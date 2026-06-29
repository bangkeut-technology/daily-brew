import { useCallback, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  ImagePlus,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { axios } from '@/lib/apiAxios';
import { cn } from '@/lib/utils';

/**
 * In-console feedback launcher.
 *
 * Submits through our own PHP backend (`POST /api/v1/support/feedback`), exactly
 * like the public `/support` page — a same-origin request that proxies to
 * SupportDock server-side. It deliberately does NOT call SupportDock directly
 * from the browser: that cross-origin request is blocked by CORS (SupportDock
 * sends no `Access-Control-Allow-Origin`), which surfaced as "Failed to fetch".
 *
 * The launcher only renders when feedback is configured on the server, signalled
 * by the presence of `window.__DAILYBREW__.supportdockApiKey`.
 */

type FeedbackType = 'bug' | 'feature' | 'question' | 'general';

const MAX_IMAGES = 3;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const feedbackTypes: {
  value: FeedbackType;
  key: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  color: string;
}[] = [
  { value: 'bug', key: 'bug', icon: Bug, color: 'text-red' },
  { value: 'feature', key: 'feature', icon: Lightbulb, color: 'text-amber' },
  { value: 'question', key: 'question', icon: HelpCircle, color: 'text-blue' },
  { value: 'general', key: 'general', icon: MessageSquare, color: 'text-coffee' },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Outer guard: only surface the launcher when feedback is configured on the
 * server. The SupportDock key injected into `window.__DAILYBREW__` doubles as
 * that "enabled" flag — the actual submission goes through our PHP backend, not
 * the browser, so the key itself is never used client-side for the request.
 */
export function FeedbackWidget() {
  const enabled = !!window.__DAILYBREW__?.supportdockApiKey;
  if (!enabled) return null;
  return <FeedbackWidgetInner />;
}

function FeedbackWidgetInner() {
  const { t } = useTranslation();
  const auth = useAuthenticationState();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  }, []);

  const user = auth.user;
  const name = useMemo(() => {
    if (!user) return undefined;
    return user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined;
  }, [user]);

  const resetForm = useCallback(() => {
    setType('general');
    setMessage('');
    setImages([]);
    setLocalError(null);
    reset();
  }, [reset]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) resetForm();
    },
    [resetForm],
  );

  const handleImageAdd = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        setLocalError(t('feedback.errors.maxImages', { max: MAX_IMAGES }));
        return;
      }
      const selected = Array.from(files).slice(0, remaining);
      if (selected.some((f) => !ACCEPTED_TYPES.includes(f.type))) {
        setLocalError(t('feedback.errors.invalidType'));
        return;
      }
      const dataUrls = await Promise.all(selected.map(fileToDataUrl));
      setImages((prev) => [...prev, ...dataUrls]);
      setLocalError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [images.length, t],
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim().length < 10) {
        setLocalError(t('feedback.errors.message'));
        return;
      }
      setLocalError(null);
      setError(null);
      setLoading(true);
      try {
        await axios.post('/support/feedback', {
          type,
          name,
          email: user?.email,
          subject: '',
          message: message.trim(),
          images,
          page: window.location.pathname,
          source: 'console',
        });
        setSuccess(true);
      } catch {
        setError(t('feedback.errors.sendFailed', 'Could not send feedback. Please try again.'));
      } finally {
        setLoading(false);
      }
    },
    [message, type, user, name, images, t],
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t('feedback.launcher')}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-[14px] font-medium bg-coffee text-white shadow-[0_6px_20px_rgba(107,66,38,0.30)] transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px cursor-pointer"
        >
          <MessageSquarePlus size={18} strokeWidth={1.9} />
          <span className="hidden sm:inline">{t('feedback.launcher')}</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[440px] max-h-[calc(100vh-2rem)] overflow-y-auto bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <Dialog.Title className="text-[18px] font-semibold text-text-primary font-serif">
                  {t('feedback.title')}
                </Dialog.Title>
                <Dialog.Description className="text-[14px] text-text-secondary mt-1 leading-relaxed">
                  {t('feedback.subtitle')}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label={t('common.close', 'Close')}
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary bg-glass-bg border border-cream-3 transition-colors duration-150 hover:text-text-primary hover:bg-cream-3/50 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-green" />
                </div>
                <h3 className="text-[17px] font-semibold text-text-primary mb-1">
                  {t('feedback.success.title')}
                </h3>
                <p className="text-[14px] text-text-secondary mb-6">
                  {t('feedback.success.subtitle')}
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-lg text-[14px] font-medium bg-glass-bg border border-cream-3 text-text-primary transition-all duration-150 hover:bg-cream-3/50 hover:-translate-y-px cursor-pointer"
                >
                  {t('feedback.success.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-2">
                    {t('feedback.typeLabel')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {feedbackTypes.map((ft) => (
                      <button
                        key={ft.value}
                        type="button"
                        onClick={() => setType(ft.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[12px] font-medium transition-all duration-150 cursor-pointer',
                          type === ft.value
                            ? 'border-coffee bg-coffee/8 text-coffee'
                            : 'border-cream-3 bg-glass-bg text-text-secondary hover:border-coffee/30 hover:bg-coffee/4',
                        )}
                      >
                        <ft.icon size={17} strokeWidth={1.8} className={type === ft.value ? 'text-coffee' : ft.color} />
                        {t(`feedback.types.${ft.key}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback-message" className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    {t('feedback.messageLabel')}
                  </label>
                  <textarea
                    id="feedback-message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder={t('feedback.messagePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-glass-bg backdrop-blur-md border border-glass-border text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-200 resize-none focus:border-amber/40 focus:shadow-[0_4px_16px_rgba(193,127,59,0.10)]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    {t('feedback.screenshotsLabel')}{' '}
                    <span className="text-text-tertiary font-normal">
                      {t('feedback.screenshotsOptional', { max: MAX_IMAGES })}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {images.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-glass-border">
                        <img src={src} alt={t('feedback.attachmentAlt', { n: i + 1 })} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label={t('feedback.removeAttachment')}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red/80 text-white flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-red"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    {images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-xl border-2 border-dashed border-cream-3 bg-glass-bg flex flex-col items-center justify-center gap-1 text-text-tertiary transition-all duration-150 hover:border-coffee/40 hover:text-coffee cursor-pointer"
                      >
                        <ImagePlus size={16} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">{t('feedback.addScreenshot')}</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    id="feedback-images"
                    name="images"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageAdd(e.target.files)}
                  />
                </div>

                {(localError || error) && (
                  <p className="text-[12.5px] text-red">{localError || error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[15px] font-medium bg-coffee text-white transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                  {loading ? t('feedback.sending') : t('feedback.send')}
                </button>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
