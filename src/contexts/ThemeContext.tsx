import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useAuth } from './AuthContext';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface CustomTheme {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: number;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  customTheme: CustomTheme;
  muiTheme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  updateCustomTheme: (updates: Partial<CustomTheme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const defaultTheme: CustomTheme = {
  mode: 'light',
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  fontSize: 'medium',
  borderRadius: 8
};

const createCustomTheme = (customTheme: CustomTheme, systemPrefersDark: boolean): Theme => {
  const isDark = customTheme.mode === 'dark' || 
    (customTheme.mode === 'auto' && systemPrefersDark);

  const fontSizeMap = {
    small: 12,
    medium: 14,
    large: 16
  };

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: customTheme.primaryColor,
      },
      secondary: {
        main: customTheme.secondaryColor,
      },
      background: {
        default: isDark ? '#121212' : '#fafafa',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontSize: fontSizeMap[customTheme.fontSize],
      h1: { fontSize: `${fontSizeMap[customTheme.fontSize] * 2.5}px` },
      h2: { fontSize: `${fontSizeMap[customTheme.fontSize] * 2}px` },
      h3: { fontSize: `${fontSizeMap[customTheme.fontSize] * 1.75}px` },
      h4: { fontSize: `${fontSizeMap[customTheme.fontSize] * 1.5}px` },
      h5: { fontSize: `${fontSizeMap[customTheme.fontSize] * 1.25}px` },
      h6: { fontSize: `${fontSizeMap[customTheme.fontSize] * 1.1}px` },
    },
    shape: {
      borderRadius: customTheme.borderRadius,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: customTheme.borderRadius,
            boxShadow: isDark 
              ? '0 2px 8px rgba(0,0,0,0.3)' 
              : '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: customTheme.borderRadius,
            textTransform: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: customTheme.borderRadius,
            },
          },
        },
      },
    },
  });
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user, updatePreferences } = useAuth();
  const [customTheme, setCustomTheme] = useState<CustomTheme>(defaultTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load user theme preferences
  useEffect(() => {
    if (user?.preferences) {
      setCustomTheme(prev => ({
        ...prev,
        mode: user.preferences.theme
      }));
    } else {
      // Load from localStorage if no user
      const savedTheme = localStorage.getItem('ai-humanizer-theme');
      if (savedTheme) {
        try {
          setCustomTheme(JSON.parse(savedTheme));
        } catch (error) {
          console.error('Error parsing saved theme:', error);
        }
      }
    }
  }, [user]);

  const muiTheme = createCustomTheme(customTheme, systemPrefersDark);

  const toggleTheme = () => {
    const newMode: ThemeMode = customTheme.mode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const setThemeMode = (mode: ThemeMode) => {
    const newTheme = { ...customTheme, mode };
    setCustomTheme(newTheme);
    
    if (user) {
      updatePreferences({ theme: mode });
    } else {
      localStorage.setItem('ai-humanizer-theme', JSON.stringify(newTheme));
    }
  };

  const updateCustomTheme = (updates: Partial<CustomTheme>) => {
    const newTheme = { ...customTheme, ...updates };
    setCustomTheme(newTheme);
    
    if (user && updates.mode) {
      updatePreferences({ theme: updates.mode });
    } else {
      localStorage.setItem('ai-humanizer-theme', JSON.stringify(newTheme));
    }
  };

  const value: ThemeContextType = {
    themeMode: customTheme.mode,
    customTheme,
    muiTheme,
    toggleTheme,
    setThemeMode,
    updateCustomTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};