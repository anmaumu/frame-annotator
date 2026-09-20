export function Footer() {
  return (
    <footer>
      <span>
        <kbd>←</kbd>
        <kbd>→</kbd> フレーム移動
      </span>
      <span>
        <kbd>1</kbd>–<kbd>9</kbd> クラス切り替え（変更可）
      </span>
      <span>
        <kbd>Enter</kbd> 確認・次へ
      </span>
      <span className="autosave">作業はブラウザに自動保存</span>
    </footer>
  );
}
