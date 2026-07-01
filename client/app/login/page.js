'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { post } from '@/lib/api';
import { setAuth, getAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth && auth.token) router.replace('/dashboard');
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await post('/api/auth/login', form);
      setAuth(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-indigo" style={{ width: 400, height: 400, top: '-10%', left: '-5%' }} />
      <div className="orb orb-violet" style={{ width: 300, height: 300, bottom: '-5%', right: '-5%' }} />

      <div className="glass-card p-8 w-full max-w-md animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Intervu</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI-powered mock interviews that adapt to you
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
          Welcome back
        </h2>

        {error && (
          <div className="error-toast mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="input-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="input-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium" style={{ color: 'var(--accent-indigo)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
