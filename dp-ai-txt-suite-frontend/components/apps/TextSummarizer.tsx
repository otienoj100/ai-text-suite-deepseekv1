// components/apps/TextSummarizer.tsx
import React, { useState, useEffect } from 'react';
import { Copy, Download, Sparkles, History, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface SummaryHistory {
  id: string;
  date: string;
  preview: string;
  fullSummary: string;
  originalText: string;
  wordCount: number;
}

export const TextSummarizer: React.FC = () => {
  const { showToast } = useApp();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [length, setLength] = useState('Medium');
  const [bulletPoints, setBulletPoints] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SummaryHistory[]>([]);
  const [originalWordCount, setOriginalWordCount] = useState(0);
  const [summaryWordCount, setSummaryWordCount] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState('0%');

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('summaryHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (summaryText: string, original: string, words: number) => {
    const newHistory: SummaryHistory = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      preview: summaryText.slice(0, 100) + (summaryText.length > 100 ? '...' : ''),
      fullSummary: summaryText,
      originalText: original,
      wordCount: words
    };
    
    const updatedHistory = [newHistory, ...history].slice(0, 10); // Keep last 10
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
    setSummaryWordCount(item.fullSummary.split(/\s+/).length);
    setOriginalWordCount(item.originalText.split(/\s+/).length);
    const ratio = (item.fullSummary.split(/\s+/).length / item.originalText.split(/\s+/).length) * 100;
    setCompressionRatio(`${ratio.toFixed(1)}%`);
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
      const response = await fetch('https://ai-text-suite-deepseekv1.onrender.com/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          length: length,
          bullet_points: bulletPoints
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Summarization failed');
      }

      const summaryText = data.summary || data.result || data.content;
      
      if (!summaryText) {
        throw new Error('Invalid response format from server');
      }

      setSummary(summaryText);
      
      const originalCount = data.original_word_count || text.split(/\s+/).length;
      const summaryCount = data.summary_word_count || summaryText.split(/\s+/).length;
      const ratio = data.compression_ratio || ((summaryCount / originalCount) * 100).toFixed(1);
      
      setOriginalWordCount(originalCount);
      setSummaryWordCount(summaryCount);
      setCompressionRatio(typeof ratio === 'string' ? ratio : `${ratio}%`);
      
      // Save to history
      saveToHistory(summaryText, text, summaryCount);
      
      showToast('Text summarized successfully!', 'success');
    } catch (error: any) {
      console.error('Summarize error:', error);
      showToast(error.message || 'Failed to summarize text', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    showToast('Copied to clipboard!', 'success');
  };

  const downloadAsTxt = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your long text here to summarize..."
            className="w-full h-48 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500 bg-white/80 px-2 py-1 rounded">
            {text.split(/\s+/).filter(w => w).length} words
          </div>
        </div>
      </div>

      {/* Summary Options */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary Length</label>
            <div className="flex gap-2">
              {['Short', 'Medium', 'Detailed'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`px-4 py-2 rounded-lg transition ${
                    length === l
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bulletPoints}
                onChange={(e) => setBulletPoints(e.target.checked)}
                className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Bullet point format</span>
            </label>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* Summarize Button */}
      <button
        onClick={handleSummarize}
        disabled={loading || !text.trim()}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Summarizing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Summary
          </span>
        )}
      </button>

      {/* History Panel */}
      {showHistory && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Summary History</h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No summaries yet. Generate a summary to see it here.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">{item.date}</span>
                    <span className="text-xs text-gray-400">{item.wordCount} words</span>
                  </div>
                  <p className="text-sm text-gray-700">{item.preview}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result Section */}
      {summary && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Summary:</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={downloadAsTxt}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Download as text"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            {bulletPoints ? (
              <div className="whitespace-pre-wrap text-gray-700">
                {summary.split('\n').map((line, i) => (
                  line.trim() && (
                    <div key={i} className="flex gap-2 mb-2">
                      <span className="text-purple-500">•</span>
                      <span>{line}</span>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-gray-700">{summary}</p>
            )}
          </div>
          
          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span>Original: {originalWordCount} words</span>
            <span>Summary: {summaryWordCount} words</span>
            <span className="text-green-600">Compression: {compressionRatio}</span>
          </div>
        </div>
      )}
    </div>
  );
};