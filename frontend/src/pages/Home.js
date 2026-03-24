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
      {/* Top Ad Banner */}
      <div style={{ textAlign: 'center', backgroundColor: '#fdfcf0', padding: '10px 0' }}>
        <img src="https://advserver.cgv.vn/www/images/5f1fe9bda4d3e5dfd9d5904fc1b30cc1.jpg" alt="top banner" style={{ maxWidth: '980px', width: '100%', cursor: 'pointer' }} onError={(e) => e.target.style.display='none'}/>
      </div>

      <header className="cgv-header">
        {/* Top small links */}
        <div className="header-top">
          <span style={{ fontSize: '11px', color: '#666' }}>TIN MỚI & ƯU ĐÃI</span>
          <span style={{ fontSize: '11px', color: '#666' }}>VÉ CỦA TÔI</span>
          {user ? (
            <span onClick={handleLogout} style={{ fontSize: '11px', color: '#666' }}>ĐĂNG XUẤT</span>
          ) : (
            <span onClick={() => navigate('/login')} style={{ fontSize: '11px', color: '#666' }}>ĐĂNG NHẬP / ĐĂNG KÝ</span>
          )}
          <span className="lang-vn">VN</span>
          <span className="lang-en">EN</span>
        </div>

        {/* Main Header with Logo and Nav */}
        <div className="header-main-bg">
          <div className="header-main">
            <div className="cgv-logo" onClick={() => navigate('/')}>
              CGV<span style={{fontSize:'30px', verticalAlign:'top'}}>*</span>
            </div>
            
            <nav className="cgv-nav">
              <div className="nav-link">PHIM</div>
              <div className="nav-link">RẠP CGV</div>
              <div className="nav-link">THÀNH VIÊN</div>
              <div className="nav-link">CULTUREPLEX</div>
            </nav>

            <div className="buy-ticket-btn-css">
              <span className="btn-text">MUA VÉ NGAY</span>
            </div>
          </div>
        </div>

        {/* Thick dotted line */}
        <div className="cgv-dotted-line"></div>
      </header>

      {/* Icon Navigation Bar */}
      <div className="icon-nav-bar">
        <div className="icon-item">
          <div className="icon-circle"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M9 7h6M9 11h6M9 15h6"/></svg></div>
          <span className="icon-text">Rạp CGV</span>
        </div>
        <div className="icon-item">
          <div className="icon-circle"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg></div>
          <span className="icon-text">Phim Đang Chiếu</span>
        </div>
        <div className="icon-item">
          <div className="icon-circle"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <span className="icon-text">Đặc Trưng CGV</span>
        </div>
        <div className="icon-item">
          <div className="icon-circle"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <span className="icon-text">Thuê Rạp</span>
        </div>
        <div className="icon-item">
          <div className="icon-circle"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
          <span className="icon-text">Liên Hệ CGV</span>
        </div>
        <div className="icon-item">
          <div className="icon-circle"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg></div>
          <span className="icon-text">Tin Mới</span>
        </div>
        <div className="icon-item">
          <div className="icon-circle"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg></div>
          <span className="icon-text">Đăng Ký Khách Hàng</span>
        </div>
      </div>

      <div className="brick-bg-wrapper">
        <div className="brick-bg-inner">
          {/* Edge to edge ads layout container */}
          <div className="content-with-ads">
            <div className="ad-left">
               <img src="https://advserver.cgv.vn/www/images/c3b1e70e3ad5d37aa9be3c3f9153a0f7.jpg" alt="Left Ad" onError={(e) => e.target.style.display='none'}/>
            </div>

            <div className="center-content">
              {/* Hero Slider */}
              <div className="slider-wrapper">
                <HeroSlider />
              </div>

              <main className="movie-section">
                <div className="movie-selection-title">
                  <div className="title-text">
                    <img src="https://www.cgv.vn/skin/frontend/cgv/default/images/bg-cgv/h3_movie_selection.gif" alt="MOVIE SELECTION" />
                  </div>
                </div>
                
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
                        <p>Không tìm thấy phim.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="event-section-title">
                  <div className="title-text">
                    <img src="https://www.cgv.vn/skin/frontend/cgv/default/images/bg-cgv/h3_event.gif" alt="EVENT" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerText = 'EVENT'; }}/>
                  </div>
                </div>

                <div className="event-grid">
                  <div className="event-card">
                    <img src="https://ui-avatars.com/api/?name=CGV+Member&size=400&background=c2150a&color=fff&font-size=0.15" alt="Event 1" className="event-img" />
                  </div>
                  <div className="event-card">
                    <img src="https://ui-avatars.com/api/?name=Ticket+Sale&size=400&background=e53e3e&color=fff&font-size=0.15" alt="Event 2" className="event-img" />
                  </div>
                  <div className="event-card">
                    <img src="https://ui-avatars.com/api/?name=Combo+50%25&size=400&background=ed8936&color=fff&font-size=0.15" alt="Event 3" className="event-img" />
                  </div>
                  <div className="event-card">
                    <img src="https://ui-avatars.com/api/?name=New+Movie&size=400&background=222222&color=fff&font-size=0.15" alt="Event 4" className="event-img" />
                  </div>
                </div>
              </main>
            </div>

            <div className="ad-right">
               <img src="https://advserver.cgv.vn/www/images/7efd2ae4c156f6bafe2dfc53fd98dd07.jpg" alt="Right Ad" onError={(e) => e.target.style.display='none'}/>
            </div>
          </div>
        </div>
      </div>
      
      {/* Brand Bar */}
      <div className="brand-bar"></div>

      {/* CGV Footer */}
      <footer className="cgv-footer">
        <div className="footer-content">
          <div className="footer-col cg-logo" style={{flex: 1}}>
          </div>
          <div className="footer-col" style={{flex: 2}}>
            <h3>CGV Việt Nam</h3>
            <ul>
              <li>Giới Thiệu</li>
              <li>Tiện Ích Online</li>
              <li>Thẻ Quà Tặng</li>
              <li>Tuyển Dụng</li>
              <li>Liên Hệ Quảng Cáo CGV</li>
              <li>Dành cho đối tác</li>
            </ul>
          </div>
          <div className="footer-col" style={{flex: 2}}>
            <h3>Điều khoản sử dụng</h3>
            <ul>
              <li>Điều Khoản Chung</li>
              <li>Điều Khoản Giao Dịch</li>
              <li>Chính Sách Thanh Toán</li>
              <li>Chính Sách Bảo Mật</li>
              <li>Câu Hỏi Thường Gặp</li>
            </ul>
          </div>
          <div className="footer-col" style={{flex: 2}}>
            <h3>Kết Nối</h3>
            <div className="social-icons">
               <span className="sc-fb">FB</span>
               <span className="sc-yt">YT</span>
               <span className="sc-ig">IG</span>
            </div>
            <img src="https://www.cgv.vn/skin/frontend/cgv/default/images/cong-thuong.PNG" alt="Bo Cong Thuong" style={{marginTop:'10px', height: '40px'}}/>
          </div>
          <div className="footer-col" style={{flex: 3}}>
            <h3>Chăm Sóc Khách Hàng</h3>
            <ul>
              <li>Hotline: 1900 6017</li>
              <li>Giờ làm việc: 8:00 - 22:00 (Tất cả các ngày bao gồm Lễ, Tết)</li>
              <li>Email: hoidap@cgv.vn</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="cj-logo">CJ CGV</div>
          <div className="company-info">
            <p><strong>CÔNG TY TNHH CJ CGV VIETNAM</strong></p>
            <p>Giấy CNĐKDN: 0303675393, đăng ký lần đầu ngày 31/7/2008, đăng ký thay đổi lần thứ 5 ngày 14/10/2015, cấp bởi Sở KHĐT thành phố Hồ Chí Minh.</p>
            <p>Địa chỉ: Tầng 2, Riviera Point, số 2/28B Thạch Nham, P. Tân Lập, Q. 7, TP. HCM.</p>
            <p>Đường dây nóng: 1900 6017 - Yêu cầu trợ giúp qua điện thoại</p>
            <p>COPYRIGHT 2017 CJ CGV VIETNAM CO., LTD. ALL RIGHTS RESERVED</p>
          </div>
        </div>

        <div className="footer-brick"></div>
      </footer>
    </div>
  );
};

export default Home;
