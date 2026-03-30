import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    movie: '',
    cinema: '',
    room: '',
    date: '',
    time: '',
    basePrice: 50000
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resShow, resMov, resCin] = await Promise.all([
        api.get('/showtimes'),
        api.get('/movies?limit=100'),
        api.get('/cinemas')
      ]);
      setShowtimes(resShow.data.data);
      setMovies(resMov.data.data.movies);
      setCinemas(resCin.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCinemaChange = async (e) => {
    const cinemaId = e.target.value;
    setForm(prev => ({ ...prev, cinema: cinemaId, room: '' }));
    if (cinemaId) {
      try {
        const res = await api.get(`/cinemas/${cinemaId}/rooms`);
        setRooms(res.data.data);
      } catch (err) {
        toast.error('Lỗi khi tải phòng');
      }
    } else {
      setRooms([]);
    }
  };

  const handleEdit = async (s) => {
    setEditingId(s._id);
    const startDate = new Date(s.startTime);
    const yyyy = startDate.getFullYear();
    const mm = String(startDate.getMonth() + 1).padStart(2, '0');
    const dd = String(startDate.getDate()).padStart(2, '0');
    const hh = String(startDate.getHours()).padStart(2, '0');
    const min = String(startDate.getMinutes()).padStart(2, '0');

    setForm({
      movie: s.movie?._id,
      cinema: s.room?.cinema?._id,
      room: s.room?._id,
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`,
      basePrice: s.basePrice
    });

    // Populate rooms for the cinema
    if (s.room?.cinema?._id) {
        try {
            const res = await api.get(`/cinemas/${s.room.cinema._id}/rooms`);
            setRooms(res.data.data);
        } catch (err) { toast.error('Lỗi khi tải phòng'); }
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedMovie = movies.find(m => m._id === form.movie);
      if (!selectedMovie) return;

      const startTime = new Date(`${form.date}T${form.time}`);
      const endTime = new Date(startTime.getTime() + (selectedMovie.duration + 30) * 60000);

      const payload = {
        movie: form.movie,
        room: form.room,
        startTime,
        endTime,
        basePrice: form.basePrice
      };

      if (editingId) {
        await api.put(`/showtimes/${editingId}`, payload);
        toast.success('Cập nhật suất chiếu thành công');
      } else {
        await api.post('/showtimes', payload);
        toast.success('Tạo suất chiếu thành công');
      }

      setShowModal(false);
      setEditingId(null);
      setForm({ movie: '', cinema: '', room: '', date: '', time: '', basePrice: 90000 });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu suất chiếu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá suất chiếu này?')) return;
    try {
      await api.delete(`/showtimes/${id}`);
      toast.success('Đã xoá');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xoá');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 className="admin-title">Quản Lý Suất Chiếu</h1>
            <p className="admin-subtitle">Thiết lập lịch chiếu phim cho các rạp</p>
          </div>
          <button className="movie-btn-add" onClick={() => { 
            setEditingId(null); 
            setForm({ movie: '', cinema: '', room: '', date: '', time: '', basePrice: 90000 });
            setShowModal(true); 
          }}>
            ➕ Thêm Suất Chiếu
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? <p>Đang tải...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Phim</th>
                <th>Cụm Rạp</th>
                <th>Phòng</th>
                <th>Bắt Đầu</th>
                <th>Giá Cơ Bản</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có suất chiếu nào</td></tr>
              ) : showtimes.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.movie?.title}</strong></td>
                  <td>{s.room?.cinema?.name}</td>
                  <td>{s.room?.name}</td>
                  <td>
                    <div style={{ color: '#333', fontWeight: '500' }}>{new Date(s.startTime).toLocaleDateString('vi-VN')}</div>
                    <div style={{ color: '#e50914', fontWeight: 'bold', fontSize: '1.1rem' }}>{new Date(s.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td>{s.basePrice?.toLocaleString()}đ</td>
                  <td>
                    <span className={`status-badge ${s.status === 'scheduled' ? 'active' : 'banned'}`}>
                      {s.status === 'scheduled' ? 'Sắp chiếu' : s.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn" style={{ marginRight: '8px' }} onClick={() => handleEdit(s)}>✏️</button>
                    <button className="action-btn" onClick={() => handleDelete(s._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="movie-modal-overlay">
          <div className="movie-modal" style={{ maxWidth: '600px' }}>
            <div className="movie-modal-header">
              <h2>{editingId ? 'Cập Nhật Suất Chiếu' : 'Tạo Suất Chiếu Mới'}</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="movie-form">
              <div className="movie-form-group">
                <label>Phim *</label>
                <select required value={form.movie} onChange={e => setForm({...form, movie: e.target.value})}>
                   <option value="">-- Chọn phim --</option>
                   {movies.map(m => <option key={m._id} value={m._id}>{m.title} ({m.duration}p)</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="movie-form-group">
                  <label>Cụm Rạp *</label>
                  <select required value={form.cinema} onChange={handleCinemaChange}>
                    <option value="">-- Chọn rạp --</option>
                    {cinemas.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="movie-form-group">
                  <label>Phòng *</label>
                  <select required value={form.room} onChange={e => setForm({...form, room: e.target.value})} disabled={!form.cinema}>
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="movie-form-group">
                  <label>Ngày chiếu *</label>
                  <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="movie-form-group">
                  <label>Giờ bắt đầu *</label>
                  <input type="time" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                </div>
              </div>
              <div className="movie-form-group">
                <label>Giá vé cơ bản (VNĐ) *</label>
                <input type="number" required step="1000" min="10000" value={form.basePrice} onChange={e => setForm({...form, basePrice: parseInt(e.target.value)})} />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>
                * Giờ kết thúc sẽ tự động tính dựa trên thời lượng phim (+30 phút dọn phòng).
              </p>
              <div className="movie-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">{editingId ? 'Cập Nhật' : 'Tạo Suất Chiếu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowtimes;
