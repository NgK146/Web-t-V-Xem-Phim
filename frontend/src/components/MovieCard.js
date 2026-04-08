import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'http://localhost:5001';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { _id, title, poster, genre, rated, duration, avgRating } = movie;
  const posterSrc = poster ? (poster.startsWith('http') ? poster : `${BACKEND_URL}${poster}`) : 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${_id}`)}>
      <div className="movie-card-poster-wrap">
        {!imageLoaded && <div className="skeleton-loader skeleton-poster" style={{ position: 'absolute', inset: 0, margin: 0, borderRadius: 0 }}></div>}
        <img 
          src={posterSrc} 
          alt={title} 
          className="movie-card-poster" 
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
        <div className={`movie-card-badge rated-${rated || 'P'}`}>
          {rated || 'P'}
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{title}</h3>
        <div className="movie-card-meta">
          <span>⭐ {avgRating || 0}/10 &nbsp;•&nbsp; {duration} phút</span>
        </div>
        <div className="movie-card-meta">
          <span>{genre?.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
