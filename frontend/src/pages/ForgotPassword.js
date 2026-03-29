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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Quên mật khẩu</h2>
        
        {isSent ? (
          <div className="success-message">
            <p>Vui lòng kiểm tra email của bạn để lấy liên kết đặt lại mật khẩu.</p>
            <Link to="/login" className="btn-secondary">Quay lại đăng nhập</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <p className="instruction-text">Nhập email đã đăng ký của bạn để nhận liên kết khôi phục mật khẩu.</p>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email là bắt buộc' })}
                className={errors.email ? 'input-error' : ''}
                placeholder="Nhập email của bạn"
              />
              {errors.email && <span className="error-text">{errors.email.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </form>
        )}
        
        {!isSent && (
          <div className="auth-links">
            <Link to="/login">Nhớ mật khẩu? Đăng nhập</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
