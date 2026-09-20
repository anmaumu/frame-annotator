import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Annotator } from '../features/annotator/useAnnotator';

export function Transport({ vm }: { vm: Annotator }) {
  return (
    <div className="transport">
      <div className="frame-number">
        <span>FRAME</span>
        <strong>{vm.times.length ? String(vm.index).padStart(6, '0') : '—'}</strong>
        <small>/ {vm.times.length ? String(vm.times.length - 1).padStart(6, '0') : '—'}</small>
      </div>
      <div className="step-controls">
        <button aria-label="前のフレーム" disabled={!vm.active || vm.index === 0} onClick={() => vm.move(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span>1 frame</span>
        <button aria-label="次のフレーム" disabled={!vm.active || vm.index === vm.times.length - 1} onClick={() => vm.move(1)}>
          <ArrowRight size={18} />
        </button>
      </div>
      <span className="timestamp">{vm.times.length ? vm.times[vm.index].toFixed(6) : '0.000000'} s</span>
    </div>
  );
}
