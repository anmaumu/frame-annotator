import { useRef } from 'react';
import { parseProject, serializeProject } from './projectFile';
import type { ProjectState } from './projectFile';

type Options = ProjectState & {
  file: File | null; times: number[]; busy: boolean;
  restore: (state: ProjectState) => void; setMessage: (message: string) => void;
};

/** Portable work files are separate from CSV results and browser autosave. */
export function useProjectFiles(options: Options) {
  const projectPickerRef = useRef<HTMLInputElement>(null);
  const latest = useRef(options);
  latest.current = options;
  const request = useRef(0);

  function saveProject() {
    const { file, times, busy, classes, rows, index, setMessage } = latest.current;
    if (!file || !times.length || busy) return;
    const text = serializeProject(file, times, { classes, rows, index });
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace(/\.[^.]+$/, '')}.frame.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('作業ファイルを保存しました。再開時は同じ動画を開き、「作業を読込」でこのファイルを選択してください。');
  }

  async function loadProject(selected: File) {
    const start = latest.current;
    if (!start.file || !start.times.length || start.busy) return;
    const id = ++request.current;
    try {
      const text = await selected.text();
      if (id !== request.current) return;
      const now = latest.current;
      if (now.file !== start.file || now.times !== start.times || now.rows !== start.rows ||
        now.classes !== start.classes || now.index !== start.index || now.busy) {
        throw new Error('読込中に作業が変更されました。もう一度作業ファイルを選択してください。');
      }
      const state = parseProject(text, start.file, start.times);
      now.restore(state);
      now.setMessage('作業ファイルを読み込みました。保存したフレームから再開できます。');
    } catch (error) {
      latest.current.setMessage(error instanceof Error ? error.message : '作業ファイルを読み込めませんでした。');
    }
  }
  return { projectPickerRef, saveProject, loadProject };
}
