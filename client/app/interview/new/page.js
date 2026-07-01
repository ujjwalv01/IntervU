'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api';
import { getAuth } from '@/lib/auth';

const INTERVIEW_TYPES = [
  {
    key: 'behavioral',
    label: 'Behavioral',
    icon: '💬',
    description: 'Communication, STAR structure, self-awareness',
    gradient: 'linear-gradient(135deg, rgba(192,192,192,0.15), rgba(192,192,192,0.03))',
    borderColor: 'rgba(192,192,192,0.25)',
    accentColor: '#c0c0c0',
  },
  {
    key: 'technical',
    label: 'Technical',
    icon: '⚡',
    description: 'Depth of knowledge, problem-solving approach',
    gradient: 'linear-gradient(135deg, rgba(226,232,240,0.15), rgba(226,232,240,0.03))',
    borderColor: 'rgba(226,232,240,0.25)',
    accentColor: '#e2e8f0',
  },
  {
    key: 'system_design',
    label: 'System Design',
    icon: '🏗️',
    description: 'Architecture thinking, tradeoffs, communicating complexity',
    gradient: 'linear-gradient(135deg, rgba(148,163,184,0.15), rgba(148,163,184,0.03))',
    borderColor: 'rgba(148,163,184,0.25)',
    accentColor: '#94a3b8',
  },
  {
    key: 'hr_culture_fit',
    label: 'HR / Culture Fit',
    icon: '🤝',
    description: 'Motivation, values, situational judgment',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
    borderColor: 'rgba(245,158,11,0.3)',
    accentColor: '#f59e0b',
  },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = getAuth();
    if (!auth || !auth.token) router.replace('/login');
  }, [router]);

  const handleSelect = async (type) => {
    setError('');
    setLoading(type);
    try {
      const data = await post('/api/sessions', { interviewType: type });
      router.push(`/interview/${data.sessionId}`);
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="orb orb-indigo" style={{ width: 300, height: 300, top: '5%', left: '50%' }} />
      <div className="orb orb-violet" style={{ width: 200, height: 200, bottom: '10%', left: '10%' }} />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Choose your <span className="gradient-text">interview type</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Select the type of interview you want to practice. Your AI interviewer will adapt accordingly.
          </p>
        </div>

        {error && (
          <div className="error-toast mb-6 max-w-md mx-auto text-center">{error}</div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
          {INTERVIEW_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => handleSelect(type.key)}
              disabled={loading !== null}
              className="glass-card glass-card-interactive p-6 text-left group relative overflow-hidden"
              style={{
                borderColor: loading === type.key ? type.accentColor : undefined,
              }}
            >
              {/* Gradient background on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: type.gradient }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{type.icon}</span>
                  {loading === type.key && (
                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {type.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {type.description}
                </p>
                <div
                  className="mt-4 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: type.accentColor }}
                >
                  Start interview →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Back to dashboard */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
