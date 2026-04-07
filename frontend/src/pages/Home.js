import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { moviesApi } from '../api/movies.api';
import MovieCard from '../components/MovieCard';
import MovieFilters from '../components/MovieFilters';
import HeroSlider from '../components/HeroSlider';
import { toast } from 'react-toastify';
import api from '../api/axios';

// ===================== MODALS =====================

const ModalOverlay = ({ onClose, children }) => (
  <div className="cb-modal-overlay" onClick={onClose}>
    <div className="cb-modal-box" onClick={e => e.stopPropagation()}>
      <button className="cb-modal-close" onClick={onClose}>✕</button>
      {children}
    </div>
  </div>
);

const CinemaListModal = ({ onClose }) => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cinemas').then(res => {
      setCinemas(res.data.data?.cinemas || res.data.data || []);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="cb-modal-title">🏛️ Hệ Thống Rạp</h2>
      <p className="cb-modal-sub">Danh sách các rạp chiếu phim của CineBooking</p>
      {loading ? (
        <div className="cb-modal-loading">Đang tải dữ liệu...</div>
      ) : cinemas.length === 0 ? (
        <div className="cb-modal-empty">Chưa có dữ liệu rạp chiếu.</div>
      ) : (
        <div className="cb-cinema-list">
          {cinemas.map((c, i) => (
            <div key={c._id || i} className="cb-cinema-item">
              <div className="cb-cinema-icon">🎦</div>
              <div className="cb-cinema-info">
                <div className="cb-cinema-name">{c.name}</div>
                <div className="cb-cinema-addr">{c.address || c.location || 'Việt Nam'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalOverlay>
  );
};

const ContactModal = ({ onClose }) => (
  <ModalOverlay onClose={onClose}>
    <h2 className="cb-modal-title">📞 Liên Hệ CineBooking</h2>
    <p className="cb-modal-sub">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
    <div className="cb-contact-list">
      <div className="cb-contact-item">
        <span className="cb-contact-icon">☎️</span>
        <div>
          <div className="cb-contact-label">Hotline</div>
          <div className="cb-contact-value">1900 6017</div>
        </div>
      </div>
      <div className="cb-contact-item">
        <span className="cb-contact-icon">📧</span>
        <div>
          <div className="cb-contact-label">Email hỗ trợ</div>
          <div className="cb-contact-value">hoidap@cinebooking.vn</div>
        </div>
      </div>
      <div className="cb-contact-item">
        <span className="cb-contact-icon">⏰</span>
        <div>
          <div className="cb-contact-label">Giờ làm việc</div>
          <div className="cb-contact-value">8:00 – 22:00 (Tất cả các ngày)</div>
        </div>
      </div>
      <div className="cb-contact-item">
        <span className="cb-contact-icon">📍</span>
        <div>
          <div className="cb-contact-label">Trụ sở chính</div>
          <div className="cb-contact-value">123 Nguyễn Huệ, Q.1, TP.HCM</div>
        </div>
      </div>
    </div>
  </ModalOverlay>
);

const RentCinemaModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error('Vui lòng điền tên và số điện thoại'); return; }
    setSubmitting(true);
    // Simulate submit
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    setDone(true);
    toast.success('Yêu cầu thuê rạp đã được gửi thành công!');
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="cb-modal-title">🎭 Thuê Rạp Chiếu Phim</h2>
      <p className="cb-modal-sub">Tổ chức sự kiện, chiếu phim riêng tư, ra mắt phim...</p>
      {done ? (
        <div className="cb-rent-success">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3>Yêu cầu đã được gửi!</h3>
          <p>Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.</p>
          <button className="cb-modal-submit" onClick={onClose}>Đóng</button>
        </div>
      ) : (
        <form className="cb-rent-form" onSubmit={handleSubmit}>
          <div className="cb-form-row">
            <div className="cb-form-group">
              <label>Họ và tên *</label>
              <input type="text" placeholder="Nguyễn Văn A" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="cb-form-group">
              <label>Số điện thoại *</label>
              <input type="tel" placeholder="0912 345 678" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="cb-form-group">
            <label>Email</label>
            <input type="email" placeholder="email@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="cb-form-group">
            <label>Ngày dự kiến thuê</label>
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="cb-form-group">
            <label>Ghi chú thêm</label>
            <textarea rows="3" placeholder="Mô tả sự kiện, số lượng khách, yêu cầu đặc biệt..."
              value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <button type="submit" className="cb-modal-submit" disabled={submitting}>
            {submitting ? '⌛ Đang gửi...' : '🚀 Gửi Yêu Cầu Thuê Rạp'}
          </button>
        </form>
      )}
    </ModalOverlay>
  );
};

const NewsModal = ({ onClose }) => {
  const NEWS = [
    { emoji: '🔥', title: 'Avengers: Doomsday – Siêu bom tấn hè 2026', date: '25/03/2026', desc: 'Bắt đầu bán vé từ ngày 28/04. Đặt vé sớm để chọn ghế đẹp!' },
    { emoji: '🎉', title: 'Ưu đãi thành viên CB – Giảm 30% mỗi thứ Tư', date: '20/03/2026', desc: 'Áp dụng cho tất cả khách hàng có tài khoản CineBooking. Không giới hạn số lượng.' },
    { emoji: '🎭', title: 'CineBooking khai trương rạp thứ 50 tại Hà Nội', date: '15/03/2026', desc: 'Rạp mới tọa lạc tại Vincom Center Bà Triệu với 8 phòng chiếu hiện đại.' },
    { emoji: '🍿', title: 'Combo mới: Popcorn + Nước chỉ 59.000đ', date: '10/03/2026', desc: 'Áp dụng khi mua vé online tại CineBooking. Nhận tại quầy khi đến rạp.' },
  ];

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="cb-modal-title">📰 Tin Mới & Ưu Đãi</h2>
      <div className="cb-news-list">
        {NEWS.map((n, i) => (
          <div key={i} className="cb-news-item">
            <div className="cb-news-emoji">{n.emoji}</div>
            <div className="cb-news-body">
              <div className="cb-news-title">{n.title}</div>
              <div className="cb-news-date">{n.date}</div>
              <div className="cb-news-desc">{n.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </ModalOverlay>
  );
};

const MyTicketsModal = ({ onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my-bookings').then(res => {
      setBookings(res.data.data?.bookings || []);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  const statusLabel = (s) => {
    if (s === 'confirmed') return { text: '✅ Đã xác nhận', cls: 'confirmed' };
    if (s === 'pending') return { text: '⏳ Chờ xác nhận', cls: 'pending' };
    if (s === 'cancelled') return { text: '❌ Đã hủy', cls: 'cancelled' };
    return { text: s, cls: '' };
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="cb-modal-title">🎟️ Vé Của Tôi</h2>
      <p className="cb-modal-sub">Lịch sử đặt vé của bạn ({bookings.length} vé)</p>
      {loading ? (
        <div className="cb-modal-loading">Đang tải...</div>
      ) : bookings.length === 0 ? (
        <div className="cb-modal-empty">Bạn chưa đặt vé nào.<br />Hãy chọn phim và đặt vé ngay!</div>
      ) : (
        <div className="cb-ticket-list">
          {bookings.map((b) => {
            const st = statusLabel(b.status);
            // Use snapshot as primary (more reliable) fallback to populated showtime
            const movieTitle = b.movieTitle || b.showtime?.movie?.title;
            const cinemaName = b.cinemaName || b.showtime?.room?.cinema?.name;
            const roomName = b.roomName || b.showtime?.room?.name;
            const startTime = b.showstartTime ? new Date(b.showstartTime) : (b.showtime?.startTime ? new Date(b.showtime.startTime) : null);
            return (
              <div key={b._id} className="cb-ticket-item">
                {/* Header row */}
                <div className="cb-ticket-header">
                  <span className="cb-ticket-code">#{b.bookingCode}</span>
                  <span className={`cb-ticket-status ${b.status}`}>{st.text}</span>
                </div>

                {/* Movie name */}
                <div className="cb-ticket-movie">
                  🎬 {movieTitle || '—'}
                </div>

                {/* Cinema / room / time */}
                {(cinemaName || roomName || startTime) && (
                  <div className="cb-ticket-details">
                    {cinemaName && <span>🏛️ {cinemaName}</span>}
                    {roomName && <span>🚪 {roomName}</span>}
                    {startTime && (
                      <span>🕐 {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} &nbsp;
                        {startTime.toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                )}

                {/* Seats + price */}
                <div className="cb-ticket-info">
                  <span>🪑 {b.tickets?.map(t => t.seatLabel).join(', ') || '—'}</span>
                  <span>💰 {b.finalPrice?.toLocaleString()}đ</span>
                </div>

                {/* Booked at */}
                <div className="cb-ticket-date">
                  Đặt lúc: {new Date(b.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModalOverlay>
  );
};

// ===================== MAIN COMPONENT =====================

const Home = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const movieSectionRef = useRef(null);
  const eventSectionRef = useRef(null);

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

  // Recommendations state
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Modal state
  const [modal, setModal] = useState(null); // 'cinemas' | 'contact' | 'rent' | 'news' | 'tickets'

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

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    setLoadingRecommendations(true);
    try {
      const response = await moviesApi.getRecommendations();
      setRecommendedMovies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => { 
      fetchMovies(); 
      if (user) fetchRecommendations();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchMovies, fetchRecommendations, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const ICON_NAV = [
    {
      icon: '🏛️', label: 'Hệ Thống Rạp',
      action: () => setModal('cinemas')
    },
    {
      icon: '🎬', label: 'Phim Đang Chiếu',
      action: () => {
        setFilters(f => ({ ...f, status: 'now_showing' }));
        scrollTo(movieSectionRef);
      }
    },
    {
      icon: '⭐', label: 'Đặc Trưng CB',
      action: () => scrollTo(eventSectionRef)
    },
    {
      icon: '🎭', label: 'Thuê Rạp',
      action: () => setModal('rent')
    },
    {
      icon: '📞', label: 'Liên Hệ CB',
      action: () => setModal('contact')
    },
    {
      icon: '📰', label: 'Tin Mới',
      action: () => setModal('news')
    },
    {
      icon: '👤', label: 'Đăng Ký Khách Hàng',
      action: () => navigate('/register')
    },
  ];

  return (
    <div className="cb-home">
      {/* ===== MODALS ===== */}
      {modal === 'cinemas' && <CinemaListModal onClose={() => setModal(null)} />}
      {modal === 'contact' && <ContactModal onClose={() => setModal(null)} />}
      {modal === 'rent' && <RentCinemaModal onClose={() => setModal(null)} />}
      {modal === 'news' && <NewsModal onClose={() => setModal(null)} />}
      {modal === 'tickets' && <MyTicketsModal onClose={() => setModal(null)} />}

      {/* ===== HEADER ===== */}
      <header className="cb-header">
        <div className="cb-header-top">
          <div className="cb-header-top-links">
            <span style={{ cursor: 'pointer' }} onClick={() => setModal('news')}>TIN MỚI & ƯU ĐÃI</span>
            {user && <span style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>HỒ SƠ & HẠNG THẺ</span>}
            {user && <span style={{ cursor: 'pointer' }} onClick={() => navigate('/my-bookings')}>🎟️ VÉ CỦA TÔI</span>}
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
            <div className="cb-nav-link" onClick={() => { setFilters(f => ({ ...f, status: 'now_showing' })); scrollTo(movieSectionRef); }}>PHIM</div>
            <div className="cb-nav-link" onClick={() => setModal('cinemas')}>HỆ THỐNG RẠP</div>
            <div className="cb-nav-link" onClick={() => navigate('/profile')}>THÀNH VIÊN</div>
            <div className="cb-nav-link" onClick={() => scrollTo(eventSectionRef)}>TIỆN ÍCH</div>
          </nav>

          <button className="cb-buy-btn" onClick={() => scrollTo(movieSectionRef)}>
            MUA VÉ NGAY
          </button>
        </div>

        <div className="cb-header-divider" />
      </header>

      {/* ===== ICON NAV ===== */}
      <div className="cb-icon-nav">
        {ICON_NAV.map((item, i) => (
          <div key={i} className="cb-icon-item" onClick={item.action} style={{ cursor: 'pointer' }}>
            <div className="cb-icon-circle">{item.icon}</div>
            <span className="cb-icon-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* ===== HERO SLIDER ===== */}
      <div className="cb-slider-wrapper">
        <HeroSlider />
      </div>

      {/* ===== RECOMMENDED MOVIES SECTION ===== */}
      <main className="cb-main" style={{ paddingBottom: '0' }}>
        <div className="cb-section-header">
          <div className="cb-section-line" />
          <h2 className="cb-section-title" style={{ color: '#e50914' }}>
            ✨ {user ? `CHÀO ${user.name.toUpperCase()}, ĐÂY LÀ PHIM DÀNH CHO BẠN` : 'PHIM DÀNH RIÊNG CHO BẠN'}
          </h2>
          <div className="cb-section-line" />
        </div>

        {user ? (
          loadingRecommendations ? (
            <div className="cb-loading">
              <div className="cb-spinner" />
              <p>Đang tải gợi ý...</p>
            </div>
          ) : recommendedMovies.length > 0 ? (
            <div className="cb-recommendations-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {recommendedMovies.filter(m => m.matchReason?.includes('Thịnh Hành')).length > 0 && (
                <div className="cb-rec-subsection">
                  <h3 style={{ color: '#facc15', marginBottom: '15px', fontSize: '1.2rem', paddingLeft: '10px', borderLeft: '3px solid #facc15' }}>🔥 CÁC PHIM ĐANG THỊNH HÀNH</h3>
                  <div className="cb-movie-grid">
                    {recommendedMovies.filter(m => m.matchReason?.includes('Thịnh Hành')).map((movie) => (
                      <MovieCard key={`rec_${movie._id}`} movie={movie} />
                    ))}
                  </div>
                </div>
              )}

              {recommendedMovies.filter(m => m.matchReason?.includes('Đúng Gu')).length > 0 && (
                <div className="cb-rec-subsection">
                  <h3 style={{ color: '#4ade80', marginBottom: '15px', fontSize: '1.2rem', paddingLeft: '10px', borderLeft: '3px solid #4ade80' }}>✨ TÌM THẤY VÌ ĐÚNG GU CỦA BẠN NHẤT</h3>
                  <div className="cb-movie-grid">
                    {recommendedMovies.filter(m => m.matchReason?.includes('Đúng Gu')).map((movie) => (
                      <MovieCard key={`rec_${movie._id}`} movie={movie} />
                    ))}
                  </div>
                </div>
              )}

              {recommendedMovies.filter(m => m.matchReason?.includes('Có thể')).length > 0 && (
                <div className="cb-rec-subsection">
                  <h3 style={{ color: '#a0a5bc', marginBottom: '15px', fontSize: '1.2rem', paddingLeft: '10px', borderLeft: '3px solid #a0a5bc' }}>💡 CÓ THỂ BẠN SẼ THÍCH</h3>
                  <div className="cb-movie-grid">
                    {recommendedMovies.filter(m => m.matchReason?.includes('Có thể')).map((movie) => (
                      <MovieCard key={`rec_${movie._id}`} movie={movie} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="cb-no-movies">
              <p>Chưa có phim gợi ý phù hợp cho bạn lúc này.</p>
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', margin: '0 20px' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Bạn muốn biết phim nào hợp gu mình nhất?</p>
            <p>
              Vui lòng <strong style={{ color: '#e50914', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>đăng nhập</strong> để khám phá danh sách phim được AI gợi ý dựa trên sở thích của bạn!
            </p>
          </div>
        )}
      </main>

      {/* ===== MOVIE SECTION ===== */}
      <main className="cb-main">
        <div className="cb-section-header" ref={movieSectionRef}>
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
        <div className="cb-section-header" style={{ marginTop: '60px' }} ref={eventSectionRef}>
          <div className="cb-section-line" />
          <h2 className="cb-section-title">🔥 SỰ KIỆN & ƯU ĐÃI</h2>
          <div className="cb-section-line" />
        </div>

        <div className="cb-event-grid">
          {[
            { bg: '#c2150a', label: 'CB Member', desc: 'Ưu đãi thành viên', action: () => navigate('/profile') },
            { bg: '#e53e3e', label: 'Ticket Sale', desc: 'Giảm 30% thứ Tư', action: () => setModal('news') },
            { bg: '#ed8936', label: 'Combo 50%', desc: 'Bắp rang + nước', action: () => setModal('news') },
            { bg: '#222', label: 'New Movie', desc: 'Phim mới ra mắt', action: () => { setFilters(f => ({ ...f, status: 'coming_soon' })); scrollTo(movieSectionRef); } },
          ].map((ev, i) => (
            <div
              key={i}
              className="cb-event-card"
              style={{ background: `linear-gradient(135deg, ${ev.bg}cc, ${ev.bg})`, cursor: 'pointer' }}
              onClick={ev.action}
            >
              <div className="cb-event-label">{ev.label}</div>
              <div className="cb-event-desc">{ev.desc}</div>
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
              <li style={{ cursor: 'pointer' }} onClick={() => setModal('contact')}>Giới Thiệu</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setModal('news')}>Tiện Ích Online</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setModal('news')}>Thẻ Quà Tặng</li>
              <li>Tuyển Dụng</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setModal('contact')}>Liên Hệ Quảng Cáo</li>
              <li style={{ cursor: 'pointer' }} onClick={() => setModal('rent')}>Dành cho đối tác</li>
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
              <li>Email: cinebooking@gmail.vn</li>
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
