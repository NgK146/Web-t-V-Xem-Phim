import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook quản lý kết nối socket cho trang chọn ghế
 * @param {string} showtimeId
 * @param {function} onSeatsUpdated
 */
export const useSeatSocket = (showtimeId, onSeatsUpdated) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!showtimeId) return;

    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001');
    socketRef.current.emit('join_showtime', showtimeId);

    socketRef.current.on('seat_status',    onSeatsUpdated);
    socketRef.current.on('seats_updated', ({ seats }) => onSeatsUpdated(seats));

    return () => {
      socketRef.current?.emit('leave_showtime', showtimeId);
      socketRef.current?.disconnect();
    };
  }, [showtimeId, onSeatsUpdated]);

  /** Gửi yêu cầu lock ghế qua socket */
  const emitLock = useCallback((seatIds) => {
    socketRef.current?.emit('lock_seats', { showtimeId, seatIds });
  }, [showtimeId]);

  return { emitLock };
};
