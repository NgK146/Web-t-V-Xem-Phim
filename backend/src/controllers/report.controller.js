import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
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
