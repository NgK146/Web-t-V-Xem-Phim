import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesApi } from '../api/movies.api';
import { reviewsApi } from '../api/reviews.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [movieRes, reviewsRes] = await Promise.all([
        moviesApi.getById(id),
        reviewsApi.getMovieReviews(id)
      ]);
      setMovie(movieRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Không thể tải thông tin phim');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.createReview({
        movie: id,
        rating,
        comment
      });
      toast.success('Đánh giá của bạn đã được gửi!');
      setComment('');
      fetchData(); // Reload to show new review and updated average
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!movie) return <div className="error">Không tìm thấy phim</div>;

  const posterSrc = movie.poster 
    ? (movie.poster.startsWith('http') ? movie.poster : `http://localhost:5001${movie.poster}`)
    : 'https://via.placeholder.com/300x450';

  return (
    <div className="movie-details-page">
      <div className="details-header" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${posterSrc})` }}>
        <div className="details-container">
          <div className="details-main">
            <img src={posterSrc} alt={movie.title} className="details-poster" />
            <div className="details-info">
              <h1 className="details-title">{movie.title}</h1>
              <div className="details-meta">
                <span className={`badge rated-${movie.rated}`}>{movie.rated}</span>
                <span>{movie.duration} phút</span>
                <span>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="details-rating">
                <span className="star">⭐</span>
                <span className="score">{movie.avgRating}</span>
                <span className="total">({movie.totalRatings} lượt đánh giá)</span>
              </div>
              <p className="details-desc">{movie.description}</p>
              <div className="details-fields">
                <p><strong>Đạo diễn:</strong> {movie.director}</p>
                <p><strong>Diễn viên:</strong> {movie.cast.join(', ')}</p>
                <p><strong>Thể loại:</strong> {movie.genre.join(', ')}</p>
                <p><strong>Ngôn ngữ:</strong> {movie.language}</p>
              </div>
              <button className="book-btn-lg">MUA VÉ NGAY</button>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <div className="details-container">
          <div className="review-box">
            <h2>Đánh giá từ khán giả</h2>
            
            <form className="review-form" onSubmit={handleSubmitReview}>
              <div className="rating-input">
                <label>Điểm của bạn (1-10):</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <textarea 
                placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <button type="submit" disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
              </button>
            </form>

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">Chưa có đánh giá nào cho phim này.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="review-item">
                    <div className="review-user">
                      <div className="user-avatar">{rev.user.name[0]}</div>
                      <div className="user-info">
                        <span className="user-name">{rev.user.name}</span>
                        <span className="review-date">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="user-rating">⭐ {rev.rating}/10</div>
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
