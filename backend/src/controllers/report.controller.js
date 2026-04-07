import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
import Showtime from '../models/Showtime.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import xlsx from 'xlsx';

/**
 * @desc  Dashboard thống kê tổng quan
 * @route GET /api/reports/dashboard
 * @access Admin
 */
export const getDashboard = async (req, res, next) => {
  try {
    const ACTIVE_STATUSES = { status: { $in: ['pending', 'confirmed'] } };

    const [totalUsers, totalMovies, ticketAgg, revenueData] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments(),
      Booking.aggregate([
        { $match: ACTIVE_STATUSES },
        { $group: { _id: null, totalTickets: { $sum: { $size: { $ifNull: ['$tickets', []] } } } } },
      ]),
      Booking.aggregate([
        { $match: ACTIVE_STATUSES },
        { $group: { _id: null, total: { $sum: '$finalPrice' } } },
      ]),
    ]);
    const totalBookings = ticketAgg[0]?.totalTickets || 0;

    // Doanh thu theo tháng (12 tháng gần nhất)
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['pending', 'confirmed'] }, createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$finalPrice' },
        count:   { $sum: { $size: { $ifNull: ['$tickets', []] } } },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top phim được đặt nhiều (Sử dụng dữ liệu snapshot thay vì tra ngược showtime do showtime có thể đã bị xóa)
    const topMovies = await Booking.aggregate([
      { $match: { status: { $in: ['pending', 'confirmed'] }, movieTitle: { $exists: true, $ne: null } } },
      { $group: { _id: '$movieTitle', count: { $sum: { $size: { $ifNull: ['$tickets', []] } } }, revenue: { $sum: '$finalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { title: '$_id', count: 1, revenue: 1 } },
    ]);

    res.json(new ApiResponse(200, {
      stats: {
        totalUsers,
        totalMovies,
        totalBookings,
        totalRevenue: revenueData[0]?.total || 0,
      },
      monthlyRevenue,
      topMovies,
    }));
  } catch (err) { next(err); }
};

/**
 * @desc  Xuất báo cáo doanh thu ra file Excel
 * @route GET /api/reports/export-excel
 * @access Admin
 */
export const exportRevenueExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const bookings = await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      createdAt: {
        $gte: new Date(startDate || '2024-01-01'),
        $lte: new Date(endDate || new Date()),
      },
    }).populate({ path: 'showtime', populate: { path: 'movie' } })
      .populate('user', 'name email');

    const data = bookings.map((b, i) => ({
      STT: i + 1,
      'Mã đặt vé':     b.bookingCode,
      'Khách hàng':    b.user?.name || '',
      'Email':         b.user?.email || '',
      'Phim':          b.showtime?.movie?.title || '',
      'Số ghế':        b.tickets.length,
      'Tổng tiền':     b.totalPrice,
      'Giảm giá':      b.totalPrice - b.finalPrice,
      'Thực thu':      b.finalPrice,
      'Trạng thái':    b.status,
      'Ngày đặt':      b.createdAt.toLocaleDateString('vi-VN'),
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Báo cáo doanh thu');

    const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) { next(err); }
};

/**
 * @desc  Phân tích chuyên sâu: Occupancy, Retention, Real-time
 * @route GET /api/reports/advanced
 * @access Admin
 */
export const getAdvancedAnalytics = async (req, res, next) => {
  try {
    const ACTIVE_STATUSES = { status: { $in: ['pending', 'confirmed'] } };

    // ============================================
    // 1. REAL-TIME METRICS (Hôm nay)
    // ============================================
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayBookingsAgg = await Booking.aggregate([
      { $match: { ...ACTIVE_STATUSES, createdAt: { $gte: startOfToday } } },
      { $group: {
          _id: null,
          todayRevenue: { $sum: '$finalPrice' },
          todayTickets: { $sum: { $size: { $ifNull: ['$tickets', []] } } },
          todayOrders: { $sum: 1 }
      }}
    ]);
    const todayStats = todayBookingsAgg[0] || { todayRevenue: 0, todayTickets: 0, todayOrders: 0 };

    // ============================================
    // 2. TỶ LỆ LẤP ĐẦY (OCCUPANCY RATE)
    // ============================================
    // Lấy 10 suất chiếu đã/đang/sắp diễn ra gần nhất để phân tích độ lấp đầy
    const recentShowtimes = await Showtime.find({ status: { $ne: 'cancelled' } })
        .sort({ startTime: -1 })
        .limit(10)
        .populate('movie', 'title')
        .populate('room', 'name capacity');

    const occupancyRates = recentShowtimes.map(st => {
      const totalSeats = st.seats.length || 1; 
      const bookedSeats = st.seats.filter(s => s.status === 'booked').length;
      return {
        showtimeId: st._id,
        movieTitle: st.movie?.title || 'Unknown',
        roomName: st.room?.name || 'Unknown',
        startTime: st.startTime,
        totalSeats,
        bookedSeats,
        occupancyRate: Number(((bookedSeats / totalSeats) * 100).toFixed(2))
      };
    });

    // ============================================
    // 3. RETENTION COHORT (Khách mới vs Khách quay lại)
    // ============================================
    const retentionAgg = await Booking.aggregate([
      { $match: ACTIVE_STATUSES },
      { $group: { _id: '$user', orderCount: { $sum: 1 } } },
      { $group: {
          _id: { $cond: [{ $gt: ['$orderCount', 1] }, 'Returning', 'New'] },
          users: { $sum: 1 }
      }}
    ]);

    const retentionRecord = { New: 0, Returning: 0 };
    retentionAgg.forEach(r => { retentionRecord[r._id] = r.users; });
    const retentionData = [
      { name: 'Khách Hàng Mới (1 Đơn)', value: retentionRecord.New, fill: '#3b82f6' },
      { name: 'Khách Cũ (>1 Đơn)', value: retentionRecord.Returning, fill: '#10b981' }
    ];

    res.json(new ApiResponse(200, {
      realTime: todayStats,
      occupancyRates,
      retentionData
    }));
  } catch (err) { next(err); }
};
