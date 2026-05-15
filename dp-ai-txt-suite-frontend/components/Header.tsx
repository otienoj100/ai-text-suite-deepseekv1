'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Moon, Sun, Sparkles } from 'lucide-react';

export function Header() {
  const { currentApp, setCurrentApp, theme, toggleTheme } = useApp();

  const apps = [
    { id: 'redactor', label: 'Text Redactor', icon: '✍️' },
    { id: 'summarizer', label: 'Text Summarizer', icon: '📝' },
    { id: 'blogger', label: 'Blog Generator', icon: '📄' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-200/30 dark:border-blue-700/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              AI Text Suite
            </span>
          </div>

          {/* App Switcher */}
          <div className="flex gap-2 items-center flex-1 justify-center">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => setCurrentApp(app.id as any)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap text-sm ${
                  currentApp === app.id
                    ? 'bg-white dark:bg-slate-800 shadow-lg text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <span className="mr-2">{app.icon}</span>
                {app.label}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-700" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
