import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, asArray } from './args.js';
import { loadConfig, writeDefaultConfig } from './config.js';
import { resolvePeriod } from './time.js';
import { collectCommits } from './git.js';
import { renderDoctorToon } from './doctor.js';
import { renderText } from './render.js';
import { sendTelegram } from './telegram.js';
import { renderErrorToon, renderHomeToon, renderReportToon } from './toon.js';
import type { OutputFormat, ShipbriefConfig, ShipbriefReport } from './types.js';

export async function main(argv: string[]): Promise<void> {
  try {
    await run(argv);
  } catch (error) {
    process.stdout.write(`${renderErrorToon(error instanceof Error ? error.message : String(error), 'Run `shipbrief --help` for usage')}\n`);
    process.exitCode = 1;
  }
}

async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const command = args._[0] || 'home';
  validateArgs(command, args);

  if (args.help || command === 'help') {
    process.stdout.write(help());
    return;
  }

  const { config } = loadConfig(args.config);

  if (command === 'home') {
    process.stdout.write(`${renderHomeToon({
      bin: process.argv[1] || 'shipbrief',
      roots: config.roots,
      outputDir: config.outputDir,
      latestReport: latestReport(config.outputDir)
    })}\n`);
    return;
  }

  if (command === 'init') {
    const file = writeDefaultConfig(args.config);
    process.stdout.write(`config: ${file.replace(os.homedir(), '~')}\n`);
    return;
  }

  if (command === 'doctor') {
    process.stdout.write(`${renderDoctorToon(config, process.argv[1] || 'shipbrief')}\n`);
    return;
  }

  const rootArgs = asArray(args.root);
  if (rootArgs.length) config.roots = rootArgs.map(String);
  const period = resolvePeriod({
    yesterday: Boolean(args.yesterday),
    date: args.date,
    since: args.since,
    until: args.until,
    label: args.label
  });

  if (command === 'collect') {
    const report = collectCommits({ config, period });
    writeTextOrStdout(formatReport(report, resolveFormat(args), {}, Boolean(args.full)), args.output);
    return;
  }

  if (command === 'render') {
    const report = readJson(args.input);
    writeTextOrStdout(renderText(report), args.output);
    return;
  }

  if (command === 'send') {
    const text = readText(args.input);
    const ids = await sendTelegram({ text, config, env: envWithLaunchctl(config) });
    process.stdout.write(`sent ${ids.length} message(s): ${ids.join(', ')}\n`);
    return;
  }

  if (command === 'run') {
    const report = collectCommits({ config, period });
    const text = renderText(report);
    const outputDir = path.resolve(String(args.outputDir || config.outputDir || process.cwd()));
    fs.mkdirSync(outputDir, { recursive: true });
    const baseName = `${period.label.replace(/[^a-zA-Z0-9._-]+/g, '-') || 'report'}`;
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    const textPath = path.join(outputDir, `${baseName}.txt`);
    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    fs.writeFileSync(textPath, text, 'utf8');

    let sendStatus = 'skipped';
    if (args.send || config.send === true) {
      const ids = await sendTelegram({ text, config, env: envWithLaunchctl(config) });
      sendStatus = `sent ${ids.length} message(s): ${ids.join(', ')}`;
    }

    const meta = { jsonPath, textPath, sendStatus };
    const format = resolveFormat(args);
    if (format === 'json') process.stdout.write(`${JSON.stringify({ ...meta, report }, null, 2)}\n`);
    else process.stdout.write(`${formatReport(report, format, meta, Boolean(args.full))}\n`);
    return;
  }

  process.stdout.write(`${renderErrorToon(`unknown command ${command}`, 'valid commands: home, init, doctor, collect, render, send, run, help')}\n`);
  process.exitCode = 2;
}

function readJson(input: string | boolean | string[] | undefined): ShipbriefReport {
  const text = readText(input);
  return JSON.parse(text);
}

function readText(input: string | boolean | string[] | undefined): string {
  if (Array.isArray(input)) input = input[0];
  if (!input || input === '-') return fs.readFileSync(0, 'utf8');
  return fs.readFileSync(path.resolve(String(input)), 'utf8');
}

function writeTextOrStdout(text: string, output: string | boolean | string[] | undefined): void {
  if (Array.isArray(output)) output = output[0];
  if (!output || output === '-') process.stdout.write(text);
  else fs.writeFileSync(path.resolve(String(output)), text, 'utf8');
}

function resolveFormat(args: Record<string, unknown>): OutputFormat {
  if (args.json) return 'json';
  const raw = Array.isArray(args.format) ? args.format[0] : args.format;
  if (!raw || raw === true) return 'toon';
  if (raw === 'toon' || raw === 'json' || raw === 'markdown') return raw;
  throw new Error(`unknown format ${String(raw)}; valid formats: toon, json, markdown`);
}

function formatReport(report: ShipbriefReport, format: OutputFormat, meta = {}, full = false): string {
  if (format === 'json') return `${JSON.stringify(report, null, 2)}\n`;
  if (format === 'markdown') return renderText(report);
  return renderReportToon(report, meta, { full });
}

function envWithLaunchctl(config: ShipbriefConfig): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const name of Object.values(config.telegram || {})) {
    if (!name || env[name]) continue;
    try {
      const result = spawnSync('/bin/launchctl', ['getenv', name], { encoding: 'utf8' });
      if (result.status === 0 && result.stdout.trim()) env[name] = result.stdout.trim();
    } catch {
      // Non-macOS hosts use process.env only.
    }
  }
  return env;
}

function help() {
  return `shipbrief - read-only local git commit digests\n\nUsage:\n  shipbrief\n  shipbrief init [--config ~/.shipbrief/config.json]\n  shipbrief doctor\n  shipbrief collect [--yesterday|--date YYYY-MM-DD|--since X --until Y] [--root DIR] [--format toon|json|markdown] [--output file]\n  shipbrief render --input file.json [--output file.txt]\n  shipbrief send --input file.txt\n  shipbrief run [--yesterday|--date YYYY-MM-DD] [--format toon|json|markdown] [--send] [--full]\n\nDefaults:\n  output format: toon\n  roots: ~/Projects when it exists\n  config: ./shipbrief.config.json, then ~/.shipbrief/config.json\n\nSafety:\n  shipbrief only reads directories and runs git rev-parse/git config/git log. It never fetches, pulls, pushes, checks out, resets, or edits repositories.\n`;
}

function latestReport(outputDir: string): string | undefined {
  try {
    const files = fs.readdirSync(outputDir)
      .filter((name) => name.endsWith('.txt') || name.endsWith('.json'))
      .map((name) => path.join(outputDir, name))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return files[0];
  } catch {
    return undefined;
  }
}

function validateArgs(command: string, args: Record<string, unknown>): void {
  const globals = new Set(['_', 'help', 'config']);
  const flags: Record<string, string[]> = {
    home: [],
    help: [],
    init: [],
    doctor: [],
    collect: ['yesterday', 'date', 'since', 'until', 'label', 'root', 'output', 'format', 'json', 'full'],
    render: ['input', 'output'],
    send: ['input'],
    run: ['yesterday', 'date', 'since', 'until', 'label', 'root', 'outputDir', 'send', 'json', 'format', 'full']
  };
  const allowed = new Set([...(flags[command] || []), ...globals]);
  for (const key of Object.keys(args)) {
    if (allowed.has(key)) continue;
    const valid = [...allowed].filter((item) => item !== '_').map((item) => `--${item}`).sort().join(', ');
    process.stdout.write(`${renderErrorToon(`unknown flag --${key} for ${command}`, `valid flags: ${valid || '--help'}`)}\n`);
    process.exit(2);
  }
}
