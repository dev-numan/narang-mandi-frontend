import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE || '') + '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000, // fail slow/hung requests instead of spinning forever
});

// Friendly fallbacks used only when the server didn't send a useful message.
const STATUS_MESSAGES = {
  400: 'Please check the details and try again.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to do that.",
  404: 'We couldn’t find what you were looking for.',
  409: 'That conflicts with something that already exists.',
  413: 'The file or data you sent is too large.',
  422: 'Some of the details look invalid. Please review and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
};

function friendlyMessage(error) {
  // Request was cancelled (e.g. component unmounted) — not a real failure.
  if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED') {
    return 'Request cancelled.';
  }
  // Browser reports offline before the request is sent.
  if (error.code === 'ERR_OFFLINE') {
    return 'Network error. Please check your internet connection and try again.';
  }
  // Timed out / hung request.
  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  // No response at all → network/server-unreachable.
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Network error. Please check your internet connection and try again.';
  }
  const { status, data } = error.response;
  // Prefer a meaningful message from the API when present.
  if (data?.message && typeof data.message === 'string') return data.message;
  if (status >= 500) return 'Something went wrong on our end. Please try again shortly.';
  return STATUS_MESSAGES[status] || 'Something went wrong. Please try again.';
}

// Fail immediately when the browser is offline (don't hang on "Saving…").
api.interceptors.request.use((config) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const err = new Error('Network error. Please check your internet connection and try again.');
    err.code = 'ERR_OFFLINE';
    err.isNetworkError = true;
    return Promise.reject(err);
  }
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize every failure into a user-friendly Error, keeping useful metadata
// (status / network flag) for callers that want to branch on it.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Already normalized by the offline request interceptor.
    if (error?.code === 'ERR_OFFLINE' && error.message) {
      return Promise.reject(error);
    }
    const err = new Error(friendlyMessage(error));
    err.status = error.response?.status ?? null;
    err.isNetworkError = !error.response && error.code !== 'ERR_CANCELED';
    err.code = error.code;
    return Promise.reject(err);
  }
);

export default api;
