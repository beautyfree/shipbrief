import type { ShipbriefReport } from './types.js';

export function renderText(report: ShipbriefReport): string {
  const lines: string[] = [];
  lines.push(`# Shipbrief за ${report.period.label}`);
  lines.push('');
  lines.push(`Период: ${formatPeriod(report.period.since, report.period.until)}`);
  lines.push(`Часовой пояс: ${formatTimeZone(report.period.since)}`);
  lines.push(`Просканировано repo: ${report.repoCount}`);
  lines.push(`Проектов с активностью: ${report.projectCount}`);
  lines.push(`Коммитов: ${report.commitCount}`);
  lines.push(`Без описания: ${report.quality.commitsWithoutBody}`);
  lines.push(`С Tests note: ${report.quality.commitsWithTestsNote}`);
  lines.push(`С Codex note: ${report.quality.commitsWithCodexNote}`);
  lines.push('');

  if (!report.projects.length) {
    lines.push('Коммитов за период не найдено.');
    return `${lines.join('\n')}\n`;
  }

  for (const project of report.projects) {
    lines.push(`## ${project.name}`);
    lines.push(project.remoteUrl ? `${project.path} (${project.remoteUrl})` : project.path);
    for (const commit of project.commits) {
      const ref = commit.refs ? ` [${commit.refs}]` : '';
      const codex = commit.codex ? ' [Codex]' : '';
      const hash = commit.url ? `[${commit.shortHash}](${commit.url})` : commit.shortHash;
      lines.push(`- ${commit.localTime} ${hash} ${commit.authorName}${ref}${codex}`);
      lines.push(`  ${commit.subject || '(no subject)'}`);
      if (commit.description) {
        lines.push('  Описание:');
        for (const line of commit.description.split('\n').slice(0, 8)) lines.push(`  ${line}`);
      }
      for (const note of commit.notes) lines.push(`  ${note}`);
    }
    lines.push('');
  }

  const risks = [];
  for (const project of report.projects) {
    for (const commit of project.commits) {
      for (const note of commit.notes) {
        if (/^(Risk|Follow-up):/i.test(note)) risks.push(`${project.name} ${commit.shortHash}: ${note}`);
      }
    }
  }
  if (risks.length) {
    lines.push('Заметные Risk/Follow-up:');
    for (const risk of risks) lines.push(`- ${risk}`);
  }

  return `${lines.join('\n').trim()}\n`;
}

function formatPeriod(since: string, until: string): string {
  return `${formatDateTime(since)} — ${formatDateTime(until)}`;
}

function formatDateTime(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return value;
  const [, year, month, day, hour, minute] = match;
  return `${day}.${month}.${year} ${hour}:${minute}`;
}

function formatTimeZone(value: string): string {
  const match = value.match(/([+-]\d{2}:\d{2})$/);
  return match ? `UTC${match[1]}` : 'local';
}
