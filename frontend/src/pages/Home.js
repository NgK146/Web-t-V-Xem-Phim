import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { moviesApi } from '../api/movies.api';
import MovieCard from '../components/MovieCard';
import MovieFilters from '../components/MovieFilters';
import HeroSlider from '../components/HeroSlider';
import { toast } from 'react-toastify';
import api from '../api/axios';

// ─── SVG Icon Set (Lucide-style, stroke-width 1.5) ─────────────────────────
const IconHome = () => (
  <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
const IconFilm = () => (
  <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.1 5.16 2 2 0 015.11 3h3a2 2 0 012 1.72c.122.96.386 1.9.77 2.81a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.384 1.85.648 2.81.77A2 2 0 0122 17.92v-.01" /></svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
);
const IconUserPlus = () => (
  <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
);
const IconTicket = () => (
  <svg viewBox="0 0 24 24"><path d="M2 9a3 3 0 000 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 000-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z" /><line x1="9" y1="12" x2="9.01" y2="12" strokeWidth="2" /><line x1="12" y1="12" x2="12.01" y2="12" strokeWidth="2" /><line x1="15" y1="12" x2="15.01" y2="12" strokeWidth="2" /></svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" /></svg>
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-poster" />
    <div className="skeleton-info">
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  </div>
);

// ─── Modal Overlay ────────────────────────────────────────────────────────────
const ModalOverlay = ({ onClose, children }) => (
  <div className="cb-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
    <div className="cb-modal-box" onClick={e => e.stopPropagation()}>
      <button className="cb-modal-close" onClick={onClose} aria-label="Đóng">✕</button>
      {children}
    </div>
  </div>
);

// ─── Cinema List Modal ────────────────────────────────────────────────────────
const CinemaListModal = ({ onClose }) => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cinemas').then(res => {
      setCinemas(res.data.data?.cinemas || res.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="cb-modal-title">Hệ Thống Rạp</h2>
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

// ─── Contact Modal ────────────────────────────────────────────────────────────
const ContactModal = ({ onClose }) => (
  <ModalOverlay onClose={onClose}>
    <h2 className="cb-modal-title">Liên Hệ CineBooking</h2>
    <p className="cb-modal-sub">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
    <div className="cb-contact-list">
      {[
        { icon: '☎️', label: 'Hotline', value: '1900 6017' },
        { icon: '📧', label: 'Email hỗ trợ', value: 'hoidap@cinebooking.vn' },
        { icon: '⏰', label: 'Giờ làm việc', value: '8:00 – 22:00 (Tất cả các ngày)' },
        { icon: '📍', label: 'Trụ sở chính', value: '123 Nguyễn Huệ, Q.1, TP.HCM' },
      ].map((item, i) => (
        <div key={i} className="cb-contact-item">
          <span className="cb-contact-icon">{item.icon}</span>
          <div>
            <div className="cb-contact-label">{item.label}</div>
            <div className="cb-contact-value">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  </ModalOverlay>
);

// ─── Rent Cinema Modal ────────────────────────────────────────────────────────
const RentCinemaModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error('Vui lòng điền tên và số điện thoại'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    setDone(true);
    toast.success('Yêu cầu thuê rạp đã được gửi!');
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="cb-modal-title">Thuê Rạp Chiếu Phim</h2>
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
            <textarea rows="3" placeholder="Mô tả sự kiện, số lượng khách..."
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

// ─── News Modal ───────────────────────────────────────────────────────────────
const NewsModal = ({ onClose }) => {
  const NEWS = [
    { emoji: '🔥', title: 'Avengers: Doomsday – Siêu bom tấn hè 2026', date: '25/03/2026', desc: 'Bắt đầu bán vé từ ngày 28/04. Đặt vé sớm để chọn ghế đẹp!' },
    { emoji: '🎉', title: 'Ưu đãi thành viên CB – Giảm 30% mỗi thứ Tư', date: '20/03/2026', desc: 'Áp dụng cho tất cả khách hàng có tài khoản CineBooking.' },
    { emoji: '🎭', title: 'CineBooking khai trương rạp thứ 50 tại Hà Nội', date: '15/03/2026', desc: 'Rạp mới tọa lạc tại Vincom Center Bà Triệu với 8 phòng chiếu.' },
    { emoji: '🍿', title: 'Combo mới: Popcorn + Nước chỉ 59.000đ', date: '10/03/2026', desc: 'Áp dụng khi mua vé online. Nhận tại quầy khi đến rạp.' },
  ];

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="cb-modal-title">Tin Mới & Ưu Đãi</h2>
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

// ─── My Tickets Modal ─────────────────────────────────────────────────────────
const MyTicketsModal = ({ onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my-bookings').then(res => {
      setBookings(res.data.data?.bookings || []);
      setLoading(false);
    }).catch(() => setLoading(false));
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
      <p className="cb-modal-sub">Lịch sử đặt vé ({bookings.length} vé)</p>
      {loading ? (
        <div className="cb-modal-loading">Đang tải...</div>
      ) : bookings.length === 0 ? (
        <div className="cb-modal-empty">Bạn chưa đặt vé nào.<br />Hãy chọn phim và đặt vé ngay!</div>
      ) : (
        <div className="cb-ticket-list">
          {bookings.map((b) => {
            const st = statusLabel(b.status);
            const movieTitle = b.movieTitle || b.showtime?.movie?.title;
            const cinemaName = b.cinemaName || b.showtime?.room?.cinema?.name;
            const roomName = b.roomName || b.showtime?.room?.name;
            const startTime = b.showstartTime
              ? new Date(b.showstartTime)
              : b.showtime?.startTime ? new Date(b.showtime.startTime) : null;
            return (
              <div key={b._id} className="cb-ticket-item">
                <div className="cb-ticket-header">
                  <span className="cb-ticket-code">#{b.bookingCode}</span>
                  <span className={`cb-ticket-status ${b.status}`}>{st.text}</span>
                </div>
                <div className="cb-ticket-movie">🎬 {movieTitle || '—'}</div>
                {(cinemaName || roomName || startTime) && (
                  <div className="cb-ticket-details">
                    {cinemaName && <span>🏛️ {cinemaName}</span>}
                    {roomName && <span>🚪 {roomName}</span>}
                    {startTime && (
                      <span>🕐 {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {startTime.toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                )}
                <div className="cb-ticket-info">
                  <span>🪑 {b.tickets?.map(t => t.seatLabel).join(', ') || '—'}</span>
                  <span>💰 {b.finalPrice?.toLocaleString()}đ</span>
                </div>
                <div className="cb-ticket-date">Đặt lúc: {new Date(b.createdAt).toLocaleString('vi-VN')}</div>
              </div>
            );
          })}
        </div>
      )}
    </ModalOverlay>
  );
};

// ─── PROMO CARDS DATA ─────────────────────────────────────────────────────────
const PROMOS = [
  {
    label: 'CB Member',
    desc: 'Ưu đãi thành viên VIP',
    gradient: 'linear-gradient(135deg, #c2150a 0%, #7b0d07 100%)',
    emoji: '👑',
    key: 'profile',
  },
  {
    label: 'Ticket Sale',
    desc: 'Giảm 30% mỗi thứ Tư',
    gradient: 'linear-gradient(135deg, #e53e3e 0%, #9b2c2c 100%)',
    emoji: '🎫',
    key: 'news',
  },
  {
    label: 'Combo 50%',
    desc: 'Bắp rang + nước lớn',
    gradient: 'linear-gradient(135deg, #dd6b20 0%, #7b341e 100%)',
    emoji: '🍿',
    key: 'news',
  },
  {
    label: 'Phim Mới',
    desc: 'Xem phim sắp chiếu',
    gradient: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
    emoji: '🎬',
    key: 'coming_soon',
  },
  {
    label: 'Thuê Rạp',
    desc: 'Tổ chức sự kiện riêng',
    gradient: 'linear-gradient(135deg, #553c9a 0%, #322659 100%)',
    emoji: '🎭',
    key: 'rent',
  },
];

// ─── ICON NAV DATA ────────────────────────────────────────────────────────────
const makeIconNav = (setModal, navigate, scrollTo, movieSectionRef, eventSectionRef) => [
  { icon: <IconMapPin />, label: 'Hệ Thống Rạp', action: () => setModal('cinemas') },
  { icon: <IconFilm />, label: 'Phim Đang Chiếu', action: () => scrollTo(movieSectionRef) },
  { icon: <IconStar />, label: 'Đặc Trưng CB', action: () => scrollTo(eventSectionRef) },
  { icon: <IconTicket />, label: 'Thuê Rạp', action: () => setModal('rent') },
  { icon: <IconPhone />, label: 'Liên Hệ CB', action: () => setModal('contact') },
  { icon: <IconBell />, label: 'Tin Mới', action: () => setModal('news') },
  { icon: <IconUserPlus />, label: 'Đăng Ký', action: () => navigate('/register') },
];

// ─── BOTTOM NAV DATA ──────────────────────────────────────────────────────────
const BOTTOM_NAV = [
  { icon: <IconHome />, label: 'Trang Chủ', key: 'home' },
  { icon: <IconFilm />, label: 'Phim', key: 'movies' },
  { icon: <IconMapPin />, label: 'Rạp', key: 'cinemas' },
  { icon: <IconUser />, label: 'Hồ Sơ', key: 'profile' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Home = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const movieSectionRef = useRef(null);
  const eventSectionRef = useRef(null);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '', status: 'now_showing', genre: '', rated: '', page: 1, limit: 15,
  });

  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const [modal, setModal] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState('home');
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await moviesApi.getAll(filters);
      setMovies(response.data.data.movies || []);
    } catch {
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
    } catch {
      // silent
    } finally {
      setLoadingRecommendations(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies();
      if (user) fetchRecommendations();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMovies, fetchRecommendations, user]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handlePromoClick = (key) => {
    if (key === 'profile') navigate('/profile');
    else if (key === 'rent') setModal('rent');
    else if (key === 'news') setModal('news');
    else if (key === 'coming_soon') {
      setFilters(f => ({ ...f, status: 'coming_soon' }));
      scrollTo(movieSectionRef);
    }
  };

  const handleBottomNav = (key) => {
    setActiveBottomNav(key);
    if (key === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    else if (key === 'movies') scrollTo(movieSectionRef);
    else if (key === 'cinemas') setModal('cinemas');
    else if (key === 'profile') navigate('/profile');
  };

  const ICON_NAV = makeIconNav(setModal, navigate, scrollTo, movieSectionRef, eventSectionRef);
  const SKELETON_COUNT = filters.limit;

  // Rec group helper
  const recGroup = (keyword) => recommendedMovies.filter(m => m.matchReason?.includes(keyword));

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="cb-home">
      {/* ── MODALS ── */}
      {modal === 'cinemas' && <CinemaListModal onClose={() => setModal(null)} />}
      {modal === 'contact' && <ContactModal onClose={() => setModal(null)} />}
      {modal === 'rent' && <RentCinemaModal onClose={() => setModal(null)} />}
      {modal === 'news' && <NewsModal onClose={() => setModal(null)} />}
      {modal === 'tickets' && <MyTicketsModal onClose={() => setModal(null)} />}

      {/* ── STICKY GLASSMORPHISM HEADER (max 60px) ── */}
      <header className="cb-header" role="banner">
        <div className="cb-header-inner">
          {/* Logo */}
          <div className="cb-logo" onClick={() => navigate('/')} role="link" aria-label="CineBooking trang chủ">
            CINEBOOKING<span className="cb-logo-star">*</span>
          </div>

          {/* Desktop Nav */}
          <nav className="cb-nav" aria-label="Điều hướng chính">
            <div className="cb-nav-link" onClick={() => { setFilters(f => ({ ...f, status: 'now_showing' })); scrollTo(movieSectionRef); }}>Phim</div>
            <div className="cb-nav-link" onClick={() => setModal('cinemas')}>Hệ Thống Rạp</div>
            <div className="cb-nav-link" onClick={() => navigate('/profile')}>Thành Viên</div>
            <div className="cb-nav-link" onClick={() => scrollTo(eventSectionRef)}>Ưu Đãi</div>
          </nav>

          {/* Actions */}
          <div className="cb-header-actions">
            <button className="cb-buy-btn" onClick={() => scrollTo(movieSectionRef)}>
              MUA VÉ NGAY
            </button>

            {user ? (
              <div className="cb-profile-chip" ref={profileRef} onClick={() => setProfileOpen(o => !o)} aria-haspopup="true" aria-expanded={profileOpen}>
                <div className="cb-profile-avatar">{initials}</div>
                <span className="cb-profile-name">{user.name.split(' ').pop()}</span>
                <span className={`cb-chevron${profileOpen ? ' open' : ''}`}><IconChevronDown /></span>

                {profileOpen && (
                  <div className="cb-profile-dropdown" role="menu">
                    <div className="cb-dropdown-greeting">
                      <span>Xin chào 👋</span>
                      <strong>{user.name}</strong>
                    </div>
                    <div className="cb-dropdown-item" role="menuitem" onClick={() => { setProfileOpen(false); navigate('/profile'); }}>
                      <span className="cb-dd-icon"><IconUser /></span> Hồ Sơ & Hạng Thẻ
                    </div>
                    <div className="cb-dropdown-item" role="menuitem" onClick={() => { setProfileOpen(false); navigate('/my-bookings'); }}>
                      <span className="cb-dd-icon"><IconTicket /></span> Vé Của Tôi
                    </div>
                    <div className="cb-dropdown-divider" />
                    <div className="cb-dropdown-item logout" role="menuitem" onClick={handleLogout}>
                      <span className="cb-dd-icon"><IconLogOut /></span> Đăng Xuất
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button className="cb-auth-btn" onClick={() => navigate('/login')}>
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── SLIM ICON NAV (Desktop / Tablet) ── */}
      <div className="cb-icon-nav" role="navigation" aria-label="Điều hướng phụ">
        {ICON_NAV.map((item, i) => (
          <div key={i} className="cb-icon-item" onClick={item.action} role="button" tabIndex={0}
            aria-label={item.label} onKeyDown={e => e.key === 'Enter' && item.action()}>
            <div className="cb-icon-circle">{item.icon}</div>
            <span className="cb-icon-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── HERO SLIDER ── */}
      <div className="cb-slider-wrapper">
        <HeroSlider />
      </div>

      {/* ── RECOMMENDED SECTION ── */}
      <main className="cb-main" style={{ paddingBottom: 0 }}>
        <div className="cb-section-header">
          <div className="cb-section-line" />
          <h2 className="cb-section-title">
            <span>✨</span> {user ? `PHIM DÀNH CHO ${user.name.split(' ').pop().toUpperCase()}` : 'GỢI Ý HÔM NAY'}
          </h2>
          <div className="cb-section-line" />
        </div>

        {user ? (
          loadingRecommendations ? (
            <div className="cb-movie-grid">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : recommendedMovies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {[
                { keyword: 'Thịnh Hành', label: '🔥 CÁC PHIM ĐANG THỊNH HÀNH', color: '#facc15' },
                { keyword: 'Đúng Gu', label: '✨ TÌM THẤY VÌ ĐÚNG GU CỦA BẠN', color: '#4ade80' },
                { keyword: 'Có thể', label: '💡 CÓ THỂ BẠN SẼ THÍCH', color: '#a0a5bc' },
              ].map(({ keyword, label, color }) => {
                const group = recGroup(keyword);
                if (!group.length) return null;
                return (
                  <div key={keyword} className="cb-rec-subsection">
                    <h3 style={{ color, marginBottom: 16, fontSize: '13px', paddingLeft: 12, borderLeft: `3px solid ${color}`, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {label}
                    </h3>
                    <div className="cb-movie-grid">
                      {group.map(movie => <MovieCard key={`rec_${movie._id}`} movie={movie} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cb-no-movies"><p>Chưa có phim gợi ý phù hợp lúc này.</p></div>
          )
        ) : (
          <div className="cb-login-prompt">
            <p>Bạn muốn biết phim nào hợp gu nhất?</p>
            <p>
              <strong onClick={() => navigate('/login')} style={{ color: '#E50914', cursor: 'pointer', textDecoration: 'underline' }}>
                Đăng nhập
              </strong>{' '}
              để khám phá danh sách phim AI gợi ý dành riêng cho bạn!
            </p>
          </div>
        )}
      </main>

      {/* ── MOVIE LIST SECTION ── */}
      <main className="cb-main">
        <div className="cb-section-header" ref={movieSectionRef}>
          <div className="cb-section-line" />
          <h2 className="cb-section-title">🎬 PHIM ĐANG CHIẾU</h2>
          <div className="cb-section-line" />
        </div>

        <MovieFilters filters={filters} onFilterChange={setFilters} />

        <div className="cb-movie-grid">
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)
            : movies.length > 0
              ? movies.map(movie => <MovieCard key={movie._id} movie={movie} />)
              : <div className="cb-no-movies"><span>🎭</span><p>Không tìm thấy phim phù hợp.</p></div>
          }
        </div>

        {/* ── PROMOTIONS SECTION ── */}
        <div className="cb-section-header" style={{ marginTop: 48 }} ref={eventSectionRef}>
          <div className="cb-section-line" />
          <h2 className="cb-section-title">🔥 SỰ KIỆN & ƯU ĐÃI</h2>
          <div className="cb-section-line" />
        </div>

        <div className="cb-promo-scroll-wrapper">
          <div className="cb-promo-scroll" role="list">
            {PROMOS.map((promo, i) => (
              <div
                key={i}
                className="cb-promo-card"
                style={{ background: promo.gradient }}
                onClick={() => handlePromoClick(promo.key)}
                role="listitem button"
                tabIndex={0}
                aria-label={promo.label}
                onKeyDown={e => e.key === 'Enter' && handlePromoClick(promo.key)}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8, position: 'relative', zIndex: 1 }}>{promo.emoji}</div>
                <div className="cb-promo-title">{promo.label}</div>
                <div className="cb-promo-desc">{promo.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="cb-footer" role="contentinfo">
        <div className="cb-footer-inner">
          <div className="cb-footer-col">
            <div className="cb-footer-logo">CINEBOOKING<span>*</span></div>
            <p className="cb-footer-tagline">Trải nghiệm điện ảnh đỉnh cao, mọi nơi mọi lúc.</p>
          </div>
          <div className="cb-footer-col">
            <h4>CineBooking Việt Nam</h4>
            <ul>
              <li onClick={() => setModal('contact')}>Giới Thiệu</li>
              <li onClick={() => setModal('news')}>Tiện Ích Online</li>
              <li onClick={() => setModal('news')}>Thẻ Quà Tặng</li>
              <li>Tuyển Dụng</li>
              <li onClick={() => setModal('contact')}>Liên Hệ Quảng Cáo</li>
              <li onClick={() => setModal('rent')}>Dành cho đối tác</li>
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
              <span className="cb-social-btn" aria-label="Facebook">FB</span>
              <span className="cb-social-btn" aria-label="YouTube">YT</span>
              <span className="cb-social-btn" aria-label="Instagram">IG</span>
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

      {/* ── BOTTOM NAVIGATION BAR (Mobile Only) ── */}
      <nav className="cb-bottom-nav" aria-label="Điều hướng di động">
        {BOTTOM_NAV.map(item => (
          <div
            key={item.key}
            className={`cb-bottom-nav-item${activeBottomNav === item.key ? ' active' : ''}`}
            onClick={() => handleBottomNav(item.key)}
            role="button"
            tabIndex={0}
            aria-label={item.label}
            onKeyDown={e => e.key === 'Enter' && handleBottomNav(item.key)}
          >
            {item.icon}
            <span className="cb-bottom-nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Home;
