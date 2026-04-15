'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboarding } from '@/lib/api';
import { getToken } from '@/lib/auth';

const STEPS = [
  { title: 'Business type', desc: 'What kind of business do you run?' },
  { title: 'Location', desc: 'Where is your business based?' },
  { title: 'Business details', desc: 'Tell us more about your operations' },
  { title: 'Current compliance', desc: 'What do you already have?' },
  { title: 'Alert preferences', desc: 'How should we notify you?' },
];

const BUSINESS_TYPES = [
  { id: 'restaurant', icon: '🍽️', title: 'Restaurant', desc: 'Food service, café, bar' },
  { id: 'clinic', icon: '🏥', title: 'Clinic', desc: 'Healthcare, dental, therapy' },
  { id: 'retail', icon: '🛍️', title: 'Retail store', desc: 'Shop, boutique, pharmacy' },
  { id: 'construction', icon: '🏗️', title: 'Construction', desc: 'Contractor, builder, trades' },
];

const US_STATES = ['California','Texas','New York','Florida','Illinois','Pennsylvania','Ohio','Georgia','North Carolina','Michigan'];

const DOCS = [
  { id: 'business_license', icon: '📋', title: 'Business licence', desc: 'General operating licence' },
  { id: 'health_permit', icon: '🏥', title: 'Health & safety permit', desc: 'Passed health inspection' },
  { id: 'fire_cert', icon: '🔥', title: 'Fire safety certificate', desc: 'Annual fire inspection' },
  { id: 'food_handler', icon: '👨‍🍳', title: 'Food handler certs', desc: 'Staff food safety training' },
  { id: 'insurance', icon: '🛡️', title: 'Business insurance', desc: 'Liability coverage active' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    type: '', state: '', city: '', employees: '1',
    alcohol: false, delivery: false, seating: false,
    docs: [] as string[], alert: 'both', businessName: '',
  });

  const update = (key: string, val: any) => setData(prev => ({ ...prev, [key]: val }));
  const toggleDoc = (id: string) => {
    setData(prev => ({
      ...prev,
      docs: prev.docs.includes(id) ? prev.docs.filter(d => d !== id) : [...prev.docs, id]
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    const token = getToken();
    await saveOnboarding({
      name: data.businessName || 'My Business',
      type: data.type, state: data.state, city: data.city,
      employees: parseInt(data.employees) || 1,
      hasAlcohol: data.alcohol, hasDelivery: data.delivery,
    }, token!);
    router.push('/dashboard');
  };

  const progress = ((current + 1) / STEPS.length) * 100;
  const score = Math.round(20 + (data.docs.length / 5) * 60);

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex relative overflow-hidden">

      {/* Orbs */}
      <div className="absolute w-72 h-72 rounded-full bg-indigo-600/15 -top-20 -right-16 blur-[70px] animate-pulse" />
      <div className="absolute w-56 h-56 rounded-full bg-purple-600/12 -bottom-10 -left-10 blur-[60px] animate-pulse" style={{animationDelay:'2s'}} />

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col justify-between w-64 p-6 border-r border-white/[0.06] relative z-10">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 6v4c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6L10 2z" fill="white"/>
              </svg>
            </div>
            <span className="text-white text-base font-semibold">RegularIQ</span>
          </div>

          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-4">Setup progress</p>

          {/* Steps */}
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    i < current ? 'bg-indigo-500/30 text-white' :
                    i === current ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' :
                    'bg-white/[0.06] text-white/25'
                  }`}>
                    {i < current ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-px h-7 mt-1 ${i < current ? 'bg-indigo-500/40' : 'bg-white/[0.06]'}`} />
                  )}
                </div>
                <div className="pt-1">
                  <p className={`text-xs font-medium ${i === current ? 'text-white' : i < current ? 'text-white/50' : 'text-white/20'}`}>
                    {s.title}
                  </p>
                  {i === current && <p className="text-[11px] text-indigo-400/70 mt-0.5">{s.desc}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/20 leading-relaxed">Your data is encrypted<br/>and never shared.</p>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col p-8 lg:p-10 relative z-10">

        {/* Progress bar */}
        <div className="h-1 bg-white/[0.07] rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>

        {/* STEP 1 - Business Type */}
        {current === 0 && (
          <div className="animate-[fadeUp_0.5s_ease_both]">
            <div className="inline-flex items-center gap-2 text-[11px] text-indigo-400 bg-indigo-400/10 rounded-full px-3 py-1 mb-4">
              Step 1 of 5
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">What type of business<br/>do you run?</h2>
            <p className="text-white/40 text-sm mb-6">We'll build your compliance checklist based on this.</p>
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              {BUSINESS_TYPES.map(b => (
                <button key={b.id} onClick={() => update('type', b.id)}
                  className={`text-left p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${
                    data.type === b.id
                      ? 'border-indigo-500/60 bg-indigo-500/15 shadow-lg shadow-indigo-500/10'
                      : 'border-white/[0.08] bg-white/[0.04] hover:border-indigo-500/30 hover:bg-indigo-500/8'
                  }`}>
                  <div className="text-2xl mb-2">{b.icon}</div>
                  <div className="text-sm font-medium text-white">{b.title}</div>
                  <div className="text-xs text-white/35 mt-0.5">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 - Location */}
        {current === 1 && (
          <div className="animate-[fadeUp_0.5s_ease_both] max-w-md">
            <div className="inline-flex text-[11px] text-indigo-400 bg-indigo-400/10 rounded-full px-3 py-1 mb-4">Step 2 of 5</div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Where is your business<br/>located?</h2>
            <p className="text-white/40 text-sm mb-6">Regulations vary by state and city.</p>
            <select value={data.state} onChange={e => update('state', e.target.value)}
              className="w-full px-4 py-3 border border-white/10 rounded-xl text-sm bg-white/[0.05] text-white mb-3 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.08] transition-all">
              <option value="">Select state</option>
              {US_STATES.map(s => <option key={s} value={s} className="bg-[#1a1a2e]">{s}</option>)}
            </select>
            <input type="text" placeholder="City (e.g. Los Angeles)"
              className="w-full px-4 py-3 border border-white/10 rounded-xl text-sm bg-white/[0.05] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.08] transition-all mb-3"
              value={data.city} onChange={e => update('city', e.target.value)} />
            <div className="bg-indigo-500/[0.08] border border-indigo-500/20 rounded-xl px-4 py-3">
              <p className="text-[11px] text-indigo-300/70 leading-relaxed">📍 We cover all 50 US states with federal, state and local regulations.</p>
            </div>
          </div>
        )}

        {/* STEP 3 - Details */}
        {current === 2 && (
          <div className="animate-[fadeUp_0.5s_ease_both] max-w-md">
            <div className="inline-flex text-[11px] text-indigo-400 bg-indigo-400/10 rounded-full px-3 py-1 mb-4">Step 3 of 5</div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Tell us about your<br/>operations</h2>
            <p className="text-white/40 text-sm mb-6">Helps us add the right regulations to your checklist.</p>
            <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Number of employees</p>
            <div className="flex gap-2 mb-5">
              {['1', '2–5', '6–15', '16–50', '50+'].map(e => (
                <button key={e} onClick={() => update('employees', e)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                    data.employees === e
                      ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-400'
                      : 'border-white/[0.08] bg-white/[0.04] text-white/40 hover:border-white/20'
                  }`}>{e}</button>
              ))}
            </div>
            {[
              { key: 'alcohol', icon: '🍺', title: 'Serve alcohol', desc: 'Liquor licence required' },
              { key: 'delivery', icon: '🚗', title: 'Offer delivery', desc: 'Food/product delivery' },
              { key: 'seating', icon: '🪑', title: 'Public seating', desc: 'Dine-in or waiting area' },
            ].map(t => (
              <div key={t.key} className="flex items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <p className="text-sm text-white font-medium">{t.title}</p>
                    <p className="text-xs text-white/35">{t.desc}</p>
                  </div>
                </div>
                <button onClick={() => update(t.key, !(data as any)[t.key])}
                  className={`w-10 h-6 rounded-full border transition-all flex items-center px-0.5 ${
                    (data as any)[t.key] ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500/60' : 'bg-white/[0.06] border-white/10'
                  }`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${(data as any)[t.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* STEP 4 - Docs */}
        {current === 3 && (
          <div className="animate-[fadeUp_0.5s_ease_both] max-w-md">
            <div className="inline-flex text-[11px] text-indigo-400 bg-indigo-400/10 rounded-full px-3 py-1 mb-4">Step 4 of 5</div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">What do you already<br/>have in place?</h2>
            <p className="text-white/40 text-sm mb-6">We'll set your compliance score from day one.</p>
            <div className="flex flex-col gap-2">
              {DOCS.map(d => (
                <button key={d.id} onClick={() => toggleDoc(d.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                    data.docs.includes(d.id)
                      ? 'border-indigo-500/50 bg-indigo-500/10'
                      : 'border-white/[0.07] bg-white/[0.04] hover:border-white/15'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{d.icon}</span>
                    <div>
                      <p className="text-sm text-white font-medium">{d.title}</p>
                      <p className="text-xs text-white/35">{d.desc}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    data.docs.includes(d.id) ? 'bg-indigo-500 border-indigo-500' : 'border-white/15'
                  }`}>
                    {data.docs.includes(d.id) && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5 - Alerts */}
        {current === 4 && (
          <div className="animate-[fadeUp_0.5s_ease_both] max-w-md">
            <div className="inline-flex text-[11px] text-indigo-400 bg-indigo-400/10 rounded-full px-3 py-1 mb-4">Step 5 of 5</div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Set up your alerts</h2>
            <p className="text-white/40 text-sm mb-6">How should we notify you before deadlines?</p>
            <div className="flex gap-3 mb-5">
              {[
                { id: 'email', icon: '📧', label: 'Email alerts' },
                { id: 'sms', icon: '📱', label: 'SMS alerts' },
                { id: 'both', icon: '🔔', label: 'Both (recommended)' },
              ].map(a => (
                <button key={a.id} onClick={() => update('alert', a.id)}
                  className={`flex-1 py-3 px-2 rounded-xl border text-center transition-all ${
                    data.alert === a.id ? 'border-indigo-500/60 bg-indigo-500/15' : 'border-white/[0.08] bg-white/[0.04]'
                  }`}>
                  <div className="text-xl mb-1">{a.icon}</div>
                  <div className={`text-[11px] font-medium ${data.alert === a.id ? 'text-indigo-400' : 'text-white/40'}`}>{a.label}</div>
                </button>
              ))}
            </div>
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 mb-4">
              <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3">Alert timing</p>
              <div className="flex flex-wrap gap-2">
                {['90 days', '60 days', '30 days', '14 days', '7 days', '1 day'].map(d => (
                  <span key={d} className="text-[11px] text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 rounded-full px-3 py-1">{d}</span>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-500/15 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-4">
              <div className="text-center flex-shrink-0">
                <div className="text-3xl font-bold text-indigo-400">{score}%</div>
                <div className="text-[10px] text-white/40">Initial score</div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${score}%` }} />
                </div>
                <p className="text-[11px] text-white/35 mt-2">Complete your profile to reach 100%</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-8 max-w-md">
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)}
              className="flex-[0.4] py-2.5 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-all">
              ← Back
            </button>
          )}
          <button
            onClick={current === STEPS.length - 1 ? handleComplete : () => setCurrent(c => c + 1)}
            disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Setting up...
              </>
            ) : current === STEPS.length - 1 ? 'Complete setup ✓' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}