import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { moviesApi } from '../api/movies.api';
import MovieCard from '../components/MovieCard';
import MovieFilters from '../components/MovieFilters';
import { toast } from 'react-toastify';

const Home = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    genre: '',
    status: 'now_showing',
    rated: '',
    page: 1,
    limit: 12
  });

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await moviesApi.getAll(filters);
      setMovies(response.data.data.movies || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchMovies]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleMovieClick = (id) => {
    // navigate(`/movie/${id}`); // Giả sử có trang chi tiết phim sau này
    toast.info('Tính năng chi tiết phim đang được phát triển');
  };

  return (
    <div className="home-container">
      {/* Header Section */}
      <header style={{ 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
        color: '#fff', 
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>Cinema App</h2>
          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')} 
              className="btn-primary" 
              style={{ padding: '6px 12px', fontSize: '14px', width: 'auto' }}
            >
              Quản trị
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Chào, <strong>{user?.name}</strong></span>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '14px' }}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="movie-section">
        <h1 style={{ marginBottom: '2rem', color: '#1a1a2e' }}>Phim Đang Chiếu & Sắp Chiếu</h1>
        
        <MovieFilters filters={filters} onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="loading-container" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Đang tải phim...</p>
          </div>
        ) : (
          <div className="movie-grid">
            {movies.length > 0 ? (
              movies.map((movie) => (
                <MovieCard 
                  key={movie._id} 
                  movie={movie} 
                  onClick={handleMovieClick}
                />
              ))
            ) : (
              <div className="no-movies">
                <p>Không tìm thấy phim nào phù hợp với tìm kiếm của bạn.</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer style={{ textAlign: 'center', padding: '2rem', color: '#888', borderTop: '1px solid #eee', marginTop: '4rem' }}>
        <p>&copy; 2026 Cinema App - Duy Nguyen</p>
      </footer>
    </div>
  );
};

export default Home;
