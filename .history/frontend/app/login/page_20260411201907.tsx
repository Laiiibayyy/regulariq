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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <input
        type="email"
        placeholder="Email"
        className="border p-2 mb-3 w-80 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 mb-3 w-80 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-2 rounded w-80"
      >
        Login
      </button>
    </div>
  );
}