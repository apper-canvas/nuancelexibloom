import { createContext, useState, useContext, useEffect } from 'react';

// Define initial themes
const predefinedThemes = {
  vibrant: {
    name: 'Vibrant',
    description: 'Energetic purple and pink tones',
    primary: '#8a5cf7',
    secondary: '#f472b6',
    accent: '#06b6d4',
    background: 'from-indigo-50 to-pink-50',
    darkBackground: 'from-gray-900 to-purple-900'
  },
  forest: {
    name: 'Forest',
    description: 'Calming natural green palette',
    primary: '#059669',
    secondary: '#65a30d',
    accent: '#16a34a',
    background: 'from-green-50 to-emerald-50',
    darkBackground: 'from-gray-900 to-green-900'
  },
  ocean: {
    name: 'Ocean',
    description: 'Refreshing blue and teal tones',
    primary: '#0284c7',
    secondary: '#0891b2',
    accent: '#06b6d4',
    primary: '#8a5cf7',
    secondary: '#f472b6',
    accent: '#06b6d4',
    background: 'from-indigo-50 to-pink-50',
    darkBackground: 'from-gray-900 to-purple-900'
  },
  calm: {
    name: 'Calm',
    description: 'Soothing blue and green shades',
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#0ea5e9',
    background: 'from-blue-50 to-green-50',
    darkBackground: 'from-gray-900 to-blue-900'
  },
  midnight: {
    name: 'Midnight',
    description: 'Elegant dark purple and blue',
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#0ea5e9',
    background: 'from-blue-50 to-green-50',
    darkBackground: 'from-gray-900 to-blue-900'
  },
  sunset: {
    name: 'Sunset',
    description: 'Warm orange and pink gradient',
    primary: '#f97316',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: 'from-orange-50 to-pink-50',
    darkBackground: 'from-gray-900 to-orange-900'
  },
  custom: {
    name: 'Custom',
    description: 'Your personalized color theme',
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