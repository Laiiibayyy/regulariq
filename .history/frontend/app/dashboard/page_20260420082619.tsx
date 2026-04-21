'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, removeToken } from '@/lib/auth';
import { getDashboardStats, downloadAuditPDF } from '@/lib/api';
import ScoreWidget from './ScoreWidget';

const NAV = [
  { label: 'Dashboard', active: true, path: '/dashboard' },
  { label: 'Compliance', active: false, path: '/dashboard' },
  { label: 'Documents', active: false, path: '/documents' },
  { label: 'Deadlines', active: false, path: '/dashboard' },
  { label: 'Alerts', active: false, path: '/alerts' },
  { label: 'Employees', active: false, path: '/employees' },
];

const getCategoryIcon = (cat: string) => {
  const icons: any = {
    license: '📋', permit: '🏛️',
    certificate: '🎓', insurance: '🛡️',
    general: '📄',
  };
  return icons[cat] || '📄';
};

const getDaysColor = (days: number) => {
  if (days <= 7) return 'text-red-400 bg-red-400/10';
  if (days <= 30) return 'text-yellow-400 bg-yellow-400/10';
  if (days <= 60) return 'text-indigo-400 bg-indigo-400/10';
  return 'text-sky-400 bg-sky-400/10';
};

const getStatusStyle = (status: string) => {
  if (status === 'Done') return { dot: 'bg-green-400', badge: 'text-green-400 bg-green-400/10' };
  if (status === 'Expiring') return { dot: 'bg-yellow-400', badge: 'text-yellow-400 bg-yellow-400/10' };
  if (status === 'Expired') return { dot: 'bg-red-400', badge: 'text-red-400 bg-red-400/10' };
  return { dot: 'bg-white/20', badge: 'text-white/40 bg-white/[0.06]' };
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    loadStats(token);
  }, []);

  const loadStats = async (token: string) => {
    setLoading(true);
    try {
      const data = await getDashboardStats(token);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const token = getToken();
    if (token) await downloadAuditPDF(token);
    setExporting(false);
  };

  const metrics = stats ? [
    {
      val: `${stats.score}%`,
      label: 'Compliance score',
      trend: stats.score >= 80 ? 'Excellent' : stats.score >= 50 ? 'Needs work' : 'Critical',
      valColor: stats.score >= 80 ? 'text-green-400' : stats.score >= 50 ? 'text-yellow-400' : 'text-red-400',
      trendColor: stats.score >= 80 ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10',
    },
    {
      val: String(stats.actionRequired),
      label: 'Action required',
      trend: stats.actionRequired > 0 ? 'Urgent' : 'All good',
      valColor: stats.actionRequired > 0 ? 'text-red-400' : 'text-green-400',
      trendColor: stats.actionRequired > 0 ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10',
    },
    {
      val: String(stats.deadlines?.length || 0),
      label: 'Upcoming deadlines',
      trend: '90 days',
      valColor: 'text-indigo-400',
      trendColor: 'text-indigo-400 bg-indigo-400/10',
    },
    {
      val: String(stats.docs?.total || 0),
      label: 'Docs uploaded',
      trend: `${stats.docs?.expiring || 0} expiring`,
      valColor: 'text-sky-400',
      trendColor: stats.docs?.expiring > 0 ? 'text-yellow-400 bg-yellow-400/10' : 'text-sky-400 bg-sky-400/10',
    },
  ] : [];

  return (
    <div className="flex min-h-screen bg-[#060610] relative overflow-hidden">

      {/* Background */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-indigo-600/10 -top-52 -right-24 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/10 -bottom-24 left-24 blur-[80px] animate-pulse pointer-events-none" style={{animationDelay:'3s'}} />
      <div className="absolute inset-0 pointer-events-none"
        style={{backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col justify-between w-52 border-r border-white/[0.05] bg-white/[0.02] p-4 relative z-10 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 px-2 mb-7">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
              style={{boxShadow:'0 0 20px rgba(99,102,241,0.4)'}}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 6v4c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6L10 2z" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">RegularIQ</span>
          </div>

          <p className="text-[9px] text-white/20 uppercase tracking-widest px-2 mb-2">Main</p>

          {NAV.map(item => (
            <div key={item.label}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 cursor-pointer transition-all relative ${
                item.active ? 'bg-indigo-500/15 border border-indigo-500/20' : 'hover:bg-white/[0.04]'
              }`}>
              {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r" />}
              <div className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 ${item.active ? 'bg-indigo-400' : 'bg-white/20'}`} />
              <span className={`text-xs flex-1 font-medium ${item.active ? 'text-white' : 'text-white/35'}`}>{item.label}</span>
            </div>
          ))}

          <p className="text-[9px] text-white/20 uppercase tracking-widest px-2 mb-2 mt-5">Account</p>
          {[
            { label: 'Settings', path: '/settings' },
            { label: 'Profile', path: '/settings' },
          ].map(l => (
            <div key={l.label} onClick={() => router.push(l.path)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 cursor-pointer hover:bg-white/[0.04] transition-all">
              <div className="w-3.5 h-3.5 rounded-sm bg-white/15 flex-shrink-0" />
              <span className="text-xs text-white/30 font-medium">{l.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
              {stats?.business?.name?.[0] || 'J'}
            </div>
            <div>
              <p className="text-[11px] text-white font-semibold truncate max-w-[100px]">
                {stats?.business?.name || 'My Business'}
              </p>
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
            <h1 className="text-sm font-bold text-white tracking-tight">
              Good morning{stats?.business?.name ? `, ${stats.business.name}` : ''} 👋
            </h1>
            <p className="text-[11px] text-white/30 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Here's your compliance overview
            </p>
          </div>
          <div className="flex items-center gap-3">

            {/* Export PDF */}
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 text-white/60 text-[11px] font-semibold px-3 py-2 rounded-lg hover:bg-white/[0.08] hover:text-white disabled:opacity-50 transition-all">
              {exporting ? (
                <>
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M6 8V1M3 5l3 3 3-3M2 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Export PDF
                </>
              )}
            </button>

            {/* Notification */}
            <div className="relative w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center cursor-pointer hover:bg-white/[0.08] transition-all">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 1a5 5 0 00-5 5v2L1.5 10h13L13 8V6a5 5 0 00-5-5z" fill="rgba(255,255,255,0.5)"/>
                <circle cx="8" cy="14" r="1.5" fill="rgba(255,255,255,0.5)"/>
              </svg>
              {stats?.actionRequired > 0 && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
              )}
            </div>

            {/* Score pill */}
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5"
              style={{boxShadow:'0 0 20px rgba(99,102,241,0.15)'}}>
              <span className="text-sm font-black text-indigo-400 tracking-tight">
                {loading ? '...' : `${stats?.score || 0}%`}
              </span>
              <span className="text-[10px] text-white/35">Score</span>
            </div>

            {/* Upload */}
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

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin w-8 h-8 text-indigo-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <p className="text-white/30 text-sm">Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {metrics.map((m, i) => (
                  <div key={i}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all group relative overflow-hidden cursor-default">
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

              {/* Score Widget */}
              <ScoreWidget />

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Score History Chart */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-semibold text-white">Compliance score trend</h3>
                      <p className="text-[10px] text-white/30 mt-0.5">Score history</p>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1">
                      {stats?.history?.length || 0} points
                    </span>
                  </div>
                  <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {stats?.history?.length > 1 ? (() => {
                      const pts = stats.history.slice(-7);
                      const w = 300 / (pts.length - 1);
                      const points = pts.map((h: any, i: number) =>
                        `${i * w},${100 - h.score}`
                      ).join(' ');
                      const areaPoints = `0,100 ${points} ${300},100`;
                      return (
                        <>
                          <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                          <polygon points={areaPoints} fill="url(#lg1)"/>
                          <circle cx={300} cy={100 - pts[pts.length-1].score} r="3.5" fill="#6366f1"/>
                        </>
                      );
                    })() : (
                      <path d="M0,85 C50,80 100,65 150,55 C200,45 250,35 300,20"
                        fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"
                        style={{strokeDasharray:1000,strokeDashoffset:1000,animation:'lineGrow 2s ease forwards'}}/>
                    )}
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul'].map((l, i) => (
                      <text key={l} x={i*50} y="98" fontSize="7" fill="rgba(255,255,255,0.2)" textAnchor="middle">{l}</text>
                    ))}
                  </svg>
                </div>

                {/* Breakdown */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-semibold text-white">Compliance breakdown</h3>
                      <p className="text-[10px] text-white/30 mt-0.5">By category</p>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1">Live</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <svg width="90" height="90" viewBox="0 0 100 100" className="flex-shrink-0">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14"/>
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="14"
                        strokeDasharray={`${(stats?.breakdown?.licenses || 0) * 2.39} 239`}
                        strokeDashoffset="60" strokeLinecap="round" transform="rotate(-90 50 50)"/>
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#4ade80" strokeWidth="14"
                        strokeDasharray={`${(stats?.breakdown?.permits || 0) * 0.8} 239`}
                        strokeDashoffset="-102" strokeLinecap="round" transform="rotate(-90 50 50)"/>
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f87171" strokeWidth="14"
                        strokeDasharray={`${(stats?.breakdown?.safety || 0) * 0.5} 239`}
                        strokeDashoffset="-150" strokeLinecap="round" transform="rotate(-90 50 50)"/>
                      <text x="50" y="46" textAnchor="middle" fontSize="13" fontWeight="800" fill="white">
                        {stats?.score || 0}%
                      </text>
                      <text x="50" y="57" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.3)">overall</text>
                    </svg>
                    <div className="flex-1 space-y-3">
                      {[
                        { label: 'Licences', val: stats?.breakdown?.licenses || 0, color: 'bg-indigo-400', text: 'text-indigo-400' },
                        { label: 'Permits', val: stats?.breakdown?.permits || 0, color: 'bg-green-400', text: 'text-green-400' },
                        { label: 'Safety', val: stats?.breakdown?.safety || 0, color: 'bg-red-400', text: 'text-red-400' },
                      ].map(d => (
                        <div key={d.label}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-white/40">{d.label}</span>
                            <span className={`text-[10px] font-semibold ${d.text}`}>{d.val}%</span>
                          </div>
                          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className={`h-full ${d.color} rounded-full transition-all duration-1000`}
                              style={{width:`${d.val}%`}} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Checklist — live data */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-semibold text-white">Compliance checklist</h3>
                      <p className="text-[10px] text-white/30 mt-0.5">{stats?.checklist?.length || 0} items</p>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1 cursor-pointer">View all</span>
                  </div>
                  {(stats?.checklist || []).map((item: any, i: number) => {
                    const style = getStatusStyle(item.status);
                    return (
                      <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                        <span className="text-[11px] text-white/60 flex-1">{item.text}</span>
                        <span className={`text-[9px] rounded-full px-2 py-0.5 font-semibold ${style.badge}`}>{item.status}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Deadlines — live data */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-semibold text-white">Upcoming deadlines</h3>
                      <p className="text-[10px] text-white/30 mt-0.5">Next 90 days</p>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1 cursor-pointer">View all</span>
                  </div>
                  {stats?.deadlines?.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-2xl mb-2">🎉</p>
                      <p className="text-xs text-white/30">No deadlines in next 90 days!</p>
                    </div>
                  ) : (
                    (stats?.deadlines || []).map((d: any, i: number) => (
                      <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-sm flex-shrink-0">
                          {getCategoryIcon(d.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white font-medium truncate">{d.title}</p>
                          <p className="text-[9px] text-white/30">
                            {new Date(d.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={`text-[9px] rounded-full px-2 py-0.5 font-semibold flex-shrink-0 ${getDaysColor(d.daysLeft)}`}>
                          {d.daysLeft}d
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Documents — live data */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/15 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-semibold text-white">Document vault</h3>
                      <p className="text-[10px] text-white/30 mt-0.5">{stats?.docs?.total || 0} documents</p>
                    </div>
                    <span onClick={() => router.push('/documents')}
                      className="text-[10px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 rounded-lg px-2 py-1 cursor-pointer hover:bg-indigo-400/15 transition-all">
                      Upload
                    </span>
                  </div>

                  {stats?.docs?.total === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/30 transition-all"
                      onClick={() => router.push('/documents')}>
                      <p className="text-2xl mb-2">📁</p>
                      <p className="text-xs text-white/30">No documents yet</p>
                      <p className="text-[10px] text-indigo-400 mt-1">Upload your first document</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {(stats?.docs?.recent || []).map((d: any, i: number) => (
                          <div key={i}
                            className={`rounded-xl p-3 text-center border cursor-pointer hover:-translate-y-0.5 transition-all ${
                              d.ok
                                ? 'bg-white/[0.03] border-white/[0.06] hover:border-indigo-500/20'
                                : 'bg-red-500/[0.05] border-red-500/20'
                            }`}>
                            <div className="text-xl mb-1">{getCategoryIcon(d.category)}</div>
                            <p className="text-[10px] text-white/55 font-medium leading-tight truncate">{d.name}</p>
                            <p className={`text-[9px] mt-1 ${d.ok ? 'text-green-400/60' : 'text-red-400/70'}`}>
                              {d.expiryDate
                                ? `Exp: ${new Date(d.expiryDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}`
                                : 'No expiry'}
                            </p>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => router.push('/documents')}
                        className="w-full mt-3 py-2 border border-dashed border-white/10 rounded-xl text-[10px] text-white/25 hover:border-indigo-500/30 hover:text-indigo-400/60 transition-all">
                        + Upload new document
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}