const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api/v1';

function getToken() {
  return localStorage.getItem('rb_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
    const message = parsed && parsed.error ? parsed.error : (parsed && parsed.message ? parsed.message : (typeof parsed === 'string' ? parsed : JSON.stringify(parsed)));
    const details = parsed && parsed.details ? `: ${JSON.stringify(parsed.details)}` : '';
    throw new Error(`${message}${details}`);
  }
  return res.status === 204 ? null : res.json();
}

export function login(email, password) {
  return request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function register(email, password, name) {
  return request('/users/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
}

export function fetchRooms(start, end) {
  const qs = `?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
  return request(`/rooms/search${qs}`);
}

export async function fetchBookings() {
  const data = await request('/bookings');
  return data.bookings || [];
}

export function createBooking(data) {
  return request('/booking', { method: 'POST', body: JSON.stringify(data) });
}

export default { login, register, fetchRooms, fetchBookings, createBooking };
