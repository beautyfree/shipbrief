import type { ArgValue, ParsedArgs } from './types.js';

export function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      out._.push(arg);
      continue;
    }

    const eq = arg.indexOf('=');
    const key = arg.slice(2, eq === -1 ? undefined : eq);
    const raw = eq === -1 ? undefined : arg.slice(eq + 1);
    const value: ArgValue = raw ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);

    if (out[key] === undefined) out[key] = value;
    else if (Array.isArray(out[key])) out[key].push(String(value));
    else out[key] = [String(out[key]), String(value)];
  }
  return out;
}

export function asArray(value: ArgValue | string[] | undefined): string[] {
  if (value === undefined || value === null || value === false) return [];
  return Array.isArray(value) ? value.map(String) : [String(value)];
}
