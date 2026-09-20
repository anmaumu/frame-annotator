import { X } from 'lucide-react';
import type { Annotator } from '../features/annotator/useAnnotator';

export function MessageToast({ vm }: { vm: Annotator }) {
  if (!vm.message) return null;
  return (
    <div role="status" className="message">
      {vm.message}
      <button aria-label="通知を閉じる" onClick={() => vm.setMessage('')}>
        <X size={15} />
      </button>
    </div>
  );
}
