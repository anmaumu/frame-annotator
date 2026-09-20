import type { Annotator } from '../features/annotator/useAnnotator';

export function ProgressBar({ vm }: { vm: Annotator }) {
  return (
    <div className="progress-area">
      <div>
        <span>確認済みのフレーム</span>
        <strong>
          {vm.reviewed.toLocaleString()} <span>/ {vm.times.length.toLocaleString()}</span>
        </strong>
      </div>
      <progress max={vm.times.length || 1} value={vm.reviewed} />
      <div className="progress-bottom">
        <span>{vm.complete ? 'すべて確認済みです。CSVを出力できます。' : 'Enter で確認済みにして、次のフレームへ'}</span>
        <span>{vm.times.length ? Math.round((vm.reviewed / vm.times.length) * 100) : 0}%</span>
      </div>
    </div>
  );
}
