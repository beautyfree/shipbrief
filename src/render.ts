import type { ShipbriefReport } from './types.js';

export function renderText(report: ShipbriefReport): string {
  const lines = [];
  lines.push(`Shiplog за ${report.period.label}`);
  lines.push(`Период: ${report.period.since} — ${report.period.until}`);
  lines.push(`Repo scanned: ${report.repoCount}`);
  lines.push(`Проектов с активностью: ${report.projectCount}`);
  lines.push(`Коммитов: ${report.commitCount}`);
  lines.push('');

  if (!report.projects.length) {
    lines.push('Коммитов за период не найдено.');
    return `${lines.join('\n')}\n`;
  }

  for (const project of report.projects) {
    lines.push(`## ${project.name}`);
    lines.push(project.path);
    for (const commit of project.commits) {
      const ref = commit.refs ? ` [${commit.refs}]` : '';
      const codex = commit.codex ? ' [Codex]' : '';
      lines.push(`- ${commit.shortHash} ${commit.date} ${commit.authorName}${ref}${codex}`);
      lines.push(`  ${commit.subject || '(no subject)'}`);
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
