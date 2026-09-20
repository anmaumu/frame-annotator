import { Film, Plus } from 'lucide-react';
import type { Annotator } from '../features/annotator/useAnnotator';

export function VideoScreen({ vm }: { vm: Annotator }) {
  return (
    <div
      className="screen"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) void vm.openFile(f);
      }}
    >
      <canvas ref={vm.canvasRef} hidden={!vm.times.length} aria-label={`フレーム ${vm.index}`} />
      {!vm.times.length && (
        <div className="empty">
          <div className="empty-icon">
            <Film size={32} />
          </div>
          <h2>{vm.busy ? 'フレームを確認しています' : '動画から、ひとつずつ。'}</h2>
          <p>{vm.busy ? `${vm.scanned.toLocaleString()} フレームを読み取り済み` : 'ここに動画をドロップ、またはファイルを選択'}</p>
          {vm.busy ? (
            <p className="muted">正確なフレーム番号のため、初回は動画全体を読み取ります。</p>
          ) : (
            <button onClick={() => vm.pickerRef.current?.click()}>
              <Plus size={17} />
              動画を選択する
            </button>
          )}
          <small>動画はこのPC内で処理されます</small>
        </div>
      )}
      {!!vm.times.length && (
        <span className="frame-overlay">
          FRAME {String(vm.index).padStart(6, '0')}
          {vm.rendering ? ' · 読み込み中' : ''}
        </span>
      )}
    </div>
  );
}
