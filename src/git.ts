import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { CommitInfo, Period, ShipbriefConfig, ShipbriefReport } from './types.js';

function git(args: string[], cwd: string): string {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args.join(' ')} failed`);
  return result.stdout;
}

function shouldExclude(fullPath: string, name: string, exclude: string[]): boolean {
  const normalized = fullPath.split(path.sep).join('/');
  return exclude.some((item) => {
    const rule = String(item).split(path.sep).join('/');
    return name === rule || normalized.endsWith(`/${rule}`) || normalized.includes(`/${rule}/`);
  });
}

export function discoverRepos(config: ShipbriefConfig): string[] {
  const roots = (config.roots || []).map((root) => path.resolve(root));
  const exclude = config.exclude || [];
  const maxDepth = Number(config.maxDepth ?? 8);
  const includeNested = Boolean(config.includeNested);
  const repos = new Map();

  function visit(dir: string, depth: number): void {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    if (entries.some((entry) => entry.name === '.git')) {
      try {
        const top = git(['rev-parse', '--show-toplevel'], dir).trim();
        const real = fs.realpathSync(top);
        repos.set(real, top);
        if (!includeNested) return;
      } catch {
        return;
      }
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const next = path.join(dir, entry.name);
      if (shouldExclude(next, entry.name, exclude)) continue;
      visit(next, depth + 1);
    }
  }

  for (const root of roots) visit(root, 0);
  return [...repos.values()].sort();
}

export function collectCommits({ config, period }: { config: ShipbriefConfig; period: Period }): ShipbriefReport {
  const repos = discoverRepos(config);
  const projects = [];
  const sep1 = '\x1f';
  const sep2 = '\x1e';
  const format = `%H%x1f%h%x1f%ad%x1f%an%x1f%ae%x1f%D%x1f%s%x1f%b%x1e`;

  for (const repo of repos) {
    let stdout = '';
    try {
      stdout = git([
        'log',
        '--all',
        `--since=${period.since}`,
        `--until=${period.until}`,
        '--date=iso-strict',
        `--format=${format}`
      ], repo);
    } catch {
      continue;
    }

    const commits = stdout
      .split(sep2)
      .map((record) => record.trim())
      .filter(Boolean)
      .map((record) => parseCommit(record, sep1));

    if (commits.length) {
      projects.push({
        name: path.basename(repo),
        path: repo,
        commits
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    period,
    roots: config.roots || [],
    repoCount: repos.length,
    projectCount: projects.length,
    commitCount: projects.reduce((sum, project) => sum + project.commits.length, 0),
    projects
  };
}

function parseCommit(record: string, sep: string): CommitInfo {
  const [hash, shortHash, date, authorName, authorEmail, refs, subject, ...bodyParts] = record.split(sep);
  const body = bodyParts.join(sep).trim();
  const notes = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^(Refs|Fixes|Tests|Risk|Follow-up|Codex):/i.test(line));
  const codex = /(^|\n)Codex:/i.test(body) || /codex/i.test(`${authorName || ''} ${authorEmail || ''}`);
  return { hash, shortHash, date, authorName, authorEmail, refs, subject, body, notes, codex };
}
