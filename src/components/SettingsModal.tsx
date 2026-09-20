import { Plus, X } from 'lucide-react';
import type { Annotator } from '../features/annotator/useAnnotator';

export function SettingsModal({ vm }: { vm: Annotator }) {
  if (!vm.settings) return null;
  const hasRows = Object.keys(vm.rows).length > 0;
  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-modal="true" aria-label="クラス設定">
        <div className="panel-heading">
          <h2>クラスとキー</h2>
          <button aria-label="設定を閉じる" onClick={vm.closeSettings}>
            <X size={18} />
          </button>
        </div>
        <p>ラベル付け開始後は、クラスの追加・削除はできません。</p>
        {vm.draft.map((c, n) => (
          <div className="config-row" key={n}>
            <input aria-label={`クラス${n + 1}の名前`} value={c.name} onChange={(e) => vm.updateDraftName(n, e.target.value)} />
            <input aria-label={`クラス${n + 1}のキー`} className="key-input" maxLength={1} value={c.key} onChange={(e) => vm.updateDraftKey(n, e.target.value)} />
            <button aria-label={`クラス${n + 1}を削除`} disabled={hasRows || vm.draft.length === 1} onClick={() => vm.removeDraftClass(n)}>
              <X size={16} />
            </button>
          </div>
        ))}
        {vm.configError && <p role="alert">{vm.configError}</p>}
        <div className="modal-actions">
          <button disabled={vm.draft.length >= 9 || hasRows} onClick={vm.addDraftClass}>
            <Plus size={16} />
            クラスを追加
          </button>
          <button className="primary" onClick={vm.saveClasses}>
            保存
          </button>
        </div>
      </section>
    </div>
  );
}
