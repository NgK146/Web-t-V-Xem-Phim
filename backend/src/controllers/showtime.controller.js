import Showtime from '../models/Showtime.js';
import Room from '../models/Room.js';
import Cinema from '../models/Cinema.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

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
    
    res.json(new ApiResponse(200, showtime, 'Chi tiết suất chiếu'));
  } catch (error) {
    next(error);
  }
};
