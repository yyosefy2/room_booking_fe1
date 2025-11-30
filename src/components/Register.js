import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  // validation state
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const passwordValid = useMemo(() => {
    if (!password) return false;
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  }, [password]);
  const nameValid = useMemo(() => name.trim().length > 0, [name]);
  const formValid = emailValid && passwordValid && nameValid;

  async function submit(e) {
    e.preventDefault();
    if (!formValid) return;
    try {
      const res = await api.register(email, password, name);
      if (res && res.token) {
        localStorage.setItem('rb_token', res.token);
        if (res.user) localStorage.setItem('rb_user', JSON.stringify(res.user));
        toast.success('Registered and logged in');
        navigate('/rooms');
      }
    } catch (err) {
      const msg = err && err.message ? err.message : 'Unknown error';
      toast.error(`Register failed: ${msg}`);
    }
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          {!nameValid && <div style={{ color: 'red' }}>Name is required</div>}
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          {email && !emailValid && <div style={{ color: 'red' }}>Enter a valid email</div>}
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {password && !passwordValid && (
            <div style={{ color: 'red' }}>
              Password must be at least 8 characters and include uppercase, lowercase and a number
            </div>
          )}
        </div>
        <div>
          <button type="submit" disabled={!formValid}>Register</button>
        </div>
      </form>
    </div>
  );
}
