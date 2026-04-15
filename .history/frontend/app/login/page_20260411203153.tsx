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

  const handleLogin = async () => {
    const data = await loginUser(email, password);
    if (data.token) {
      saveToken(data.token);
      router.push('/dashboard');
    } else {
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE - Blue */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0C447C] p-12">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 6v4c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6L10 2z" fill="white"/>
              </svg>
            </div>
            <span className="text-white text-xl font-medium">RegularIQ</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            The compliance co-pilot for small businesses. Never get fined. Never get shut down.
          </p>

          {[
            { title: 'Auto compliance checklist', desc: 'Every regulation that applies to your business, automatically identified' },
            { title: 'Deadline alerts', desc: 'Automated reminders at 90, 60, 30, 14, 7 and 1 day before expiry' },
            { title: 'Document vault', desc: 'All licenses and certificates stored, audit-ready at any time' },
          ].map((f) => (
            <div key={f.title} className="flex gap-3 mb-5">
              <div className="w-8 h-8 rounded-md bg-white/10 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/80" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-white/70 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs">Trusted by 500+ US small businesses</p>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 lg:px-16 bg-white">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-8">Sign in to your RegularIQ account</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Google Button */}
        <button className="flex items-center justify-center gap-3 w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 mb-6">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or sign in with email</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Email address</label>
          <input type="email" placeholder="you@company.com"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-2">
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Password</label>
          <input type="password" placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <a href="/forgot-password" className="text-xs text-[#185FA5] block text-right mt-1">Forgot password?</a>
        </div>

        <button onClick={handleLogin}
          className="w-full py-2.5 bg-[#0C447C] hover:bg-[#185FA5] text-white rounded-lg text-sm font-medium mt-2">
          Sign in
        </button>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-[#185FA5] font-medium">Create one free</a>
        </p>
      </div>
    </div>
  );
}