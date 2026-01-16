"use client";
import { useState, useMemo, useRef } from 'react';

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

  // Debuggande
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugJson, setDebugJson] = useState('');
  const [debugText, setDebugText] = useState('');

  // Filter
  const [minSeverity, setMinSeverity] = useState<'critical' | 'warning' | 'suggestion'>('suggestion');
  const [visibleTypes, setVisibleTypes] = useState<string[]>(['filler', 'circular', 'weak']);

  // Toasts
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);


  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);

    setToast({ show: true, message, type });

    toastTimeout.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };


  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    triggerToast("Text copied to clipboard!", "success");
  };

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
        triggerToast("AI returned an invalid format. Try again.", "error");
      }
    } catch (e) {
      console.error(e);
      triggerToast("Connection failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const cleanText = (input: string): string => {
    let cleaned = input
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/,\./g, '.')
      .replace(/\.,/g, '.')
      .replace(/,,/g, ',')
      .replace(/(?<!\.)\.\.(?!\.)/g, '.')
      .replace(/\(\s*\)/g, '')
      .trim();

    cleaned = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (separator, letter) => {
      return separator + letter.toUpperCase();
    });

    return cleaned;
  };

  const handleDebugInject = () => {
    try {
      const parsed = JSON.parse(debugJson);
      setText(debugText);
      setResults(parsed);
      setIsAnalyzed(true);
      setShowDebugModal(false);
    } catch (e) {
      triggerToast("Invalid JSON. Must be an array of items.", "error");
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
    setText(prev => {
      const rawText = prev.replace(snippet, replacement);
      return cleanText(rawText);
    });
    setResults(prev => prev.filter(r => r.snippet !== snippet));
    setActiveId(null);
  };

  // Interaktiv Text
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

      const textColors = {
        critical: 'text-red-400',
        warning: 'text-orange-400',
        suggestion: 'text-blue-400'
      }

      parts.push(
        <span 
          key={index} 
          className="relative inline-block font-work"
          onMouseEnter={() => setActiveId(index)}
          onMouseLeave={() => setActiveId(null)}
        >
          <span
            className={`${colors[item.severity]} shadow-sm p-1 rounded mx-0.5 transition-all hover:brightness-90 text-left`}
          >
            {item.snippet}
          </span>

          {activeId === index && (
            <div className="bridge absolute z-50 bottom-full left-1/2 -translate-x-1/2 w-72 pb-2">
              <div className="p-4 bg-white shadow-2xl rounded-xl border border-slate-200 text-left">
                <div className="flex justify-between items-center">
                  <span className={`text-[14px] font-black uppercase ${textColors[item.severity]}`}>
                    {item.type} - {item.severity}
                  </span>
                  <button onClick={() => setActiveId(null)} className="text-slate-400 font-black cursor-pointer hover:text-slate-600 transition-colors">✕</button>
                </div>
                
                <p className="text-sm text-slate-600 mb-3 leading-snug">
                  {item.reason}
                </p>
                
                <button
                  onClick={() => handleReplace(item.snippet, item.replacement)}
                  className="w-full bg-indigo-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-indigo-800 hover:text-slate-100 cursor-pointer transition-colors"
                >
                  "{item.replacement}"
                </button>
              </div>
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
    <main className={`bg-slate-50 p-4 md:p-4 text-slate-900 font-work ${isAnalyzed ? 'min-h-screen' : 'h-screen w-full overflow-hidden flex flex-col'}`}>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-300 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300">
           <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
           </div>
           
           <h2 className="text-2xl font-black text-slate-800 animate-pulse tracking-tight">DETECTING BULLSHIT...</h2>
           <p className="text-slate-500 font-medium mt-2">Consulting the oracle of truth</p>
        </div>
      )}


      {/* Rostat Bröd (Toast) */}
     <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-200 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${toast.show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-90 pointer-events-none border border-t-slate-100 border-slate-200 border-b-slate-300'} ${toast.type === 'error' ? 'bg-red-400 text-white' : 'bg-white text-slate-900'}`}>
        <div className={`rounded-full p-1 ${toast.type === 'error' ? 'bg-white/20' : 'bg-green-500'}`}>
          {toast.type === 'success' ? (
            <svg className="w-3 h-3 text-white stroke-current stroke-4" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-white stroke-current stroke-4" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        
        <span className="font-bold text-sm tracking-wide">{toast.message}</span>
      </div>

      {/* DEBUG MODAL */}
      {showDebugModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-indigo-600">Developer Debug Tool</h2>
              <button onClick={() => setShowDebugModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Raw Text Input</label>
                <textarea 
                  className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl font-serif text-sm outline-none focus:ring-2 ring-indigo-500"
                  placeholder="Paste the essay text here..."
                  value={debugText}
                  onChange={(e) => setDebugText(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">JSON Results Array</label>
                <textarea 
                  className="w-full h-48 p-3 bg-slate-900 text-green-400 border border-slate-700 rounded-xl font-mono text-xs outline-none focus:ring-2 ring-indigo-500"
                  placeholder='[{"snippet": "...", "reason": "...", "type": "filler", "severity": "warning", "replacement": "..."}]'
                  value={debugJson}
                  onChange={(e) => setDebugJson(e.target.value)}
                />
              </div>
              <button 
                onClick={handleDebugInject}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                BYPASS AI & INJECT DATA
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`mx-auto max-w-5xl min-w-[60%] flex flex-col px-10 ${isAnalyzed ? 'h-auto' : 'h-screen'}`}>

        {/* Logo del */}
        <div className="flex flex-col justify-between items-center mb-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className={`${isAnalyzed ? '' : 'flex md:flex-row'} justify-between items-center w-full px-8`}>


            <h1 className={`text-[40px] font-black text-indigo-600 ${isAnalyzed ? 'mb-2' : '-mb-3'}`}><button onClick={() => setIsAnalyzed(false)} className="cursor-pointer hover:text-indigo-700 trnasition-colors">Bullshit Detector</button></h1>

            {isAnalyzed ? (
              <div className="flex flex-wrap gap-4 items-center">
                {/* Filter */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
                  {['filler', 'circular', 'weak'].map(t => (
                    <button
                      key={t} onClick={() => toggleType(t)}
                      className={`px-3 py-1 text-[12px] cursor-pointer font-black uppercase rounded-xl transition-all ${visibleTypes.includes(t) ? 'bg-indigo-600 text-slate-50 hover:bg-indigo-800 hover:text-slate-100 shadow-sm' : 'text-slate-400 hover:bg-indigo-200 hover:text-slate-700'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                  {/* Viktigthet */}
                <div className="relative group inline-block text-[14px] font-bold z-50">

                  <div className="relative z-20 bg-slate-100 px-3 py-2 border border-slate-200 cursor-pointer grid grid-cols-1 rounded-lg group-hover:rounded-b-none group-hover:border-b-slate-100 transition-all duration-300 ease-in-out">

                    <span className={`col-start-1 row-start-1 ${minSeverity === 'suggestion' ? 'visible' : 'invisible'}`}>All Issues</span>
                    <span className={`col-start-1 row-start-1 ${minSeverity === 'warning' ? 'visible' : 'invisible'}`}>Hide Polish</span>
                    <span className={`col-start-1 row-start-1 text-nowrap ${minSeverity === 'critical' ? 'visible' : 'invisible'}`}>Critical Only</span>
                  </div>

                  <div className="absolute top-full left-0 w-full z-10 bg-slate-100 border border-slate-200 border-t-0 rounded-b-lg shadow-lg max-h-0 opacity-0 -translate-y-2 overflow-hidden group-hover:max-h-37.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out">

                    <div className="py-1">

                      {minSeverity !== 'suggestion' && (
                        <button onClick={() => setMinSeverity('suggestion')} className="block w-full text-left px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"> All Issues </button>
                      )}

                      {minSeverity !== 'warning' && (
                        <button 
                          onClick={() => setMinSeverity('warning')}
                          className="block w-full text-left px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Hide Polish
                        </button>
                      )}

                      {minSeverity !== 'critical' && (
                        <button 
                          onClick={() => setMinSeverity('critical')}
                          className="block w-full text-left px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Critical Only
                        </button>
                      )}

                    </div>
                  </div>
                </div>
                {/* Lägen */}
                <button
                  onClick={() => setIsManualMode(!isManualMode)}
                  className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all cursor-pointer ${isManualMode ? 'bg-indigo-600 text-white hover:bg-indigo-800 hover:text-slate-100' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-300 hover:text-slate-700'}`}
                >
                  {isManualMode ? "Switch to AI Mode" : "Switch to Manual Mode"}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowDebugModal(true)} className="bg-slate-100 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-300"><svg fill="#4f39f6" height="48px" width="48px" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.00 16.00"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path className="cls-1" d="M12.28592,11.7143,6.49472,5.92372a2.50375,2.50375,0,0,0,.16958-.7544,2.14905,2.14905,0,0,0-.09474-.81438,2.11972,2.11972,0,0,0-.54871-.90431,2.32771,2.32771,0,0,0-1.76079-.68447H4.21515a2.104,2.104,0,0,0-.71829.15488L4.59925,4.02518l.31921.31976.24445.24481a1.864,1.864,0,0,1-.21948.85435,1.04314,1.04314,0,0,1-.11475.14488,1.64822,1.64822,0,0,1-1.00259.33474L2.609,4.70468,2.16005,4.255a2.07386,2.07386,0,0,0-.13469.54457l-.015.10493a2.33671,2.33671,0,0,0,.38407,1.51882,2.50928,2.50928,0,0,0,.29431.35975A2.20549,2.20549,0,0,0,4.265,7.43257a2.45325,2.45325,0,0,0,.89789-.17485L9.95648,12.054l1.20212,1.19909H11.827l.66343-.6645v-.6695Zm-6.53561-2.806,1.3662,1.3662L4.12892,13.2621H3.20558l-.45037-.45038V11.8959ZM14,5.90569,12.19094,7.71475,10.89232,6.49869,9.5111,7.87992,8.1449,6.51372,9.51861,5.13249,7.89717,3.5111l.68312-.7732,2.252.45042Z"></path> </g></svg></button>
            )}
          </div>
          {!isAnalyzed && (
            <p className="text-gray-800 px-8">Paste your essay down below and press <span className="font-bold">ANALYZE</span>, this will find issues in your writting. This tool focuses mainly on logical faults, filler words and straight up <span className="font-bold">bullshit</span> but will also recommend fixes to grammar and spelling.</p>
          )}
        </div>

        


        {!isAnalyzed ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex-1 mb-4">
            <textarea
              className="w-full h-[80%] p-8 text-xl leading-relaxed outline-none resize-none bg-transparent"
              placeholder="Paste your essay here..."
              value={text}
              maxLength={5000}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={scanText}
              disabled={loading || !text}
              className="w-full h-[20%] bg-indigo-600 py-3 text-white font-black text-xl hover:bg-indigo-700 disabled:bg-slate-200 transition-all"
            >
              ANALYZE & LOCK
            </button>
          </div>
        ) : (
          <div className="flex gap-6 items-start">
            <div className="flex-1 bg-white rounded-3xl p-10 shadow-lg border border-slate-200 min-h-[75vh] mb-8">
              {isManualMode ? (
                <textarea
                  className="w-full h-[70vh] text-lg leading-[2.2rem] font-work text-slate-800 bg-transparent outline-none resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              ) : (
                <div className="text-lg leading-[2.2rem] whitespace-pre-wrap font-work text-slate-800">
                  {renderedText}
                </div>
              )}

              <div className="mt-12 pt-6 border-t flex justify-between items-center">
                <button onClick={() => setIsAnalyzed(false)} className="text-slate-400 text-sm font-bold hover:text-indigo-600 transition-colors cursor-pointer">← New Scan</button>
                <button onClick={handleCopy} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-indigo-200 hover:shadow-lg hover:bg-indigo-700 transition-all cursor-pointer">Copy Current Text</button>
              </div>
            </div>

            {/* Manuellt Läge */}
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