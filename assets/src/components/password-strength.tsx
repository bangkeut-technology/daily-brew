import * as React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
    value?: string;
}

/** Simple password strength helper (client-side only) */
export function PasswordStrength({ value }: PasswordStrengthProps) {
    const score = React.useMemo(() => {
        if (!value) return 0;
        let s = 0;
        if (value.length >= 8) s++;
        if (/[A-Z]/.test(value)) s++;
        if (/[a-z]/.test(value)) s++;
        if (/\d/.test(value)) s++;
        if (/[^A-Za-z0-9]/.test(value)) s++; // symbol bonus
        return Math.min(s, 5);
    }, [value]);

    const labels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'];
    const pct = (score / 5) * 100;

    return (
        <div>
            <div className="h-1.5 w-full rounded bg-muted/60 overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all',
                        score <= 2 && 'bg-destructive',
                        score === 3 && 'bg-yellow-500',
                        score >= 4 && 'bg-green-500',
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
                {value ? labels[Math.max(0, score - 1)] : 'Use 8+ chars with a mix of letters & numbers'}
            </div>
        </div>
    );
}
