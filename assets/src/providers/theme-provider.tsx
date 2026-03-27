import React, { type ReactNode } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

interface Props {
    children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
    return (
        <NextThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
        </NextThemeProvider>
    );
}
