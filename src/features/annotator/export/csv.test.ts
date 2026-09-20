import { describe, expect, it } from 'vitest';
import { quote, buildCsv } from './csv';
import type { ClassDef, Row } from '../types';

describe('quote', () => {
  it('wraps a plain value in double quotes', () => {
    expect(quote('frame')).toBe('"frame"');
  });

  it('doubles embedded double quotes', () => {
    expect(quote('異常"クラス"A')).toBe('"異常""クラス""A"');
  });

  it('stringifies non-string values', () => {
    expect(quote(42)).toBe('"42"');
  });
});

describe('buildCsv', () => {
  const classes: ClassDef[] = [
    { name: 'A', key: '1' },
    { name: 'B', key: '2' },
  ];

  it('emits a header row and one row per frame, including unreviewed frames', () => {
    const times = [0, 0.5, 1];
    const rows: Record<number, Row> = { 1: { reviewed: true, flags: [1, 0] } };

    const csv = buildCsv(times, rows, classes);
    const lines = csv.split('\r\n');

    expect(lines).toEqual(['"frame","reviewed","A","B"', '0,0,0,0', '1,1,1,0', '2,0,0,0']);
  });

  it('defaults reviewed and flags to 0 for frames with no row yet', () => {
    const csv = buildCsv([0], {}, classes);
    expect(csv).toBe('"frame","reviewed","A","B"\r\n0,0,0,0');
  });

  it('quotes class names that contain commas or quotes', () => {
    const csv = buildCsv([], {}, [{ name: 'has,comma"quote', key: '1' }]);
    expect(csv.split('\r\n')[0]).toBe('"frame","reviewed","has,comma""quote"');
  });
});
