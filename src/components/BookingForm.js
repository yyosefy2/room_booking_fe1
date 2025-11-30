import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../api';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BookingForm() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // If navigated from RoomList, location.state contains room, start, end
  const navState = location && location.state ? location.state : {};
  const preRoom = navState.room || null;
  const preStart = navState.start ? new Date(navState.start) : (() => { const d = new Date(); d.setDate(d.getDate()+1); d.setHours(0,0,0,0); return d; })();
  const preEnd = navState.end ? new Date(navState.end) : (() => { const d = new Date(); d.setDate(d.getDate()+2); d.setHours(0,0,0,0); return d; })();

  const [roomId, setRoomId] = useState(preRoom ? (preRoom.id || preRoom._id) : '');
  // Helper to parse YYYY-MM-DD into UTC midnight
  function parseDateToUTC(yyyyMmDd) {
    const [y, m, d] = (yyyyMmDd || '').split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  }

  // Booking date is taken from navigation state (preferred) or last search saved in localStorage
  const lastStart = preStart || (() => { try { const v = localStorage.getItem('last_search_start'); return v ? new Date(v) : null; } catch (e) { return null; } })();
  const lastEnd = preEnd || (() => { try { const v = localStorage.getItem('last_search_end'); return v ? new Date(v) : null; } catch (e) { return null; } })();
  const [date, setDate] = useState(lastStart || new Date());
  const [endDate, setEndDate] = useState(() => {
    try {
      if (lastEnd) return lastEnd;
    } catch (e) {}
    const d = new Date(); d.setDate(d.getDate()+2); d.setHours(0,0,0,0); return d;
  });
  const [startTime, setStartTime] = useState(() => {
    try {
      const v = navState.start ? new Date(navState.start) : (lastStart || null);
      if (v) return v.toISOString().split('T')[1].slice(0,5);
    } catch (e) {}
    return '00:00';
  });
  const [endTime, setEndTime] = useState(() => {
    try {
      const v = navState.end ? new Date(navState.end) : (lastEnd || null);
      if (v) return v.toISOString().split('T')[1].slice(0,5);
    } catch (e) {}
    return '00:00';
  });
  const [contactEmail, setContactEmail] = useState(() => {
    try {
      const u = localStorage.getItem('rb_user');
      if (u) return JSON.parse(u).email || '';
    } catch (e) {}
    return '';
  });
  const [emailValid, setEmailValid] = useState(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail));

  // If no room provided via nav state, allow user to enter room manually by id
  useEffect(() => {
    if (!preRoom) {
      try {
        const params = new URLSearchParams(window.location.search);
        const r = params.get('roomId');
        if (r) setRoomId(r);
      } catch (e) {}
    }
  }, [preRoom]);

  const mutation = useMutation(api.createBooking, {
    onSuccess: () => {
      toast.success('Booking created');
      queryClient.invalidateQueries('bookings');
      // Do not trigger a full rooms search here; simply navigate back to rooms view
      try { navigate('/rooms'); } catch (e) {}
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  function submit(e) {
    e.preventDefault();
    if (!roomId) return toast.error('Select a room');
    if (!emailValid) return toast.error('Enter a valid contact email');
    // Combine date + time into UTC ISO datetimes
    function combineToUTCISO(d, timeStr) {
      const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hh || 0, mm || 0, 0, 0));
    }
    const startDT = combineToUTCISO(date, startTime);
    const endBase = (endDate instanceof Date && !isNaN(endDate)) ? endDate : date;
    const endDT = combineToUTCISO(endBase, endTime);
    if (!(startDT instanceof Date) || !(endDT instanceof Date) || isNaN(startDT) || isNaN(endDT) || startDT >= endDT) {
      return toast.error('Start must be before end');
    }
    mutation.mutate({ room_id: roomId, start_date: startDT.toISOString(), end_date: endDT.toISOString(), quantity: 1, contact_email: contactEmail });
  }

  return (
    <div>
      <h2>Book a Room</h2>
      <form onSubmit={submit}>
        <div>
          <label>Room</label>
          {preRoom ? (
            <div>
              <strong>{preRoom.name}</strong>
              <div style={{ fontSize: '0.9em', color: '#666' }}>{preRoom.location}</div>
            </div>
          ) : (
            <input placeholder="Enter room id" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
          )}
        </div>
        <div>
          <label>Start</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" value={(date && date.toISOString().split('T')[0]) || ''} onChange={(e) => {
              const v = e.target.value; if (!v) return; const [y,m,d] = v.split('-').map(Number); setDate(new Date(Date.UTC(y,m-1,d,0,0,0,0)));
            }} />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ marginLeft: 8 }} />
          </div>
        </div>
        <div>
          <label>End</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" value={(endDate && endDate.toISOString().split('T')[0]) || ''} onChange={(e) => {
              const v = e.target.value; if (!v) return; const [y,m,d] = v.split('-').map(Number); const nd = new Date(Date.UTC(y,m-1,d,0,0,0,0)); try { localStorage.setItem('last_search_end', nd.toISOString()); } catch (er) {} setEndDate(nd);
            }} />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ marginLeft: 8 }} />
          </div>
        </div>
        
        <div>
          <label>Contact email</label>
          <input value={contactEmail} onChange={(e) => { setContactEmail(e.target.value); setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)); }} />
          {!emailValid && <div style={{ color: 'red' }}>Enter a valid email</div>}
        </div>
        <div>
          <button type="submit" disabled={!emailValid}>submit</button>
        </div>
      </form>
    </div>
  );
}
