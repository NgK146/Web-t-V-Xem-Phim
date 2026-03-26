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
    <div className="cb-home">
      {/* ===== HEADER ===== */}
      <header className="cb-header">
        <div className="cb-header-top">
          <div className="cb-header-top-links">
            <span>TIN MỚI & ƯU ĐÃI</span>
            <span>VÉ CỦA TÔI</span>
            {user ? (
              <span onClick={handleLogout} style={{ cursor: 'pointer' }}>ĐĂNG XUẤT</span>
            ) : (
              <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>ĐĂNG NHẬP / ĐĂNG KÝ</span>
            )}
          </div>
          <div className="cb-header-top-lang">
            <span className="cb-lang-active">VN</span>
            <span className="cb-lang">EN</span>
          </div>
        </div>

        <div className="cb-header-main">
          <div className="cb-logo" onClick={() => navigate('/')}>
            CINEBOOKING<span className="cb-logo-star">*</span>
          </div>

          <nav className="cb-nav">
            <div className="cb-nav-link">PHIM</div>
            <div className="cb-nav-link">HỆ THỐNG RẠP</div>
            <div className="cb-nav-link">THÀNH VIÊN</div>
            <div className="cb-nav-link">TIỆN ÍCH</div>
          </nav>

          <button className="cb-buy-btn" onClick={() => navigate('/')}>
            MUA VÉ NGAY
          </button>
        </div>

        <div className="cb-header-divider" />
      </header>

      {/* ===== ICON NAV ===== */}
      <div className="cb-icon-nav">
        {[
          { icon: '🏛️', label: 'Hệ Thống Rạp' },
          { icon: '🎬', label: 'Phim Đang Chiếu' },
          { icon: '⭐', label: 'Đặc Trưng CB' },
          { icon: '🎭', label: 'Thuê Rạp' },
          { icon: '📞', label: 'Liên Hệ CB' },
          { icon: '📰', label: 'Tin Mới' },
          { icon: '👤', label: 'Đăng Ký Khách Hàng' },
        ].map((item, i) => (
          <div key={i} className="cb-icon-item">
            <div className="cb-icon-circle">{item.icon}</div>
            <span className="cb-icon-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* ===== HERO SLIDER ===== */}
      <div className="cb-slider-wrapper">
        <HeroSlider />
      </div>

      {/* ===== MOVIE SECTION ===== */}
      <main className="cb-main">
        <div className="cb-section-header">
          <div className="cb-section-line" />
          <h2 className="cb-section-title">🎬 PHIM ĐANG CHIẾU</h2>
          <div className="cb-section-line" />
        </div>

        <MovieFilters filters={filters} onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="cb-loading">
            <div className="cb-spinner" />
            <p>Đang tải phim...</p>
          </div>
        ) : (
          <div className="cb-movie-grid">
            {movies.length > 0 ? (
              movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))
            ) : (
              <div className="cb-no-movies">
                <span>🎭</span>
                <p>Không tìm thấy phim phù hợp.</p>
              </div>
            )}
          </div>
        )}

        {/* Events */}
        <div className="cb-section-header" style={{ marginTop: '60px' }}>
          <div className="cb-section-line" />
          <h2 className="cb-section-title">🔥 SỰ KIỆN & ƯU ĐÃI</h2>
          <div className="cb-section-line" />
        </div>

        <div className="cb-event-grid">
          {[
            { bg: '#c2150a', label: 'CB Member' },
            { bg: '#e53e3e', label: 'Ticket Sale' },
            { bg: '#ed8936', label: 'Combo 50%' },
            { bg: '#222', label: 'New Movie' },
          ].map((ev, i) => (
            <div key={i} className="cb-event-card" style={{ background: `linear-gradient(135deg, ${ev.bg}cc, ${ev.bg})` }}>
              <div className="cb-event-label">{ev.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="cb-footer">
        <div className="cb-footer-inner">
          <div className="cb-footer-col">
            <div className="cb-footer-logo">CINEBOOKING<span>*</span></div>
            <p className="cb-footer-tagline">Trải nghiệm điện ảnh đỉnh cao, mọi nơi mọi lúc.</p>
          </div>
          <div className="cb-footer-col">
            <h4>CineBooking Việt Nam</h4>
            <ul>
              <li>Giới Thiệu</li>
              <li>Tiện Ích Online</li>
              <li>Thẻ Quà Tặng</li>
              <li>Tuyển Dụng</li>
              <li>Liên Hệ Quảng Cáo CineBooking</li>
              <li>Dành cho đối tác</li>
            </ul>
          </div>
          <div className="cb-footer-col">
            <h4>Điều khoản sử dụng</h4>
            <ul>
              <li>Điều Khoản Chung</li>
              <li>Điều Khoản Giao Dịch</li>
              <li>Chính Sách Thanh Toán</li>
              <li>Chính Sách Bảo Mật</li>
              <li>Câu Hỏi Thường Gặp</li>
            </ul>
          </div>
          <div className="cb-footer-col">
            <h4>Kết Nối</h4>
            <div className="cb-social">
              <span className="cb-social-btn">FB</span>
              <span className="cb-social-btn">YT</span>
              <span className="cb-social-btn">IG</span>
            </div>
          </div>
          <div className="cb-footer-col">
            <h4>Chăm Sóc Khách Hàng</h4>
            <ul>
              <li>Hotline: 1900 6017</li>
              <li>Giờ làm việc: 8:00 - 22:00</li>
              <li>Email: hoidap@cinebooking.vn</li>
            </ul>
          </div>
        </div>
        <div className="cb-footer-bottom">
          <strong>CÔNG TY TNHH CINEBOOKING VIETNAM</strong>
          <p>COPYRIGHT 2025 CINEBOOKING VIETNAM CO., LTD. ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
