import { cn } from '@/lib/utils';

interface BasilBookBrandProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Renders "BasilBook" with their brand gradient (teal→green)
 * and a bold, rounded style to match their logo identity.
 */
export function BasilBookBrand({ className, size = 'md' }: BasilBookBrandProps) {
  return (
    <span
      className={cn(
        'font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1ea67a] via-[#2bb673] to-[#5ec06e]',
        size === 'sm' && 'text-[inherit]',
        size === 'md' && 'text-[inherit]',
        size === 'lg' && 'text-[inherit]',
        className,
      )}
      style={{ WebkitBackgroundClip: 'text' }}
    >
      BasilBook
    </span>
  );
}
