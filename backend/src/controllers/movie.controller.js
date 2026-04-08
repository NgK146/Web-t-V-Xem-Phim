import Movie from '../models/Movie.js';
import Showtime from '../models/Showtime.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/pagination.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Upload a file buffer directly to Cloudinary (compatible with multer v2 memoryStorage)
 */
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'cinema_posters', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * @desc  Lấy danh sách phim có lọc, tìm kiếm, phân trang
 * @route GET /api/movies
 * @access Public
 */
export const getMovies = async (req, res, next) => {
  try {
    const { q, genre, status, rated, page = 1, limit = 12, sort = '-releaseDate' } = req.query;

    const filter = {};
    if (q)       filter.$text = { $search: q };
    if (genre)   filter.genre = { $in: genre.split(',') };
    
    if (status === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Find unique movie IDs that have scheduled showtimes today
      const showtimesToday = await Showtime.find({
        startTime: { $gte: startOfDay, $lte: endOfDay },
        status: 'scheduled'
      }).distinct('movie');

      filter._id = { $in: showtimesToday };
    } else if (status) {
      filter.status = status;
    }

    if (rated)   filter.rated = rated;

    const { skip, pagination } = buildPagination(page, limit,
      await Movie.countDocuments(filter));

    const movies = await Movie.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    res.json(new ApiResponse(200, { movies, pagination }));
  } catch (err) { next(err); }
};

/**
 * @desc  Lấy chi tiết một phim
 * @route GET /api/movies/:id
 * @access Public
 */
export const getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) throw new ApiError(404, 'Không tìm thấy phim');
    res.json(new ApiResponse(200, movie));
  } catch (err) { next(err); }
};

/**
 * @desc  Tạo phim mới (admin)
 * @route POST /api/movies
 * @access Admin
 */
export const createMovie = async (req, res, next) => {
  try {
    let posterUrl = '';
    if (req.file) {
      posterUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }
    const movie = await Movie.create({ ...req.body, poster: posterUrl });
    res.status(201).json(new ApiResponse(201, movie, 'Tạo phim thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Cập nhật phim (admin)
 * @route PUT /api/movies/:id
 * @access Admin
 */
export const updateMovie = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.poster = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!movie) throw new ApiError(404, 'Không tìm thấy phim');
    res.json(new ApiResponse(200, movie, 'Cập nhật phim thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Xóa phim (admin)
 * @route DELETE /api/movies/:id
 * @access Admin
 */
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) throw new ApiError(404, 'Không tìm thấy phim');
    res.json(new ApiResponse(200, null, 'Xóa phim thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Lấy danh sách phim gợi ý cho người dùng
 * @route GET /api/movies/recommendations
 * @access Private
 */
export const getRecommendedMovies = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId, status: { $ne: 'cancelled' } })
      .populate({
        path: 'showtime',
        populate: { path: 'movie', select: 'genre _id' }
      });
      
    const reviews = await Review.find({ user: userId, rating: { $gte: 7 } })
      .populate('movie', 'genre _id');

    let watchedMovieIds = new Set();
    const genreFrequency = {};

    bookings.forEach(b => {
       if(b.showtime && b.showtime.movie) {
           watchedMovieIds.add(b.showtime.movie._id.toString());
           b.showtime.movie.genre.forEach(g => {
               genreFrequency[g] = (genreFrequency[g] || 0) + 1;
           });
       }
    });

    reviews.forEach(r => {
        if(r.movie) {
            watchedMovieIds.add(r.movie._id.toString());
            r.movie.genre.forEach(g => {
                genreFrequency[g] = (genreFrequency[g] || 0) + 2; 
            });
        }
    });

    if (Object.keys(genreFrequency).length === 0) {
        const topMovies = await Movie.find({ status: 'now_showing' })
            .sort('-avgRating -totalRatings')
            .limit(10)
            .lean();
        
        topMovies.forEach(m => m.matchReason = '🔥 Đang Thịnh Hành');
        return res.json(new ApiResponse(200, topMovies, "Gợi ý mặc định"));
    }

    const topGenres = Object.entries(genreFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);

    const recommendedMovies = await Movie.find({
        _id: { $nin: Array.from(watchedMovieIds) },
        genre: { $in: topGenres },
        status: { $in: ['now_showing', 'coming_soon'] }
    })
    .sort('-avgRating')
    .limit(10)
    .lean();

    recommendedMovies.forEach(m => m.matchReason = `✨ Đúng Gu Bạn Nhất`);

    if (recommendedMovies.length < 10) {
        const fallbackMovies = await Movie.find({
            _id: { $nin: [...Array.from(watchedMovieIds), ...recommendedMovies.map(m => m._id.toString())] },
            status: 'now_showing'
        })
        .sort('-avgRating')
        .limit(10 - recommendedMovies.length)
        .lean();
        
        fallbackMovies.forEach(m => m.matchReason = `💡 Có thể bạn sẽ thích`);
        
        recommendedMovies.push(...fallbackMovies);
    }

    res.json(new ApiResponse(200, recommendedMovies, "Gợi ý cá nhân hóa"));

  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Lấy phim đang chiếu
 * @route GET /api/movies/now-showing
 * @access Public
 */
export const getNowShowing = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: 'now_showing' })
      .sort('-avgRating')
      .limit(20);
    res.json(new ApiResponse(200, movies));
  } catch (err) { next(err); }
};

/**
 * @desc  Lấy phim sắp chiếu
 * @route GET /api/movies/coming-soon
 * @access Public
 */
export const getComingSoon = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: 'coming_soon' })
      .sort('releaseDate')
      .limit(20);
    res.json(new ApiResponse(200, movies));
  } catch (err) { next(err); }
};
