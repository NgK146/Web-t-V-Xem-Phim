import Movie from '../models/Movie.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPagination } from '../utils/pagination.js';
import cloudinary from '../config/cloudinary.js';

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
    if (status)  filter.status = status;
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
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'cinema/posters',
      });
      posterUrl = result.secure_url;
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
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
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
