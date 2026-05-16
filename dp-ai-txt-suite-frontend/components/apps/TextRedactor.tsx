// components/apps/TextRedactor.tsx
import React, { useState } from 'react';
import { Copy, Download, Sparkles, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

// Emoji list for quick reactions
const emojis = ["📝", "✅", "🎯", "📚", "💪", "🛒", "🧹", "📞", "✍️", "🎨"];

export const TextRedactor: React.FC = () => {
  const { showToast } = useApp();
  const [text, setText] = useState('');
  const [tone, setTone] = useState('Formal');
  const [dialect, setDialect] = useState('American');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("📝");
  const [wordCount, setWordCount] = useState(0);
  const [redactedWordCount, setRedactedWordCount] = useState(0);

  const handleRedact = async () => {
    if (!text.trim()) {
      showToast('Please enter some text', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://ai-text-suite-deepseekv1.onrender.com/api/redact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          tone: tone,
          dialect: dialect
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Redaction failed');
      }

      const redactedText = data.redacted || data.result || data.content;
      
      if (!redactedText) {
        throw new Error('Invalid response format from server');
      }

      setResult(redactedText);
      setWordCount(data.original_word_count || text.split(/\s+/).length);
      setRedactedWordCount(data.redacted_word_count || redactedText.split(/\s+/).length);
      
      showToast('Text redacted successfully!', 'success');
    } catch (error: any) {
      console.error('Redact error:', error);
      showToast(error.message || 'Failed to redact text', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    showToast('Copied to clipboard!', 'success');
  };

  const downloadAsTxt = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'redacted_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-2xl"
          >
            {selectedEmoji}
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRedact()}
            placeholder="Enter your text to rewrite..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            onClick={handleRedact}
            disabled={loading || !text.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? '...' : 'Rewrite'}
          </button>
        </div>

        {showEmojiPicker && (
          <div className="flex gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-2xl hover:bg-gray-200 p-2 rounded transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Word counter */}
        <div className="text-sm text-gray-500 mt-2">
          {text.split(/\s+/).filter(w => w).length} words
          {text.split(/\s+/).length > 700 && (
            <span className="text-red-500 ml-2">⚠️ Exceeds 700 word limit</span>
          )}
        </div>
      </div>

      {/* Style Options */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <div className="flex gap-2">
              {['Formal', 'Informal'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    tone === t
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dialect</label>
            <div className="flex gap-2">
              {['American', 'British'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDialect(d)}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    dialect === d
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Redacted Text:</h3>
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
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="whitespace-pre-wrap text-gray-700">{result}</p>
          </div>
          <div className="text-sm text-gray-500 mt-3">
            Original: {wordCount} words → Redacted: {redactedWordCount} words
          </div>
        </div>
      )}
    </div>
  );
};