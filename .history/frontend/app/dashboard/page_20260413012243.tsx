'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, removeToken } from '@/lib/auth';
import { getBusiness } from '@/lib/api';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'grid', active: true },
  { label: 'Compliance', icon: 'shield', badge: 3 },
  { label: 'Documents', icon: 'file' },
  { label: 'Deadlines', icon: 'clock' },
  { label: 'Alerts', icon: 'bell' },
];

const CHECKLIST = [
  { icon: '✅', text: 'Business licence', status: 'Done', color: 'text-green-400 bg-green-400/10' },
  { icon: '✅', text: 'Health permit', status: 'Done', color: 'text-green-400 bg-green-400/10' },
  { icon: '⚠️', text: 'Fire safety cert', status: 'Expiring', color: 'text-yellow-400 bg-yellow-400/10' },
  { icon: '❌', text: 'Liquor licence', status: 'Missing', color: 'text-red-400 bg-red-400/10' },
  { icon: '❌', text: 'Food handler cert', status: 'Missing', color: 'text-red-400 bg-red-400/10' },
  { icon: '✅', text: 'Business insurance', status: 'Done', color: 'text-green-400 bg-green-400/10' },
];

const DEADLINES = [
  { icon: '🔥', title: 'Fire safety cert', date: 'Due Apr 28, 2026', days: '15 days', color: 'text-yellow-400 bg-yellow-400/10' },
  { icon: '🍺', title: 'Liquor licence', date: 'Due May 15, 2026', days: '32 days', color: 'text-red-400 bg-red-400/10' },
  { icon: '👨‍🍳', title: 'Food handler cert', date: 'Due Jun 1, 2026', days: '49 days', color: 'text-indigo-400 bg-indigo-400/10' },
  { icon: '📋', title: 'Business licence renewal', date: 'Due Jul 10, 2026', days: '88 days', color: 'text-sky-400 bg-sky-400/10' },
];

const DOCS = [
  { icon: '📋', name: 'Business licence', exp: 'Dec 2026', ok: true },
  { icon: '🏥', name: 'Health permit', exp: 'Mar 2027', ok: true },
  { icon: '🛡️', name: 'Insurance cert', exp: 'Jan 2027', ok: true },
  { icon: '🔥', name: 'Fire safety cert', exp: 'Apr 2026', ok: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    getBusiness(token).then(setBusiness).catch(() => {});
  }, []);

  const handleLogout = () => { removeToken(); router.push('/login'); };

  return (
    <div className="flex min-h-screen bg-[#0d0d1a]">

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col justify-between w-56 border-r border-white/[0.06] p-4 flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2 mb-7 px-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 6v4c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6L10 2z" fill="white"/>
              </svg>
            </div>
            <span className="text-white text-sm font-semibold">RegularIQ</span>
          </div>

          <p className="text-[9px] text-white/20 uppercase tracking-widest px-2 mb-2">Main</p>

          {NAV_ITEMS.map(item => (
            <div key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 cursor-pointer transition-all ${
                item.active
                  ? 'bg-indigo-500/15 border border-indigo-500/20'
                  : 'hover:bg-white/[0.05]'
              }`}>
              <div className={`w-3.5 h-3.5 rounded-sm ${item.active ? 'bg-indigo-400' : 'bg-white/30'}`} />
              <span className={`text-xs flex-1 ${item.active ? 'text-white font-medium' : 'text-white/40'}`}>
                {item.label}
              </span>
              {item.badge && (
                <span className="text-[10px] bg-red-400/20 text-red-400 rounded-full px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <p className="text-[9px] text-white/20 uppercase tracking-widest px-2 mb-2 mt-4">Account</p>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/[0.05] mb-1">
            <div className="w-3.5 h-3.5 rounded-full bg-white/30" />
            <span className="text-xs text-white/40">Profile</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/[0.05]">
            <div className="w-3.5 h-3.5 bg-white/30" />
            <span className="text-xs text-white/40">Settings</span>
          </div>
        </div>

        {/* User card */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white font-semibold">
              {business?.name?.[0] || 'J'}
            </div>
            <div>
              <p className="text-xs text-white font-medium">{business?.name || 'My Business'}</p>
              <p className="text-[10px] text-white/30">Starter plan</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full mt-3 py-1.5 text-[10px] text-white/30 hover:text-white/60 border border-white/[0.06] rounded-lg transition-all">
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <div>
            <h1 className="text-base font-semibold text-white">Good morning 👋</h1>
            <p className="text-xs text-white/30 mt-0.5">Here's your compliance overview for today</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1a5 5 0 00-5 5v2L1.5 10.5h13L13 8V6a5 5 0 00-5-5z" fill="rgba(255,255,255,0.5)"/>
                <circle cx="8" cy="14" r="1.5" fill="rgba(255,255,255,0.5)"/>
              </svg>
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
            </div>
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5">
              <span className="text-sm font-bold text-indigo-400">72%</span>
              <span className="text-xs text-white/40">Compliance score</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { val: '72%', label: 'Compliance score', badge: '↑ +12% this month', valColor: 'text-green-400', badgeColor: 'text-green-400 bg-green-400/10' },
              { val: '3', label: 'Action required', badge: 'Urgent', valColor: 'text-red-400', badgeColor: 'text-red-400 bg-red-400/10' },
              { val: '8', label: 'Upcoming deadlines', badge: 'Next 90 days', valColor: 'text-indigo-400', badgeColor: 'text-indigo-400 bg-indigo-400/10' },
              { val: '5', label: 'Docs uploaded', badge: 'of 12 total', valColor: 'text-sky-400', badgeColor: 'text-sky-400 bg-sky-400/10' },
            ].map((m, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
                <div className={`text-2xl font-bold tracking-tight mb-1 ${m.valColor}`}>{m.val}</div>
                <div className="text-xs text-white/35 mb-2">{m.label}</div>
                <span className={`text-[10px] rounded-full px-2 py-0.5 ${m.badgeColor}`}>{m.badge}</span>
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

            {/* Checklist */}
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Compliance checklist</h3>
                <span className="text-[10px] text-indigo-400 cursor-pointer">View all →</span>
              </div>
              {CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-white/70 flex-1">{item.text}</span>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>

            {/* Deadlines */}
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Upcoming deadlines</h3>
                <span className="text-[10px] text-indigo-400 cursor-pointer">View all →</span>
              </div>
              {DEADLINES.map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-sm flex-shrink-0">
                    {d.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white font-medium">{d.title}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{d.date}</p>
                  </div>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${d.color}`}>{d.days}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document vault */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Document vault</h3>
              <span className="text-[10px] text-indigo-400 cursor-pointer">Upload new →</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {DOCS.map((d, i) => (
                <div key={i} className={`rounded-xl p-3 text-center border ${
                  d.ok ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-red-500/[0.05] border-red-500/20'
                }`}>
                  <div className="text-xl mb-1.5">{d.icon}</div>
                  <p className="text-[10px] text-white/60 font-medium mb-1">{d.name}</p>
                  <p className={`text-[9px] ${d.ok ? 'text-green-400/70' : 'text-red-400/70'}`}>Exp: {d.exp}</p>
                </div>
              ))}
              <div className="rounded-xl p-3 text-center border border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/[0.05] cursor-pointer transition-all">
                <div className="text-xl mb-1.5 text-white/30">+</div>
                <p className="text-[10px] text-white/25">Upload doc</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}