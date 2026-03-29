import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesApi } from '../api/movies.api';
import { reviewsApi } from '../api/reviews.api';
import { showtimesApi } from '../api/showtimes.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [movieRes, reviewsRes, showtimesRes] = await Promise.all([
        moviesApi.getById(id),
        reviewsApi.getMovieReviews(id),
        showtimesApi.getByMovie(id)
      ]);
      setMovie(movieRes.data.data);
      setReviews(reviewsRes.data.data);
      setShowtimes(showtimesRes.data.data);
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
      // Delay nhỏ để backend cập nhật avgRating trước khi fetch lại
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchData();
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
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '10px 20px',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: 'bold',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#E71A0F'; e.currentTarget.style.borderColor = '#E71A0F'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
      >
        <span>←</span> Quay lại Trang Chủ
      </button>

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

              <div style={{ marginTop: '40px' }}>
                <h3 style={{ 
                  marginBottom: '20px', 
                  fontSize: '24px', 
                  borderBottom: '2px solid #E71A0F', 
                  display: 'inline-block',
                  paddingBottom: '5px' 
                }}>
                  LỊCH CHIẾU
                </h3>
                {showtimes.length === 0 ? (
                  <p style={{ color: '#aaa', fontStyle: 'italic' }}>Phim chưa có lịch chiếu.</p>
                ) : (
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {showtimes.map(st => (
                      <button 
                        key={st._id}
                        onClick={() => navigate(`/showtimes/${st._id}`)}
                        style={{ 
                          padding: '12px 24px', 
                          background: 'rgba(255,255,255,0.05)', 
                          backdropFilter: 'blur(10px)',
                          color: 'white', 
                          border: '1px solid rgba(255,255,255,0.2)', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#E71A0F';
                          e.currentTarget.style.borderColor = '#E71A0F';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(231,26,15,0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                          {new Date(st.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span style={{ fontSize: '13px', opacity: 0.8 }}>
                          {new Date(st.startTime).toLocaleDateString('vi-VN')}
                        </span>
                        <span style={{ fontSize: '11px', color: '#FFD700', marginTop: '4px', textTransform: 'uppercase' }}>
                          {st.room.type} - {st.room.cinema.name.replace('CGV - ', '')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
