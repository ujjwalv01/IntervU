'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_KEY = 'intervu_auth';

export function getAuth() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    if (!auth || !auth.token) {
      router.replace('/login');
    }
  }, [router]);

  return getAuth();
}
