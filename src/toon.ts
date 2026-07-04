import os from 'node:os';
import type { ProjectReport, ShipbriefReport } from './types.js';

export interface RunMeta {
  jsonPath?: string;
  textPath?: string;
  sendStatus?: string;
}

export interface ToonOptions {
  full?: boolean;
  limit?: number;
}

export function renderReportToon(report: ShipbriefReport, meta: RunMeta = {}, options: ToonOptions = {}): string {
  const limit = Number(options.limit ?? 100);
  const projects = report.projects.slice(0, limit);
  const commits = projects.flatMap((project) => project.commits.map((commit) => ({ project, commit })));
  const lines: string[] = [];

  lines.push('shipbrief:');
  lines.push(`  date: ${scalar(report.period.label)}`);
  lines.push(`  timezone: ${scalar(timeZone(report.period.since))}`);
  lines.push(`  period: ${scalar(`${humanDateTime(report.period.since)} — ${humanDateTime(report.period.until)}`)}`);
  lines.push(`  repos_scanned: ${report.repoCount}`);
  lines.push(`  active_projects: ${report.projectCount}`);
  lines.push(`  commits: ${report.commitCount}`);
  if (meta.jsonPath || meta.textPath || meta.sendStatus) {
    lines.push('files:');
    if (meta.jsonPath) lines.push(`  json: ${scalar(collapseHome(meta.jsonPath))}`);
    if (meta.textPath) lines.push(`  text: ${scalar(collapseHome(meta.textPath))}`);
    if (meta.sendStatus) lines.push(`  send: ${scalar(meta.sendStatus)}`);
  }

  if (!projects.length) {
    lines.push('empty: 0 commits found for this period');
    lines.push('help[1]:');
    lines.push('  Run `shipbrief run --yesterday --format markdown` for a human report');
    return lines.join('\n');
  }

  lines.push(`projects[${projects.length}]{name,path,remote,commit_count}:`);
  for (const project of projects) {
    lines.push(`  ${row([project.name, collapseHome(project.path), project.remoteUrl || '', String(project.commits.length)])}`);
  }

  lines.push(`commits[${commits.length}]{project,time,hash,subject,url}:`);
  for (const { project, commit } of commits) {
    lines.push(`  ${row([project.name, commit.localTime, commit.shortHash, commit.subject || '', commit.url || ''])}`);
  }

  const noteRows = commits.flatMap(({ project, commit }) =>
    commit.notes.map((note) => [project.name, commit.shortHash, note])
  );
  if (noteRows.length) {
    lines.push(`notes[${noteRows.length}]{project,hash,note}:`);
    for (const noteRow of noteRows) lines.push(`  ${row(noteRow)}`);
  }

  const descriptionRows = commits
    .filter(({ commit }) => commit.description)
    .map(({ project, commit }) => [
      project.name,
      commit.shortHash,
      options.full ? commit.description : truncate(commit.description, 500)
    ]);
  if (descriptionRows.length) {
    lines.push(`descriptions[${descriptionRows.length}]{project,hash,text}:`);
    for (const descriptionRow of descriptionRows) lines.push(`  ${row(descriptionRow)}`);
  }

  const help = [
    'Run `shipbrief run --yesterday --format markdown` for a human-readable report',
    'Run `shipbrief run --yesterday --format json --full` for complete agent data'
  ];
  lines.push(`help[${help.length}]:`);
  for (const item of help) lines.push(`  ${scalar(item)}`);
  return lines.join('\n');
}

export function renderHomeToon({
  bin,
  roots,
  outputDir,
  latestReport
}: {
  bin: string;
  roots: string[];
  outputDir: string;
  latestReport?: string;
}): string {
  const lines: string[] = [];
  lines.push(`bin: ${scalar(collapseHome(bin))}`);
  lines.push('description: Read-only local git commit digests for agent-written follow-ups');
  lines.push(`roots[${roots.length}]:`);
  for (const root of roots) lines.push(`  ${scalar(collapseHome(root))}`);
  lines.push(`output_dir: ${scalar(collapseHome(outputDir))}`);
  if (latestReport) lines.push(`latest_report: ${scalar(collapseHome(latestReport))}`);
  lines.push('help[4]:');
  lines.push('  Run `shipbrief run --yesterday` for compact TOON output');
  lines.push('  Run `shipbrief run --yesterday --format markdown` for a human report');
  lines.push('  Run `shipbrief run --yesterday --format json --full` for complete JSON');
  lines.push('  Run `shipbrief init` to create a config file');
  return lines.join('\n');
}

export function renderErrorToon(message: string, help?: string): string {
  return [`error: ${scalar(message)}`, help ? `help: ${scalar(help)}` : undefined].filter(Boolean).join('\n');
}

function row(values: Array<string | number | boolean | undefined>): string {
  return values.map((value) => scalar(value ?? '')).join(',');
}

function scalar(value: string | number | boolean): string {
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const text = value;
  if (text === '') return '""';
  if (/^[A-Za-z0-9_./@+-]+$/.test(text)) return text;
  return `"${text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')}"`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}... (truncated, ${text.length} chars total — use --full to see complete text)`;
}

function collapseHome(filePath: string): string {
  const home = os.homedir();
  return filePath.startsWith(home) ? `~${filePath.slice(home.length)}` : filePath;
}

function humanDateTime(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return value;
  const [, year, month, day, hour, minute] = match;
  return `${day}.${month}.${year} ${hour}:${minute}`;
}

function timeZone(value: string): string {
  const match = value.match(/([+-]\d{2}:\d{2})$/);
  return match ? `UTC${match[1]}` : 'local';
}
