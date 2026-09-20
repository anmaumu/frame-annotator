import type { ClassDef } from '../types';

const RESERVED_KEYS = ['o', 'e']; // O = open file, E = export CSV shortcuts

// Returns an error message when the draft class list can't be saved, or null when it's valid.
export function validateClasses(draft: ClassDef[]): string | null {
  const names = draft.map((c) => c.name.trim());
  const keys = draft.map((c) => c.key.toLowerCase());
  const invalid =
    names.some((n) => !n) ||
    new Set(names).size !== names.length ||
    new Set(keys).size !== keys.length ||
    keys.some((k) => !/^[a-z0-9]$/.test(k) || RESERVED_KEYS.includes(k));
  return invalid ? '名前は重複なし、キーは O・E 以外の重複しない英数字1文字にしてください。' : null;
}
