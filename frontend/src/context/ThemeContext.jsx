import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Ensures theme consumers are wrapped by ThemeProvider.
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // Prefer the user's saved choice, then fall back to the system theme.
        const saved = localStorage.getItem('theme-mode');
        if (saved) return saved === 'dark';
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Keep both CSS selectors and localStorage in sync with React state.
        localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
        
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        // The UI only needs to flip the boolean; the effect above handles the DOM.
        setIsDark(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
