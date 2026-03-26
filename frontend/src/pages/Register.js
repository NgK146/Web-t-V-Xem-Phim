import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: 'Yếu', color: '#e71a0f' };
  if (score === 2) return { level: 2, label: 'Trung bình', color: '#f5a623' };
  if (score === 3) return { level: 3, label: 'Mạnh', color: '#27ae60' };
  return { level: 4, label: 'Rất mạnh', color: '#1abc9c' };
};

const Register = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const passwordValue = watch('password', '');
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
            <h1 className="auth-brand-name">CineBook</h1>
          </div>
          <div className="auth-left-headline">
            <h2>Tham gia cộng đồng!</h2>
            <p>Đăng ký miễn phí để đặt vé, nhận ưu đãi độc quyền và trải nghiệm phim cùng hàng triệu người dùng.</p>
          </div>
          <div className="auth-left-perks">
            <div className="auth-perk">
              <span className="auth-perk-icon">🎁</span>
              <div>
                <strong>Ưu đãi chào mừng</strong>
                <p>Giảm ngay 20% cho lần đặt vé đầu tiên</p>
              </div>
            </div>
            <div className="auth-perk">
              <span className="auth-perk-icon">💎</span>
              <div>
                <strong>Thành viên VIP</strong>
                <p>Tích điểm, đổi vé và combo hấp dẫn</p>
              </div>
            </div>
            <div className="auth-perk">
              <span className="auth-perk-icon">🔔</span>
              <div>
                <strong>Thông báo sớm</strong>
                <p>Nhận thông tin phim mới trước mọi người</p>
              </div>
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
            <h2 className="auth-form-title">Tạo tài khoản</h2>
            <p className="auth-form-subtitle">Miễn phí • Nhanh chóng • An toàn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-new">
            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">👤</span> Họ và tên
              </label>
              <input
                type="text"
                {...register('name', { required: 'Họ và tên là bắt buộc' })}
                className={`auth-input ${errors.name ? 'auth-input-error' : ''}`}
                placeholder="Nguyễn Văn A"
              />
              {errors.name && <span className="auth-error-msg">{errors.name.message}</span>}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">📧</span> Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: 'Email không hợp lệ'
                  }
                })}
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
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự' }
                  })}
                  className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                  placeholder="Tối thiểu 6 ký tự"
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
              {passwordValue && (
                <div className="password-strength-wrap">
                  <div className="password-strength-bar">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-segment"
                        style={{
                          background: i <= strength.level ? strength.color : '#e0e0e0',
                          transition: 'background 0.3s ease',
                        }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
              {errors.password && <span className="auth-error-msg">{errors.password.message}</span>}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">✅</span> Xác nhận mật khẩu
              </label>
              <div className="auth-password-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu',
                    validate: (val) => {
                      if (watch('password') !== val) return 'Mật khẩu không khớp';
                    }
                  })}
                  className={`auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className="auth-show-pass"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="auth-error-msg">{errors.confirmPassword.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? (
                <><span className="auth-spinner" /> Đang tạo tài khoản...</>
              ) : (
                '🎉 Đăng ký miễn phí'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>hoặc</span>
          </div>

          <div className="auth-switch">
            <p>Đã có tài khoản?</p>
            <Link to="/login" className="auth-switch-link">
              Đăng nhập ngay →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
