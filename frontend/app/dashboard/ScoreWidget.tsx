'use client';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { getScore, recalculateScore } from '@/lib/api';

export default function ScoreWidget() {
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadScore(); }, []);

  const loadScore = async () => {
    const token = getToken();
    if (!token) return;
    const data = await getScore(token);
    setScoreData(data);
  };

  const handleRecalculate = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) return;
    await recalculateScore(token);
    await loadScore();
    setLoading(false);
  };

  const score = scoreData?.score || 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-indigo-500/15 transition-all">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Compliance score</h3>
          <p className="text-[10px] text-white/30 mt-0.5">Real-time score</p>
        </div>
        <button onClick={handleRecalculate} disabled={loading}
          className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-3 py-1.5 hover:bg-indigo-400/15 transition-all disabled:opacity-50">
          {loading ? 'Calculating...' : 'Recalculate'}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none"
              stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
            <circle cx="65" cy="65" r="54" fill="none"
              stroke={color} strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{transition:'stroke-dashoffset 1s ease'}}/>
            <text x="65" y="58" textAnchor="middle"
              fontSize="28" fontWeight="800" fill="white">{score}</text>
            <text x="65" y="72" textAnchor="middle"
              fontSize="10" fill="rgba(255,255,255,0.35)">out of 100</text>
            <text x="65" y="84" textAnchor="middle"
              fontSize="9" fill={color}>
              {score >= 80 ? 'Excellent' : score >= 50 ? 'Needs work' : 'Critical'}
            </text>
          </svg>
        </div>

        <div className="flex-1 space-y-3">
          {[
            { label: 'Licences', val: scoreData?.breakdown?.licenses || 0, color: 'bg-indigo-400' },
            { label: 'Permits', val: scoreData?.breakdown?.permits || 0, color: 'bg-green-400' },
            { label: 'Safety certs', val: scoreData?.breakdown?.safety || 0, color: 'bg-yellow-400' },
            { label: 'Insurance', val: scoreData?.breakdown?.insurance || 0, color: 'bg-sky-400' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-white/40">{item.label}</span>
                <span className="text-[11px] text-white/70 font-medium">{item.val}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                  style={{width:`${item.val}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {scoreData?.history?.length > 1 && (
        <div className="mt-5 pt-4 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/30 mb-3">Score history</p>
          <div className="flex items-end gap-1.5 h-10">
            {scoreData.history.slice(-8).map((h: any, i: number) => (
              <div key={i} className="flex-1">
                <div className="w-full rounded-sm transition-all duration-500"
                  style={{
                    height: `${Math.max(4, (h.score / 100) * 36)}px`,
                    background: h.score >= 80 ? '#4ade80' : h.score >= 50 ? '#fbbf24' : '#f87171',
                    opacity: 0.5 + (i / 8) * 0.5,
                  }}/>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          { val: scoreData?.completedItems || 0, label: 'Docs uploaded' },
          { val: scoreData?.totalItems || 0, label: 'Total required' },
          { val: Math.max(0, (scoreData?.totalItems || 0) - (scoreData?.completedItems || 0)), label: 'Still needed' },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.03] rounded-xl p-2.5 text-center">
            <div className="text-base font-black text-white">{s.val}</div>
            <div className="text-[9px] text-white/30 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}