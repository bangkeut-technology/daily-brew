import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

/**
 * Icon-only theme toggle for the topbar. The labelled version lives in the
 * sidebar (or used to) — this variant is just a 36×36 hit area.
 */
export function ThemeToggleIcon() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? t('theme.light', 'Light mode') : t('theme.dark', 'Dark mode')}
      title={isDark ? t('theme.light', 'Light mode') : t('theme.dark', 'Dark mode')}
      className="h-9 w-9 flex items-center justify-center rounded-lg text-text-secondary border-none bg-transparent cursor-pointer transition-colors hover:bg-cream-3/40 hover:text-text-primary"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
