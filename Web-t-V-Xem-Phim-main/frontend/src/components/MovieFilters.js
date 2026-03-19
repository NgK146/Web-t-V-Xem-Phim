import React from 'react';

const MovieFilters = ({ filters, onFilterChange }) => {
  const genres = [
    'Hành động', 'Hài hước', 'Hoạt hình', 'Kinh dị', 'Phiêu lưu', 'Viễn tưởng'
  ];
  const ratings = ['P', 'K', 'T13', 'T16', 'T18'];

  const handleStatusChange = (status) => {
    onFilterChange({ ...filters, status });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="movie-filters-cgv">
      <div className="movie-tabs">
        <button 
          className={`tab-btn ${filters.status === 'now_showing' ? 'active' : ''}`}
          onClick={() => handleStatusChange('now_showing')}
        >
          Phim Đang Chiếu
        </button>
        <button 
          className={`tab-btn ${filters.status === 'coming_soon' ? 'active' : ''}`}
          onClick={() => handleStatusChange('coming_soon')}
        >
          Phim Sắp Chiếu
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginBottom: '3rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          name="q"
          placeholder="Tìm tên phim..."
          value={filters.q || ''}
          onChange={handleChange}
          className="filter-input"
          style={{ 
            width: '100%', 
            maxWidth: '300px', 
            borderRadius: '25px', 
            padding: '10px 20px',
            border: '2px solid #ddd'
          }}
        />
        
        <select
          name="genre"
          value={filters.genre || ''}
          onChange={handleChange}
          className="filter-select-cgv"
          style={{
            padding: '10px 20px',
            borderRadius: '25px',
            border: '2px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="">Tất cả thể loại</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          name="rated"
          value={filters.rated || ''}
          onChange={handleChange}
          className="filter-select-cgv"
          style={{
            padding: '10px 20px',
            borderRadius: '25px',
            border: '2px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="">Tất cả độ tuổi</option>
          {ratings.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
};

export default MovieFilters;
