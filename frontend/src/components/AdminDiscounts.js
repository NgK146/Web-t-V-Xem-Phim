import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  const initialForm = {
    code: '',
    type: 'percent',
    value: 10,
    minOrder: 0,
    maxDiscount: 100000,
    usageLimit: 100,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isActive: true
  };

  const [form, setForm] = useState(initialForm);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/discounts');
      setDiscounts(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải mã giảm giá');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  const handleEdit = (d) => {
    setEditingDiscount(d);
    setForm({
      ...d,
      startDate: d.startDate.slice(0, 10),
      endDate: d.endDate.slice(0, 10)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, code: form.code.toUpperCase() };
      if (editingDiscount) {
        await api.put(`/discounts/${editingDiscount._id}`, data);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/discounts', data);
        toast.success('Tạo mã giảm giá thành công');
      }
      setShowModal(false);
      fetchDiscounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu mã');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoá mã giảm giá này?')) return;
    try {
      await api.delete(`/discounts/${id}`);
      toast.success('Đã xoá');
      fetchDiscounts();
    } catch (err) {
      toast.error('Lỗi khi xoá');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 className="admin-title">Quản Lý Mã Giảm Giá</h1>
            <p className="admin-subtitle">Tạo và quản lý các thủ thuật marketing, khuyến mãi</p>
          </div>
          <button className="movie-btn-add" onClick={() => { setEditingDiscount(null); setForm(initialForm); setShowModal(true); }}>
            ➕ Thêm Mã Mới
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? <p>Đang tải...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Loại</th>
                <th>Giá Trị</th>
                <th>Lượt Dùng</th>
                <th>Thời Gian</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có mã giảm giá nào</td></tr>
              ) : discounts.map(d => (
                <tr key={d._id}>
                  <td><code style={{ fontSize: '1.1rem', background: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '4px', color: '#e50914', border: '1px solid rgba(229,9,20,0.2)' }}>{d.code}</code></td>
                  <td>{d.type === 'percent' ? 'Phần trăm (%)' : 'Cố định (đ)'}</td>
                  <td><strong>{d.type === 'percent' ? `${d.value}%` : `${d.value.toLocaleString()}đ`}</strong></td>
                  <td>{d.usedCount} / {d.usageLimit || '∞'}</td>
                  <td>
                    <div style={{ color: '#333', fontWeight: '500' }}>{new Date(d.startDate).toLocaleDateString('vi-VN')}</div>
                    <div style={{ color: '#e50914', fontWeight: 'bold', fontSize: '1.1rem' }}>{new Date(d.endDate).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${d.isActive ? 'active' : 'banned'}`}>
                      {d.isActive ? 'Đang bật' : 'Đã tắt'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" onClick={() => handleEdit(d)}>✏️</button>
                      <button className="action-btn" onClick={() => handleDelete(d._id)}>🗑️</button>
                    </div>
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
              <h2>{editingDiscount ? 'Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="movie-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="movie-form-group">
                  <label>Mã (Code) *</label>
                  <input required style={{ textTransform: 'uppercase' }} value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="VD: KM50" />
                </div>
                <div className="movie-form-group">
                  <label>Loại giảm giá</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="movie-form-group">
                  <label>Giá trị giảm *</label>
                  <input type="number" required min="1" value={form.value} onChange={e => setForm({...form, value: parseInt(e.target.value)})} />
                </div>
                <div className="movie-form-group">
                  <label>Giảm tối đa (VNĐ)</label>
                  <input type="number" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: parseInt(e.target.value)})} placeholder="Để trống nếu không giới hạn" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="movie-form-group">
                  <label>Đơn hàng tối thiểu (VNĐ)</label>
                  <input type="number" value={form.minOrder} onChange={e => setForm({...form, minOrder: parseInt(e.target.value)})} />
                </div>
                <div className="movie-form-group">
                  <label>Số lượt sử dụng tối đa</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: parseInt(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="movie-form-group">
                  <label>Ngày bắt đầu *</label>
                  <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="movie-form-group">
                  <label>Ngày kết thúc *</label>
                  <input type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>
              <div className="movie-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
                  Đang hoạt động
                </label>
              </div>
              <div className="movie-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">{editingDiscount ? 'Cập Nhật' : 'Tạo Mã'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;
