import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import type { ShipbriefConfig } from './types.js';

export function renderDoctorToon(config: ShipbriefConfig, bin: string): string {
  const checks = [
    check('binary', fs.existsSync(bin), collapseHome(bin), 'Reinstall with `npm install -g shipbrief`'),
    check('git', commandExists('git'), 'git command available', 'Install git and ensure it is on PATH'),
    check('roots', config.roots.length > 0 && config.roots.every((root) => fs.existsSync(root)), config.roots.map(collapseHome).join(' '), 'Run `shipbrief init` and set existing roots'),
    check('output_dir', directoryWritable(config.outputDir), collapseHome(config.outputDir), 'Create outputDir or choose a writable path in config'),
    check('telegram_token', Boolean(readEnv(config.telegram.botTokenEnv)), config.telegram.botTokenEnv, `Set ${config.telegram.botTokenEnv}`),
    check('telegram_chat', Boolean(readEnv(config.telegram.chatIdEnv)), config.telegram.chatIdEnv, `Set ${config.telegram.chatIdEnv}`),
    check('telegram_thread', !config.telegram.threadIdEnv || Boolean(readEnv(config.telegram.threadIdEnv)), config.telegram.threadIdEnv || '', config.telegram.threadIdEnv ? `Set ${config.telegram.threadIdEnv}` : 'No topic env configured'),
    check('codex_commit_rules', codexCommitRulesPresent(), '~/.codex/AGENTS.md', 'Add global Codex commit metadata rules')
  ];
  const ok = checks.filter((item) => item.ok).length;
  const lines = [`doctor: ${ok}/${checks.length} ok`, `checks[${checks.length}]{name,status,detail,fix}:`];
  for (const item of checks) {
    lines.push(`  ${row([item.name, item.ok ? 'ok' : 'fail', item.detail, item.ok ? '' : item.fix])}`);
  }
  return lines.join('\n');
}

function check(name: string, ok: boolean, detail: string, fix: string): { name: string; ok: boolean; detail: string; fix: string } {
  return { name, ok, detail, fix };
}

function commandExists(command: string): boolean {
  return spawnSync('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' }).status === 0;
}

function directoryWritable(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function readEnv(name?: string): string {
  if (!name) return '';
  if (process.env[name]) return process.env[name] || '';
  try {
    const result = spawnSync('/bin/launchctl', ['getenv', name], { encoding: 'utf8' });
    return result.status === 0 ? result.stdout.trim() : '';
  } catch {
    return '';
  }
}

function codexCommitRulesPresent(): boolean {
  const file = `${os.homedir()}/.codex/AGENTS.md`;
  try {
    const text = fs.readFileSync(file, 'utf8');
    return text.includes('## Commits') && text.includes('Codex:') && text.includes('For every non-trivial commit');
  } catch {
    return false;
  }
}

function collapseHome(filePath: string): string {
  const home = os.homedir();
  return filePath.startsWith(home) ? `~${filePath.slice(home.length)}` : filePath;
}

function row(values: string[]): string {
  return values.map(scalar).join(',');
}

function scalar(value: string): string {
  if (value === '') return '""';
  if (/^[A-Za-z0-9_./@+-]+$/.test(value)) return value;
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
