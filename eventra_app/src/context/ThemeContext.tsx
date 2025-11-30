import React, { createContext, useContext, useEffect, useMemo } from 'react';

export type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light';
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

// light-only mode; no system detection needed

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const effectiveTheme = useMemo<'light'>(() => 'light', []);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const value = useMemo(
    () => ({ theme: 'light' as const, effectiveTheme, setTheme: () => {}, toggle: () => {} }),
    [effectiveTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
