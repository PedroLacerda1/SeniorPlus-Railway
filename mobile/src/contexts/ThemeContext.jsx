import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { storage } from '../utils/storage';

export const ThemeContext = createContext({});

export const themes = {
  light: {
    dark: false,
    background: '#f1f5f9',
    containerGradient: ['#f8fafc', '#e2e8f0'],
    cardBackground: '#ffffff',
    cardBorder: '#e2e8f0',
    cardShadow: 'rgba(0, 0, 0, 0.08)',
    text: '#1a202c',
    textSecondary: '#1a202c',
    subtitle: '#718096',
    placeholder: '#94a3b8',
    badgeBg: '#f1f5f9',
    label: '#2d3748',
    labelIcon: '#718096',
    inputBackground: '#ffffff',
    inputBorder: '#cbd5e1',
    inputBorderFocused: '#0aa174',
    inputText: '#1a202c',
    inputPlaceholder: '#94a3b8',
    inputIcon: '#94a3b8',
    eyeIcon: '#94a3b8',
    checkboxBorder: '#94a3b8',
    checkboxText: '#4a5568',
    primary: '#0aa174',
    buttonGradient: ['#0aa174', '#088f66'],
    buttonText: '#ffffff',
    dividerLine: '#e2e8f0',
    dividerText: '#718096',
    socialBackground: '#ffffff',
    socialBorder: '#e2e8f0',
    socialText: '#4a5568',
    footerText: '#718096',
    link: '#0aa174',
    errorBackground: 'rgba(239, 68, 68, 0.10)',
    errorBorder: 'rgba(239, 68, 68, 0.25)',
    errorText: '#b91c1c',
    roleInactiveBg: '#f8fafc',
    roleInactiveBorder: '#e2e8f0',
    roleInactiveText: '#4a5568',
    roleActiveBg: 'rgba(10, 161, 116, 0.1)',
    roleActiveBorder: '#0aa174',
    roleActiveText: '#0aa174',
    themeToggleBg: '#ffffff',
    themeToggleBorder: '#e2e8f0',
    themeToggleIcon: '#4a5568',
    statusBar: 'dark',
  },
  dark: {
    dark: true,
    background: '#0d131f',
    containerGradient: ['#0b111e', '#0f172a'],
    cardBackground: '#172133',
    cardBorder: '#243247',
    cardShadow: 'rgba(0, 0, 0, 0.45)',
    text: '#ffffff',
    textSecondary: '#e2e8f0',
    subtitle: '#cbd5e1',
    placeholder: '#64748b',
    badgeBg: '#1e293b',
    label: '#cbd5e1',
    labelIcon: '#94a3b8',
    inputBackground: '#131b29',
    inputBorder: '#27364e',
    inputBorderFocused: '#00c885',
    inputText: '#ffffff',
    inputPlaceholder: '#52627a',
    inputIcon: '#64748b',
    eyeIcon: '#64748b',
    checkboxBorder: '#ffffff',
    checkboxText: '#ffffff',
    primary: '#00c885',
    buttonGradient: ['#00c885', '#009b65'],
    buttonText: '#ffffff',
    dividerLine: '#27364e',
    dividerText: '#73849a',
    socialBackground: '#192336',
    socialBorder: '#293952',
    socialText: '#ffffff',
    footerText: '#8f9eb3',
    link: '#00c885',
    errorBackground: 'rgba(239, 68, 68, 0.15)',
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    errorText: '#fca5a5',
    roleInactiveBg: '#131b29',
    roleInactiveBorder: '#27364e',
    roleInactiveText: '#94a3b8',
    roleActiveBg: 'rgba(0, 200, 133, 0.15)',
    roleActiveBorder: '#00c885',
    roleActiveText: '#00c885',
    themeToggleBg: '#192336',
    themeToggleBorder: '#293952',
    themeToggleIcon: '#f1f5f9',
    statusBar: 'light',
  },
};

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true); // default to dark matching reference
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadThemePreference() {
      try {
        const savedTheme = await storage.getItem('theme_preference');
        if (savedTheme) {
          setDarkMode(savedTheme === 'dark');
        } else {
          const systemScheme = Appearance.getColorScheme();
          setDarkMode(systemScheme === 'dark');
        }
      } catch (_err) {
        // Fallback default
      } finally {
        setIsLoaded(true);
      }
    }

    loadThemePreference();
  }, []);

  const toggleDarkMode = async () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    try {
      await storage.setItem('theme_preference', nextMode ? 'dark' : 'light');
    } catch (_err) {}
  };

  const currentTheme = darkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        theme: currentTheme,
        colors: currentTheme,
        isLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

