import test from 'node:test';
import assert from 'node:assert/strict';
import { renderText } from './render.js';

test('renderText groups commits by project and keeps notes', () => {
  const text = renderText({
    generatedAt: '2026-07-04T00:00:00.000Z',
    period: { label: '2026-07-03', since: 'a', until: 'b' },
    roots: ['/tmp'],
    repoCount: 1,
    projectCount: 1,
    commitCount: 1,
    projects: [{
      name: 'demo',
      path: '/tmp/demo',
      commits: [{
        hash: 'abc123456',
        shortHash: 'abc123',
        date: '2026-07-03T10:00:00+03:00',
        localTime: '10:00',
        authorName: 'Dev',
        authorEmail: 'dev@example.com',
        refs: 'main',
        codex: true,
        subject: 'Add report',
        body: 'Human-readable body\nTests: npm test\nFollow-up: publish package',
        description: 'Human-readable body',
        notes: ['Tests: npm test', 'Follow-up: publish package']
      }]
    }]
  });

  assert.match(text, /## demo/);
  assert.match(text, /# Shipbrief/);
  assert.match(text, /10:00/);
  assert.doesNotMatch(text, /10:00:00\+03:00/);
  assert.match(text, /Описание:/);
  assert.match(text, /abc123/);
  assert.match(text, /Tests: npm test/);
  assert.match(text, /Follow-up: publish package/);
  assert.match(text, /Заметные Risk\/Follow-up/);
});
