import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AdminCinemas = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [cinemaForm, setCinemaForm] = useState({ name: '', address: '', city: '', phone: '', image: '' });

  const [selectedCinema, setSelectedCinema] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', type: '2D', rows: 10, cols: 12 });

  const fetchCinemas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/cinemas');
      setCinemas(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách rạp');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRooms = useCallback(async (cinemaId) => {
    setLoadingRooms(true);
    try {
      const res = await api.get(`/cinemas/${cinemaId}/rooms`);
      setRooms(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách phòng');
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => { fetchCinemas(); }, [fetchCinemas]);

  useEffect(() => {
    if (selectedCinema) fetchRooms(selectedCinema._id);
  }, [selectedCinema, fetchRooms]);

  const handleSaveCinema = async (e) => {
    e.preventDefault();
    try {
      if (editingCinema) {
        await api.put(`/cinemas/${editingCinema._id}`, cinemaForm);
        toast.success('Cập nhật rạp thành công');
      } else {
        await api.post('/cinemas', cinemaForm);
        toast.success('Thêm rạp thành công');
      }
      setShowCinemaModal(false);
      fetchCinemas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu rạp');
    }
  };

  const handleDeleteCinema = async (id, name) => {
    if (!window.confirm(`Xoá rạp "${name}" sẽ xoá tất cả phòng và suất chiếu liên quan. Bạn chắc chắn?`)) return;
    try {
      await api.delete(`/cinemas/${id}`);
      toast.success('Đã xoá rạp');
      if (selectedCinema?._id === id) setSelectedCinema(null);
      fetchCinemas();
    } catch (err) {
      toast.error('Lỗi khi xoá rạp');
    }
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cinemas/${selectedCinema._id}/rooms`, roomForm);
      toast.success('Thêm phòng thành công');
      setShowRoomModal(false);
      fetchRooms(selectedCinema._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi thêm phòng');
    }
  };

  const handleDeleteRoom = async (id, name) => {
    if (!window.confirm(`Xoá phòng "${name}"?`)) return;
    try {
      await api.delete(`/cinemas/rooms/${id}`);
      toast.success('Đã xoá phòng');
      fetchRooms(selectedCinema._id);
    } catch (err) {
      toast.error('Lỗi khi xoá phòng');
    }
  };

  return (
    <div className="admin-cinemas-container">
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 className="admin-title">Quản Lý Rạp & Phòng Chiếu</h1>
            <p className="admin-subtitle">Quản lý hệ thống cụm rạp và cấu hình phòng phim</p>
          </div>
          <button className="movie-btn-add" onClick={() => { setEditingCinema(null); setCinemaForm({ name: '', address: '', city: '', phone: '', image: '' }); setShowCinemaModal(true); }}>
            ➕ Thêm Cụm Rạp
          </button>
        </div>
      </div>

      <div className="cinemas-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', marginTop: '1.5rem' }}>
        {/* Cinema List */}
        <div className="cinema-sidebar-list">
          <h3 style={{ marginBottom: '1rem', color: '#1a1a2e' }}>Danh Sách Cụm Rạp</h3>
          {loading ? <p>Đang tải...</p> : (
            <div className="cinema-items">
              {cinemas.map(c => (
                <div 
                  key={c._id} 
                  className={`cinema-item-card ${selectedCinema?._id === c._id ? 'active' : ''}`}
                  onClick={() => setSelectedCinema(c)}
                  style={{
                    background: selectedCinema?._id === c._id ? 'rgba(229, 9, 20, 0.1)' : '#fff',
                    border: selectedCinema?._id === c._id ? '1px solid #e50914' : '1px solid #ddd',
                    padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem', cursor: 'pointer', transition: '0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: selectedCinema?._id === c._id ? '#e50914' : '#1a1a2e' }}>{c.name}</strong>
                    <div className="small-actions">
                       <button onClick={(e) => { e.stopPropagation(); setEditingCinema(c); setCinemaForm(c); setShowCinemaModal(true); }}>✏️</button>
                       <button onClick={(e) => { e.stopPropagation(); handleDeleteCinema(c._id, c.name); }}>🗑️</button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>{c.city} - {c.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Room Management Area */}
        <div className="room-management-area">
          {selectedCinema ? (
            <div className="room-card-panel" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#1a1a2e' }}>Phòng Chiếu tại <span style={{ color: '#e50914' }}>{selectedCinema.name}</span></h3>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', width: 'auto' }} onClick={() => setShowRoomModal(true)}>
                  ➕ Thêm Phòng
                </button>
              </div>

              {loadingRooms ? <p>Đang tải phòng...</p> : (
                <div className="rooms-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên Phòng</th>
                        <th>Loại</th>
                        <th>Số Ghế</th>
                        <th>Trạng Thái</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có phòng nào</td></tr>
                      ) : rooms.map(r => (
                        <tr key={r._id}>
                          <td><strong>{r.name}</strong></td>
                          <td><span className="type-badge" style={{ background: '#e50914', padding: '2px 8px', borderRadius: '4px' }}>{r.type}</span></td>
                          <td>{r.totalSeats} ghế</td>
                          <td>{r.isActive ? '✅ Hoạt động' : '❌ Ngừng'}</td>
                          <td>
                            <button className="action-btn" onClick={() => handleDeleteRoom(r._id, r.name)}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ddd', borderRadius: '12px', color: '#999', background: '#fff' }}>
              Chọn một cụm rạp để quản lý phòng chiếu
            </div>
          )}
        </div>
      </div>

      {/* Cinema Modal */}
      {showCinemaModal && (
        <div className="movie-modal-overlay">
          <div className="movie-modal" style={{ maxWidth: '500px' }}>
            <div className="movie-modal-header">
              <h2>{editingCinema ? 'Sửa Cụm Rạp' : 'Thêm Cụm Rạp Mới'}</h2>
              <button onClick={() => setShowCinemaModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveCinema} className="movie-form">
              <div className="movie-form-group">
                <label>Tên cụm rạp *</label>
                <input required value={cinemaForm.name} onChange={e => setCinemaForm({...cinemaForm, name: e.target.value})} />
              </div>
              <div className="movie-form-group">
                <label>Thành phố *</label>
                <input required value={cinemaForm.city} onChange={e => setCinemaForm({...cinemaForm, city: e.target.value})} placeholder="Hồ Chí Minh, Hà Nội..." />
              </div>
              <div className="movie-form-group">
                <label>Địa chỉ *</label>
                <input required value={cinemaForm.address} onChange={e => setCinemaForm({...cinemaForm, address: e.target.value})} />
              </div>
              <div className="movie-form-group">
                <label>Số điện thoại</label>
                <input value={cinemaForm.phone} onChange={e => setCinemaForm({...cinemaForm, phone: e.target.value})} />
              </div>
              <div className="movie-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCinemaModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">{editingCinema ? 'Cập Nhật' : 'Tạo Mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="movie-modal-overlay">
          <div className="movie-modal" style={{ maxWidth: '500px' }}>
            <div className="movie-modal-header">
              <h2>Thêm Phòng Chiếu Mới</h2>
              <button onClick={() => setShowRoomModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveRoom} className="movie-form">
              <div className="movie-form-group">
                <label>Tên phòng (VD: Phòng 01) *</label>
                <input required value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} />
              </div>
              <div className="movie-form-group">
                <label>Loại phòng</label>
                <select value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})}>
                  <option value="2D">2D Standard</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                  <option value="4DX">4DX</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="movie-form-group">
                  <label>Số hàng ghế (A, B, C...)</label>
                  <input type="number" min="1" max="26" value={roomForm.rows} onChange={e => setRoomForm({...roomForm, rows: parseInt(e.target.value)})} />
                </div>
                <div className="movie-form-group">
                  <label>Số ghế mỗi hàng</label>
                  <input type="number" min="1" max="30" value={roomForm.cols} onChange={e => setRoomForm({...roomForm, cols: parseInt(e.target.value)})} />
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>* Hệ thống sẽ tự động tạo {roomForm.rows * roomForm.cols} ghế cho phòng này.</p>
              <div className="movie-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowRoomModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Tạo Phòng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCinemas;
