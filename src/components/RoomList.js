import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function RoomList() {
  const token = localStorage.getItem('rb_token');
  // Helper: parse YYYY-MM-DD into Date at UTC midnight to avoid timezone shift
  function parseDateToUTC(yyyyMmDd) {
    const [y, m, d] = (yyyyMmDd || '').split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  }

  const [startDate, setStartDate] = useState(() => {
    const now = new Date(); const t = new Date(now.getTime()); t.setUTCDate(t.getUTCDate() + 1); t.setUTCHours(0,0,0,0); return t;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date(); const t = new Date(now.getTime()); t.setUTCDate(t.getUTCDate() + 2); t.setUTCHours(0,0,0,0); return t;
  });
  // time parts stored as HH:MM strings
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  if (!token) return null;

  async function doSearch(e) {
    if (e && e.preventDefault) e.preventDefault();
    setHasSearched(true);
    setError(null);
    setLoading(true);
    try {
      // Ensure we search only for future dates; clamp startDate to tomorrow
      const min = new Date(); min.setDate(min.getDate()+1); min.setHours(0,0,0,0);
      const sDate = (startDate instanceof Date && !isNaN(startDate)) ? (startDate < min ? min : startDate) : min;
      const endD = (endDate instanceof Date && !isNaN(endDate)) ? endDate : new Date(min.getTime() + 24 * 60 * 60 * 1000);
      // Combine date and time into a UTC Date
      function combineToUTC(d, timeStr) {
        const datePart = d.toISOString().split('T')[0];
        const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hh || 0, mm || 0, 0, 0));
      }
      const s = combineToUTC(sDate, startTime);
      const e = combineToUTC(endD, endTime);
      if (!(s instanceof Date) || !(e instanceof Date) || isNaN(s) || isNaN(e) || s >= e) {
        throw new Error('Start must be before end');
      }
      // Persist last search in localStorage for BookingForm fallback
      try { localStorage.setItem('last_search_start', s.toISOString()); localStorage.setItem('last_search_end', e.toISOString()); } catch (err) {}
      const data = await api.fetchRooms(s, e);
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const h = () => doSearch();
    window.addEventListener('rooms:refresh', h);
    return () => window.removeEventListener('rooms:refresh', h);
  }, [startDate, endDate]);

  return (
    <div>
      <h2>Available Rooms</h2>
      <form onSubmit={doSearch} style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>
          Start:
          <input style={{ marginLeft: 6 }} type="date" min={(() => { const m = new Date(); m.setDate(m.getDate()+1); return m.toISOString().split('T')[0]; })()} value={(startDate instanceof Date && !isNaN(startDate)) ? startDate.toISOString().split('T')[0] : ''} onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              const m = parseDateToUTC(new Date().toISOString().split('T')[0]); m.setUTCDate(m.getUTCDate()+1); setStartDate(m);
            } else {
              const d = parseDateToUTC(val); if (d) setStartDate(d);
            }
          }} />
          <input style={{ marginLeft: 8, width: 90 }} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
        <label style={{ marginLeft: 12, marginRight: 8 }}>
          End:
          <input style={{ marginLeft: 6 }} type="date" min={(() => { const m = new Date(); m.setDate(m.getDate()+1); return m.toISOString().split('T')[0]; })()} value={(endDate instanceof Date && !isNaN(endDate)) ? endDate.toISOString().split('T')[0] : ''} onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              const m = parseDateToUTC(new Date().toISOString().split('T')[0]); m.setUTCDate(m.getUTCDate()+2); setEndDate(m);
            } else {
              const d = parseDateToUTC(val); if (d) setEndDate(d);
            }
          }} />
          <input style={{ marginLeft: 8, width: 90 }} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>
        <button type="submit" style={{ marginLeft: 12 }}>Search</button>
      </form>

      {loading && <div>Searching available rooms...</div>}
      {error && <div style={{ color: 'red' }}>Error loading rooms: {String(error.message || error)}</div>}

      <ul>
        {(!rooms || rooms.length === 0) && !loading && <li>{!hasSearched ? 'Waiting' : 'No available rooms for the selected dates'}</li>}
        {(rooms || []).map((r) => {
          const id = r.id || r._id || r._Id;
          return (
            <li key={id} style={{ marginBottom: '8px' }}>
              <strong>{r.name}</strong> — {r.location || 'No location'} — capacity {r.capacity || '-'}
              <button
                style={{ marginLeft: '12px' }}
                onClick={() => {
                  const min = new Date(); min.setDate(min.getDate()+1); min.setHours(0,0,0,0);
                  const sDateSafe = (startDate instanceof Date && !isNaN(startDate)) ? startDate : min;
                  const eDateSafe = (endDate instanceof Date && !isNaN(endDate)) ? endDate : new Date(min.getTime() + 24 * 60 * 60 * 1000);
                  function combineToUTC(d, timeStr) {
                    const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
                    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hh || 0, mm || 0, 0, 0));
                  }
                  const startISO = combineToUTC(sDateSafe, startTime).toISOString();
                  const endISO = combineToUTC(eDateSafe, endTime).toISOString();
                  navigate('/book', { state: { room: r, start: startISO, end: endISO } });
                }}
              >
                Book
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
