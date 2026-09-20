import { useEffect, useRef, useState } from 'react';
import { Input, BlobSource, MATROSKA, WEBM, VideoSampleSink } from 'mediabunny';

/** Owns decoding, frame position, canvas rendering and decoder cleanup. */
export function useVideoFrames(setMessage: (message: string) => void) {
  const [times, setTimes] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [scanned, setScanned] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const input = useRef<Input | null>(null);
  const sink = useRef<VideoSampleSink | null>(null);
  const loadId = useRef(0);
  const ready = useRef(false);
  const active = times.length > 0 && !busy && !rendering;
  /** Releases the mediabunny decoder when the component unmounts. */
  useEffect(
    () => () => {
      loadId.current++;
      input.current?.dispose();
    },
    [],
  );

  /**
   * Loads a video file, verifies it's a decodable VP9 MKV/WebM, and scans it
   * once to collect every frame's timestamp (needed so frame numbers and
   * seeking are exact). The coordinator restores labels in onLoaded and
   * returns the frame index to display; video decoding knows nothing of storage.
   *
   * @param selectedFile - the video file chosen via the file picker or drag-and-drop
   */
  async function openFile(selectedFile: File, onReset: () => void, onLoaded: (file: File, frameCount: number) => number) {
    if (busy) return;
    const id = ++loadId.current;
    ready.current = false;
    setBusy(true);
    setScanned(0);
    setMessage('');
    setTimes([]);
    onReset();
    setIndex(0);
    setFile(selectedFile);

    input.current?.dispose();
    try {
      if (!('VideoDecoder' in window)) throw Error('このブラウザでは動画をデコードできません。最新版のChromeまたはEdgeを使用してください。');
      const media = new Input({ source: new BlobSource(selectedFile), formats: [MATROSKA, WEBM] });
      input.current = media;
      const track = await media.getPrimaryVideoTrack();
      if (!track) throw Error('動画トラックがありません。');
      if ((await track.getCodec()) !== 'vp9') throw Error('VP9形式のMKV / WebMを選択してください。');
      if (!(await track.canDecode())) throw Error('この動画のVP9設定は、この環境ではデコードできません。');
      const decoder = new VideoSampleSink(track);
      sink.current = decoder;
      const timestamps: number[] = [];
      for await (const sample of decoder.samples()) {
        if (id !== loadId.current) {
          sample.close();
          return;
        }
        timestamps.push(sample.timestamp);
        sample.close();
        if (timestamps.length % 120 === 0) {
          setScanned(timestamps.length);
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
      if (!timestamps.length) throw Error('表示できるフレームがありません。');
      setTimes(timestamps);
      setIndex(onLoaded(selectedFile, timestamps.length));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '動画を読み込めませんでした。');
      input.current?.dispose();
      sink.current = null;
    } finally {
      if (id === loadId.current) setBusy(false);
    }
  }

  /**
   * Decodes and draws the frame at the current `index` onto the canvas
   * whenever `index` or `times` changes. Ignores a decode that's no longer
   * relevant (e.g. the user already moved on, or opened a different file)
   * via the `cancelled` flag.
   */
  useEffect(() => {
    if (!times.length || !sink.current) return;
    let cancelled = false;
    ready.current = false;
    setRendering(true);
    const decoder = sink.current;
    void (async () => {
      try {
        const sample = await decoder.getSample(times[index]);
        if (!sample) throw Error('フレームを取得できません。');
        try {
          if (!cancelled && canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = sample.displayWidth;
            canvas.height = sample.displayHeight;
            sample.draw(canvas.getContext('2d')!, 0, 0);
            ready.current = true;
          }
        } finally {
          sample.close();
        }
      } catch (err) {
        if (!cancelled) setMessage(err instanceof Error ? err.message : '表示に失敗しました。');
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [index, times, setMessage]);

  /**
   * Moves to another frame, clamped to the video's range. Ignored while
   * busy/decoding, or if the current frame hasn't finished rendering yet.
   *
   * @param delta - frames to move by (e.g. 1 for next, -1 for previous)
   */
  function move(delta: number) {
    if (!active || !ready.current) return;
    ready.current = false;
    const next = Math.min(times.length - 1, Math.max(0, index + delta));
    if (next === index) {
      ready.current = true;
      return;
    }
    setIndex(next);
  }

  function goTo(indexToShow: number) {
    ready.current = indexToShow === index;
    setIndex(indexToShow);
  }
  return { times, index, file, busy, rendering, scanned, active, canvasRef, pickerRef,
    openFile, move, goTo, canEdit: () => active && ready.current };
}
