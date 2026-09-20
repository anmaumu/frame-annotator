import { vi } from 'vitest';
import type { RefObject } from 'react';
import type { Annotator } from '../features/annotator/useAnnotator';

// A minimal stand-in for the useAnnotator() ViewModel, so components can be
// rendered in isolation with plain props instead of a real video/decoder.
export function fakeAnnotator(overrides: Partial<Annotator> = {}): Annotator {
  return {
    classes: [
      { name: '異常クラス A', key: '1' },
      { name: '異常クラス B', key: '2' },
    ],
    rows: {},
    times: [],
    index: 0,
    file: null,
    busy: false,
    rendering: false,
    message: '',
    settings: false,
    draft: [],
    configError: '',
    scanned: 0,
    reviewed: 0,
    complete: false,
    active: true,
    canvasRef: { current: null } as RefObject<HTMLCanvasElement | null>,
    pickerRef: { current: null } as RefObject<HTMLInputElement | null>,
    projectPickerRef: { current: null } as RefObject<HTMLInputElement | null>,
    saveProject: vi.fn(),
    loadProject: vi.fn(),
    openFile: vi.fn(),
    toggle: vi.fn(),
    move: vi.fn(),
    confirmFrame: vi.fn(),
    undo: vi.fn(),
    exportCsv: vi.fn(),
    setMessage: vi.fn(),
    openSettings: vi.fn(),
    closeSettings: vi.fn(),
    saveClasses: vi.fn(),
    addDraftClass: vi.fn(),
    removeDraftClass: vi.fn(),
    updateDraftName: vi.fn(),
    updateDraftKey: vi.fn(),
    historyLength: 0,
    ...overrides,
  } as Annotator;
}
