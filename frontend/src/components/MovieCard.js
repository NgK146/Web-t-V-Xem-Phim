import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'http://localhost:5001';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { _id, title, poster, genre, rated, duration, avgRating } = movie;
  const posterSrc = poster ? (poster.startsWith('http') ? poster : `${BACKEND_URL}${poster}`) : 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${_id}`)}>
      <div className="movie-card-poster-wrap">
        <img src={posterSrc} alt={title} className="movie-card-poster" />
        <div className={`movie-card-badge rated-${rated || 'P'}`}>
          {rated || 'P'}
        </div>
        <div className="movie-overlay">
          <button className="overlay-btn btn-detail">Xem Chi Tiết</button>
          <button className="overlay-btn btn-book">Mua Vé</button>
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{title}</h3>
        <div className="movie-card-meta">
          <span>⭐ {avgRating || 0}/10</span>
          <span>• {duration} phút</span>
        </div>
        <div className="movie-card-meta">
          <span>{genre?.join(', ')}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
