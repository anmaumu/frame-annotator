import { Download, Film, FolderOpen, Save, Upload } from 'lucide-react';
import type { Annotator } from '../features/annotator/useAnnotator';

export function Header({ vm }: { vm: Annotator }) {
  return (
    <header>
      <div className="brand" aria-label="Frame Annotator">
        <span className="brand-icon">
          <Film size={21} />
        </span>
        frame
        <span className="brand-sub">ANNOTATOR</span>
      </div>
      <div className="header-actions">
        <span className="local-label">ローカル処理 · VP9 / MKV</span>
        <button onClick={() => vm.pickerRef.current?.click()} disabled={vm.busy}>
          <FolderOpen size={16} />
          動画を開く<kbd>O</kbd>
        </button>
        <button disabled={!vm.times.length || vm.busy} onClick={vm.saveProject} title="作業を保存 (Ctrl+S)">
          <Save size={16} />作業を保存
        </button>
        <button disabled={!vm.times.length || vm.busy} onClick={() => vm.projectPickerRef.current?.click()}
          title="同じ動画を開いてから作業ファイルを選択 (Ctrl+Shift+O)">
          <Upload size={16} />作業を読込
        </button>
        <button className="primary" disabled={!vm.times.length || vm.busy} onClick={vm.exportCsv}>
          <Download size={16} />
          {vm.complete ? 'CSVを書き出す' : 'CSV出力'}
          <kbd>E</kbd>
        </button>
      </div>
      <input
        ref={vm.projectPickerRef}
        type="file"
        accept=".json"
        className="file-input"
        aria-label="作業ファイルを選択"
        disabled={!vm.times.length || vm.busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void vm.loadProject(f);
          e.target.value = '';
        }}
      />
      <input
        ref={vm.pickerRef}
        type="file"
        accept=".mkv,.webm"
        className="file-input"
        aria-label="動画を選択"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void vm.openFile(f);
          e.target.value = '';
        }}
      />
    </header>
  );
}
