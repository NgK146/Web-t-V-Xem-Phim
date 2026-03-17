import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bảng điều khiển Quản trị viên</h1>
      <div className="admin-card" style={{ background: '#f8d7da', color: '#721c24', padding: '2rem', borderRadius: '8px', display: 'inline-block' }}>
        <h2>Khu vực cấm dành cho người dùng thường</h2>
        <p>Xin chào Admin: <strong>{user?.name}</strong></p>
        <p>Bạn có toàn quyền truy cập tại đây.</p>
        
        <div style={{ marginTop: '2rem' }}>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Về Trang Chủ
          </button>
          <button onClick={handleLogout} className="btn-primary" style={{ marginLeft: '1rem' }}>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
