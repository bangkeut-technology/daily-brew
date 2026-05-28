import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/providers/language-provider';
import { CustomSelect, type SelectOption } from '@/components/shared/CustomSelect';
import { cn } from '@/lib/utils';

/**
 * Three supported locales. Labels stay in each language's *own* script — a
 * French visitor looking at a Khmer page must still be able to spot "Français".
 * Translating the labels into the active locale would defeat that.
 */
const LANGUAGES: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'km', label: 'ភាសាខ្មែរ' },
];

const FALLBACK: SelectOption = LANGUAGES[0];

interface Props {
  /**
   * `nav`     — marketing nav / footer / sidebar: pill with globe icon + label
   *             on a transparent background so it blends with surrounding chrome.
   * `floating`— absolute-positioned chip used on auth screens, opaque so it
   *             stays legible against the gradient backdrop.
   */
  variant?: 'nav' | 'floating';
  className?: string;
}

/**
 * Compact language picker wired to {@link useLanguage}. Switching persists in
 * three places (sessionStorage, `dailybrew_lang` cookie, `?lang=` URL param —
 * see language-provider.tsx) so the choice survives full page reloads, share
 * links, and server-rendered meta tags.
 */
export function LanguageSwitcher({ variant = 'nav', className }: Props) {
  const { locale, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  // i18next can briefly emit a BCP-47 tag with a region (e.g. "en-US"); fall
  // back to the language part before claiming we don't recognise it.
  const base = (locale ?? 'en').split('-')[0];
  const active = LANGUAGES.find((l) => l.value === base) ?? FALLBACK;

  return (
    <div
      className={cn(
        // Trigger width is set on the wrapper so CustomSelect's portaled menu
        // (which copies the trigger's measured width) matches.
        variant === 'floating' ? 'w-[140px]' : 'w-[130px]',
        className,
      )}
    >
      <CustomSelect
        value={active.value}
        onChange={changeLanguage}
        options={LANGUAGES}
        renderSelected={(opt) => (
          <span className="flex items-center gap-1.5 min-w-0">
            <Globe size={13} className="text-text-tertiary shrink-0" aria-hidden />
            <span className="truncate" aria-label={t('common.languageSwitcher.ariaLabel', 'Language')}>
              {opt.label}
            </span>
          </span>
        )}
      />
    </div>
  );
}
