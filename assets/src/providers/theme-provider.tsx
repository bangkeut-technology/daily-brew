import React from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    systemTheme: Theme | undefined;
    setTheme: (theme: Theme) => void;
};

const MEDIA = '(prefers-color-scheme: dark)';

const initialState: ThemeProviderState = {
    theme: 'system',
    systemTheme: undefined,
    setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'symflow-ui-theme',
    ...props
}: ThemeProviderProps) {
    const [resolvedTheme] = React.useState(() => getTheme(storageKey));
    const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);

    React.useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia(MEDIA).matches ? 'dark' : 'light';

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        systemTheme: resolvedTheme as Theme | undefined,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext);

    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};

const getTheme = (key: string, fallback?: string) => {
    let theme;
    try {
        theme = localStorage.getItem(key) || undefined;
    } catch (e) {
        console.error(e);
    }
    return theme || fallback;
};
