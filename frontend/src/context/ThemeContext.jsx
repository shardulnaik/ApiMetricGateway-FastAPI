import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('apimetric-theme') || 'light');

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('apimetric-theme', theme);
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
    }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
