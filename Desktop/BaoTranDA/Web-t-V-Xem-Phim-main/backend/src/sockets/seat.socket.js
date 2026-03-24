import Showtime from '../models/Showtime.js';

/**
 * Khởi tạo Socket.IO cho quản lý ghế real-time
 * @param {import('socket.io').Server} io
 */
export const initSeatSocket = (io) => {
  io.on('connection', (socket) => {
    /**
     * Người dùng vào trang chọn ghế của 1 suất chiếu
     */
    socket.on('join_showtime', async (showtimeId) => {
      socket.join(showtimeId);

      // Gửi trạng thái ghế hiện tại
      const showtime = await Showtime.findById(showtimeId).select('seats');
      if (showtime) {
        socket.emit('seat_status', showtime.seats.map(s => ({
          id: s.seat,
          status: s.status,
        })));
      }
    });

    socket.on('leave_showtime', (showtimeId) => {
      socket.leave(showtimeId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });

  // Job giải phóng ghế lock hết hạn mỗi 1 phút
  setInterval(async () => {
    const now = new Date();
    const showtimes = await Showtime.find({
      'seats.status': 'locked',
      'seats.lockedAt': { $lt: now },
    });

    for (const showtime of showtimes) {
      let changed = false;
      const freedSeats = [];

      showtime.seats.forEach((seat, idx) => {
        if (seat.status === 'locked' && seat.lockedAt < now) {
          showtime.seats[idx].status   = 'available';
          showtime.seats[idx].lockedBy = undefined;
          showtime.seats[idx].lockedAt = undefined;
          freedSeats.push({ id: seat.seat, status: 'available' });
          changed = true;
        }
      });

      if (changed) {
        await showtime.save();
        io.to(showtime._id.toString()).emit('seats_updated', {
          showtimeId: showtime._id,
          seats: freedSeats,
        });
      }
    }
  }, 60_000);
};
