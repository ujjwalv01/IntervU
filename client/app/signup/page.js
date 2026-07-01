'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { post } from '@/lib/api';
import { setAuth, getAuth } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
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
      const data = await post('/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setAuth(data);
      router.push('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-violet" style={{ width: 400, height: 400, top: '-10%', right: '-5%' }} />
      <div className="orb orb-cyan" style={{ width: 300, height: 300, bottom: '-5%', left: '-5%' }} />

      <div className="glass-card p-8 w-full max-w-md animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Intervu</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your personal AI interview coach
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
          Create your account
        </h2>

        {error && (
          <div className="error-toast mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="signup-name" className="input-label">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className="input-field"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="input-label">Email</label>
            <input
              id="signup-email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="input-label">Password</label>
            <input
              id="signup-password"
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : null}
            {loading ? 'Creating account...' : 'Get Started'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'var(--accent-indigo)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
