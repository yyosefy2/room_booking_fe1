import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const passwordValid = useMemo(() => password && password.length > 0, [password]);
  const formValid = emailValid && passwordValid;

  async function submit(e) {
    e.preventDefault();
    if (!formValid) return;
    try {
      const res = await api.login(email, password);
      if (res && res.token) {
        localStorage.setItem('rb_token', res.token);
        if (res.user) localStorage.setItem('rb_user', JSON.stringify(res.user));
        toast.success('Logged in');
        navigate('/rooms');
      }
    } catch (err) {
      const msg = err && err.message ? err.message : 'Unknown error';
      toast.error(`Login failed: ${msg}`);
    }
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          {email && !emailValid && <div style={{ color: 'red' }}>Enter a valid email</div>}
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {password && !passwordValid && <div style={{ color: 'red' }}>Password is required</div>}
        </div>
        <div>
          <button type="submit" disabled={!formValid}>Login</button>
        </div>
      </form>
    </div>
  );
}
