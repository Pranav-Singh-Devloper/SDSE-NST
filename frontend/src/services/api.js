import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// ── Channel ──
export const getMyChannel = () => api.get('/channels/me');

// ── Streams ──
export const createStream = (data) => api.post('/streams', data);
export const startStream = (id) => api.patch(`/streams/${id}/start`);
export const stopStream = (id) => api.patch(`/streams/${id}/stop`);
export const getLiveStreams = () => api.get('/streams/live');
export const getStreamDetails = (id) => api.get(`/streams/${id}`);

// ── Subscription ──
export const getSubscriptionStatus = () => api.get('/subscriptions/status');
export const getViewingAccess = () => api.get('/subscriptions/viewing-access');
export const subscribe = () => api.post('/subscriptions/subscribe');

// ── Streaming ──
export const getStreamingUrls = () => api.get('/streaming/urls');

export default api;
