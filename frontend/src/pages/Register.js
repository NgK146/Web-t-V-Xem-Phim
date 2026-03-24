import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const Register = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const navigate = useNavigate();

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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Đăng ký tài khoản</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              {...register('name', { required: 'Họ và tên là bắt buộc' })}
              className={errors.name ? 'input-error' : ''}
              placeholder="Nhập họ và tên"
            />
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Email không hợp lệ'
                }
              })}
              className={errors.email ? 'input-error' : ''}
              placeholder="Nhập email"
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              {...register('password', { 
                required: 'Mật khẩu là bắt buộc',
                minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự' }
              })}
              className={errors.password ? 'input-error' : ''}
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
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
              placeholder="Nhập lại mật khẩu"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
