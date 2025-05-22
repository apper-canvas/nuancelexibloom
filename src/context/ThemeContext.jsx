import { createContext, useState, useContext, useEffect } from 'react';

// Define initial themes
const predefinedThemes = {
  vibrant: {
    name: 'Vibrant',
    primary: '#8a5cf7',
    secondary: '#f472b6',
    accent: '#06b6d4',
    background: 'from-indigo-50 to-pink-50',
    darkBackground: 'from-gray-900 to-purple-900'
  },
  calm: {
    name: 'Calm',
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#0ea5e9',
    background: 'from-blue-50 to-green-50',
    darkBackground: 'from-gray-900 to-blue-900'
  },
  sunset: {
    name: 'Sunset',
    primary: '#f97316',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: 'from-orange-50 to-pink-50',
    darkBackground: 'from-gray-900 to-orange-900'
  },
  custom: {
    name: 'Custom',
    primary: '#8a5cf7',
    secondary: '#f472b6',
    accent: '#06b6d4',
    background: 'from-indigo-50 to-pink-50',
    darkBackground: 'from-gray-900 to-purple-900'
  }
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage or use default
  const getSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? JSON.parse(savedTheme) : predefinedThemes.vibrant;
  };

  const [currentTheme, setCurrentTheme] = useState(getSavedTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Apply theme colors to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', currentTheme.primary);
    document.documentElement.style.setProperty('--color-secondary', currentTheme.secondary);
    document.documentElement.style.setProperty('--color-accent', currentTheme.accent);
    
    // Save theme to localStorage
    localStorage.setItem('theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setCurrentTheme,
      isDarkMode,
      toggleDarkMode,
      predefinedThemes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};