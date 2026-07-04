export interface CheckResult {
  chars: number;
  chunks: number;
  maxChunk: number;
  ok: boolean;
  warnings: string[];
}

export function checkHtml(text: string, maxLength = 3500): CheckResult {
  const chunks = chunkHtml(text, maxLength);
  const warnings: string[] = [];
  const maxChunk = chunks.reduce((max, chunk) => Math.max(max, chunk.length), 0);
  if (maxChunk > 4096) warnings.push('chunk exceeds Telegram hard limit of 4096 chars');
  if (!balanced(text, 'blockquote')) warnings.push('unbalanced blockquote tags');
  if (!balanced(text, 'b')) warnings.push('unbalanced b tags');
  if (!balanced(text, 'a')) warnings.push('unbalanced a tags');
  return { chars: text.length, chunks: chunks.length, maxChunk, ok: warnings.length === 0, warnings };
}

export function chunkHtml(text: string, maxLength = 3500): string[] {
  const sections = splitSections(text);
  const chunks: string[] = [];
  let current = '';
  for (const section of sections) {
    if (section.length > maxLength) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      chunks.push(...splitOversizedSection(section, maxLength));
      continue;
    }
    const next = current ? `${current}\n\n${section}` : section;
    if (next.length > maxLength && current) {
      chunks.push(current.trim());
      current = section;
    } else {
      current = next;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function splitSections(text: string): string[] {
  return text.split(/\n(?=<b>[^<]+<\/b>\n<blockquote)/).map((part) => part.trim()).filter(Boolean);
}

function splitOversizedSection(section: string, maxLength: number): string[] {
  const match = section.match(/^<b>([^<]+)<\/b>\n<blockquote expandable>\n([\s\S]*)\n<\/blockquote>$/);
  if (!match) return splitPlain(section, maxLength);
  const [, title, body] = match;
  const lines = body.split('\n');
  const parts: string[] = [];
  let current: string[] = [];
  let part = 1;
  for (const line of lines) {
    const candidate = wrapQuote(`${title} (part ${part})`, [...current, line].join('\n'));
    if (candidate.length > maxLength && current.length) {
      parts.push(wrapQuote(`${title} (part ${part})`, current.join('\n')));
      part += 1;
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) parts.push(wrapQuote(`${title} (part ${part})`, current.join('\n')));
  return parts;
}

function splitPlain(text: string, maxLength: number): string[] {
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += maxLength) parts.push(text.slice(i, i + maxLength));
  return parts;
}

function wrapQuote(title: string, body: string): string {
  return `<b>${title}</b>\n<blockquote expandable>\n${body.trim()}\n</blockquote>`;
}

function balanced(text: string, tag: string): boolean {
  const open = (text.match(new RegExp(`<${tag}(?:\\s[^>]*)?>`, 'g')) || []).length;
  const close = (text.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  return open === close;
}
