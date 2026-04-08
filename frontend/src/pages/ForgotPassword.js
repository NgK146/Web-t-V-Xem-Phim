import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data);
      setIsSent(true);
      toast.success('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
            <h2>Tìm lại mật khẩu</h2>
            <p>Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản của mình.</p>
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
            <h2 className="auth-form-title">Quên mật khẩu</h2>
            <p className="auth-form-subtitle">Nhập email đã đăng ký của bạn để nhận liên kết khôi phục.</p>
          </div>

          {isSent ? (
            <div className="success-message" style={{ textAlign: 'center', margin: '20px 0' }}>
              <p style={{ marginBottom: '16px', color: '#333' }}>Vui lòng kiểm tra email của bạn để lấy liên kết đặt lại mật khẩu.</p>
              <Link to="/login" className="auth-submit-btn" style={{ textDecoration: 'none', display: 'inline-block', lineHeight: '1' }}>Quay lại đăng nhập</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form-new">
              <div className="auth-field">
                <label className="auth-label">
                  <span className="auth-label-icon">📧</span> Email
                </label>
                <input
                  type="email"
                  {...register('email', { required: 'Email là bắt buộc' })}
                  className={`auth-input ${errors.email ? 'auth-input-error' : ''}`}
                  placeholder="Nhập email của bạn"
                />
                {errors.email && <span className="auth-error-msg">{errors.email.message}</span>}
              </div>

              <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
                {isSubmitting ? (
                  <><span className="auth-spinner" /> Đang gửi...</>
                ) : (
                  '🚀 Gửi yêu cầu'
                )}
              </button>
            </form>
          )}

          {!isSent && (
            <div className="auth-switch">
              <p>Nhớ mật khẩu?</p>
              <Link to="/login" className="auth-switch-link" style={{ marginLeft: '6px' }}>
                Đăng nhập ngay →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
