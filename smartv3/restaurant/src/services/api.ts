import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,            // ← send & receive cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: auto‐attach CSRF token from cookie
api.interceptors.request.use((config) => {
  const getCookie = (name: string) => {
    const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? match.pop() : '';
  };
  config.headers!['X-CSRFToken'] = getCookie('csrftoken');
  return config;
});

export default api;
