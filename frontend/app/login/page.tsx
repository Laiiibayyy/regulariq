'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { saveToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const data = await loginUser(email, password);
    if (data.token) {
      saveToken(data.token);
      router.push('/dashboard');
    } else {
      setError(data.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex relative overflow-hidden">

      {/* Glowing Orbs */}
      <div className="absolute w-80 h-80 rounded-full bg-indigo-600/20 -top-20 -left-16 blur-[80px] animate-pulse" />
      <div className="absolute w-64 h-64 rounded-full bg-sky-500/15 -bottom-16 right-20 blur-[60px] animate-pulse" style={{animationDelay:'2s'}} />
      <div className="absolute w-44 h-44 rounded-full bg-purple-600/12 top-52 right-52 blur-[50px] animate-pulse" style={{animationDelay:'1s'}} />

      {/* LEFT */}
      <div className="hidden lg:flex flex-col justify-between w-[50%] p-10 relative z-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v4c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6L10 2z" fill="white"/>
            </svg>
          </div>
          <span className="text-white text-xl font-semibold tracking-tight">RegularIQ</span>
        </div>

        {/* Hero */}
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-3">
            Stay compliant.<br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
              Stay protected.
            </span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            The AI-powered compliance platform for small businesses. Track regulations, get alerts, store documents.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { val: '98.7%', label: 'Compliance rate', badge: 'Live', color: 'text-green-400', bg: 'bg-green-400/10' },
              { val: '$0', label: 'Avg fines avoided', badge: '+$6,200 saved', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { val: '500+', label: 'Businesses', badge: 'USA', color: 'text-sky-400', bg: 'bg-sky-400/10' },
            ].map(s => (
              <div key={s.val} className="bg-white/[0.05] border border-white/[0.07] rounded-xl p-3">
                <div className={`text-xl font-bold ${s.color} tracking-tight`}>{s.val}</div>
                <div className="text-white/40 text-[11px] mt-0.5">{s.label}</div>
                <div className={`inline-flex items-center gap-1 text-[10px] ${s.color} ${s.bg} rounded-full px-2 py-0.5 mt-2`}>
                  {s.val === '98.7%' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                  {s.badge}
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-col gap-2.5">
            {[
              { text: 'Auto compliance checklist for your business type', color: 'bg-green-400', badge: 'Active', badgeStyle: 'text-green-400 bg-green-400/10' },
              { text: 'Smart deadline alerts at 90, 30, 7 & 1 day', color: 'bg-indigo-400', badge: 'AI', badgeStyle: 'text-indigo-400 bg-indigo-400/10' },
              { text: 'Secure document vault, audit-ready anytime', color: 'bg-sky-400', badge: 'Secure', badgeStyle: 'text-sky-400 bg-sky-400/10' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
                <div className={`w-2 h-2 rounded-full ${f.color} flex-shrink-0`} />
                <span className="text-white/55 text-xs flex-1">{f.text}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${f.badgeStyle}`}>{f.badge}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          All systems operational · SOC 2 · GDPR compliant
        </div>
      </div>

      {/* RIGHT - Glass Card */}
      <div className="flex flex-col justify-center flex-1 px-8 lg:px-12 relative z-10">
        <div className="bg-white/[0.05] border border-white/[0.1] rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white tracking-tight mb-1">Welcome back</h2>
          <p className="text-white/40 text-xs mb-6">Sign in to your RegularIQ account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Google */}
          <button className="flex items-center justify-center gap-2.5 w-full py-2.5 border border-white/10 rounded-xl bg-white/[0.06] text-white/70 text-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all mb-5">
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[11px] text-white/25">or continue with email</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          <div className="mb-4 group">
            <label className="text-[11px] font-medium text-white/40 group-focus-within:text-indigo-400 transition-colors block mb-1.5 uppercase tracking-wider">
              Email address
            </label>
            <input type="email" placeholder="you@company.com"
              className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm bg-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.08] focus:ring-2 focus:ring-indigo-500/10 transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="mb-1 group">
            <label className="text-[11px] font-medium text-white/40 group-focus-within:text-indigo-400 transition-colors block mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input type="password" placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm bg-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.08] focus:ring-2 focus:ring-indigo-500/10 transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <a href="/forgot-password" className="text-[11px] text-indigo-400/80 block text-right mt-1.5">Forgot password?</a>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold mt-4 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Signing in...
              </>
            ) : 'Sign in to RegularIQ'}
          </button>

          <p className="text-center text-[11px] text-white/30 mt-4">
            No account?{' '}
            <a href="/signup" className="text-indigo-400 font-medium">Start free trial</a>
          </p>

          <div className="flex justify-center gap-5 mt-4">
            {['256-bit SSL', 'No credit card', 'Cancel anytime'].map(t => (
              <span key={t} className="text-[10px] text-white/20 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-white/20" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
