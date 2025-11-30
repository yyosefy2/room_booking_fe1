import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthLanding() {
  const [mode, setMode] = useState('login');

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <button onClick={() => setMode('login')} style={{ marginRight: 8, fontWeight: mode === 'login' ? 'bold' : 'normal' }}>Login</button>
        <button onClick={() => setMode('register')} style={{ fontWeight: mode === 'register' ? 'bold' : 'normal' }}>Register</button>
      </div>
      <div>
        {mode === 'login' ? (
          <div>
            <h2>Login</h2>
            <Login />
          </div>
        ) : (
          <div>
            <h2>Register</h2>
            <Register />
          </div>
        )}
      </div>
    </div>
  );
}
