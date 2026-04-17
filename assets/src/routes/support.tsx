import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Mail,
  Send,
  Bug,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
  Loader2,
  ImagePlus,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PageSeo } from '@/components/shared/PageSeo';
import { cn } from '@/lib/utils';
import { axios } from '@/lib/apiAxios';

export const Route = createFileRoute('/support')({
  component: SupportPage,
});

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'question', 'general']),
  name: z.string().min(1, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(1, 'Please enter a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

const feedbackTypes = [
  { value: 'bug' as const, label: 'Bug report', icon: Bug, color: 'text-red' },
  { value: 'feature' as const, label: 'Feature request', icon: Lightbulb, color: 'text-amber' },
  { value: 'question' as const, label: 'Question', icon: HelpCircle, color: 'text-blue' },
  { value: 'general' as const, label: 'General', icon: MessageSquare, color: 'text-coffee' },
];

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-cream-3/50 last:border-b-0"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-transparent border-none cursor-pointer group"
      >
        <span className="text-[16px] font-medium text-text-primary pr-4 group-hover:text-coffee transition-colors duration-200">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={16} className="text-text-tertiary" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">
              <p className="text-[15px] text-text-secondary leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const MAX_IMAGES = 3;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get('/support/faqs')
      .then((res) => setFaqs(res.data ?? []))
      .catch(() => {})
      .finally(() => setFaqsLoading(false));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { type: 'general', name: '', email: '', subject: '', message: '' },
  });

  const selectedType = watch('type');

  const handleImageAdd = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    const invalid = selected.filter((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalid.length > 0) {
      toast.error('Only PNG, JPEG, WebP, and GIF images are allowed');
      return;
    }
    const dataUrls = await Promise.all(selected.map(fileToDataUrl));
    setImages((prev) => [...prev, ...dataUrls]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onSubmit = async (data: FeedbackForm) => {
    try {
      await axios.post('/support/feedback', {
        type: data.type,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        images,
        page: '/support',
      });
      setSubmitted(true);
      setImages([]);
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <PageSeo
        title="Support"
        description="Get help with DailyBrew. Contact our team, report bugs, or submit feature requests for your restaurant attendance tracking."
        path="/support"
      />

      <main className="page-enter pt-20">
        {/* Hero */}
        <section className="py-20 px-6 md:px-8 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
              Support
            </p>
            <h1 className="text-[34px] md:text-[42px] font-semibold text-text-primary font-serif leading-tight mb-4">
              How can we help?
            </h1>
            <p className="text-[16px] text-text-secondary max-w-md mx-auto">
              Send us a message and we'll get back to you within 24 hours.
            </p>
          </motion.div>
        </section>

        {/* Contact form */}
        <section className="px-6 md:px-8 max-w-2xl mx-auto pb-16">
          <motion.div
            className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-green" />
                </div>
                <h3 className="text-[20px] font-semibold text-text-primary font-serif mb-2">
                  Message sent
                </h3>
                <p className="text-[15px] text-text-secondary mb-6">
                  We'll get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-lg text-[14px] font-medium bg-glass-bg border border-cream-3 text-text-primary transition-all duration-150 hover:bg-cream-3/50 hover:-translate-y-px cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Type selector */}
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-2.5">
                    What can we help with?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {feedbackTypes.map((ft) => (
                      <button
                        key={ft.value}
                        type="button"
                        onClick={() => setValue('type', ft.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[12.5px] font-medium transition-all duration-150 cursor-pointer',
                          selectedType === ft.value
                            ? 'border-coffee bg-coffee/8 text-coffee'
                            : 'border-cream-3 bg-glass-bg text-text-secondary hover:border-coffee/30 hover:bg-coffee/4',
                        )}
                      >
                        <ft.icon size={18} strokeWidth={1.8} className={selectedType === ft.value ? 'text-coffee' : ft.color} />
                        {ft.label}
                      </button>
                    ))}
                  </div>
                  {errors.type && (
                    <p className="text-[12px] text-red mt-1">{errors.type.message}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="support-name" className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    Your name
                  </label>
                  <input
                    id="support-name"
                    type="text"
                    {...register('name')}
                    placeholder="John Doe"
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-glass-bg backdrop-blur-md border text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-200',
                      errors.name
                        ? 'border-red/50 focus:border-red/70'
                        : 'border-glass-border focus:border-amber/40 focus:shadow-[0_4px_16px_rgba(193,127,59,0.10)]',
                    )}
                  />
                  {errors.name && (
                    <p className="text-[12px] text-red mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="support-email" className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    Your email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-glass-bg backdrop-blur-md border text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-200',
                      errors.email
                        ? 'border-red/50 focus:border-red/70'
                        : 'border-glass-border focus:border-amber/40 focus:shadow-[0_4px_16px_rgba(193,127,59,0.10)]',
                    )}
                  />
                  {errors.email && (
                    <p className="text-[12px] text-red mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="support-subject" className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    Subject
                  </label>
                  <input
                    id="support-subject"
                    type="text"
                    {...register('subject')}
                    placeholder="Brief summary of your request"
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-glass-bg backdrop-blur-md border text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-200',
                      errors.subject
                        ? 'border-red/50 focus:border-red/70'
                        : 'border-glass-border focus:border-amber/40 focus:shadow-[0_4px_16px_rgba(193,127,59,0.10)]',
                    )}
                  />
                  {errors.subject && (
                    <p className="text-[12px] text-red mt-1">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="support-message" className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    {...register('message')}
                    rows={5}
                    placeholder="Describe your issue or question..."
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-glass-bg backdrop-blur-md border text-[15px] text-text-primary placeholder:text-text-tertiary outline-none transition-all duration-200 resize-none',
                      errors.message
                        ? 'border-red/50 focus:border-red/70'
                        : 'border-glass-border focus:border-amber/40 focus:shadow-[0_4px_16px_rgba(193,127,59,0.10)]',
                    )}
                  />
                  {errors.message && (
                    <p className="text-[12px] text-red mt-1">{errors.message.message}</p>
                  )}
                </div>

                {/* Images */}
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    Screenshots <span className="text-text-tertiary font-normal">(optional, max {MAX_IMAGES})</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {images.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-glass-border group">
                        <img src={src} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red/80 text-white flex items-center justify-center cursor-pointer transition-opacity duration-150 hover:bg-red"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-cream-3 bg-glass-bg flex flex-col items-center justify-center gap-1 text-text-tertiary transition-all duration-150 hover:border-coffee/40 hover:text-coffee cursor-pointer"
                      >
                        <ImagePlus size={18} strokeWidth={1.5} />
                        <span className="text-[10px] font-medium">Add</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    id="support-images"
                    name="images"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageAdd(e.target.files)}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[15px] font-medium bg-coffee text-white transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {isSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </motion.div>
        </section>

        {/* FAQs from SupportDock */}
        {!faqsLoading && faqs.length > 0 && (
          <section className="py-16 px-6 md:px-8 max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[13px] uppercase tracking-[2px] font-medium text-amber mb-3">
                FAQ
              </p>
              <h2 className="text-[30px] md:text-[36px] font-semibold text-text-primary font-serif leading-tight">
                Frequently asked questions
              </h2>
              <p className="text-[16px] text-text-secondary mt-3 max-w-md mx-auto">
                Quick answers to the most common questions.
              </p>
            </motion.div>

            <motion.div
              className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl shadow-[0_2px_12px_rgba(107,66,38,0.05)] overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  index={i}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* Bottom email fallback */}
        <section className="py-16 px-6 md:px-8 max-w-2xl mx-auto">
          <motion.div
            className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-8 text-center shadow-[0_2px_12px_rgba(107,66,38,0.05)]"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 rounded-xl bg-coffee/10 flex items-center justify-center text-coffee mx-auto mb-4">
              <Mail size={22} strokeWidth={1.8} />
            </div>
            <h3 className="text-[20px] font-semibold text-text-primary font-serif mb-2">
              Prefer email?
            </h3>
            <p className="text-[15px] text-text-secondary leading-relaxed mb-5 max-w-sm mx-auto">
              You can also reach us directly at the address below.
            </p>
            <a
              href="mailto:support@mail.dailybrew.work"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[15px] font-medium bg-coffee text-white no-underline transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
            >
              <Mail size={14} />
              support@mail.dailybrew.work
            </a>
          </motion.div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
