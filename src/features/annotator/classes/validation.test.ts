import { describe, expect, it } from 'vitest';
import { validateClasses } from './validation';
import type { ClassDef } from '../types';

const valid: ClassDef[] = [
  { name: '異常クラス A', key: '1' },
  { name: '異常クラス B', key: '2' },
];

describe('validateClasses', () => {
  it('accepts a list with unique names and unique single alphanumeric keys', () => {
    expect(validateClasses(valid)).toBeNull();
  });

  it('rejects an empty (whitespace-only) name', () => {
    expect(validateClasses([{ name: '  ', key: '1' }])).not.toBeNull();
  });

  it('rejects duplicate names', () => {
    expect(validateClasses([{ name: 'A', key: '1' }, { name: 'A', key: '2' }])).not.toBeNull();
  });

  it('rejects duplicate keys (case-insensitive)', () => {
    expect(validateClasses([{ name: 'A', key: '1' }, { name: 'B', key: '1' }])).not.toBeNull();
  });

  it('rejects keys that are not a single alphanumeric character', () => {
    expect(validateClasses([{ name: 'A', key: 'ab' }])).not.toBeNull();
    expect(validateClasses([{ name: 'A', key: '!' }])).not.toBeNull();
  });

  it('rejects the reserved O and E keys (open file / export CSV shortcuts)', () => {
    expect(validateClasses([{ name: 'A', key: 'o' }])).not.toBeNull();
    expect(validateClasses([{ name: 'A', key: 'E' }])).not.toBeNull();
  });
});
