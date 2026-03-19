import React from 'react';

const MovieFilters = ({ filters, onFilterChange }) => {
  const genres = [
    'Hành động', 'Hài hước', 'Kinh dị', 'Lãng mạn', 'Hoạt hình', 
    'Phiêu lưu', 'Viễn tưởng', 'Tâm lý', 'Gia đình'
  ];

  const ratings = ['P', 'K', 'T13', 'T16', 'T18'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="filters-container">
      <div className="filter-group">
        <label htmlFor="q">Tìm kiếm</label>
        <input
          type="text"
          id="q"
          name="q"
          className="filter-input"
          placeholder="Nhập tên phim..."
          value={filters.q || ''}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="genre">Thể loại</label>
        <select
          id="genre"
          name="genre"
          className="filter-select"
          value={filters.genre || ''}
          onChange={handleChange}
        >
          <option value="">Tất cả thể loại</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status">Trạng thái</label>
        <select
          id="status"
          name="status"
          className="filter-select"
          value={filters.status || ''}
          onChange={handleChange}
        >
          <option value="">Tất cả</option>
          <option value="now_showing">Đang chiếu</option>
          <option value="coming_soon">Sắp chiếu</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="rated">Phân loại độ tuổi</label>
        <select
          id="rated"
          name="rated"
          className="filter-select"
          value={filters.rated || ''}
          onChange={handleChange}
        >
          <option value="">Tất cả</option>
          {ratings.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MovieFilters;
