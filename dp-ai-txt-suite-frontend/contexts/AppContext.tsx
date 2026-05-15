'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

type App = 'redactor' | 'summarizer' | 'blogger';
type Theme = 'light' | 'dark';

interface AppContextType {
  currentApp: App;
  setCurrentApp: (app: App) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const defaultContextValue: AppContextType = {
  currentApp: 'redactor',
  setCurrentApp: () => {},
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  showToast: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextValue);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentApp, setCurrentApp] = useState<App>('redactor');
  const [theme, setTheme] = useState<Theme>('light');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initialize theme and app from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
      
      const savedApp = localStorage.getItem('currentApp') as App | null;
      if (savedApp) {
        setCurrentApp(savedApp);
      }
    } catch (e) {
      // localStorage not available
    }
  }, []);

  // Update HTML class and persist theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // localStorage not available
    }
  }, [theme]);

  // Persist current app
  useEffect(() => {
    try {
      localStorage.setItem('currentApp', currentApp);
    } catch (e) {
      // localStorage not available
    }
  }, [currentApp]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const value = useMemo<AppContextType>(
    () => ({
      currentApp,
      setCurrentApp,
      theme,
      setTheme,
      toggleTheme,
      showToast
    }),
    [currentApp, theme]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-in ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  return context;
}
