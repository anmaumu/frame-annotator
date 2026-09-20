import { useState } from 'react';
import { useVideoFrames } from './video/useVideoFrames';
import { useAnnotations } from './labels/useAnnotations';
import { readAnnotations, useAnnotationStorage } from './labels/storage';
import { useClassSettings } from './classes/useClassSettings';
import { useShortcuts } from './keyboard/useShortcuts';
import { downloadCsv } from './export/downloadCsv';
import { useProjectFiles } from './project/useProjectFiles';

/** Connects features and exposes the unchanged ViewModel used by the UI. */
export function useAnnotator() {
  const [message, setMessage] = useState('');
  const video = useVideoFrames(setMessage);
  const labels = useAnnotations();
  const config = useClassSettings();
  const { classes } = config;
  const { times, index, file, busy, rendering, scanned, active, canvasRef, pickerRef, move } = video;
  const { rows, reviewed, historyLength } = labels;
  const complete = times.length > 0 && reviewed === times.length;

  useAnnotationStorage(file, times.length, { classes, rows, index }, setMessage);
  const project = useProjectFiles({ file, times, busy, classes, rows, index, setMessage,
    restore: (saved) => {
      config.setClasses(saved.classes);
      labels.restore(saved.rows);
      video.goTo(saved.index);
    },
  });

  function openFile(selectedFile: File) {
    return video.openFile(selectedFile, () => labels.restore({}), (loadedFile, frameCount) => {
      const saved = readAnnotations(loadedFile, frameCount);
      if (!saved) return 0;
      config.setClasses(saved.classes);
      labels.restore(saved.rows);
      setMessage('この動画の前回の作業を復元しました。');
      return saved.index;
    });
  }
  function toggle(classIndex: number) {
    if (video.canEdit()) labels.toggle(index, classIndex, classes.length);
  }
  function confirmFrame() {
    if (!video.canEdit()) return;
    labels.confirm(index, classes.length);
    if (index < times.length - 1) move(1);
    else setMessage('最終フレームです。未確認がなくなったらCSVを出力できます。');
  }
  function undo() {
    if (!active) return;
    const previousIndex = labels.undo();
    if (previousIndex !== undefined) video.goTo(previousIndex);
  }
  function saveClasses() {
    if (config.saveClasses()) labels.clearHistory();
  }
  function exportCsv() {
    if (!times.length || busy) return;
    downloadCsv(times, rows, classes, file, complete);
    setMessage(complete ? '全フレームのCSVを出力しました。' : '途中結果を出力しました。未確認フレームは reviewed=0 です。');
  }

  useShortcuts({ settings: config.settings, classes, pickerRef, undo, move, confirmFrame, exportCsv, toggle,
    saveProject: project.saveProject, projectPickerRef: project.projectPickerRef });

  return {
    classes, rows, row: rows[index], times, index, file, busy, rendering,
    message, scanned, reviewed, complete, active, canvasRef, pickerRef,
    openFile, toggle, move, confirmFrame, undo, exportCsv, setMessage,
    settings: config.settings, draft: config.draft, configError: config.configError,
    openSettings: config.openSettings, closeSettings: config.closeSettings, saveClasses,
    addDraftClass: config.addDraftClass, removeDraftClass: config.removeDraftClass,
    updateDraftName: config.updateDraftName, updateDraftKey: config.updateDraftKey,
    historyLength,
    ...project,
  };
}

export type Annotator = ReturnType<typeof useAnnotator>;
