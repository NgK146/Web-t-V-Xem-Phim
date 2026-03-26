import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🎬',
    title: 'Hàng nghìn bộ phim',
    desc: 'Cập nhật phim mới nhất, từ bom tấn Hollywood đến phim Việt đặc sắc.',
  },
  {
    icon: '⚡',
    title: 'Đặt vé siêu tốc',
    desc: 'Chọn ghế, thanh toán và nhận vé điện tử chỉ trong vài giây.',
  },
  {
    icon: '🍿',
    title: 'Trải nghiệm đẳng cấp',
    desc: 'Rạp chiếu hiện đại, âm thanh Dolby, màn hình IMAX cực đỉnh.',
  },
  {
    icon: '🎟️',
    title: 'Ưu đãi độc quyền',
    desc: 'Thành viên nhận combo ưu đãi, giảm giá vé và quà tặng hấp dẫn.',
  },
];

const STATS = [
  { value: '500K+', label: 'Khách hàng tin dùng' },
  { value: '200+', label: 'Phim đang chiếu' },
  { value: '50+', label: 'Rạp toàn quốc' },
  { value: '4.9★', label: 'Đánh giá trung bình' },
];

const MOVIES = [
  {
    title: 'Avengers: Doomsday',
    genre: 'Hành động / Siêu anh hùng',
    rating: '8.5',
  },
  {
    title: 'Lật Mặt 8',
    genre: 'Hài / Gia đình',
    rating: '7.8',
  },
  {
    title: 'Mission Impossible 8',
    genre: 'Hành động / Ly kỳ',
    rating: '8.2',
  },
  {
    title: 'Minecraft: The Movie',
    genre: 'Hoạt hình / Phiêu lưu',
    rating: '7.5',
  },
];

const MOVIE_GRADIENTS = [
  'linear-gradient(135deg, #1a1a3e 0%, #e71a0f 100%)',
  'linear-gradient(135deg, #1a3e1a 0%, #f5a623 100%)',
  'linear-gradient(135deg, #1a2e3e 0%, #667eea 100%)',
  'linear-gradient(135deg, #2d1a3e 0%, #764ba2 100%)',
];

const LandingPage = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    // Parallax effect on hero
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.backgroundPositionY = `${50 + scrollY * 0.3}%`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">🎬</span>
            <span className="landing-logo-text">CineBooking</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Tính năng</a>
            <a href="#movies" className="landing-nav-link">Phim hot</a>
            <a href="#stats" className="landing-nav-link">Về chúng tôi</a>
          </div>
          <div className="landing-nav-auth">
            <Link to="/login" className="landing-btn-ghost">Đăng nhập</Link>
            <Link to="/register" className="landing-btn-cta">Đăng ký miễn phí</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="landing-hero" ref={heroRef}>
        <div className="hero-overlay" />
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }} />
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge">Nền tảng đặt vé #1 Việt Nam</div>
          <h1 className="hero-title">
            Trải Nghiệm<br/>
            <span className="hero-title-accent">Điện Ảnh</span><br/>
            Đỉnh Cao
          </h1>
          <p className="hero-subtitle">
            Đặt vé xem phim dễ dàng, nhanh chóng tại hàng trăm rạp trên toàn quốc.
            Chọn ghế, chọn phim, tận hưởng ngay!
          </p>
          <div className="hero-actions">
            <Link to="/register" className="hero-btn-primary">
              <span>🚀</span> Bắt đầu ngay miễn phí
            </Link>
            <Link to="/login" className="hero-btn-secondary">
              Đăng nhập →
            </Link>
          </div>
          <div className="hero-trust">
            <div className="hero-trust-item">
              <div className="hero-trust-avatars">
                {['👨', '👩', '🧑', '👦'].map((em, i) => (
                  <span key={i} className="trust-avatar">{em}</span>
                ))}
              </div>
              <span className="hero-trust-text">500.000+ người dùng tin tưởng</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="stats-bar" id="stats">
        <div className="stats-bar-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stats-bar-item">
              <div className="stats-bar-value">{s.value}</div>
              <div className="stats-bar-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="landing-features" id="features">
        <div className="section-inner">
          <div className="section-label">✨ Tại sao chọn chúng tôi</div>
          <h2 className="section-title">Đặt vé thông minh hơn,<br />trải nghiệm tốt hơn</h2>
          <p className="section-subtitle">
            Chúng tôi mang đến trải nghiệm đặt vé hiện đại, tiện lợi và nhanh chóng nhất.
          </p>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works">
        <div className="section-inner">
          <div className="section-label">📋 Quy trình</div>
          <h2 className="section-title">Chỉ 3 bước đơn giản</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Chọn phim</h3>
              <p className="step-desc">Browse hàng trăm bộ phim đang chiếu và sắp chiếu với thông tin chi tiết.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Chọn ghế</h3>
              <p className="step-desc">Xem sơ đồ ghế realtime, chọn vị trí yêu thích và giờ chiếu phù hợp.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Nhận vé</h3>
              <p className="step-desc">Thanh toán an toàn và nhận vé điện tử ngay lập tức qua email.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOVIES PREVIEW ===== */}
      <section className="movies-preview" id="movies">
        <div className="section-inner">
          <div className="section-label">🔥 Đang hot</div>
          <h2 className="section-title">Phim nổi bật tuần này</h2>
          <div className="movies-preview-grid">
            {MOVIES.map((m, i) => (
              <div key={i} className="movie-preview-card">
                <div
                  className="movie-preview-poster"
                  style={{ background: MOVIE_GRADIENTS[i] }}
                >
                  <span className="movie-preview-emoji">🎬</span>
                  <div className="movie-preview-rating">⭐ {m.rating}</div>
                </div>
                <div className="movie-preview-info">
                  <h4 className="movie-preview-title">{m.title}</h4>
                  <p className="movie-preview-genre">{m.genre}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="movies-preview-cta">
            <Link to="/login" className="hero-btn-primary">
              Xem tất cả phim →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-glow" />
          <h2 className="cta-title">Sẵn sàng trải nghiệm?</h2>
          <p className="cta-subtitle">
            Đăng ký miễn phí ngay hôm nay và nhận ngay ưu đãi đặc biệt cho lần đầu đặt vé!
          </p>
          <div className="cta-actions">
            <Link to="/register" className="hero-btn-primary">
              🎬 Tạo tài khoản miễn phí
            </Link>
            <Link to="/login" className="cta-login-link">
              Đã có tài khoản? Đăng nhập ngay
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo" style={{ marginBottom: '12px' }}>
              <span className="landing-logo-icon">🎬</span>
              <span className="landing-logo-text">CineBooking</span>
            </div>
            <p className="footer-tagline">Trải nghiệm điện ảnh đỉnh cao tại mọi nơi, mọi lúc.</p>
          </div>
          <div className="footer-links-col">
            <h4>Dịch vụ</h4>
            <a href="#features">Tính năng</a>
            <a href="#movies">Phim đang chiếu</a>
            <a href="#stats">Về chúng tôi</a>
          </div>
          <div className="footer-links-col">
            <h4>Tài khoản</h4>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
            <Link to="/forgot-password">Quên mật khẩu</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 CineBooking. Nền tảng đặt vé xem phim hàng đầu Việt Nam.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
