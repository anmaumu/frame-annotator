import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { ClassDef } from '../types';

type Shortcuts = {
  settings: boolean; classes: ClassDef[]; pickerRef: RefObject<HTMLInputElement | null>;
  undo: () => void; move: (delta: number) => void; confirmFrame: () => void;
  exportCsv: () => void; toggle: (index: number) => void;
  saveProject: () => void; projectPickerRef: RefObject<HTMLInputElement | null>;
};

/** Keep form fields and modal/native button activation separate from frame shortcuts. */
export function useShortcuts({ settings, classes, pickerRef, undo, move, confirmFrame, exportCsv, toggle, saveProject, projectPickerRef }: Shortcuts) {
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.closest('input,textarea,select,[contenteditable=true]')) return;
      if (settings) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!e.repeat) saveProject();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        if (!e.repeat) projectPickerRef.current?.click();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        pickerRef.current?.click();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 'Enter') {
        // In the annotation controls, Enter always confirms the frame.
        // Keep native activation for file/export/settings buttons elsewhere.
        const button = e.target instanceof HTMLElement ? e.target.closest('button') : null;
        if (button && !button.matches('.class-card, .step-controls button, .confirm, .undo')) return;
        e.preventDefault();
        if (!e.repeat) confirmFrame();
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        exportCsv();
      } else {
        const n = classes.findIndex((c) => c.key.toLowerCase() === e.key.toLowerCase());
        if (n >= 0 && !e.repeat) {
          e.preventDefault();
          toggle(n);
        }
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

}
