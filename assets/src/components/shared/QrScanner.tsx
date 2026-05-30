import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useTranslation } from 'react-i18next';
import { CameraOff } from 'lucide-react';

/**
 * Minimal in-browser QR code scanner. Opens the rear camera via
 * getUserMedia, decodes frames with jsQR on a hidden canvas, and fires
 * `onDecode(text)` exactly once per scan session — the parent is expected
 * to either unmount the scanner or call `key` rotation to scan again.
 *
 * Cleans up the MediaStream + RAF loop on unmount. Returns a fallback
 * UI when the browser doesn't support getUserMedia or permission was
 * denied, so callers don't have to handle that themselves.
 */
interface QrScannerProps {
  /** Called with the raw decoded string the first time a QR resolves. */
  onDecode: (text: string) => void;
  /** Optional override for the "camera not available" copy. */
  unavailableText?: string;
}

type Status = 'idle' | 'starting' | 'scanning' | 'unavailable' | 'denied';

export function QrScanner({ onDecode, unavailableText }: QrScannerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const decodedRef = useRef(false);
  const [status, setStatus] = useState<Status>('idle');

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      return;
    }

    setStatus('starting');
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStatus('scanning');

        const canvas = canvasRef.current ?? document.createElement('canvas');
        canvasRef.current = canvas;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const tick = () => {
          if (decodedRef.current) return;
          if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code?.data) {
            decodedRef.current = true;
            stop();
            onDecode(code.data);
            return;
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) setStatus('denied');
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [onDecode, stop]);

  if (status === 'unavailable' || status === 'denied') {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 rounded-xl border border-amber/20 bg-amber/5 text-center">
        <CameraOff size={20} className="text-amber" />
        <p className="text-[14px] text-text-secondary">
          {unavailableText ??
            (status === 'denied'
              ? t('dashboard.linkScanDenied', 'Camera permission denied. Use Paste ID instead.')
              : t(
                  'dashboard.linkScanUnsupported',
                  'Camera not available in this browser. Use Paste ID instead.',
                ))}
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-black/80 aspect-square w-full max-w-[280px] mx-auto">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Crosshair frame to hint where to aim */}
      <div className="pointer-events-none absolute inset-6 border-2 border-amber/70 rounded-lg" />
      {status === 'starting' && (
        <div className="absolute inset-0 flex items-center justify-center text-[14px] text-white/80">
          {t('dashboard.linkScanStarting', 'Starting camera…')}
        </div>
      )}
    </div>
  );
}
