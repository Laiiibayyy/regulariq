'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ALERTS = [
  { id: 1, icon: '🔥', title: 'Fire safety cert expiring', days: 15, type: 'Email + SMS', status: 'active', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  { id: 2, icon: '🍺', title: 'Liquor licence renewal due', days: 32, type: 'Email', status: 'active', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  { id: 3, icon: '👨‍🍳', title: 'Food handler cert renewal', days: 49, type: 'Email + SMS', status: 'active', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  { id: 4, icon: '📋', title: 'Business licence renewal', days: 88, type: 'Email', status: 'sent', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
];

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState(ALERTS);
  const [emailOn, setEmailOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);

  const dismiss = (id: number) => setAlerts(a => a.filter(x => x.id !== id));

  return (
    <div className="min-h-screen bg-[#0d0d1a] p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push('/dashboard')}
              className="text-xs text-white/30 hover:text-white/60 mb-2 flex items-center gap-1 transition-all">
              ← Back to dashboard
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Alert centre</h1>
            <p className="text-white/40 text-sm mt-1">Manage your compliance deadline notifications</p>
          </div>
          <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">{alerts.filter(a => a.status === 'active').length} active alerts</span>
          </div>
        </div>

        {/* Alert preferences */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-medium text-white mb-4">Notification preferences</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Email alerts', desc: 'Get notified via email', val: emailOn, set: setEmailOn, icon: '📧' },
              { label: 'SMS alerts', desc: 'Get text messages for urgent deadlines', val: smsOn, set: setSmsOn, icon: '📱' },
            ].map(p => (
              <div key={p.label} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{p.icon}</span>
                  <div>
                    <p className="text-sm text-white font-medium">{p.label}</p>
                    <p className="text-xs text-white/35">{p.desc}</p>
                  </div>
                </div>
                <button onClick={() => p.set(!p.val)}
                  className={`w-10 h-6 rounded-full border transition-all flex items-center px-0.5 ${
                    p.val ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500/60' : 'bg-white/[0.06] border-white/10'
                  }`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${p.val ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Alert timing */}
          <div className="mt-4">
            <p className="text-xs text-white/40 mb-2">Alert timing — we notify you at:</p>
            <div className="flex flex-wrap gap-2">
              {['90 days', '60 days', '30 days', '14 days', '7 days', '1 day'].map(d => (
                <span key={d} className="text-[11px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 rounded-full px-3 py-1">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Active alerts */}
        <h2 className="text-sm font-medium text-white mb-3">Active alerts</h2>
        <div className="flex flex-col gap-3">
          {alerts.map(alert => (
            <div key={alert.id}
              className={`flex items-center gap-4 bg-white/[0.04] border rounded-xl px-4 py-4 ${
                alert.status === 'sent' ? 'opacity-50' : ''
              } border-white/[0.07]`}>
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-xl flex-shrink-0">
                {alert.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{alert.title}</p>
                <p className="text-xs text-white/35 mt-0.5">{alert.type} · {alert.status === 'sent' ? 'Alert sent' : 'Alert scheduled'}</p>
              </div>
              <span className={`text-[11px] rounded-full px-3 py-1 border font-medium ${alert.color}`}>
                {alert.days} days
              </span>
              {alert.status === 'active' && (
                <button onClick={() => dismiss(alert.id)}
                  className="text-white/20 hover:text-white/50 transition-all text-lg ml-1">
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-white/40 text-sm">No active alerts — you're fully compliant!</p>
          </div>
        )}
      </div>
    </div>
  );
}