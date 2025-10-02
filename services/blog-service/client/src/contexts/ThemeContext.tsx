import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'classic' | 'blue' | 'purple' | 'green' | 'orange' | 'indigo';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('classic');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    const themes = ['theme-classic', 'theme-blue', 'theme-purple', 'theme-green', 'theme-orange', 'theme-indigo'];
    themes.forEach(t => root.classList.remove(t));
    
    // Add current theme
    root.classList.add(`theme-${theme}`);
    
    // Handle dark mode
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isDark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}