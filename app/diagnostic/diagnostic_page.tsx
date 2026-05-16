// app/diagnostic/page.tsx
'use client';

import { useState } from 'react';

export default function Diagnostic() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (msg: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const runTests = async () => {
    setResults([]);
    setLoading(true);

    // Test 1: Direct backend health
    try {
      addResult('Test 1: Direct backend health...');
      const r1 = await fetch('https://ai-text-suite-deepseekv1.onrender.com/health');
      const d1 = await r1.json();
      addResult(`✅ Direct OK: ${JSON.stringify(d1)}`);
    } catch (e: any) {
      addResult(`❌ Direct FAIL: ${e.message}`);
    }

    // Test 2: Proxy health through Vercel
    try {
      addResult('Test 2: Proxy /api/health...');
      const r2 = await fetch('/api/health');
      const d2 = await r2.json();
      addResult(`✅ Proxy OK: ${JSON.stringify(d2)}`);
    } catch (e: any) {
      addResult(`❌ Proxy FAIL: ${e.message}`);
    }

    // Test 3: Proxy POST to redact
    try {
      addResult('Test 3: Proxy POST /api/redact...');
      const r3 = await fetch('/api/redact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hello world', tone: 'Formal', dialect: 'American' })
      });
      if (r3.ok) {
        const d3 = await r3.json();
        addResult(`✅ Redact OK: ${d3.redacted?.substring(0, 50)}...`);
      } else {
        addResult(`❌ Redact HTTP ${r3.status}: ${r3.statusText}`);
      }
    } catch (e: any) {
      addResult(`❌ Redact FAIL: ${e.message}`);
    }

    // Test 4: Direct POST to redact (CORS test)
    try {
      addResult('Test 4: Direct POST (CORS)...');
      const r4 = await fetch('https://ai-text-suite-deepseekv1.onrender.com/api/redact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hello world', tone: 'Formal', dialect: 'American' })
      });
      if (r4.ok) {
        addResult('✅ Direct POST OK (CORS working)');
      } else {
        addResult(`❌ Direct POST HTTP ${r4.status}`);
      }
    } catch (e: any) {
      addResult(`❌ Direct POST FAIL: ${e.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg-animated p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">API Diagnostic</h1>

        <button
          onClick={runTests}
          disabled={loading}
          className="gradient-button mb-8"
        >
          {loading ? 'Running...' : 'Run Diagnostic Tests'}
        </button>

        <div className="glass-card p-6 space-y-2">
          {results.length === 0 ? (
            <p className="text-slate-500">Click button to run tests</p>
          ) : (
            results.map((r, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm font-mono ${
                r.includes('✅') ? 'bg-emerald-50 text-emerald-800' : 
                r.includes('❌') ? 'bg-red-50 text-red-800' : 'bg-slate-50 text-slate-600'
              }`}>
                {r}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 glass-card p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Fixes</h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• If Test 1 fails: Backend is down</li>
            <li>• If Test 2 fails: Vercel rewrite broken</li>
            <li>• If Test 3 fails: Backend POST handler missing</li>
            <li>• If Test 4 fails: CORS not configured</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
