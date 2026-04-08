import Showtime from '../models/Showtime.js';
import Room from '../models/Room.js';
import Cinema from '../models/Cinema.js';
import Movie from '../models/Movie.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc  Lấy danh sách tất cả suất chiếu (admin)
 * @route GET /api/showtimes
 * @access Admin
 */
export const getAdminShowtimes = async (req, res, next) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movie', 'title')
      .populate({
        path: 'room',
        select: 'name',
        populate: { path: 'cinema', select: 'name' }
      })
      .sort('-startTime');

    res.json(new ApiResponse(200, showtimes));
  } catch (error) { next(error); }
};

/**
 * @desc  Lấy danh sách suất chiếu của một phim
 * @route GET /api/showtimes/movie/:movieId
 * @access Public
 */
export const getShowtimesByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const now = new Date();
    const showtimes = await Showtime.find({ 
      movie: movieId, 
      status: 'scheduled',
      startTime: { $gte: now }
    })
    .populate({
      path: 'room',
      populate: { path: 'cinema' }
    })
    .sort('startTime');

    res.json(new ApiResponse(200, showtimes, 'Lịch chiếu'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Lấy chi tiết một suất chiếu (kèm sơ đồ ghế)
 * @route GET /api/showtimes/:id
 * @access Public
 */
export const getShowtimeDetails = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate({
        path: 'room',
        populate: { path: 'cinema' }
      });
      
    if (!showtime) throw new ApiError(404, 'Không tìm thấy suất chiếu');

    // Auto-expire stale locks
    const now = new Date();
    let changed = false;
    showtime.seats.forEach(seat => {
      if (seat.status === 'locked' && seat.lockedAt && new Date(seat.lockedAt) < now) {
        seat.status = 'available';
        seat.lockedBy = undefined;
        seat.lockedAt = undefined;
        changed = true;
      }
    });
    if (changed) await showtime.save();

    res.json(new ApiResponse(200, showtime, 'Chi tiết suất chiếu'));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Tạo suất chiếu mới (admin)
 * @route POST /api/showtimes
 * @access Admin
 */
export const createShowtime = async (req, res, next) => {
  try {
    const { movie, room, startTime, endTime, basePrice } = req.body;

    // 1. Kiểm tra phòng tồn tại
    const roomDoc = await Room.findById(room);
    if (!roomDoc) throw new ApiError(404, 'Không tìm thấy phòng');

    // 2. Kiểm tra trùng lịch (Overlap check)
    const overlap = await Showtime.findOne({
      room,
      status: { $ne: 'cancelled' },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });
    if (overlap) throw new ApiError(400, 'Phòng đã có suất chiếu vào thời gian này');

    const seats = roomDoc.seats.map(s => ({
      seat: s._id,
      status: s.isActive ? 'available' : 'booked', // Nếu ghế bị hỏng thì coi như đã đặt để khoá
      price: s.type === 'vip' ? basePrice * 1.2 : (s.type === 'couple' ? basePrice * 2 : basePrice)
    }));

    // Find movie and cinema names for display fields
    const movieDoc = await Movie.findById(movie);
    const cinemaDoc = await Cinema.findById(roomDoc.cinema);

    const showtime = await Showtime.create({
      movie, room, startTime, endTime, basePrice, seats,
      movieTitle: movieDoc?.title,
      roomName: roomDoc.name,
      cinemaName: cinemaDoc?.name,
      startTimeDisplay: new Date(startTime).toLocaleString('vi-VN')
    });

    res.status(201).json(new ApiResponse(201, showtime, 'Tạo suất chiếu thành công'));
  } catch (error) { next(error); }
};

/**
 * @desc  Cập nhật suất chiếu (admin)
 * @route PUT /api/showtimes/:id
 * @access Admin
 */
export const updateShowtime = async (req, res, next) => {
  try {
    const { movie, room, startTime, basePrice } = req.body;
    let showtime = await Showtime.findById(req.params.id);
    if (!showtime) throw new ApiError(404, 'Không tìm thấy suất chiếu');

    // 1. If movie or startTime changes, recalculate endTime
    if (movie || startTime) {
      const movieDoc = await Movie.findById(movie || showtime.movie);
      const start = new Date(startTime || showtime.startTime);
      const end = new Date(start.getTime() + (movieDoc?.duration + 30) * 60000);
      req.body.endTime = end;
      req.body.startTimeDisplay = start.toLocaleString('vi-VN');
    }

    // 2. If room or basePrice changes, recalculate seats
    if (room || basePrice) {
      const roomDoc = await Room.findById(room || showtime.room);
      const bp = basePrice || showtime.basePrice;
      const seats = roomDoc.seats.map(s => ({
        seat: s._id,
        status: s.isActive ? 'available' : 'booked',
        price: s.type === 'vip' ? bp * 1.2 : (s.type === 'couple' ? bp * 2 : bp)
      }));
      req.body.seats = seats;
      
      const cinemaDoc = await Cinema.findById(roomDoc.cinema);
      req.body.roomName = roomDoc.name;
      req.body.cinemaName = cinemaDoc?.name;
    }

    if (movie) {
        const movieDoc = await Movie.findById(movie);
        req.body.movieTitle = movieDoc?.title;
    }

    showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(new ApiResponse(200, showtime, 'Cập nhật thành công'));
  } catch (error) { next(error); }
};

/**
 * @desc  Xoá suất chiếu (admin)
 * @route DELETE /api/showtimes/:id
 * @access Admin
 */
export const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) throw new ApiError(404, 'Không tìm thấy suất chiếu');
    res.json(new ApiResponse(200, null, 'Xoá suất chiếu thành công'));
  } catch (error) { next(error); }
};
