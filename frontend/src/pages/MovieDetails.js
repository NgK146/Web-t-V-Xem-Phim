import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesApi } from '../api/movies.api';
import { reviewsApi } from '../api/reviews.api';
import { showtimesApi } from '../api/showtimes.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

// Helper: convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  // Match youtube.com/watch?v=ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) videoId = watchMatch[1];
  // Match youtu.be/ID
  if (!videoId) {
    const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) videoId = shortMatch[1];
  }
  // Match youtube.com/embed/ID
  if (!videoId) {
    const embedMatch = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (embedMatch) videoId = embedMatch[1];
  }
  if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  return null;
};

const isYouTubeUrl = (url) => {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url);
};

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

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
      const stData = showtimesRes.data.data;
      setShowtimes(stData);
      
      if (stData.length > 0) {
        const firstDate = new Date(stData[0].startTime).toDateString();
        setSelectedDate(firstDate);
      }
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

              {/* Trailer Section */}
              {movie.trailer && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ 
                    marginBottom: '20px', 
                    fontSize: '24px', 
                    borderBottom: '2px solid #E71A0F', 
                    display: 'inline-block',
                    paddingBottom: '5px' 
                  }}>
                    🎬 TRAILER
                  </h3>

                  {!showTrailer ? (
                    <div 
                      onClick={() => setShowTrailer(true)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '720px',
                        aspectRatio: '16/9',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${posterSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(231,26,15,0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
                      }}
                    >
                      {/* Play button */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px',
                        height: '80px',
                        background: 'rgba(231, 26, 15, 0.9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(231,26,15,0.5), 0 0 60px rgba(231,26,15,0.2)',
                        animation: 'pulse 2s infinite',
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      {/* Label */}
                      <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        whiteSpace: 'nowrap',
                      }}>
                        ▶ Xem Trailer
                      </div>
                      <style>{`
                        @keyframes pulse {
                          0% { box-shadow: 0 0 30px rgba(231,26,15,0.5), 0 0 60px rgba(231,26,15,0.2); }
                          50% { box-shadow: 0 0 40px rgba(231,26,15,0.7), 0 0 80px rgba(231,26,15,0.3); transform: translate(-50%, -50%) scale(1.08); }
                          100% { box-shadow: 0 0 30px rgba(231,26,15,0.5), 0 0 60px rgba(231,26,15,0.2); }
                        }
                      `}</style>
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      maxWidth: '720px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      position: 'relative',
                    }}>
                      {isYouTubeUrl(movie.trailer) ? (
                        <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                          <iframe
                            src={getYouTubeEmbedUrl(movie.trailer)}
                            title={`${movie.title} - Trailer`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none',
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video 
                          controls 
                          autoPlay
                          style={{ width: '100%', display: 'block' }}
                          src={movie.trailer}
                        >
                          Trình duyệt không hỗ trợ phát video.
                        </video>
                      )}
                      {/* Close button */}
                      <button
                        onClick={() => setShowTrailer(false)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          fontSize: '18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          backdropFilter: 'blur(5px)',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#E71A0F'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                ) : (() => {
                  const grouped = showtimes.reduce((acc, st) => {
                    const dateStr = new Date(st.startTime).toDateString();
                    if (!acc[dateStr]) acc[dateStr] = [];
                    acc[dateStr].push(st);
                    return acc;
                  }, {});
                  const dates = Object.keys(grouped).sort((a,b) => new Date(a) - new Date(b));
                  
                  return (
                    <>
                      {/* Date Tabs */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        marginBottom: '25px', 
                        overflowX: 'auto', 
                        paddingBottom: '10px',
                        scrollbarWidth: 'none'
                      }}>
                        {dates.map(date => {
                          const d = new Date(date);
                          const isActive = selectedDate === date;
                          return (
                            <button
                              key={date}
                              onClick={() => setSelectedDate(date)}
                              style={{
                                padding: '10px 20px',
                                background: isActive ? '#E71A0F' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                border: '1px solid',
                                borderColor: isActive ? '#E71A0F' : 'rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                minWidth: '100px',
                                transition: 'all 0.3s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                              }}
                            >
                              <span style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase' }}>
                                {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                              </span>
                              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                {d.getDate()}/{d.getMonth() + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Showtimes for selected date */}
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {selectedDate && grouped[selectedDate] ? (
                          grouped[selectedDate].map(st => (
                            <button 
                              key={st._id}
                              onClick={() => navigate(`/showtimes/${st._id}`)}
                              style={{ 
                                padding: '15px 30px', 
                                background: 'rgba(255,255,255,0.05)', 
                                backdropFilter: 'blur(10px)',
                                color: 'white', 
                                border: '1px solid rgba(255,255,255,0.2)', 
                                borderRadius: '12px', 
                                cursor: 'pointer', 
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                minWidth: '140px'
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
                              <span style={{ fontSize: '22px', fontWeight: 'bold' }}>
                                {new Date(st.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <span style={{ fontSize: '11px', color: '#FFD700', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {st.room?.type || '2D'} • {st.room?.cinema?.name.replace('CGV - ', '') || 'Rạp'}
                              </span>
                              <span style={{ fontSize: '10px', opacity: 0.6 }}>
                                {st.room?.name}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p style={{ color: '#aaa', fontStyle: 'italic' }}>Hôm nay không có suất chiếu, vui lòng chọn ngày khác.</p>
                        )}
                      </div>
                    </>
                  );
                })()}
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
