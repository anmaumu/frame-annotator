import { describe, it, expect } from 'vitest';
import { parseProject, serializeProject } from './projectFile';

const file = new File(['video'], 'clip.mkv');
const times = [0, 0.067, 0.133];
const state = { classes: [{ name: '異常', key: '1' }],
  rows: { 0: { reviewed: true, flags: [1] }, 1: { reviewed: false, flags: [0] } }, index: 1 };
const encoded = () => serializeProject(file, times, state);

describe('project files', () => {
  it('round trips classes, flags, reviewed status and current position', () => {
    expect(parseProject(encoded(), file, times)).toEqual(state);
  });
  it.each(['not json', '{}', '{"format":"frame-annotator","version":99}'])('rejects invalid or unsupported files: %s', (text) => {
    expect(() => parseProject(text, file, times)).toThrow();
  });
  it('rejects another video or a different timeline', () => {
    expect(() => parseProject(encoded(), new File(['video'], 'other.mkv'), times)).toThrow('一致しません');
    expect(() => parseProject(encoded(), file, [0, 0.1, 0.2])).toThrow('一致しません');
  });
  it.each([
    { index: 1.5 }, { index: 3 }, { classes: [] },
    { classes: [{ name: '異常', key: 'e' }] },
    { rows: { 3: { reviewed: true, flags: [1] } } },
    { rows: { 0: { reviewed: 'yes', flags: [1] } } },
    { rows: { 0: { reviewed: true, flags: [2] } } },
    { rows: { 0: { reviewed: true, flags: [0, 1] } } },
  ])('rejects invalid state without mutating the caller', (patch) => {
    const json = JSON.stringify({ ...JSON.parse(encoded()), ...patch });
    expect(() => parseProject(json, file, times)).toThrow();
    expect(state.rows[0].flags).toEqual([1]);
  });
});
