const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    const auth = localStorage.getItem('intervu_auth');
    if (!auth) return null;
    return JSON.parse(auth).token;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export function get(endpoint) {
  return request(endpoint);
}

export function post(endpoint, body) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function patch(endpoint, body) {
  return request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
