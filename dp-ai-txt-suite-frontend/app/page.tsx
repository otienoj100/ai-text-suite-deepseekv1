'use client';

import { useApp } from '@/contexts/AppContext';
import { TextRedactor } from '@/components/apps/TextRedactor';
import { TextSummarizer } from '@/components/apps/TextSummarizer';
import { BlogGenerator } from '@/components/apps/BlogGenerator';

export default function Home() {
  const { currentApp } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentApp === 'redactor' && <TextRedactor />}
      {currentApp === 'summarizer' && <TextSummarizer />}
      {currentApp === 'blogger' && <BlogGenerator />}
    </div>
  );
}
