// components/apps/TextRedactor.tsx
import React, { useState } from 'react';
import { Copy, Download, Sparkles, Check, Wand2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const EXAMPLE_TEXT = `The rapid advancement of artificial intelligence has fundamentally transformed numerous industries, from healthcare diagnostics to autonomous transportation systems. Organizations worldwide are increasingly adopting AI-driven solutions to enhance operational efficiency and deliver superior customer experiences.`;

export const TextRedactor: React.FC = () => {
  const { showToast } = useApp();
  const [text, setText] = useState('');
  const [tone, setTone] = useState<'Formal' | 'Informal'>('Formal');
  const [dialect, setDialect] = useState<'American' | 'British'>('American');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const wordCount = text.split(/\s+/).filter(w => w).length;
  const exceedsLimit = wordCount > 700;

  const handleRedact = async () => {
    if (!text.trim()) {
      showToast('Please enter some text', 'error');
      return;
    }
    if (exceedsLimit) {
      showToast('Text exceeds 700 word limit', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/redact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), tone, dialect })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const redactedText = data.redacted || data.result || data.content;

      if (!redactedText) {
        throw new Error('Invalid response format from server');
      }

      setResult(redactedText);
      showToast('✨ Text rewritten successfully!', 'success');
    } catch (error: any) {
      console.error('Redact error:', error);
      showToast(error.message || 'Failed to rewrite text', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    showToast('Copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rewritten_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
    showToast('Example loaded!', 'info');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleRedact();
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Text Redactor</h2>
          <button
            onClick={loadExample}
            className="text-sm text-[#667eea] hover:text-[#764ba2] font-medium transition"
          >
            Try Example
          </button>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your text to rewrite..."
            className="textarea-field min-h-[200px]"
            disabled={loading}
          />
          <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-medium 
                          ${exceedsLimit 
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            {wordCount} / 700 words
            {exceedsLimit && ' ⚠️'}
          </div>
        </div>
      </div>

      {/* Options Card */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Tone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Tone
            </label>
            <div className="flex gap-2">
              {(['Formal', 'Informal'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    tone === t
                      ? 'toggle-button-active'
                      : 'toggle-button'
                  }`}
                  disabled={loading}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dialect */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Dialect
            </label>
            <div className="flex gap-2">
              {(['American', 'British'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDialect(d)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    dialect === d
                      ? 'toggle-button-active'
                      : 'toggle-button'
                  }`}
                  disabled={loading}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleRedact}
        disabled={loading || !text.trim() || exceedsLimit}
        className="gradient-button w-full flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Rewriting...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            ✨ Rewrite Text
          </>
        )}
      </button>

      {/* Result Card */}
      {result && (
        <div className="glass-card p-6 animate-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rewritten Text</h3>
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

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
              {result}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>Original: {wordCount} words</span>
            <span>→</span>
            <span>Rewritten: {result.split(/\s+/).filter(w => w).length} words</span>
          </div>
        </div>
      )}
    </div>
  );
};