import { Check, Settings2, Undo2 } from 'lucide-react';
import type { Annotator } from '../features/annotator/useAnnotator';

export function ClassPanel({ vm }: { vm: Annotator }) {
  return (
    <aside>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ANNOTATION</p>
          <h2>異常クラス</h2>
        </div>
        <button className="icon-button" aria-label="クラスとキーの設定" onClick={vm.openSettings}>
          <Settings2 size={18} />
        </button>
      </div>
      <p className="panel-description">
        該当するクラスをオンにします。
        <br />
        複数のクラスを同時に選択できます。
      </p>
      <div className="class-list">
        {vm.classes.map((c, n) => (
          <button
            key={n}
            className={`class-card ${vm.row?.flags[n] ? 'selected' : ''}`}
            aria-pressed={!!vm.row?.flags[n]}
            disabled={!vm.active}
            onClick={() => vm.toggle(n)}
          >
            <kbd>{c.key.toUpperCase()}</kbd>
            <span>{c.name}</span>
            <b>{vm.row?.flags[n] || 0}</b>
          </button>
        ))}
      </div>
      <div className="review-status">
        <span className={vm.row?.reviewed ? 'status-reviewed' : ''}>
          {vm.row?.reviewed ? <Check size={15} /> : <span className="status-dot" />}
          {vm.row?.reviewed ? '確認済み' : '未確認'}
        </span>
        <span>{vm.row?.flags.some(Boolean) ? '異常あり' : 'フラグなし'}</span>
      </div>
      <button className="primary confirm" disabled={!vm.active} onClick={vm.confirmFrame}>
        <Check size={18} />
        確認して次へ<kbd>Enter</kbd>
      </button>
      <button className="undo" disabled={!vm.active || !vm.historyLength} onClick={vm.undo}>
        <Undo2 size={15} />
        ラベル変更を元に戻す<small>Ctrl Z</small>
      </button>
      <div className="note">
        異常がない場合は、すべて0のまま
        <br />
        確認してください。
      </div>
    </aside>
  );
}
