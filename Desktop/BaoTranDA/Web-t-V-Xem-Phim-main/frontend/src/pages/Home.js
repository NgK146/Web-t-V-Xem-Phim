import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Home = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="home-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Trang chủ</h1>
      {user ? (
        <div className="user-profile">
          <p>Xin chào, <strong>{user.name}</strong>!</p>
          <p>Email: {user.email}</p>
          <p>Vai trò: {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
          
          <button onClick={handleLogout} className="btn-secondary" style={{ marginTop: '1rem' }}>
            Đăng xuất
          </button>
          
          {user.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')} 
              className="btn-primary" 
              style={{ marginTop: '1rem', marginLeft: '1rem' }}
            >
              Vào trang quản trị
            </button>
          )}
        </div>
      ) : (
        <div>
          <p>Bạn chưa đăng nhập.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Đi đến đăng nhập
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
