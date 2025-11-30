import React from 'react';
import { useQuery } from 'react-query';
import api from '../api';

export default function BookingsList() {
  const { data, error, isLoading } = useQuery('bookings', api.fetchBookings);

  if (isLoading) return <div>Loading bookings...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Bookings</h2>
      <ul>
        {data.map((b) => (
          <li key={b.id}>
            <strong>{b.user && b.user.name ? b.user.name : b.name}</strong> booked <em>{b.room && b.room.name ? b.room.name : (b.room_id || b.roomId)}</em> from {new Date(b.start_date).toLocaleString()} to {new Date(b.end_date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
