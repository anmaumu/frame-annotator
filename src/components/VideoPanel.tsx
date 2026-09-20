import { Film } from 'lucide-react';
import type { Annotator } from '../features/annotator/useAnnotator';
import { VideoScreen } from './VideoScreen';
import { Transport } from './Transport';
import { ProgressBar } from './ProgressBar';

export function VideoPanel({ vm }: { vm: Annotator }) {
  return (
    <section className="viewer-panel">
      <div className="viewer-top">
        <span>
          <Film size={15} />
          VIDEO
        </span>
        <span>{vm.times.length ? `${vm.times.length.toLocaleString()} frames` : 'MKV / WebM · VP9'}</span>
      </div>
      <VideoScreen vm={vm} />
      <Transport vm={vm} />
      <ProgressBar vm={vm} />
    </section>
  );
}
