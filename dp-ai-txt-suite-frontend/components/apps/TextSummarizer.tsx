// components/apps/TextSummarizer.tsx
import React, { useState, useEffect } from 'react';
import { Copy, Download, Sparkles, History, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface SummaryHistory {
  id: string;
  date: string;
  preview: string;
  fullSummary: string;
  originalText: string;
  wordCount: number;
  compressionRatio: string;
}

export const TextSummarizer: React.FC = () => {
  const { showToast } = useApp();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [length, setLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [bulletPoints, setBulletPoints] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SummaryHistory[]>([]);
  const [copied, setCopied] = useState(false);
  const [originalWordCount, setOriginalWordCount] = useState(0);
  const [summaryWordCount, setSummaryWordCount] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState('0%');

  useEffect(() => {
    const saved = localStorage.getItem('summaryHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  const saveToHistory = (summaryText: string, original: string, words: number, ratio: string) => {
    const newHistory: SummaryHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      preview: summaryText.slice(0, 120) + (summaryText.length > 120 ? '...' : ''),
      fullSummary: summaryText,
      originalText: original,
      wordCount: words,
      compressionRatio: ratio
    };

    const updatedHistory = [newHistory, ...history].slice(0, 15);
    setHistory(updatedHistory);
    localStorage.setItem('summaryHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('summaryHistory');
    showToast('History cleared!', 'success');
  };

  const loadFromHistory = (item: SummaryHistory) => {
    setSummary(item.fullSummary);
    setText(item.originalText);
    setSummaryWordCount(item.fullSummary.split(/\s+/).filter(w => w).length);
    setOriginalWordCount(item.originalText.split(/\s+/).filter(w => w).length);
    setCompressionRatio(item.compressionRatio);
    setShowHistory(false);
    showToast('Loaded from history', 'success');
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      showToast('Please enter text to summarize', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), length, bullet_points: bulletPoints })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const summaryText = data.summary || data.result || data.content;
      if (!summaryText) {
        throw new Error('Invalid response format from server');
      }

      setSummary(summaryText);

      const originalCount = data.original_word_count || text.split(/\s+/).filter(w => w).length;
      const summaryCount = data.summary_word_count || summaryText.split(/\s+/).filter(w => w).length;
      const ratio = data.compression_ratio || `${((summaryCount / originalCount) * 100).toFixed(1)}%`;

      setOriginalWordCount(originalCount);
      setSummaryWordCount(summaryCount);
      setCompressionRatio(typeof ratio === 'string' ? ratio : `${ratio}%`);

      saveToHistory(summaryText, text, summaryCount, typeof ratio === 'string' ? ratio : `${ratio}%`);
      showToast('📊 Summary generated!', 'success');
    } catch (error: any) {
      console.error('Summarize error:', error);
      showToast(error.message || 'Failed to summarize text', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    showToast('Copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${length.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSummarize();
    }
  };

  const wordCount = text.split(/\s+/).filter(w => w).length;
  const compressionPercent = parseFloat(compressionRatio);

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Text Summarizer</h2>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your long text here to summarize..."
            className="textarea-field min-h-[200px]"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg 
                          border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
            {wordCount} words
          </div>
        </div>
      </div>

      {/* Options Card */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap gap-4 items-start">
          {/* Length Selection */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Summary Length
            </label>
            <div className="flex gap-2">
              {(['Short', 'Medium', 'Detailed'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    length === l
                      ? 'toggle-button-active'
                      : 'toggle-button'
                  }`}
                  disabled={loading}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Bullet Points Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 
                            dark:border-slate-700 cursor-pointer hover:border-[#667eea] 
                            dark:hover:border-[#667eea] transition-all bg-white dark:bg-slate-800/50">
              <input
                type="checkbox"
                checked={bulletPoints}
                onChange={(e) => setBulletPoints(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-[#667eea] 
                         focus:ring-[#667eea] focus:ring-offset-0"
              />
              <div>
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 block">Bullet Points</span>
                <span className="text-xs text-slate-500">Format as structured list</span>
              </div>
            </label>
          </div>

          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
              showHistory 
                ? 'border-[#667eea] bg-[#667eea]/10 text-[#667eea]' 
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="font-medium text-sm">History ({history.length})</span>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSummarize}
        disabled={loading || !text.trim()}
        className="gradient-button w-full flex items-center justify-center gap-2 text-lg py-4"
      >
        {loading ? (
          <>
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing & Summarizing...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            📊 Generate Summary
          </>
        )}
      </button>

      {/* History Panel */}
      {showHistory && (
        <div className="glass-card p-6 animate-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Summary History</h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium 
                         text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No summaries yet</p>
              <p className="text-sm text-slate-400 mt-1">Generate a summary to see it here</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 
                           dark:hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-slate-400">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 
                                     bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                        {item.compressionRatio}
                      </span>
                      <span className="text-xs text-slate-400">{item.wordCount} words</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.preview}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result Card */}
      {summary && (
        <div className="glass-card p-6 animate-in">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Summary</h3>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                  <span>{originalWordCount} → {summaryWordCount} words</span>
                  <span className="text-emerald-600 font-medium">{compressionRatio}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 
                         dark:bg-slate-800 dark:hover:bg-slate-700 transition text-sm font-medium 
                         text-slate-700 dark:text-slate-300"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadAsTxt}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 
                         dark:bg-slate-800 dark:hover:bg-slate-700 transition text-sm font-medium 
                         text-slate-700 dark:text-slate-300"
              >
                <Download className="w-4 h-4" />
                .txt
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            {bulletPoints ? (
              <div className="space-y-3">
                {summary.split('\n').filter(line => line.trim()).map((line, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-2 h-2 mt-2 rounded-full bg-[#667eea] flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{line.trim()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary}
              </p>
            )}
          </div>

          {/* Compression Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(compressionPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};