import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDarkMode: boolean; // FIX: Added isDarkMode property
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('system');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const localTheme = localStorage.getItem('theme') as Theme | null;
        if (localTheme) {
            setThemeState(localTheme);
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const currentTheme = theme === 'system' ? systemTheme : theme;
        
        setIsDarkMode(currentTheme === 'dark');
        
        root.classList.remove('light', 'dark');
        root.classList.add(currentTheme);
        
        localStorage.setItem('theme', theme);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDarkMode }}>
            {children}
        </Theme-Context.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};