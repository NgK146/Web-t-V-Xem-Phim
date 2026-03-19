import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.data);
      toast.success('Đăng nhập thành công!');
      
      // Chuyển hướng dựa trên vai trò
      if (response.data.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              {...register('password', { required: 'Mật khẩu là bắt buộc' })}
              className={errors.password ? 'input-error' : ''}
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Đường xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
          <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
