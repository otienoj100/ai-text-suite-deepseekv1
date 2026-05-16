// components/apps/BlogGenerator.tsx
import React, { useState } from 'react';
import { Copy, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const BlogGenerator: React.FC = () => {
  const { showToast } = useApp();
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(400);
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General');
  const [blogPost, setBlogPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [generatedWordCount, setGeneratedWordCount] = useState(0);
  const [advancedOptions, setAdvancedOptions] = useState({
    intro: true,
    list: false,
    conclusion: true,
    cta: false
  });

  const exampleTopics = [
    "The Future of AI",
    "10 Productivity Tips",
    "Remote Work Best Practices",
    "Sustainable Living Guide",
    "Pig Farming in Kenya"
  ];

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
          tone: tone,
          audience: audience,
          advanced_options: advancedOptions
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Blog generation failed');
      }

      const blogContent = data.blog_post || data.result || data.content;
      
      if (!blogContent) {
        throw new Error('Invalid response format from server');
      }

      setBlogPost(blogContent);
      setGeneratedWordCount(data.word_count || blogContent.split(/\s+/).length);
      setReadingTime(data.reading_time || Math.ceil(blogContent.split(/\s+/).length / 200));
      
      showToast('Blog post generated!', 'success');
    } catch (error: any) {
      console.error('Blog generation error:', error);
      showToast(error.message || 'Failed to generate blog post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(blogPost);
    showToast('Copied to clipboard!', 'success');
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([blogPost], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_')}_blog.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([blogPost], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_')}_blog.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Topic Input Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Enter your blog topic..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? '...' : 'Generate'}
          </button>
        </div>

        {/* Example topics */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {exampleTopics.map((example) => (
            <button
              key={example}
              onClick={() => setTopic(example)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Word Count: {wordCount}
            </label>
            <input
              type="range"
              min="200"
              max="1000"
              step="50"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value))}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              <option>Professional</option>
              <option>Casual</option>
              <option>Humorous</option>
              <option>Technical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              <option>General</option>
              <option>Business</option>
              <option>Technical</option>
              <option>Beginners</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Options
            </button>
          </div>
        </div>

        {/* Advanced Options Panel */}
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advancedOptions.intro}
                onChange={(e) => setAdvancedOptions({...advancedOptions, intro: e.target.checked})}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-sm text-gray-700">Include Introduction</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advancedOptions.list}
                onChange={(e) => setAdvancedOptions({...advancedOptions, list: e.target.checked})}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-sm text-gray-700">Include Numbered List</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advancedOptions.conclusion}
                onChange={(e) => setAdvancedOptions({...advancedOptions, conclusion: e.target.checked})}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-sm text-gray-700">Include Conclusion</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advancedOptions.cta}
                onChange={(e) => setAdvancedOptions({...advancedOptions, cta: e.target.checked})}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-sm text-gray-700">Add Call-to-Action</span>
            </label>
          </div>
        )}
      </div>

      {/* Result Section */}
      {blogPost && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Generated Blog Post:</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={downloadAsMarkdown}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Download as Markdown"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs ml-1">MD</span>
              </button>
              <button
                onClick={downloadAsTxt}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Download as Text"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs ml-1">TXT</span>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
              {blogPost}
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-3">
            {generatedWordCount} words · {readingTime} min read
          </div>
        </div>
      )}
    </div>
  );
};