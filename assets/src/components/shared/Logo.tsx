import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * DailyBrew logo — Lucide Coffee icon in the brand palette.
 * Used in navbar, sidebar, auth pages, and loading screens.
 */
export function Logo({ size = 32, className = '' }: LogoProps) {
  return <Coffee size={size} className={cn('text-coffee', className)} strokeWidth={2} />;
}

/**
 * Full brand mark: logo icon + "DailyBrew" text
 */
export function LogoBrand({ size = 32, className = '' }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Logo size={size} />
      <span
        className="font-semibold text-coffee"
        style={{
          fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
          fontSize: size * 0.56,
        }}
      >
        DailyBrew
      </span>
    </div>
  );
}
