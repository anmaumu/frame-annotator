import { buildCsv } from './csv';
import type { ClassDef, Row } from '../types';

export function downloadCsv(times: number[], rows: Record<number, Row>, classes: ClassDef[], file: File | null, complete: boolean) {
    const csv = buildCsv(times, rows, classes);
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.[^.]+$/, '') || 'labels'}${complete ? '' : '_partial'}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
