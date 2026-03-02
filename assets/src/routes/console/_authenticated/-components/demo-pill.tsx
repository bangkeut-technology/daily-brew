import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { differenceInMinutes, intervalToDuration } from 'date-fns';

type Props = { expiresAt?: string | null; className?: string };

export function DemoPill({ expiresAt, className }: Props) {
    const [label, setLabel] = React.useState<string>('Resets in 24h');

    React.useEffect(() => {
        if (!expiresAt) return;
        const update = () => {
            const mins = Math.max(0, differenceInMinutes(new Date(expiresAt), new Date()));
            const dur = intervalToDuration({ start: 0, end: mins * 60 * 1000 });
            // keep it short: “5h 12m” or “23m”
            const parts = [];
            if (dur.days) parts.push(`${dur.days}d`);
            if (dur.hours) parts.push(`${dur.hours}h`);
            if (!dur.days && !dur.hours) parts.push(`${dur.minutes ?? 0}m`);
            setLabel(`Resets in ${parts.join(' ')}`);
        };
        update();
        const id = setInterval(update, 60_000);
        return () => clearInterval(id);
    }, [expiresAt]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="destructive" className={className}>
                        DEMO • {label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>Demo data is temporary and will be deleted after 1 day.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
