import { useRef, useState } from 'react';
import type { Row } from '../types';

/** Frame labels and undo history, independent of video decoding. */
export function useAnnotations() {
  const [rows, setRows] = useState<Record<number, Row>>({});
  const history = useRef<{ index: number; row: Row | undefined }[]>([]);

  function clearHistory() { history.current = []; }
  function restore(next: Record<number, Row>) {
    setRows(next);
    clearHistory();
  }
  function update(index: number, next: Row) {
    history.current.push({ index, row: rows[index] });
    setRows((prev) => ({ ...prev, [index]: next }));
  }
  function toggle(index: number, classIndex: number, classCount: number) {
    const row = rows[index];
    const flags = [...(row?.flags || Array<number>(classCount).fill(0))];
    flags[classIndex] = flags[classIndex] ? 0 : 1;
    update(index, { reviewed: row?.reviewed || false, flags });
  }
  function confirm(index: number, classCount: number) {
    update(index, { reviewed: true, flags: rows[index]?.flags || Array<number>(classCount).fill(0) });
  }
  function undo() {
    const entry = history.current.pop();
    if (!entry) return undefined;
    setRows((prev) => {
      const next = { ...prev };
      if (entry.row) next[entry.index] = entry.row;
      else delete next[entry.index];
      return next;
    });
    return entry.index;
  }

  return { rows, reviewed: Object.values(rows).filter((row) => row.reviewed).length,
    historyLength: history.current.length, toggle, confirm, undo, restore, clearHistory };
}
