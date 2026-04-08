import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.patch(`/auth/reset-password/${token}`, {
        password: data.password
      });
      toast.success('Mật khẩu của bạn đã được cập nhật thành công!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.');
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
            <h2>Thiết lập mật khẩu mới</h2>
            <p>Bảo mật tài khoản của bạn bằng một mật khẩu mạnh và dễ nhớ.</p>
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
            <h2 className="auth-form-title">Đặt lại mật khẩu</h2>
            <p className="auth-form-subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-new">
            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">🔐</span> Mật khẩu mới
              </label>
              <input
                type="password"
                {...register('password', { 
                  required: 'Mật khẩu là bắt buộc',
                  minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự' }
                })}
                className={`auth-input ${errors.password ? 'auth-input-error' : ''}`}
                placeholder="Nhập mật khẩu mới"
              />
              {errors.password && <span className="auth-error-msg">{errors.password.message}</span>}
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">🔄</span> Xác nhận mật khẩu
              </label>
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: (val) => {
                    if (watch('password') != val) {
                      return "Mật khẩu không khớp";
                    }
                  }
                })}
                className={`auth-input ${errors.confirmPassword ? 'auth-input-error' : ''}`}
                placeholder="Nhập lại mật khẩu mới"
              />
              {errors.confirmPassword && <span className="auth-error-msg">{errors.confirmPassword.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? (
                <><span className="auth-spinner" /> Đang cập nhật...</>
              ) : (
                '✅ Cập nhật thay đổi'
              )}
            </button>
          </form>
          
          <div className="auth-switch">
            <Link to="/login" className="auth-switch-link">
              ← Trở về đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
