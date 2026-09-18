# Frame

React / WebCodecs / Mediabunny による VP9 MKV ラベリングツール。

## 起動

```sh
npm install
npm run dev
```

http://localhost:5173 を Chrome / Edge で開く。

- O: 動画を選択
- 左右: 1フレーム移動
- 1〜9: クラスのフラグ切り替え（設定で変更）
- Enter: 確認済みにして次へ
- Ctrl+Z: ラベル変更を戻す
- E: CSV出力

CSV は表示順の0始まり frame、実際の timestamp_sec、reviewed、各クラスの0/1を含む。未確認を残した出力は _partial.csv。
動画はアップロードしない。初回は全フレームをデコードしてタイムスタンプを列挙するため、長い動画は読み込みに時間がかかる。画像を全件保持せず、その都度フレームを取得する。遠くへの移動はキーフレームからの再デコードが必要になる。
作業はファイル名・サイズ・更新時刻をキーにlocalStorageへ保存。同じファイルを同じブラウザで開くと復元する。ブラウザの保存データ削除に備えてCSVを保存すること。

## 検証状況

TypeScript型検査、production build、HTTP応答を確認済み。実際のVP9 MKV動画を使ったブラウザでのデコード・キー操作の検証は未実施。
