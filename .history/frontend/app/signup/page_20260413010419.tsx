'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupUser } from '@/lib/api';
import { saveToken } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !email || !password) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    const data = await signupUser(`${firstName} ${lastName}`, email, password);
    if (data.token) {
      saveToken(data.token);
      router.push('/onboarding');
    } else {
      setError(data.message || 'Signup failed');
      setLoading(false);
    }
  };

  const steps = [
    'Create your account',
    'Tell us about your business',
    'Get your compliance checklist',
    'Upload your documents',
    'Set up alerts & done',
  ];

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex relative overflow-hidden">

      {/* Glowing Orbs */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 -top-24 -left-20 blur-[90px] animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-indigo-500/15 bottom-0 right-10 blur-[70px] animate-pulse" style={{animationDelay:'2s'}} />
      <div className="absolute w-48 h-48 rounded-full bg-sky-500/10 top-1/2 left-1/3 blur-[60px] animate-pulse" style={{animationDelay:'1s'}} />

      {/* LEFT */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-10 relative z-10">

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
            Get compliant<br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
              in 5 minutes.
            </span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            No credit card required. No legal jargon. Just a clear compliance checklist built for your business.
          </p>

          {/* Steps */}
          <div className="flex flex-col gap-1">
            {steps.map((step, i) => (
              <div key={step}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all ${
                    i === 0
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-white/[0.06] border border-white/[0.08] text-white/30'
                  }`}>
                    {i === 0 ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-sm ${i === 0 ? 'text-white font-medium' : 'text-white/30'}`}>
                    {step}
                  </span>
                  {i === 0 && (
                    <span className="ml-auto text-[10px] text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">
                      Now
                    </span>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-px h-5 ml-4 my-0.5 ${i === 0 ? 'bg-indigo-500/40' : 'bg-white/[0.06]'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-8">
            {[
              { val: 'Free', label: '14-day trial', color: 'text-green-400' },
              { val: '5 min', label: 'Setup time', color: 'text-indigo-400' },
              { val: '$0', label: 'Credit card', color: 'text-sky-400' },
            ].map(s => (
              <div key={s.val} className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-center">
                <div className={`text-lg font-bold ${s.color} tracking-tight`}>{s.val}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          No credit card required · Cancel anytime
        </div>
      </div>

      {/* RIGHT - Glass Card */}
      <div className="flex flex-col justify-center flex-1 px-8 lg:px-12 relative z-10">
        <div className="bg-white/[0.05] border border-white/[0.1] rounded-2xl p-8 backdrop-blur-xl">

          <h2 className="text-xl font-semibold text-white tracking-tight mb-1">Create your account</h2>
          <p className="text-white/40 text-xs mb-6">Start your free 14-day trial — no credit card needed</p>

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
            <span className="text-[11px] text-white/25">or sign up with email</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Name Row */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 group">
              <label className="text-[11px] font-medium text-white/40 group-focus-within:text-indigo-400 transition-colors block mb-1.5 uppercase tracking-wider">
                First name
              </label>
              <input type="text" placeholder="Jane"
                className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm bg-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.08] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="flex-1 group">
              <label className="text-[11px] font-medium text-white/40 group-focus-within:text-indigo-400 transition-colors block mb-1.5 uppercase tracking-wider">
                Last name
              </label>
              <input type="text" placeholder="Smith"
                className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm bg-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.08] focus:ring-2 focus:ring-indigo-500/10 transition-all"
                value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="mb-4 group">
            <label className="text-[11px] font-medium text-white/40 group-focus-within:text-indigo-400 transition-colors block mb-1.5 uppercase tracking-wider">
              Work email
            </label>
            <input type="email" placeholder="jane@yourrestaurant.com"
              className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm bg-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.08] focus:ring-2 focus:ring-indigo-500/10 transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="mb-1 group">
            <label className="text-[11px] font-medium text-white/40 group-focus-within:text-indigo-400 transition-colors block mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input type="password" placeholder="Min. 8 characters"
              className="w-full px-3.5 py-2.5 border border-white/10 rounded-xl text-sm bg-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.08] focus:ring-2 focus:ring-indigo-500/10 transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button onClick={handleSignup} disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold mt-5 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Creating account...
              </>
            ) : 'Create free account →'}
          </button>

          <p className="text-center text-[11px] text-white/25 mt-3">
            By signing up you agree to our{' '}
            <a href="/terms" className="text-indigo-400">Terms</a> and{' '}
            <a href="/privacy" className="text-indigo-400">Privacy Policy</a>
          </p>

          <p className="text-center text-[11px] text-white/30 mt-3">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-400 font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}