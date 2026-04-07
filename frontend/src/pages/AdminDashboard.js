import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import AdminMovies from '../components/AdminMovies';
import AdminCinemas from '../components/AdminCinemas';
import AdminShowtimes from '../components/AdminShowtimes';
import AdminDiscounts from '../components/AdminDiscounts';
import AdminReports from '../components/AdminReports';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('users');
  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, search, role: roleFilter });
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success(`Đã cập nhật quyền thành ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật quyền');
    }
  };

  const handleToggleBan = async (userId, isBanned) => {
    const action = isBanned ? 'mở khoá' : 'khoá';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
    try {
      const res = await api.patch(`/users/${userId}/ban`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc muốn XÓA tài khoản của ${userName}? Hành động này không thể hoàn tác!`)) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Đã xóa người dùng');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa người dùng');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-icon">🎬</span>
          <span>CineBooking</span>
        </div>
        <div className="admin-admin-badge">
          <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="admin-name">{user?.name}</div>
            <div className="admin-role-tag">Quản trị viên</div>
          </div>
        </div>
        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span>👥</span> Người Dùng
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            <span>🎬</span> Quản Lý Phim
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'cinemas' ? 'active' : ''}`}
            onClick={() => setActiveTab('cinemas')}
          >
            <span>🏢</span> Rạp & Phòng
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'showtimes' ? 'active' : ''}`}
            onClick={() => setActiveTab('showtimes')}
          >
            <span>⏰</span> Suất Chiếu
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'discounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('discounts')}
          >
            <span>🎟️</span> Mã Giảm Giá
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span>📊</span> Báo Cáo
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <span>⚙️</span> Hệ Thống
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={() => navigate('/')}>
            <span>🏠</span> Trang Chủ
          </button>
          <button className="admin-nav-item admin-logout" onClick={handleLogout}>
            <span>🚪</span> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'users' && (
          <div>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Quản Lý Người Dùng</h1>
                <p className="admin-subtitle">Tổng cộng <strong>{total}</strong> tài khoản</p>
              </div>
            </div>

            {/* Filters */}
            <div className="admin-filters">
              <input
                type="text"
                className="admin-search"
                placeholder="🔍 Tìm kiếm theo tên hoặc email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              <select
                className="admin-select"
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              >
                <option value="">Tất cả vai trò</option>
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            {/* Table */}
            <div className="admin-table-wrap">
              {loading ? (
                <div className="admin-loading">Đang tải...</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Người Dùng</th>
                      <th>Email</th>
                      <th>Vai Trò</th>
                      <th>Trạng Thái</th>
                      <th>Ngày Tạo</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Không tìm thấy người dùng nào</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id} className={u.isBanned ? 'row-banned' : ''}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm">{u.name?.charAt(0).toUpperCase()}</div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <select
                            className={`role-badge ${u.role}`}
                            value={u.role}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                            disabled={u._id === user?.id}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <span className={`status-badge ${u.isBanned ? 'banned' : 'active'}`}>
                            {u.isBanned ? '🔒 Bị khoá' : '✅ Hoạt động'}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              className={`action-btn ${u.isBanned ? 'btn-unlock' : 'btn-ban'}`}
                              onClick={() => handleToggleBan(u._id, u.isBanned)}
                              disabled={u._id === user?.id}
                              title={u.isBanned ? 'Mở khoá' : 'Khoá tài khoản'}
                            >
                              {u.isBanned ? '🔓' : '🔒'}
                            </button>
                            <button
                              className="action-btn btn-delete"
                              onClick={() => handleDelete(u._id, u.name)}
                              disabled={u._id === user?.id}
                              title="Xoá tài khoản"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >← Trước</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >Sau →</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'movies' && <AdminMovies />}
        {activeTab === 'cinemas' && <AdminCinemas />}
        {activeTab === 'showtimes' && <AdminShowtimes />}
        {activeTab === 'discounts' && <AdminDiscounts />}
        {activeTab === 'reports' && <AdminReports />}

        {activeTab === 'stats' && (
          <div>
            <div className="admin-header">
              <h1 className="admin-title">Thống Kê Hệ Thống</h1>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{total}</div>
                <div className="stat-label">Tổng Người Dùng</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👑</div>
                <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
                <div className="stat-label">Quản Trị Viên</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔒</div>
                <div className="stat-value">{users.filter(u => u.isBanned).length}</div>
                <div className="stat-label">Tài Khoản Bị Khoá</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{users.filter(u => !u.isBanned).length}</div>
                <div className="stat-label">Tài Khoản Hoạt Động</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
