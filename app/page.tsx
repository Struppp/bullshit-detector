"use client";
import { useState, useMemo } from 'react';

interface BullshitItem {
  snippet: string;
  reason: string;
  type: 'filler' | 'circular' | 'weak';
  severity: 'critical' | 'warning' | 'suggestion';
  replacement: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<BullshitItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Filters
  const [minSeverity, setMinSeverity] = useState<'critical' | 'warning' | 'suggestion'>('suggestion');
  const [visibleTypes, setVisibleTypes] = useState<string[]>(['filler', 'circular', 'weak']);

const scanText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setResults(data);
        setIsAnalyzed(true);
      } else {
        console.error("API did not return an array:", data);
        alert("The AI returned a weird format. Try scanning again.");
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggleType = (type: string) => {
    setVisibleTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const filteredResults = useMemo(() => {
    if (!Array.isArray(results)) return [];

    const severityMap = { critical: 3, warning: 2, suggestion: 1 };
    return results.filter(item => 
      severityMap[item.severity] >= severityMap[minSeverity] &&
      visibleTypes.includes(item.type)
    );
  }, [results, minSeverity, visibleTypes]);

  const handleReplace = (snippet: string, replacement: string) => {
    setText(prev => prev.replace(snippet, replacement));
    setResults(prev => prev.filter(r => r.snippet !== snippet));
    setActiveId(null);
  };

  // Interactive Text Rendering
  const renderedText = useMemo(() => {
    let parts: any[] = [];
    let lastIndex = 0;
    const sorted = [...filteredResults].sort((a, b) => text.indexOf(a.snippet) - text.indexOf(b.snippet));

    sorted.forEach((item, index) => {
      const startIndex = text.indexOf(item.snippet, lastIndex);
      if (startIndex === -1) return;
      parts.push(text.substring(lastIndex, startIndex));

      const colors = {
        critical: 'bg-red-200 border-red-500',
        warning: 'bg-orange-200 border-orange-400',
        suggestion: 'bg-blue-100 border-blue-300'
      };

      parts.push(
        <span key={index} className="relative inline-block">
          <button
            onClick={() => setActiveId(activeId === index ? null : index)}
            className={`${colors[item.severity]} border-b-2 cursor-pointer px-0.5 rounded mx-0.5 transition-all hover:brightness-90`}
          >
            {item.snippet}
          </button>
          
          {activeId === index && (
            <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-white shadow-2xl rounded-xl border border-slate-200 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase text-indigo-600">{item.type} • {item.severity}</span>
                <button onClick={() => setActiveId(null)} className="text-slate-300">✕</button>
              </div>
              <p className="text-sm text-slate-600 mb-3 leading-snug">{item.reason}</p>
              <button 
                onClick={() => handleReplace(item.snippet, item.replacement)}
                className="w-full bg-indigo-600 text-white text-xs py-2 rounded-lg font-bold"
              >
                Apply Fix: "{item.replacement}"
              </button>
            </div>
          )}
        </span>
      );
      lastIndex = startIndex + item.snippet.length;
    });
    parts.push(text.substring(lastIndex));
    return parts;
  }, [text, filteredResults, activeId]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-work">
      <div className="mx-auto max-w-6xl">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-black text-indigo-600">Bullshit Detector</h1>
          
          {isAnalyzed && (
            <div className="flex flex-wrap gap-4 items-center">
              {/* Type Filter */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {['filler', 'circular', 'weak'].map(t => (
                  <button 
                    key={t} onClick={() => toggleType(t)}
                    className={`px-3 py-1 text-[10px] font-black uppercase rounded transition-all ${visibleTypes.includes(t) ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Severity Switch */}
              <select 
                value={minSeverity} 
                onChange={(e) => setMinSeverity(e.target.value as any)}
                className="bg-slate-100 text-xs font-bold px-3 py-2 rounded-lg outline-none border-none"
              >
                <option value="suggestion">Full Analysis</option>
                <option value="warning">Hide Minor Polish</option>
                <option value="critical">Critical Only</option>
              </select>
              {/* Mode Toggle */}
              <button 
                onClick={() => setIsManualMode(!isManualMode)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isManualMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}
              >
                {isManualMode ? "Switch to AI Mode" : "Switch to Manual Mode"}
              </button>
            </div>
          )}
        </div>

        {!isAnalyzed ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <textarea
              className="w-full h-[65vh] p-8 text-xl leading-relaxed outline-none resize-none bg-transparent"
              placeholder="Paste your essay here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={scanText}
              disabled={loading || !text}
              className="w-full bg-indigo-600 py-6 text-white font-black text-xl hover:bg-indigo-700 disabled:bg-slate-200 transition-all"
            >
              {loading ? "SCANNIG FOR BS..." : "ANALYZE & LOCK"}
            </button>
          </div>
        ) : (
          <div className="flex gap-6 items-start">
            {/* Editor Area */}
            <div className="flex-1 bg-white rounded-3xl p-10 shadow-lg border border-slate-200 min-h-[75vh]">
              {isManualMode ? (
                <textarea 
                  className="w-full h-[70vh] text-lg leading-[2.2rem] font-serif text-slate-800 bg-transparent outline-none resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              ) : (
                <div className="text-lg leading-[2.2rem] whitespace-pre-wrap font-serif text-slate-800">
                  {renderedText}
                </div>
              )}
              
              <div className="mt-12 pt-6 border-t flex justify-between items-center">
                <button onClick={() => setIsAnalyzed(false)} className="text-slate-400 text-sm font-bold hover:text-indigo-600 transition">← New Scan</button>
                <button onClick={() => {navigator.clipboard.writeText(text); alert("Clean text copied!")}} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-indigo-200 hover:shadow-lg transition">Copy Current Text</button>
              </div>
            </div>

            {/* Manual Mode Sidebar */}
            {isManualMode && (
              <div className="w-80 sticky top-8 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Pending Issues ({filteredResults.length})</h3>
                <div className="max-h-[80vh] overflow-y-auto pr-2 space-y-3">
                  {filteredResults.map((item, i) => (
                    <div key={i} className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{item.type}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400">{item.severity}</span>
                      </div>
                      <p className="text-xs font-serif italic text-slate-800 mb-2">"{item.snippet}"</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                  {filteredResults.length === 0 && (
                    <div className="text-center p-8 bg-indigo-50 rounded-2xl border border-dashed border-indigo-200">
                      <p className="text-xs font-bold text-indigo-400">All filtered issues resolved!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}