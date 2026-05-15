'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/20 dark:border-slate-700/30 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="font-bold">AI Text Suite</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Three powerful AI-powered text processing tools in one elegant suite.  
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Features</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Text Redactor - Rewrite with different tones</li>
              <li>Text Summarizer - Condense long content</li>
              <li>Blog Generator - Create engaging posts</li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold mb-4 text-slate-900 dark:text-white">Info</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Built with Next.js & React</li>
              <li>Powered by AI </li>
              <li>Dark mode support</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            © {currentYear} AI Text Suite. Built with care using modern web  - Credit: Joseph Otieno.
          </p>
        </div>
      </div>
    </footer>
  );
}
