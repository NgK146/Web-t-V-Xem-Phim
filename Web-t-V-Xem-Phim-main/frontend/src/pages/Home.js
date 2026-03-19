import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { moviesApi } from '../api/movies.api';
import MovieCard from '../components/MovieCard';
import MovieFilters from '../components/MovieFilters';
import HeroSlider from '../components/HeroSlider';
import { toast } from 'react-toastify';

const Home = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    status: 'now_showing',
    genre: '',
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
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchMovies]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="home-container">
      {/* CGV Header */}
      <header className="cgv-header">
        <div className="header-top">
          {user?.role === 'admin' && (
            <span onClick={() => navigate('/admin')} style={{ cursor: 'pointer', color: '#fff', fontWeight: 'bold' }}>
              QUẢN TRỊ VIÊN
            </span>
          )}
          <span>Chào, <strong>{user?.name}</strong></span>
          <span onClick={handleLogout} style={{ cursor: 'pointer' }}>Thoát</span>
        </div>
        <div className="header-main">
          <div className="cgv-logo" onClick={() => navigate('/')}>CGV</div>
          <nav className="cgv-nav">
            <div className="nav-link">Phim</div>
            <div className="nav-link">Rạp CGV</div>
            <div className="nav-link">Thành Viên</div>
            <div className="nav-link">Cultureplex</div>
          </nav>
          <button className="overlay-btn" style={{ width: 'auto', padding: '10px 30px' }}>Mua Vé</button>
        </div>
      </header>

      {/* Hero Slider */}
      <HeroSlider />

      <main className="movie-section">
        <div className="section-title">Movie Selection</div>
        
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
      
      {/* CGV Footer */}
      <footer className="cgv-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h3>CGV Việt Nam</h3>
            <ul>
              <li>Giới Thiệu</li>
              <li>Tiện Ích Online</li>
              <li>Thẻ Quà Tặng</li>
              <li>Tuyển Dụng</li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Điều Khoản</h3>
            <ul>
              <li>Điều Khoản Chung</li>
              <li>Chính Sách Thanh Toán</li>
              <li>Chính Sách Bảo Mật</li>
              <li>Câu Hỏi Thường Gặp</li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Kết Nối</h3>
            <ul>
              <li>Facebook</li>
              <li>Youtube</li>
              <li>Instagram</li>
              <li>Zalo</li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Chăm Sóc</h3>
            <ul>
              <li>Hotline: 1900 6017</li>
              <li>Giờ làm việc: 8:00 - 22:00</li>
              <li>Email: hoidap@cgv.vn</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
