import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ShipbriefConfig } from './types.js';

export const DEFAULT_EXCLUDE = [
  'node_modules',
  '.git',
  '.cache',
  '.npm',
  '.pnpm-store',
  '.cargo',
  '.rustup',
  'Library',
  '.Trash',
  '.codex/plugins/cache',
  '.codex/cache'
];

export function defaultConfig(): ShipbriefConfig {
  const projects = path.join(os.homedir(), 'Projects');
  return {
    roots: fs.existsSync(projects) ? [projects] : [process.cwd()],
    exclude: DEFAULT_EXCLUDE,
    maxDepth: 8,
    includeNested: false,
    outputDir: path.join(os.homedir(), 'Documents', 'Codex', 'commit-reports'),
    telegram: {
      botTokenEnv: 'TELEGRAM_BOT_TOKEN',
      chatIdEnv: 'TELEGRAM_COMMIT_REPORT_CHAT_ID',
      threadIdEnv: 'TELEGRAM_COMMIT_REPORT_THREAD_ID'
    }
  };
}

export function resolveConfigPath(explicitPath?: string | boolean | string[]): string | null {
  if (Array.isArray(explicitPath)) explicitPath = explicitPath[0];
  if (explicitPath === true) explicitPath = undefined;
  if (explicitPath) return path.resolve(String(explicitPath));
  const local = path.resolve(process.cwd(), 'shipbrief.config.json');
  if (fs.existsSync(local)) return local;
  const home = path.join(os.homedir(), '.shipbrief', 'config.json');
  if (fs.existsSync(home)) return home;
  return null;
}

export function loadConfig(explicitPath?: string | boolean | string[]): { config: ShipbriefConfig; configPath: string | null } {
  const base = defaultConfig();
  const configPath = resolveConfigPath(explicitPath);
  if (!configPath) return { config: base, configPath: null };
  const loaded = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Partial<ShipbriefConfig>;
  return {
    config: {
      ...base,
      ...loaded,
      exclude: loaded.exclude ?? base.exclude,
      telegram: { ...base.telegram, ...(loaded.telegram || {}) }
    },
    configPath
  };
}

export function writeDefaultConfig(targetPath?: string | boolean | string[]): string {
  if (Array.isArray(targetPath)) targetPath = targetPath[0];
  if (targetPath === true) targetPath = undefined;
  const file = path.resolve(targetPath || path.join(os.homedir(), '.shipbrief', 'config.json'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(defaultConfig(), null, 2)}\n`, 'utf8');
  return file;
}
