import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, asArray } from './args.js';
import { loadConfig, writeDefaultConfig } from './config.js';
import { resolvePeriod } from './time.js';
import { collectCommits } from './git.js';
import { renderText } from './render.js';
import { sendTelegram } from './telegram.js';
import type { ShipbriefConfig, ShipbriefReport } from './types.js';

export async function main(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const command = args._[0] || 'help';

  if (args.help || command === 'help') {
    process.stdout.write(help());
    return;
  }

  if (command === 'init') {
    const file = writeDefaultConfig(args.config);
    process.stdout.write(`${file}\n`);
    return;
  }

  const { config } = loadConfig(args.config);
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
    writeJsonOrStdout(report, args.output);
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

    if (args.json) process.stdout.write(`${JSON.stringify({ jsonPath, textPath, sendStatus, report }, null, 2)}\n`);
    else process.stdout.write(`json: ${jsonPath}\ntext: ${textPath}\nsend: ${sendStatus}\n`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
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

function writeJsonOrStdout(value: unknown, output: string | boolean | string[] | undefined): void {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  writeTextOrStdout(text, output);
}

function writeTextOrStdout(text: string, output: string | boolean | string[] | undefined): void {
  if (Array.isArray(output)) output = output[0];
  if (!output || output === '-') process.stdout.write(text);
  else fs.writeFileSync(path.resolve(String(output)), text, 'utf8');
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
  return `shipbrief - read-only local git commit digests\n\nUsage:\n  shipbrief init [--config ~/.shipbrief/config.json]\n  shipbrief collect [--yesterday|--date YYYY-MM-DD|--since X --until Y] [--root DIR] [--output file.json]\n  shipbrief render --input file.json [--output file.txt]\n  shipbrief send --input file.txt\n  shipbrief run [--yesterday|--date YYYY-MM-DD] [--send] [--json]\n\nDefaults:\n  roots: ~/Projects when it exists\n  config: ./shipbrief.config.json, then ~/.shipbrief/config.json\n\nSafety:\n  shipbrief only reads directories and runs git rev-parse/git log. It never fetches, pulls, pushes, checks out, resets, or edits repositories.\n`;
}
