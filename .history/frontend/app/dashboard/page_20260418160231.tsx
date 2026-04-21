'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, removeToken } from '@/lib/auth';
import { getBusiness } from '@/lib/api';
import { loginUser } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { getScore, recalculateScore } from '@/lib/api';

const NAV = [
  { label: 'Dashboard', active: true, badge: null },
  { label: 'Compliance', active: false, badge: 3 },
  { label: 'Documents', active: false, badge: null },
  { label: 'Deadlines', active: false, badge: null },
  { label: 'Alerts', active: false, badge: null },
];

const CHECKLIST = [
  { text: 'Business licence', status: 'Done', dot: 'bg-green-400', badge: 'text-green-400 bg-green-400/10' },
  { text: 'Health permit', status: 'Done', dot: 'bg-green-400', badge: 'text-green-400 bg-green-400/10' },
  { text: 'Fire safety cert', status: 'Expiring', dot: 'bg-yellow-400', badge: 'text-yellow-400 bg-yellow-400/10' },
  { text: 'Liquor licence', status: 'Missing', dot: 'bg-red-400', badge: 'text-red-400 bg-red-400/10' },
  { text: 'Food handler cert', status: 'Missing', dot: 'bg-red-400', badge: 'text-red-400 bg-red-400/10' },
];

const DEADLINES = [
  { icon: '🔥', title: 'Fire safety cert', date: 'Apr 28', days: '15d', color: 'text-yellow-400 bg-yellow-400/10' },
  { icon: '🍺', title: 'Liquor licence', date: 'May 15', days: '32d', color: 'text-red-400 bg-red-400/10' },
  { icon: '👨‍🍳', title: 'Food handler cert', date: 'Jun 1', days: '49d', color: 'text-indigo-400 bg-indigo-400/10' },
  { icon: '📋', title: 'Business licence', date: 'Jul 10', days: '88d', color: 'text-sky-400 bg-sky-400/10' },
];

const DOCS = [
  { icon: '📋', name: 'Business licence', exp: 'Dec 2026', ok: true },
  { icon: '🏥', name: 'Health permit', exp: 'Mar 2027', ok: true },
  { icon: '🛡️', name: 'Insurance', exp: 'Jan 2027', ok: true },
  { icon: '🔥', name: 'Fire cert', exp: 'Apr 2026', ok: false },
];

const METRICS = [
  { val: '72%', label: 'Compliance score', trend: '↑ +12%', valColor: 'text-green-400', trendColor: 'text-green-400 bg-green-400/10' },
  { val: '3', label: 'Action required', trend: 'Urgent', valColor: 'text-red-400', trendColor: 'text-red-400 bg-red-400/10' },
  { val: '8', label: 'Upcoming deadlines', trend: '90 days', valColor: 'text-indigo-400', trendColor: 'text-indigo-400 bg-indigo-400/10' },
  { val: '5', label: 'Docs uploaded', trend: 'of 12', valColor: 'text-sky-400', trendColor: 'text-sky-400 bg-sky-400/10' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    getBusiness(token).then(setBusiness).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-[#060610] relative overflow-hidden">

      {/* Background */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-indigo-600/10 -top-52 -right-24 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/8 -bottom-24 left-24 blur-[80px] animate-pulse pointer-events-none" style={{animationDelay:'3s'}} />
      <div className="absolute inset-0 pointer-events-none"
        style={{backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col justify-between w-52 border-r border-white/[0.05] bg-white/[0.02] p-4 relative z-10 flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2 px-2 mb-7">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center" style={{boxShadow:'0 0 20px rgba(99,102,241,0.4)'}}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 6v4c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6L10 2z" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">RegularIQ</span>
          </div>

          <p className="text-[9px] text-white/20 uppercase tracking-widest px-2 mb-2">Main</p>

          {NAV.map(item => (
            <div key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 cursor-pointer transition-all relative ${
                item.active
                  ? 'bg-indigo-500/15 border border-indigo-500/20'
                  : 'hover:bg-white/[0.04]'
              }`}>
              {item.active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r" />
              )}
              <div className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 ${item.active ? 'bg-indigo-400' : 'bg-white/20'}`} />
              <span className={`text-xs flex-1 font-medium ${item.active ? 'text-white' : 'text-white/35'}`}>
                {item.label}
              </span>
              {item.badge && (
                <span className="text-[9px] bg-red-400/20 text-red-400 rounded-full px-1.5 font-semibold">
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <p className="text-[9px] text-white/20 uppercase tracking-widest px-2 mb-2 mt-5">Account</p>
          {['Profile', 'Settings'].map(l => (
            <div key={l} className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 cursor-pointer hover:bg-white/[0.04] transition-all">
              <div className="w-3.5 h-3.5 rounded-sm bg-white/15 flex-shrink-0" />
              <span className="text-xs text-white/30 font-medium">{l}</span>
            </div>
          ))}
        </div>

        {/* User */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
              {business?.name?.[0] || 'J'}
            </div>
            <div>
              <p className="text-[11px] text-white font-semibold">{business?.name || "Jane's Diner"}</p>
              <p className="text-[9px] text-white/30">Starter plan</p>
            </div>
          </div>
          <button onClick={() => { removeToken(); router.push('/login'); }}
            className="w-full py-1.5 text-[10px] text-white/30 hover:text-white/60 border border-white/[0.06] rounded-lg transition-all">
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">

        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.01] backdrop-blur-xl">
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Good morning, Jane 👋</h1>
            <p className="text-[11px] text-white/30 mt-0.5">Monday, April 14 · Here's your compliance overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center cursor-pointer hover:bg-white/[0.08] transition-all">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 1a5 5 0 00-5 5v2L1.5 10h13L13 8V6a5 5 0 00-5-5z" fill="rgba(255,255,255,0.5)"/>
                <circle cx="8" cy="14" r="1.5" fill="rgba(255,255,255,0.5)"/>
              </svg>
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
            </div>
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5"
              style={{boxShadow:'0 0 20px rgba(99,102,241,0.15)'}}>
              <span className="text-sm font-black text-indigo-400 tracking-tight">72%</span>
              <span className="text-[10px] text-white/35">Compliance score</span>
            </div>
            <button onClick={() => router.push('/documents')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-semibold px-3 py-2 rounded-lg hover:opacity-90 hover:-translate-y-0.5 transition-all">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v7M3 4l3-3 3 3M2 10h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Upload doc
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {METRICS.map((m, i) => (
              <div key={i}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all group relative overflow-hidden cursor-default"
                style={{animationDelay:`${i*0.06}s`}}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${m.trendColor}`}>
                    {m.trend}
                  </span>
                </div>
                <div className={`text-2xl font-black tracking-tight mb-1 ${m.valColor}`}>{m.val}</div>
                <div className="text-[11px] text-white/30">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Line Chart */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-white">Compliance score trend</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">Last 6 months</p>
                </div>
                <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1 cursor-pointer">View all</span>
              </div>
              <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,85 C30,80 50,70 80,60 C110,50 130,52 160,45 C190,38 220,32 250,25 C270,20 285,18 300,15"
                  fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"
                  className="animate-[lineGrow_2s_ease_0.5s_both]" style={{strokeDasharray:1000,strokeDashoffset:1000,animation:'lineGrow 2s ease 0.5s forwards'}}/>
                <path d="M0,85 C30,80 50,70 80,60 C110,50 130,52 160,45 C190,38 220,32 250,25 C270,20 285,18 300,15 L300,100 L0,100Z"
                  fill="url(#lg1)"/>
                <circle cx="300" cy="15" r="3.5" fill="#6366f1"/>
                <circle cx="300" cy="15" r="8" fill="#6366f1" opacity="0.15" className="animate-pulse"/>
                {['Oct','Nov','Dec','Jan','Feb','Mar','Apr'].map((l,i) => (
                  <text key={l} x={i*50} y="98" fontSize="7" fill="rgba(255,255,255,0.2)" textAnchor="middle">{l}</text>
                ))}
              </svg>
            </div>

            {/* Donut Chart */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-white">Compliance breakdown</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">By category</p>
                </div>
                <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1 cursor-pointer">Details</span>
              </div>
              <div className="flex items-center gap-5">
                <svg width="90" height="90" viewBox="0 0 100 100" className="flex-shrink-0">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="14"
                    strokeDasharray="162 239" strokeDashoffset="60" strokeLinecap="round"
                    transform="rotate(-90 50 50)"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#4ade80" strokeWidth="14"
                    strokeDasharray="48 239" strokeDashoffset="-102" strokeLinecap="round"
                    transform="rotate(-90 50 50)"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f87171" strokeWidth="14"
                    strokeDasharray="29 239" strokeDashoffset="-150" strokeLinecap="round"
                    transform="rotate(-90 50 50)"/>
                  <text x="50" y="46" textAnchor="middle" fontSize="13" fontWeight="800" fill="white">72%</text>
                  <text x="50" y="57" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.3)">overall</text>
                </svg>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Licences', pct: 68, color: 'bg-indigo-400', text: 'text-indigo-400' },
                    { label: 'Permits', pct: 80, color: 'bg-green-400', text: 'text-green-400' },
                    { label: 'Safety', pct: 55, color: 'bg-red-400', text: 'text-red-400' },
                  ].map(d => (
                    <div key={d.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-white/40">{d.label}</span>
                        <span className={`text-[10px] font-semibold ${d.text}`}>{d.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full ${d.color} rounded-full transition-all duration-1000`}
                          style={{width:`${d.pct}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Checklist */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-white">Compliance checklist</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">6 items total</p>
                </div>
                <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1 cursor-pointer">View all</span>
              </div>
              {CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
                  <span className="text-[11px] text-white/60 flex-1">{item.text}</span>
                  <span className={`text-[9px] rounded-full px-2 py-0.5 font-semibold ${item.badge}`}>{item.status}</span>
                </div>
              ))}
            </div>

            {/* Deadlines */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-white">Upcoming deadlines</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">Next 90 days</p>
                </div>
                <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1 cursor-pointer">View all</span>
              </div>
              {DEADLINES.map((d, i) => (
                <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-sm flex-shrink-0">
                    {d.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white font-medium truncate">{d.title}</p>
                    <p className="text-[9px] text-white/30">{d.date}</p>
                  </div>
                  <span className={`text-[9px] rounded-full px-2 py-0.5 font-semibold flex-shrink-0 ${d.color}`}>
                    {d.days}
                  </span>
                </div>
              ))}
            </div>

            {/* Docs */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-white">Document vault</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">5 of 12 uploaded</p>
                </div>
                <span onClick={() => router.push('/documents')}
                  className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1 cursor-pointer hover:bg-indigo-400/15 transition-all">
                  Upload
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DOCS.map((d, i) => (
                  <div key={i}
                    className={`rounded-xl p-3 text-center border cursor-pointer hover:-translate-y-0.5 transition-all ${
                      d.ok
                        ? 'bg-white/[0.03] border-white/[0.06] hover:border-indigo-500/20'
                        : 'bg-red-500/[0.05] border-red-500/20'
                    }`}>
                    <div className="text-xl mb-1">{d.icon}</div>
                    <p className="text-[10px] text-white/55 font-medium leading-tight">{d.name}</p>
                    <p className={`text-[9px] mt-1 ${d.ok ? 'text-green-400/60' : 'text-red-400/70'}`}>
                      Exp: {d.exp}
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/documents')}
                className="w-full mt-3 py-2 border border-dashed border-white/10 rounded-xl text-[10px] text-white/25 hover:border-indigo-500/30 hover:text-indigo-400/60 transition-all">
                + Upload new document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Score widget component
function ScoreWidget() {
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScore();
  }, []);

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

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#4ade80';
    if (s >= 50) return '#fbbf24';
    return '#f87171';
  };

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

      {/* Score ring */}
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none"
              stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
            <circle cx="65" cy="65" r="54" fill="none"
              stroke={getScoreColor(score)} strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{transition:'stroke-dashoffset 1s ease, stroke 0.5s ease'}}/>
            <text x="65" y="58" textAnchor="middle"
              fontSize="28" fontWeight="800" fill="white">
              {score}
            </text>
            <text x="65" y="72" textAnchor="middle"
              fontSize="10" fill="rgba(255,255,255,0.35)">
              out of 100
            </text>
            <text x="65" y="84" textAnchor="middle"
              fontSize="9" fill={getScoreColor(score)}>
              {score >= 80 ? 'Excellent' : score >= 50 ? 'Needs work' : 'Critical'}
            </text>
          </svg>
        </div>

        {/* Breakdown */}
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

      {/* History */}
      {scoreData?.history?.length > 1 && (
        <div className="mt-5 pt-4 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/30 mb-3">Score history</p>
          <div className="flex items-end gap-1.5 h-10">
            {scoreData.history.slice(-8).map((h: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm transition-all duration-500"
                  style={{
                    height:`${Math.max(4, (h.score/100)*36)}px`,
                    background: h.score >= 80 ? '#4ade80' :
                                h.score >= 50 ? '#fbbf24' : '#f87171',
                    opacity: 0.6 + (i / scoreData.history.length) * 0.4,
                  }}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          { val: scoreData?.completedItems || 0, label: 'Docs uploaded' },
          { val: scoreData?.totalItems || 0, label: 'Total required' },
          { val: `${Math.max(0, (scoreData?.totalItems || 0) - (scoreData?.completedItems || 0))}`, label: 'Still needed' },
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