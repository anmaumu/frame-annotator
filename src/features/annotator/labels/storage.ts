import { useLayoutEffect } from 'react';
import type { ClassDef, Row } from '../types';

type SavedAnnotations = { classes: ClassDef[]; rows: Record<number, Row>; index: number };
const storageKey = (file: File) => `frame:v1:${file.name}:${file.size}:${file.lastModified}`;

/** Keep the existing key/schema so previously saved work remains readable. */
export function readAnnotations(file: File, frameCount: number): SavedAnnotations | null {
  const saved = localStorage.getItem(storageKey(file));
  if (!saved) return null;
  try {
    const state = JSON.parse(saved);
    if (Array.isArray(state.classes) && state.classes.length &&
      state.classes.every((c: ClassDef) => typeof c.name === 'string' && typeof c.key === 'string') &&
      state.rows && typeof state.rows === 'object') {
      return { classes: state.classes, rows: state.rows,
        index: Math.min(Math.max(Number(state.index) || 0, 0), frameCount - 1) };
    }
  } catch {
    // Ignore invalid local state, as before.
  }
  return null;
}

/** Save before paint; never write the temporary empty state while loading. */
export function useAnnotationStorage(file: File | null, frameCount: number,
  { classes, rows, index }: SavedAnnotations, setMessage: (message: string) => void) {
  useLayoutEffect(() => {
    if (!file || !frameCount) return;
    try {
      localStorage.setItem(storageKey(file), JSON.stringify({ classes, rows, index }));
    } catch {
      setMessage('自動保存できません。CSVを出力して結果を保存してください。');
    }
  }, [file, frameCount, classes, rows, index, setMessage]);
}
