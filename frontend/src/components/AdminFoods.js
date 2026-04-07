import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { foodsApi } from '../api/foods.api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const EMPTY_FORM = {
  name: '', description: '', price: '', type: 'combo', isActive: true
};

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await foodsApi.getAllAdmin();
      let data = res.data.data;
      if (search) {
        data = data.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (typeFilter) {
        data = data.filter(f => f.type === typeFilter);
      }
      setFoods(data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách Bắp/Nước');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  const handleAdd = () => {
    setEditingFood(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setForm({
      name: food.name,
      description: food.description || '',
      price: food.price,
      type: food.type || 'combo',
      isActive: food.isActive
    });
    setImageFile(null);
    setImagePreview(food.image || '');
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xoá món: ${name}?`)) return;
    try {
      await foodsApi.delete(id);
      toast.success('Đã xóa món ăn');
      fetchFoods();
    } catch (err) {
      toast.error('Lỗi khi xoá món');
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', Number(form.price));
      fd.append('type', form.type);
      fd.append('isActive', form.isActive);
      if (imageFile) fd.append('image', imageFile);

      if (editingFood) {
        await foodsApi.update(editingFood._id, fd);
        toast.success('Cập nhật thành công');
      } else {
        await foodsApi.create(fd);
        toast.success('Thêm mới thành công');
      }
      setShowModal(false);
      fetchFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi khi lưu món');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="admin-title">Quản Lý Bắp Nước (F&B)</h1>
            <p className="admin-subtitle">Bộ sưu tập Combo Đồ Gắp & Nước Uống</p>
          </div>
          <button className="movie-btn-add" onClick={handleAdd}>
            ➕ Thêm Món
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          className="admin-search"
          placeholder="🔍 Tìm kiếm món..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="admin-select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">Tất cả các loại</option>
          <option value="combo">Combo</option>
          <option value="snack">Đồ ăn vặt/Bắp</option>
          <option value="drink">Thức uống</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Đang tải...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên món</th>
                <th>Phân loại</th>
                <th>Giá bán</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {foods.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    Không có món ăn nào trong danh sách
                  </td>
                </tr>
              ) : foods.map(f => (
                <tr key={f._id}>
                  <td>
                    {f.image ? (
                      <img src={f.image.startsWith('http') ? f.image : `${BACKEND_URL}${f.image}`} alt={f.name} className="movie-poster-thumb" style={{ objectFit: 'contain', background: '#fff' }} />
                    ) : (
                      <div className="movie-poster-placeholder">🍿</div>
                    )}
                  </td>
                  <td>
                    <strong>{f.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 4 }}>{f.description}</div>
                  </td>
                  <td>
                    {f.type === 'combo' && <span className="role-badge admin">Combo</span>}
                    {f.type === 'snack' && <span className="role-badge user" style={{background: '#f59e0b', color:'#fff'}}>Bắp/Đồ ăn</span>}
                    {f.type === 'drink' && <span className="role-badge user" style={{background: '#3b82f6', color:'#fff'}}>Thức uống</span>}
                  </td>
                  <td><strong style={{ color: '#ef4444' }}>{f.price.toLocaleString()} đ</strong></td>
                  <td>
                    <span className={`status-badge ${f.isActive ? 'active' : 'banned'}`}>
                      {f.isActive ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn movie-btn-edit" onClick={() => handleEdit(f)}>✏️</button>
                      <button className="action-btn btn-delete" onClick={() => handleDelete(f._id, f.name)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="movie-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="movie-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="movie-modal-header">
              <h2>{editingFood ? 'Kế/Sửa Bắp Nước' : 'Thêm Món Mới'}</h2>
              <button className="movie-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="movie-form">
              <div className="movie-form-group">
                <label>Tên gọi *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="VD: Combo Mưa Đá" />
              </div>
              <div className="movie-form-group">
                <label>Phân loại *</label>
                <select name="type" value={form.type} onChange={handleChange} required>
                  <option value="combo">Combo</option>
                  <option value="snack">Đồ ăn vặt/Bắp</option>
                  <option value="drink">Nước giải khát</option>
                </select>
              </div>
              <div className="movie-form-group">
                <label>Mô tả chi tiết</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Bao gồm: 1 Bắp vị tùy chọn, 2 Nước ngọt cỡ lớn" />
              </div>
              <div className="movie-form-group">
                <label>Giá bán (VNĐ) *</label>
                <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required />
              </div>
              <div className="movie-form-group">
                <label>Hình ảnh đại diện {editingFood ? '' : '*'}</label>
                <input type="file" accept="image/*" onChange={handleFileChange} required={!editingFood && !imagePreview} />
                {imagePreview && (
                  <div style={{ marginTop: 10, padding: 8, background: '#fff', borderRadius: 8, display: 'inline-block' }}>
                     <img src={imagePreview} alt="Preview" style={{ height: 100, objectFit: 'contain' }} />
                  </div>
                )}
              </div>
              <div className="movie-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} style={{ width: 'auto' }} />
                  {" \u00a0\u00a0"} 🍔 Hiện lên màn hình cho khách đặt
                </label>
              </div>
              
              <div className="movie-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : (editingFood ? 'Cập Nhật' : 'Tạo Món')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
