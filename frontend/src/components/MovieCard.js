
import React, { useState } from 'react';


const BACKEND_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5001';

// SVG icons (inline, no library dep)
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5c518" stroke="#f5c518" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);  const { _id, title, poster, genre, rated, duration, avgRating } = movie;

  const posterSrc = poster
    ? (poster.startsWith('http') ? poster : `${BACKEND_URL}${poster}`)
    : null;

  const ratedColor = {
    P: '#48bb78', K: '#3182ce', T13: '#ed8936', T16: '#e53e3e', T18: '#E50914'
  }[rated] || '#48bb78';

  return (
    <div
      className="movie-card"
      onClick={() => navigate(`/movie/${_id}`)}
      role="button"
      tabIndex={0}
      aria-label={`Xem phim ${title}`}
      onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${_id}`)}
    >
      <div className="movie-card-poster-wrap">
        {/* Skeleton shown until image loads */}
        {!imgLoaded && (
          <div className="skeleton-poster" aria-hidden="true" />
        )}

        {posterSrc ? (
          <img
            src={posterSrc}
            alt={title}
            className="movie-card-poster"
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
          />
        ) : (
          <div className="movie-card-no-poster">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <circle cx="12" cy="10" r="3" />
              <path d="M7 21v-2a5 5 0 0110 0v2" />
            </svg>
          </div>
        )}

        {/* Age Rating Badge */}
        <div
          className="movie-card-badge"
          style={{ background: ratedColor }}
          aria-label={`Phân loại ${rated || 'P'}`}
        >
          {rated || 'P'}
        </div>

        {/* Hover Overlay */}
        <div className="movie-overlay">
          <button className="overlay-btn btn-detail" onClick={e => { e.stopPropagation(); navigate(`/movie/${_id}`); }}>
            Xem Chi Tiết
          </button>
          <button className="overlay-btn btn-book" onClick={e => { e.stopPropagation(); navigate(`/movie/${_id}`); }}>
            Mua Vé
          </button>
        </div>      </div>

      <div className="movie-card-info">
        <h3 className="movie-card-title" title={title}>{title}</h3>
        <div className="movie-card-meta">
          <span className="meta-rating">
            <StarIcon /> {avgRating ? Number(avgRating).toFixed(1) : '—'}/10
          </span>
          <span className="meta-duration">
            <ClockIcon /> {duration ? `${duration}ph` : '—'}
          </span>        </div>
        <div className="movie-card-genre">
          {genre?.slice(0, 2).join(' · ')}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
