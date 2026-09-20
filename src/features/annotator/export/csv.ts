import type { ClassDef, Row } from '../types';

export const quote = (value: unknown) => '"' + String(value).replace(/"/g, '""') + '"';

export function buildCsv(times: number[], rows: Record<number, Row>, classes: ClassDef[]): string {
  const lines = [
    ['frame', 'reviewed', ...classes.map((c) => c.name)].map(quote).join(','),
    ...times.map((_, i) => [i, rows[i]?.reviewed ? 1 : 0, ...classes.map((_c, n) => rows[i]?.flags[n] || 0)].join(',')),
  ];
  return lines.join('\r\n');
}
