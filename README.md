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

CSV は表示順の0始まり frame、reviewed、各クラスの0/1を含む。未確認を残した出力は _partial.csv。
動画はアップロードしない。初回は全フレームをデコードしてタイムスタンプを列挙するため、長い動画は読み込みに時間がかかる。画像を全件保持せず、その都度フレームを取得する。遠くへの移動はキーフレームからの再デコードが必要になる。
作業はファイル名・サイズ・更新時刻をキーにlocalStorageへ保存。同じファイルを同じブラウザで開くと復元する。ブラウザの保存データ削除に備えてCSVを保存すること。

## 途中保存・再開

- 「作業を保存」（Ctrl+S）で .frame.json をダウンロード。クラス名・キー、全ラベル、確認済み状態、現在位置を保存する。
- 再開時は元の動画を開いてから「作業を読込」（Ctrl+Shift+O）で保存ファイルを選択する。現在のラベル・設定を保存内容に置き換える。Undo履歴は引き継がない。
- 動画は作業ファイルに含まれないため、元の動画も保管する。ファイル名・サイズ・フレームのタイムスタンプが一致しない動画には読み込めない。
- ブラウザ内の自動保存も継続。CSVは結果の出力用で、再開には作業ファイルを使う。

## ソース構成

```text
src/
├─ features/annotator/
│  ├─ useAnnotator.ts             # 機能を組み合わせて画面へ渡す
│  ├─ types.ts                    # クラス・ラベルの共通型
│  ├─ video/useVideoFrames.ts     # 動画読み込み・デコード・表示・移動
│  ├─ labels/useAnnotations.ts    # ラベル変更・確認・Undo
│  ├─ labels/storage.ts           # 自動保存・復元
│  ├─ classes/useClassSettings.ts # クラス設定の編集
│  ├─ classes/validation.ts       # 設定の検証
│  ├─ keyboard/useShortcuts.ts    # キーボード操作
│  ├─ export/csv.ts               # CSV生成
│  ├─ export/downloadCsv.ts       # CSVダウンロード
│  └─ project/                   # 作業ファイルの保存・読込
├─ components/                   # 画面の表示部品
└─ App.tsx
```

画面部品は `features/annotator/useAnnotator.ts` の `Annotator` 型を参照し、
従来と同じ `vm` を受け取る。各機能は画面部品に依存しない。
保存キー・保存形式は変更していないので、以前の作業も復元できる。

## テスト

```sh
npm test          # 単体・コンポーネントテスト（Vitest）
npm run test:e2e  # E2Eテスト（Playwright、実際にVP9動画をデコードして操作）
```

- 単体テスト: CSV生成 (`src/features/annotator/export/csv.test.ts`)、クラス設定のバリデーション (`src/features/annotator/classes/validation.test.ts`)
- コンポーネントテスト: `src/components/*.test.tsx`（偽のViewModelを渡して表示・クリック挙動を検証、実動画・実デコードは不要）
- E2Eテスト: `e2e/annotator.spec.ts`（`samples/vp9-labeling-demo.mkv`を実際に開き、デコード・フレーム移動・ラベル付け・Undo・CSV出力まで一気通貫で検証。`npm run dev`を自動起動する）

## 検証状況

TypeScript型検査、production build、上記の自動テスト（単体・コンポーネント・E2E）を確認済み。
