'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { getRegulations, getAISummary, getAIAdvice } from '@/lib/api';

const DIFFICULTY_COLOR: any = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const CATEGORY_ICON: any = {
  license: '📋', permit: '🏛️',
  certificate: '🎓', insurance: '🛡️',
  general: '📄',
};

export default function RegulationsPage() {
  const router = useRouter();
  const [regulations, setRegulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [advice, setAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRegulations();
    loadAdvice();
  }, []);

  const loadRegulations = async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    setLoading(true);
    try {
      const data = await getRegulations(token);
      setRegulations(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const loadAdvice = async () => {
    const token = getToken();
    if (!token) return;
    setAdviceLoading(true);
    try {
      const data = await getAIAdvice(72, ['Fire safety cert', 'Liquor licence'], token);
      setAdvice(data.advice);
    } finally {
      setAdviceLoading(false);
    }
  };

  const handleSummarize = async (reg: any) => {
    setSelected(reg);
    setAiData(null);

    if (reg.aiSummary) {
      setAiData({
        summary: reg.aiSummary,
        actionItems: reg.aiActionItems,
        penalty: reg.aiPenalty,
        deadline: reg.aiDeadline,
        difficulty: reg.aiDifficulty,
      });
      return;
    }

    setAiLoading(true);
    const token = getToken()!;
    try {
      const data = await getAISummary(reg._id, token);
      setAiData(data);
      setRegulations(prev =>
        prev.map(r => r._id === reg._id ? { ...r, aiSummary: data.summary } : r)
      );
    } finally {
      setAiLoading(false);
    }
  };

  const categories = ['all', 'license', 'permit', 'certificate', 'insurance'];
  const filtered = filter === 'all'
    ? regulations
    : regulations.filter(r => r.category === filter);

  return (
    <div className="min-h-screen bg-[#060610] text-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute w-96 h-96 rounded-full bg-indigo-600/10 -top-20 -right-20 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />

      <div className="flex h-screen relative z-10">

        {/* Left — Regulations List */}
        <div className="w-96 border-r border-white/[0.06] flex flex-col flex-shrink-0">

          {/* Header */}
          <div className="p-5 border-b border-white/[0.06]">
            <button onClick={() => router.push('/dashboard')}
              className="text-xs text-white/30 hover:text-white/60 mb-3 flex items-center gap-1 transition-all">
              ← Dashboard
            </button>
            <h1 className="text-lg font-black text-white tracking-tight">Regulations</h1>
            <p className="text-xs text-white/35 mt-1">{regulations.length} regulations for your business</p>

            {/* AI Advice Box */}
            {advice && (
              <div className="mt-3 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 1a3 3 0 100 6A3 3 0 005 1zM5 9v.5" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">AI Advice</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{advice}</p>
              </div>
            )}
            {adviceLoading && (
              <div className="mt-3 bg-indigo-500/[0.05] border border-indigo-500/10 rounded-xl p-3 flex items-center gap-2">
                <svg className="animate-spin w-3 h-3 text-indigo-400" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <span className="text-xs text-white/30">Getting AI advice...</span>
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 p-3 border-b border-white/[0.06] overflow-x-auto">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                  filter === cat
                    ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
                    : 'bg-white/[0.04] border border-white/[0.07] text-white/35 hover:text-white/60'
                }`}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <svg className="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-2xl mb-2">📋</p>
                <p className="text-xs text-white/30">No regulations found</p>
              </div>
            ) : (
              filtered.map(reg => (
                <div key={reg._id}
                  onClick={() => handleSummarize(reg)}
                  className={`p-3.5 rounded-xl border mb-2 cursor-pointer transition-all ${
                    selected?._id === reg._id
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/20 hover:bg-indigo-500/[0.05]'
                  }`}>
                  <div className="flex items-start gap-2.5">
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {CATEGORY_ICON[reg.category] || '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white leading-tight mb-1">{reg.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/30 capitalize">{reg.category}</span>
                        {reg.aiSummary && (
                          <span className="text-[9px] text-indigo-400 bg-indigo-400/10 rounded-full px-1.5">
                            AI ✓
                          </span>
                        )}
                        {reg.penaltyAmount && (
                          <span className="text-[9px] text-red-400/70">Fine: {reg.penaltyAmount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — AI Summary Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 4L5 8v6c0 5.5 3.8 10.6 9 11.9C19.2 24.6 23 19.5 23 14V8L14 4z" fill="#6366f1" opacity="0.3"/>
                    <path d="M14 4L5 8v6c0 5.5 3.8 10.6 9 11.9C19.2 24.6 23 19.5 23 14V8L14 4z" stroke="#6366f1" strokeWidth="1.5"/>
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Select a regulation</h2>
                <p className="text-sm text-white/35 leading-relaxed">
                  Click any regulation on the left to get an AI-powered plain English summary, action items and penalty information.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-indigo-400/60">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="#818cf8" strokeWidth="1"/>
                    <path d="M6 4v2.5l1.5 1" stroke="#818cf8" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  Powered by GPT-4o-mini
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">

              {/* Regulation header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {CATEGORY_ICON[selected.category] || '📄'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{selected.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/35 capitalize">{selected.category}</span>
                    {selected.state && selected.state !== 'ALL' && (
                      <span className="text-xs text-indigo-400/60">· {selected.state}</span>
                    )}
                    {aiData?.difficulty && (
                      <span className={`text-[10px] rounded-full px-2 py-0.5 border font-medium ${DIFFICULTY_COLOR[aiData.difficulty]}`}>
                        {aiData.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="animate-spin w-8 h-8 text-indigo-400 mb-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  <p className="text-sm text-white/40 mb-1">Generating AI summary...</p>
                  <p className="text-xs text-white/25">Using GPT-4o-mini to analyze this regulation</p>
                </div>
              ) : aiData ? (
                <div className="space-y-4">

                  {/* AI Summary */}
                  <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M5 1a3 3 0 100 6A3 3 0 005 1z" fill="#818cf8" opacity="0.5"/>
                          <path d="M5 9v.5" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">AI Summary</span>
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed">{aiData.summary}</p>
                  </div>

                  {/* Action Items */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                      <span>✅</span> Action items
                    </h3>
                    <div className="space-y-2.5">
                      {(aiData.actionItems || []).map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] text-green-400 font-bold">{i + 1}</span>
                          </div>
                          <p className="text-sm text-white/65 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Penalty & Deadline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-500/[0.05] border border-red-500/15 rounded-xl p-4">
                      <p className="text-[10px] text-red-400/70 uppercase tracking-wider mb-2">⚠️ Penalty</p>
                      <p className="text-sm text-white/70 leading-relaxed">{aiData.penalty}</p>
                      {selected.penaltyAmount && (
                        <p className="text-xs text-red-400 font-semibold mt-2">{selected.penaltyAmount}</p>
                      )}
                    </div>
                    <div className="bg-yellow-500/[0.05] border border-yellow-500/15 rounded-xl p-4">
                      <p className="text-[10px] text-yellow-400/70 uppercase tracking-wider mb-2">📅 Deadline</p>
                      <p className="text-sm text-white/70 leading-relaxed">{aiData.deadline}</p>
                      {selected.renewalPeriod && (
                        <p className="text-xs text-yellow-400 font-semibold mt-2">Renews every {selected.renewalPeriod} days</p>
                      )}
                    </div>
                  </div>

                  {/* Original description */}
                  {selected.description && (
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Original regulation text</p>
                      <p className="text-xs text-white/40 leading-relaxed">{selected.description}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-[10px] text-white/20 pt-2">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    AI summary generated by GPT-4o-mini · Not legal advice
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-white/30 text-sm">Click a regulation to generate AI summary</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}