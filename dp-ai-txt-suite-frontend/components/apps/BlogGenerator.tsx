// components/apps/BlogGenerator.tsx
import React, { useState } from 'react';
import { Copy, Download, Sparkles, ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const EXAMPLE_TOPICS = [
  "The Future of AI",
  "10 Productivity Tips",
  "Remote Work Best Practices",
  "Sustainable Living Guide",
  "Pig Farming in Kenya"
];

const TEMPLATES = [
  { name: "How-to Guide", structure: { intro: true, list: true, conclusion: true, cta: false } },
  { name: "Listicle", structure: { intro: true, list: true, conclusion: true, cta: true } },
  { name: "Product Review", structure: { intro: true, list: false, conclusion: true, cta: true } },
  { name: "Opinion Piece", structure: { intro: true, list: false, conclusion: true, cta: false } },
];

export const BlogGenerator: React.FC = () => {
  const { showToast } = useApp();
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(400);
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General');
  const [blogPost, setBlogPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [generatedWordCount, setGeneratedWordCount] = useState(0);
  const [advancedOptions, setAdvancedOptions] = useState({
    intro: true,
    list: false,
    conclusion: true,
    cta: false
  });

  const tones = ['Professional', 'Casual', 'Humorous', 'Technical'];
  const audiences = ['General', 'Business', 'Technical', 'Beginners'];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('Please enter a topic', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          word_count: wordCount,
          tone,
          audience,
          advanced_options: advancedOptions
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const blogContent = data.blog_post || data.result || data.content;
      if (!blogContent) {
        throw new Error('Invalid response format from server');
      }

      setBlogPost(blogContent);
      setGeneratedWordCount(data.word_count || blogContent.split(/\s+/).filter(w => w).length);
      setReadingTime(data.reading_time || Math.ceil(blogContent.split(/\s+/).filter(w => w).length / 200));

      showToast('🎨 Blog post generated!', 'success');
    } catch (error: any) {
      console.error('Blog generation error:', error);
      showToast(error.message || 'Failed to generate blog post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(blogPost);
    setCopied(true);
    showToast('Copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (format: 'md' | 'txt') => {
    const blob = new Blob([blogPost], { 
      type: format === 'md' ? 'text/markdown' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_').toLowerCase()}_blog.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded as .${format}`, 'success');
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    setAdvancedOptions(template.structure);
    showToast(`Loaded ${template.name} template`, 'info');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Topic Input Card */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Blog Generator</h2>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your blog topic..."
              className="input-field pr-10"
              disabled={loading}
            />
            {topic && (
              <button
                onClick={() => setTopic('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 
                         hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="gradient-button flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Writing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Example Chips */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-slate-500 dark:text-slate-400 py-1">Try:</span>
          {EXAMPLE_TOPICS.map((example) => (
            <button
              key={example}
              onClick={() => setTopic(example)}
              className="chip"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Card */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          {/* Word Count Slider */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Length: <span className="text-[#667eea]">{wordCount}</span> words
            </label>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none 
                       cursor-pointer accent-[#667eea]"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>200</span>
              <span>1000</span>
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Tone
            </label>
            <div className="flex gap-2 flex-wrap">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
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

          {/* Audience */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Audience
            </label>
            <div className="flex gap-2 flex-wrap">
              {audiences.map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    audience === a
                      ? 'toggle-button-active'
                      : 'toggle-button'
                  }`}
                  disabled={loading}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Toggle */}
          <div className="flex items-end">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl 
                       border-2 border-slate-200 dark:border-slate-700 hover:border-[#667eea] 
                       dark:hover:border-[#667eea] transition-all text-sm font-medium 
                       text-slate-600 dark:text-slate-400"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Options
            </button>
          </div>
        </div>

        {/* Template Chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400 py-1">Templates:</span>
          {TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => loadTemplate(template)}
              className="chip"
            >
              {template.name}
            </button>
          ))}
        </div>

        {/* Advanced Options Panel */}
        {showAdvanced && (
          <div className="mt-4 p-5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border 
                        border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'intro', label: 'Introduction', desc: 'Hook readers' },
                { key: 'list', label: 'Numbered List', desc: 'Structured points' },
                { key: 'conclusion', label: 'Conclusion', desc: 'Strong closing' },
                { key: 'cta', label: 'Call-to-Action', desc: 'Engage readers' }
              ].map(({ key, label, desc }) => (
                <label
                  key={key}
                  className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    advancedOptions[key as keyof typeof advancedOptions]
                      ? 'border-[#667eea] bg-[#667eea]/5 dark:bg-[#667eea]/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={advancedOptions[key as keyof typeof advancedOptions]}
                      onChange={(e) => setAdvancedOptions({
                        ...advancedOptions, 
                        [key]: e.target.checked
                      })}
                      className="w-4 h-4 rounded border-slate-300 text-[#667eea] 
                               focus:ring-[#667eea]"
                    />
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      {label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-6">{desc}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate Button (full width for emphasis) */}
      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="gradient-button w-full flex items-center justify-center gap-2 text-lg py-4"
      >
        {loading ? (
          <>
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Crafting your blog post...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            🎨 Generate Blog Post
          </>
        )}
      </button>

      {/* Result Card */}
      {blogPost && (
        <div className="glass-card p-6 animate-in">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-[#667eea]/10 text-[#667eea] text-sm font-medium">
                {generatedWordCount} words
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 
                            dark:text-slate-400 text-sm font-medium">
                {readingTime} min read
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
                onClick={() => downloadFile('md')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 
                         dark:bg-slate-800 dark:hover:bg-slate-700 transition text-sm font-medium 
                         text-slate-700 dark:text-slate-300"
              >
                <Download className="w-4 h-4" />
                .md
              </button>
              <button
                onClick={() => downloadFile('txt')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 
                         dark:bg-slate-800 dark:hover:bg-slate-700 transition text-sm font-medium 
                         text-slate-700 dark:text-slate-300"
              >
                <Download className="w-4 h-4" />
                .txt
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#667eea]/10 
                         hover:bg-[#667eea]/20 transition text-sm font-medium text-[#667eea]"
                title="Regenerate"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                {blogPost}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};