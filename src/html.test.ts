import test from 'node:test';
import assert from 'node:assert/strict';
import { checkHtml, chunkHtml } from './html.js';

test('checkHtml accepts balanced Telegram HTML', () => {
  const result = checkHtml('<b>demo</b>\n<blockquote expandable>\n- item (<a href="https://example.com">abc123</a>)\n</blockquote>');

  assert.equal(result.ok, true);
  assert.equal(result.warnings.length, 0);
});

test('chunkHtml splits oversized project quote blocks', () => {
  const body = Array.from({ length: 50 }, (_, index) => `- item ${index} ${'x'.repeat(80)}`).join('\n');
  const chunks = chunkHtml(`<b>project</b>\n<blockquote expandable>\n${body}\n</blockquote>`, 1000);

  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 1000));
  assert.match(chunks[0], /project \(part 1\)/);
});
