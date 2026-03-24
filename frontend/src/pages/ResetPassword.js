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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Đặt lại mật khẩu</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              {...register('password', { 
                required: 'Mật khẩu là bắt buộc',
                minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự' }
              })}
              className={errors.password ? 'input-error' : ''}
              placeholder="Nhập mật khẩu mới"
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu mới</label>
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
              className={errors.confirmPassword ? 'input-error' : ''}
              placeholder="Nhập lại mật khẩu mới"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
