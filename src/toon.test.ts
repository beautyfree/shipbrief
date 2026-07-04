import test from 'node:test';
import assert from 'node:assert/strict';
import { renderErrorToon, renderHomeToon, renderReportToon } from './toon.js';
import type { ShipbriefReport } from './types.js';

const report: ShipbriefReport = {
  generatedAt: '2026-07-04T00:00:00.000Z',
  period: {
    label: '2026-07-03',
    since: '2026-07-03T00:00:00+03:00',
    until: '2026-07-04T00:00:00+03:00'
  },
  roots: ['/tmp'],
  repoCount: 1,
  projectCount: 1,
  commitCount: 1,
  quality: {
    commitsWithoutBody: 0,
    commitsWithBody: 1,
    commitsWithTestsNote: 1,
    commitsWithRiskNote: 0,
    commitsWithFollowUpNote: 0,
    commitsWithCodexNote: 0,
    codexMarkedCommits: 0
  },
  projects: [{
    name: 'demo',
    path: '/tmp/demo',
    remoteUrl: 'https://github.com/acme/demo',
    commits: [{
      hash: 'abc123456',
      shortHash: 'abc123',
      date: '2026-07-03T10:00:00+03:00',
      localTime: '10:00',
      authorName: 'Dev',
      authorEmail: 'dev@example.com',
      refs: 'main',
      codex: false,
      subject: 'Add report',
      body: 'Longer body',
      description: 'Longer body',
      notes: ['Tests: npm test'],
      url: 'https://github.com/acme/demo/commit/abc123456'
    }]
  }]
};

test('renderReportToon emits compact tables and hints', () => {
  const text = renderReportToon(report);

  assert.match(text, /^shipbrief:/);
  assert.match(text, /projects\[1\]\{name,path,remote,commit_count\}:/);
  assert.match(text, /commits\[1\]\{project,time,hash,subject,url\}:/);
  assert.match(text, /notes\[1\]/);
  assert.match(text, /help\[2\]/);
});

test('renderHomeToon exposes content-first orientation', () => {
  const text = renderHomeToon({
    bin: '/Users/devall/.hermes/node/bin/shipbrief',
    roots: ['/Users/devall/Projects'],
    outputDir: '/Users/devall/Documents/Codex/commit-reports'
  });

  assert.match(text, /^bin:/);
  assert.match(text, /description:/);
  assert.match(text, /roots\[1\]/);
});

test('renderErrorToon is structured stdout content', () => {
  assert.equal(
    renderErrorToon('unknown flag --stat for run', 'valid flags: --date'),
    'error: "unknown flag --stat for run"\nhelp: "valid flags: --date"'
  );
});
