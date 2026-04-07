import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.data);
      toast.success('Đăng nhập thành công!');
      if (response.data.data.user.role === 'admin') {
        navigate('/admin');
      } else if (response.data.data.user.role === 'staff') {
        navigate('/staff/checkin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Panel */}
      <div className="auth-split-left">
        <div className="auth-left-content">
          <Link to="/landing" className="auth-back-btn">← Trang chủ</Link>
          <div className="auth-brand">
            <div className="auth-brand-icon">🎬</div>
            <h1 className="auth-brand-name">CineBooking</h1>
          </div>
          <div className="auth-left-headline">
            <h2>Chào mừng trở lại!</h2>
            <p>Đặt vé xem phim yêu thích chỉ trong vài giây. Hàng trăm bộ phim đang chờ bạn.</p>
          </div>
          <div className="auth-left-stats">
            <div className="auth-stat">
              <span className="auth-stat-value">500K+</span>
              <span className="auth-stat-label">Người dùng</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-value">200+</span>
              <span className="auth-stat-label">Phim chiếu</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-value">4.9★</span>
              <span className="auth-stat-label">Đánh giá</span>
            </div>
          </div>
          <div className="auth-left-reviews">
            <div className="auth-review">
              <div className="auth-review-stars">⭐⭐⭐⭐⭐</div>
              <p>"Đặt vé siêu nhanh, giao diện đẹp, tôi dùng mỗi cuối tuần!"</p>
              <span>— Nguyễn Minh Tú, TP.HCM</span>
            </div>
          </div>
        </div>
        <div className="auth-left-deco">
          <div className="deco-circle deco-c1" />
          <div className="deco-circle deco-c2" />
          <div className="deco-circle deco-c3" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-split-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Đăng nhập</h2>
            <p className="auth-form-subtitle">Nhập thông tin tài khoản của bạn để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-new">
            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">📧</span> Email
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email là bắt buộc' })}
                className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                placeholder="example@email.com"
              />
              {errors.email && <span className="auth-error-msg">{errors.email.message}</span>}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">🔐</span> Mật khẩu
              </label>
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Mật khẩu là bắt buộc' })}
                  className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                  placeholder="Nhập mật khẩu của bạn"
                />
                <button
                  type="button"
                  className="auth-show-pass"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="auth-error-msg">{errors.password.message}</span>}
            </div>

            <div className="auth-forgot-row">
              <Link to="/forgot-password" className="auth-forgot-link">Quên mật khẩu?</Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? (
                <><span className="auth-spinner" /> Đang xử lý...</>
              ) : (
                '🚀 Đăng nhập'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>hoặc</span>
          </div>

          <div className="auth-switch">
            <p>Chưa có tài khoản?</p>
            <Link to="/register" className="auth-switch-link">
              Đăng ký miễn phí ngay →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
