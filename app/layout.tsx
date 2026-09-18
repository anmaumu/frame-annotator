import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Frame — 動画ラベリング',description:'VP9 / MKVの動画をフレーム単位で確認し、クラス別のラベルをCSVに出力。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ja"><body>{children}</body></html>}
