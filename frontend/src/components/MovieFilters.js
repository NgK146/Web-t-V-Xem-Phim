import React from 'react';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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
    <div className="mf-wrap">
      {/* Status Tabs */}
      <div className="mf-tabs" role="tablist" aria-label="Lọc phim theo trạng thái">
        {[
          { key: 'today', label: 'Chiếu Hôm Nay' },
          { key: 'now_showing', label: 'Đang Chiếu' },
          { key: 'coming_soon', label: 'Sắp Chiếu' },
        ].map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={filters.status === tab.key}
            className={`mf-tab${filters.status === tab.key ? ' active' : ''}`}
            onClick={() => handleStatusChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="mf-filters">
        <div className="mf-search-wrap">
          <SearchIcon />
          <input
            type="text"
            name="q"
            placeholder="Tìm tên phim..."
            value={filters.q || ''}
            onChange={handleChange}
            className="mf-search"
            aria-label="Tìm kiếm phim"
          />
        </div>

        <select
          name="genre"
          value={filters.genre || ''}
          onChange={handleChange}
          className="mf-select"
          aria-label="Lọc theo thể loại"
        >
          <option value="">Tất cả thể loại</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          name="rated"
          value={filters.rated || ''}
          onChange={handleChange}
          className="mf-select"
          aria-label="Lọc theo độ tuổi"
        >
          <option value="">Tất cả độ tuổi</option>
          {ratings.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );
};

export default MovieFilters;
