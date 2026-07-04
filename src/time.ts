import type { Period } from './types.js';

interface PeriodOptions {
  today?: boolean;
  yesterday?: boolean;
  date?: string | boolean | string[];
  since?: string | boolean | string[];
  until?: string | boolean | string[];
  label?: string | boolean | string[];
}

function stringOption(value: string | boolean | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  return undefined;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function localIso(date: Date): string {
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function resolvePeriod(options: PeriodOptions = {}, now = new Date()): Period {
  if (options.today) {
    const today = startOfLocalDay(now);
    return {
      since: localIso(today),
      until: localIso(now),
      label: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    };
  }

  if (options.yesterday) {
    const today = startOfLocalDay(now);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    return {
      since: localIso(yesterday),
      until: localIso(today),
      label: `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`
    };
  }

  const dateOption = stringOption(options.date);
  if (dateOption) {
    const [year, month, day] = dateOption.split('-').map(Number);
    if (!year || !month || !day) throw new Error(`Invalid --date: ${dateOption}`);
    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { since: localIso(start), until: localIso(end), label: dateOption };
  }

  const since = stringOption(options.since) || '24 hours ago';
  const until = stringOption(options.until) || 'now';
  return { since, until, label: stringOption(options.label) || 'last 24 hours' };
}
