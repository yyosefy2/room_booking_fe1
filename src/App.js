import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import RoomList from './components/RoomList';
import BookingForm from './components/BookingForm';
import BookingsList from './components/BookingsList';
import AuthLanding from './components/AuthLanding';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('rb_token'));

  useEffect(() => {
    const h = () => setToken(localStorage.getItem('rb_token'));
    window.addEventListener('storage', h);
    window.addEventListener('rb_auth_changed', h);
    return () => { window.removeEventListener('storage', h); window.removeEventListener('rb_auth_changed', h); };
  }, []);

  const navigate = useNavigate();
  function logout() {
    try { localStorage.removeItem('rb_token'); localStorage.removeItem('rb_user'); } catch (e) {}
    setToken(null);
    try { navigate('/'); } catch (e) {}
  }

  return (
    <div className="app">
      <nav className="topnav">
          <Link to="/">Login/Register</Link>
          <Link to="/rooms">Available Rooms</Link>
        
        {token && <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>}
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<AuthLanding />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/book" element={<BookingForm />} />
          <Route path="/bookings" element={<BookingsList />} />
          {/* Login/Register handled on the root landing */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
