import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { sendEmail } from '../services/email.service.js';

/**
 * @desc  Tạo đánh giá mới cho phim
 * @route POST /api/reviews
 * @access Private
 */
export const createReview = async (req, res, next) => {
  try {
    const { movie: movieId, rating, comment, booking } = req.body;
    const userId = req.user._id;

    // Kiểm tra xem đã review chưa (Unique index handles this, but we can be explicit)
    const existingReview = await Review.findOne({ movie: movieId, user: userId });
    if (existingReview) {
      throw new ApiError(400, 'Bạn đã đánh giá phim này rồi');
    }

    // Kiểm tra xem đã đặt vé cho phim này chưa
    const showtimes = await Showtime.find({ movie: movieId });
    const showtimeIds = showtimes.map(st => st._id);
    const hasBooked = await Booking.findOne({ 
      user: userId, 
      status: 'confirmed',
      showtime: { $in: showtimeIds } 
    });

    if (!hasBooked) {
      throw new ApiError(403, 'Vui lòng hoàn tất đặt vé và trải nghiệm bộ phim tại rạp trước khi gửi đánh giá. Xin cảm ơn!');
    }

    const review = await Review.create({
      movie: movieId,
      user: userId,
      rating: Number(rating),
      comment,
      booking
    });

    // Cập nhật rating trung bình của phim
    await Movie.calcAverageRatings(movieId);

    // Gửi email thông báo cho admin (không chặn response)
    const movieDoc = await Movie.findById(movieId).select('title');
    sendEmail({
      to: process.env.EMAIL_USER || 'ngockhoi141414@gmail.com',
      subject: `Đánh giá mới: ${movieDoc?.title || 'Phim'}`,
      template: 'reviewNotification',
      data: {
        userName: req.user.name,
        movieTitle: movieDoc?.title || 'N/A',
        rating: Number(rating),
        comment,
      },
    }).catch(err => console.error('Lỗi gửi email thông báo đánh giá:', err));

    res.status(201).json(new ApiResponse(201, review, 'Đã gửi đánh giá thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Lấy danh sách đánh giá của một phim
 * @route GET /api/reviews/movie/:movieId
 * @access Public
 */
export const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.json(new ApiResponse(200, reviews));
  } catch (err) { next(err); }
};

/**
 * @desc  Xóa đánh giá
 * @route DELETE /api/reviews/:id
 * @access Private/Admin
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, 'Không tìm thấy đánh giá');

    // Chỉ chủ nhân hoặc admin mới được xóa
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ApiError(403, 'Bạn không có quyền xóa đánh giá này');
    }

    const movieId = review.movie;
    await review.deleteOne();

    // Cập nhật lại rating trung bình
    await Movie.calcAverageRatings(movieId);

    res.json(new ApiResponse(200, null, 'Đã xóa đánh giá'));
  } catch (err) { next(err); }
};
