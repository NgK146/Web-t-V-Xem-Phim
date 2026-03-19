import React from 'react';

const MovieCard = ({ movie, onClick }) => {
  const { title, poster, genre, rated, duration, status } = movie;

  // Xử lý đường dẫn poster
  const posterSrc = poster ? (poster.startsWith('http') ? poster : `http://localhost:5001${poster}`) : 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="movie-card" onClick={() => onClick && onClick(movie._id)}>
      <img src={posterSrc} alt={title} className="movie-card-poster" />
      <div className={`movie-card-badge status-${status}`}>
        {status === 'now_showing' ? 'Đang chiếu' : 'Sắp chiếu'}
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{title}</h3>
        <div className="movie-card-genre">{genre?.join(', ')}</div>
        <div className="movie-card-meta">
          <span className="movie-duration">{duration} phút</span>
          <span className={`movie-rated rated-${rated}`}>{rated}</span>
        </div>
        <button className="movie-card-action">Đặt vé ngay</button>
      </div>
    </div>
  );
};

export default MovieCard;
