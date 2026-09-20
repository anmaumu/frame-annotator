import type { ClassDef, Row } from '../types';
import { validateClasses } from '../classes/validation';

export type ProjectState = { classes: ClassDef[]; rows: Record<number, Row>; index: number };
export type ProjectFile = ProjectState & {
  format: 'frame-annotator'; version: 1;
  video: { name: string; size: number; timestamps: number[] };
};

export function serializeProject(file: File, times: number[], state: ProjectState) {
  const project: ProjectFile = { format: 'frame-annotator', version: 1,
    video: { name: file.name, size: file.size, timestamps: times }, ...state };
  return JSON.stringify(project, null, 2);
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Validate everything before applying any state; corrupt files never partially load. */
export function parseProject(text: string, file: File, times: number[]): ProjectState {
  const invalid = () => new Error('作業ファイルの形式が正しくありません。');
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw invalid(); }
  if (!record(value) || value.format !== 'frame-annotator' || value.version !== 1) throw invalid();
  const { video, classes, rows, index } = value;
  if (!record(video) || !Array.isArray(video.timestamps)) throw invalid();
  if (video.name !== file.name || video.size !== file.size || video.timestamps.length !== times.length ||
    video.timestamps.some((time, i) => time !== times[i])) {
    throw new Error('開いている動画と作業ファイルが一致しません。保存時と同じ動画を開いてください。');
  }
  if (!Array.isArray(classes) || classes.length < 1 || classes.length > 9 ||
    !classes.every((c) => record(c) && typeof c.name === 'string' && typeof c.key === 'string') ||
    validateClasses(classes as ClassDef[]) || !record(rows) ||
    !Number.isInteger(index) || (index as number) < 0 || (index as number) >= times.length) throw invalid();
  const checkedRows: Record<number, Row> = {};
  for (const [key, row] of Object.entries(rows)) {
    const frame = Number(key);
    if (!Number.isInteger(frame) || String(frame) !== key || frame < 0 || frame >= times.length ||
      !record(row) || typeof row.reviewed !== 'boolean' || !Array.isArray(row.flags) ||
      row.flags.length !== classes.length || !row.flags.every((flag) => flag === 0 || flag === 1)) throw invalid();
    checkedRows[frame] = { reviewed: row.reviewed, flags: [...row.flags] };
  }
  return { classes: (classes as ClassDef[]).map((c) => ({ name: c.name.trim(), key: c.key.toLowerCase() })),
    rows: checkedRows, index: index as number };
}
