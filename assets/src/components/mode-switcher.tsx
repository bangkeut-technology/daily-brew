import * as React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';

import { useMetaColor } from '@/hooks/use-meta-color';
import { Button } from '@/components/ui/button';
import { META_THEME_COLORS } from '@/theme/palette';
import { useTheme } from '@/providers/theme-provider';

export function ModeSwitcher() {
    const { setTheme, theme } = useTheme();
    const { setMetaColor } = useMetaColor();

    const toggleTheme = React.useCallback(() => {
        console.log('resolvedTheme', theme);
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setMetaColor(theme === 'dark' ? META_THEME_COLORS.light : META_THEME_COLORS.dark);
    }, [theme, setTheme, setMetaColor]);

    return (
        <Button variant="ghost" className="group/toggle h-8 w-8 px-0" onClick={toggleTheme}>
            <SunIcon className="hidden [html.dark_&]:block" />
            <MoonIcon className="hidden [html.light_&]:block" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
