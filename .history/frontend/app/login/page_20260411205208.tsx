'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { saveToken } from '@/lib/auth';
{import('tailwindcss').Config}

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
    <div className="flex min-h-screen">

      {/* LEFT - Animated Blue Side */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#0C447C] p-10 relative overflow-hidden">

        {/* Floating orbs */}
        <div className="absolute w-44 h-44 rounded-full bg-white/[0.04] -top-10 -right-10 animate-pulse" />
        <div className="absolute w-28 h-28 rounded-full bg-white/[0.04] bottom-16 -left-8 animate-pulse" style={{animationDelay:'1s'}} />
        <div className="absolute w-14 h-14 rounded-full bg-white/[0.06] bottom-44 right-8 animate-pulse" style={{animationDelay:'0.5s'}} />

        {/* Brand */}
        <div className="flex items-center gap-3 animate-[fadeInLeft_0.6s_ease_both]">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v4c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6L10 2z" fill="white"/>
            </svg>
          </div>
          <span className="text-white text-xl font-medium">RegularIQ</span>
        </div>

        {/* Hero */}
        <div>
          <h2 className="text-3xl font-medium text-white leading-snug mb-3">
            Never get fined.<br/>Never get shut down.
          </h2>
          <p className="text-white/60 text-sm mb-8">The compliance co-pilot built for small businesses.</p>

          {[
            { title: 'Auto compliance checklist', desc: 'Every regulation identified for your business instantly' },
            { title: 'Smart deadline alerts', desc: 'Reminders at 90, 60, 30, 14, 7 and 1 day before expiry' },
            { title: 'Document vault', desc: 'All licences stored and audit-ready at any time' },
          ].map((f, i) => (
            <div key={f.title} className="flex gap-3 mb-5" style={{animationDelay:`${0.3+i*0.1}s`}}>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/70" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-white/55 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 w-fit">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/80 text-xs">500+ US businesses protected</span>
        </div>
      </div>

      {/* RIGHT - Form */}
      <div className="flex flex-col justify-center flex-1 px-8 lg:px-14 bg-white animate-[fadeUp_0.7s_ease_0.2s_both]">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-7">Sign in to your RegularIQ account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Google */}
        <button className="flex items-center justify-center gap-3 w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 active:scale-95 transition-all mb-5">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or continue with email</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="mb-4 group">
          <label className="text-xs font-medium text-gray-500 group-focus-within:text-[#185FA5] transition-colors block mb-1.5">
            Email address
          </label>
          <input type="email" placeholder="you@company.com"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#185FA5] focus:ring-2 focus:ring-blue-100 transition-all"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-1 group">
          <label className="text-xs font-medium text-gray-500 group-focus-within:text-[#185FA5] transition-colors block mb-1.5">
            Password
          </label>
          <input type="password" placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#185FA5] focus:ring-2 focus:ring-blue-100 transition-all"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <a href="/forgot-password" className="text-xs text-[#185FA5] block text-right mt-1.5">Forgot password?</a>
        </div>

        <button onClick={handleLogin} disabled={loading}
          className="w-full py-2.5 bg-[#0C447C] hover:bg-[#185FA5] disabled:opacity-70 text-white rounded-xl text-sm font-medium mt-3 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 5l4 3-4 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500 mt-5">
          Don't have an account?{' '}
          <a href="/signup" className="text-[#185FA5] font-medium">Create one free</a>
        </p>

        {/* Trust badges */}
        <div className="flex justify-center gap-5 mt-5">
          {['SOC 2 secured', 'GDPR compliant', '99.9% uptime'].map(t => (
            <span key={t} className="text-xs text-gray-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}