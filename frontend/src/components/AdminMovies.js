import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { moviesApi } from '../api/movies.api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

const EMPTY_FORM = {
  title: '', description: '', genre: '', director: '', cast: '',
  duration: '', releaseDate: '', endDate: '', language: 'Vietsub',
  rated: 'P', status: 'coming_soon', trailer: '',
};

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const limit = 10;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      const res = await moviesApi.getAll(params);
      setMovies(res.data.data.movies);
      setPagination(res.data.data.pagination || {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  // Open add modal
  const handleAdd = () => {
    setEditingMovie(null);
    setForm(EMPTY_FORM);
    setPosterFile(null);
    setPosterPreview('');
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: (movie.genre || []).join(', '),
      director: movie.director || '',
      cast: (movie.cast || []).join(', '),
      duration: movie.duration || '',
      releaseDate: movie.releaseDate ? movie.releaseDate.slice(0, 10) : '',
      endDate: movie.endDate ? movie.endDate.slice(0, 10) : '',
      language: movie.language || 'Vietsub',
      rated: movie.rated || 'P',
      status: movie.status || 'coming_soon',
      trailer: movie.trailer || '',
    });
    setPosterFile(null);
    setPosterPreview(movie.poster || '');
    setShowModal(true);
  };

  // Delete movie
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn XÓA phim "${title}"?`)) return;
    try {
      await moviesApi.delete(id);
      toast.success('Đã xóa phim thành công');
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa phim');
    }
  };

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle poster file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Always use FormData so we can attach poster file for both create & update
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('director', form.director);
      fd.append('duration', Number(form.duration));
      fd.append('releaseDate', form.releaseDate);
      fd.append('language', form.language);
      fd.append('rated', form.rated);
      fd.append('status', form.status);
      if (form.endDate) fd.append('endDate', form.endDate);
      if (form.trailer) fd.append('trailer', form.trailer);
      form.genre.split(',').map(g => g.trim()).filter(Boolean).forEach(g => fd.append('genre', g));
      form.cast.split(',').map(c => c.trim()).filter(Boolean).forEach(c => fd.append('cast', c));
      if (posterFile) fd.append('poster', posterFile);

      if (editingMovie) {
        await moviesApi.update(editingMovie._id, fd);
        toast.success('Cập nhật phim thành công');
      } else {
        await moviesApi.create(fd);
        toast.success('Thêm phim thành công');
      }
      setShowModal(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu phim');
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = (s) => {
    switch (s) {
      case 'now_showing': return 'Đang chiếu';
      case 'coming_soon': return 'Sắp chiếu';
      case 'ended': return 'Đã kết thúc';
      default: return s;
    }
  };

  const statusClass = (s) => {
    switch (s) {
      case 'now_showing': return 'movie-status-showing';
      case 'coming_soon': return 'movie-status-coming';
      case 'ended': return 'movie-status-ended';
      default: return '';
    }
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="admin-title">Quản Lý Phim</h1>
            <p className="admin-subtitle">
              Tổng cộng <strong>{pagination.total || movies.length}</strong> phim
            </p>
          </div>
          <button className="movie-btn-add" onClick={handleAdd}>
            ➕ Thêm Phim
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text"
          className="admin-search"
          placeholder="🔍 Tìm kiếm theo tên phim..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="now_showing">Đang chiếu</option>
          <option value="coming_soon">Sắp chiếu</option>
          <option value="ended">Đã kết thúc</option>
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
                <th>Poster</th>
                <th>Tên Phim</th>
                <th>Thể Loại</th>
                <th>Thời Lượng</th>
                <th>Trạng Thái</th>
                <th>Ngày Chiếu</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {movies.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    Không tìm thấy phim nào
                  </td>
                </tr>
              ) : movies.map(m => (
                <tr key={m._id}>
                  <td>
                    {m.poster ? (
                      <img src={m.poster.startsWith('http') ? m.poster : `${BACKEND_URL}${m.poster}`} alt={m.title} className="movie-poster-thumb" />
                    ) : (
                      <div className="movie-poster-placeholder">🎬</div>
                    )}
                  </td>
                  <td>
                    <div className="movie-title-cell">
                      <strong>{m.title}</strong>
                      <span className="movie-director">{m.director}</span>
                    </div>
                  </td>
                  <td>{(m.genre || []).join(', ')}</td>
                  <td>{m.duration} phút</td>
                  <td>
                    <span className={`status-badge ${statusClass(m.status)}`}>
                      {statusLabel(m.status)}
                    </span>
                  </td>
                  <td>{new Date(m.releaseDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn movie-btn-edit"
                        onClick={() => handleEdit(m)}
                        title="Sửa phim"
                      >✏️</button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDelete(m._id, m.title)}
                        title="Xóa phim"
                      >🗑️</button>
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
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ← Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Sau →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="movie-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="movie-modal" onClick={e => e.stopPropagation()}>
            <div className="movie-modal-header">
              <h2>{editingMovie ? 'Sửa Phim' : 'Thêm Phim Mới'}</h2>
              <button className="movie-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="movie-form">
              <div className="movie-form-grid">
                <div className="movie-form-group">
                  <label>Tên phim *</label>
                  <input name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div className="movie-form-group">
                  <label>Đạo diễn</label>
                  <input name="director" value={form.director} onChange={handleChange} />
                </div>
                <div className="movie-form-group movie-form-full">
                  <label>Mô tả *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={3} />
                </div>
                <div className="movie-form-group">
                  <label>Thể loại (cách nhau bởi dấu phẩy)</label>
                  <input name="genre" value={form.genre} onChange={handleChange} placeholder="Hành động, Phiêu lưu" />
                </div>
                <div className="movie-form-group">
                  <label>Diễn viên (cách nhau bởi dấu phẩy)</label>
                  <input name="cast" value={form.cast} onChange={handleChange} placeholder="Nguyễn A, Trần B" />
                </div>
                <div className="movie-form-group">
                  <label>Thời lượng (phút) *</label>
                  <input name="duration" type="number" value={form.duration} onChange={handleChange} required min={1} />
                </div>
                <div className="movie-form-group">
                  <label>Ngày chiếu *</label>
                  <input name="releaseDate" type="date" value={form.releaseDate} onChange={handleChange} required />
                </div>
                <div className="movie-form-group">
                  <label>Ngày kết thúc</label>
                  <input name="endDate" type="date" value={form.endDate} onChange={handleChange} />
                </div>
                <div className="movie-form-group">
                  <label>Ngôn ngữ</label>
                  <input name="language" value={form.language} onChange={handleChange} />
                </div>
                <div className="movie-form-group">
                  <label>Phân loại</label>
                  <select name="rated" value={form.rated} onChange={handleChange}>
                    <option value="P">P - Phổ thông</option>
                    <option value="K">K - Dưới 13 tuổi</option>
                    <option value="T13">T13 - 13 tuổi trở lên</option>
                    <option value="T16">T16 - 16 tuổi trở lên</option>
                    <option value="T18">T18 - 18 tuổi trở lên</option>
                  </select>
                </div>
                <div className="movie-form-group">
                  <label>Trạng thái</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="coming_soon">Sắp chiếu</option>
                    <option value="now_showing">Đang chiếu</option>
                    <option value="ended">Đã kết thúc</option>
                  </select>
                </div>
                <div className="movie-form-group">
                  <label>Trailer URL</label>
                  <input name="trailer" value={form.trailer} onChange={handleChange} placeholder="https://..." />
                </div>
                {/* Poster upload — show for both create AND edit */}
                <div className="movie-form-group movie-form-full">
                  <label>{editingMovie ? 'Thay Poster (để trống nếu không đổi)' : 'Poster *'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editingMovie}
                  />
                  {posterPreview && (
                    <img src={posterPreview} alt="Preview" className="movie-poster-preview" />
                  )}
                </div>
              </div>
              <div className="movie-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={saving}
                  style={{ width: 'auto', padding: '10px 28px' }}>
                  {saving ? 'Đang lưu...' : (editingMovie ? 'Cập Nhật' : 'Thêm Phim')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;
