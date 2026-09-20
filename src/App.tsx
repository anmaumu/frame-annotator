import { Header } from './components/Header';
import { VideoPanel } from './components/VideoPanel';
import { ClassPanel } from './components/ClassPanel';
import { SettingsModal } from './components/SettingsModal';
import { MessageToast } from './components/MessageToast';
import { Footer } from './components/Footer';
import { useAnnotator } from './features/annotator/useAnnotator';

export default function App() {
  const vm = useAnnotator();
  return (
    <main>
      <Header vm={vm} />
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">FRAME-BY-FRAME LABELING</p>
          <h1>{vm.file?.name || 'アノテーション workspace'}</h1>
        </div>
        <span className="pill">{vm.busy ? '読み込み中' : vm.complete ? '確認完了' : vm.times.length ? '作業中' : '動画未選択'}</span>
      </div>
      <div className="workspace">
        <VideoPanel vm={vm} />
        <ClassPanel vm={vm} />
      </div>
      <MessageToast vm={vm} />
      <Footer />
      <SettingsModal vm={vm} />
    </main>
  );
}
