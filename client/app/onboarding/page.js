'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { patch } from '@/lib/api';
import { getAuth, setAuth } from '@/lib/auth';

export default function OnboardingPage() {
  const router = useRouter();
  const [auth, setAuthState] = useState(null);
  const [form, setForm] = useState({
    role: '',
    experienceLevel: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const a = getAuth();
    if (!a || !a.token) {
      router.replace('/login');
      return;
    }
    setAuthState(a);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.role.trim()) {
      setError('Please enter your target job role');
      return;
    }
    if (!form.experienceLevel) {
      setError('Please select your experience level');
      return;
    }

    setLoading(true);
    try {
      const updated = await patch('/api/users/me', form);
      // Update stored user data
      const currentAuth = getAuth();
      setAuth({ ...currentAuth, user: updated });
      router.push('/interview/new');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!auth) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="orb orb-indigo" style={{ width: 350, height: 350, top: '10%', right: '10%' }} />
      <div className="orb orb-cyan" style={{ width: 250, height: 250, bottom: '15%', left: '5%' }} />

      <div className="glass-card p-8 w-full max-w-lg animate-fade-in relative z-10">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--gradient-main)', color: 'white' }}>
              ✓
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Account</span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'var(--border-glass)' }} />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold animate-pulse-glow"
              style={{ background: 'var(--gradient-main)', color: 'white' }}>
              2
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--accent-indigo)' }}>Profile</span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'var(--border-glass)' }} />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ background: 'rgba(192,192,192,0.1)', color: 'var(--text-muted)' }}>
              3
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Interview</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Set up your profile
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          This helps your AI interviewer tailor questions to your level and goals.
        </p>

        {error && <div className="error-toast mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name (read-only) */}
          <div>
            <label className="input-label">Name</label>
            <input
              type="text"
              className="input-field"
              value={auth.user?.name || ''}
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>

          {/* Target role */}
          <div>
            <label htmlFor="onboarding-role" className="input-label">Target Job Role</label>
            <input
              id="onboarding-role"
              type="text"
              className="input-field"
              placeholder="e.g. Frontend Developer, Product Manager, Data Scientist"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
          </div>

          {/* Experience level */}
          <div>
            <label htmlFor="onboarding-experience" className="input-label">Experience Level</label>
            <select
              id="onboarding-experience"
              className="input-field"
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              required
            >
              <option value="" disabled>Select your level</option>
              <option value="Fresher / Intern">Fresher / Intern</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3+ years">3+ years</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : null}
            {loading ? 'Saving...' : 'Continue to Interview Selection →'}
          </button>
        </form>
      </div>
    </div>
  );
}
