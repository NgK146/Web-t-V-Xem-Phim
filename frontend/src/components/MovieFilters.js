import React from 'react';

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const MovieFilters = ({ filters, onFilterChange }) => {
  const genres = [
    'Hành động', 'Hài hước', 'Hoạt hình', 'Kinh dị', 'Phiêu lưu', 'Viễn tưởng'
  ];
  const ratings = ['P', 'K', 'T13', 'T16', 'T18'];

  const tabs = [
    { key: 'today', label: 'Hôm Nay' },
    { key: 'now_showing', label: 'Đang Chiếu' },
    { key: 'coming_soon', label: 'Sắp Chiếu' },
  ];

  const handleStatusChange = (status) => {
    onFilterChange({ ...filters, status });
  };

  const handleGenreChange = (genre) => {
    onFilterChange({ ...filters, genre: filters.genre === genre ? '' : genre });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const activeTabIndex = tabs.findIndex(t => t.key === filters.status);

  return (
    <div className="mf-wrap">
      {/* Big Search Bar */}
      <div className="mf-search-container">
        <div className="mf-search-inner">
          <SearchIcon />
          <input
            type="text"
            name="q"
            placeholder="Tìm kiếm tác phẩm điện ảnh..."
            value={filters.q || ''}
            onChange={handleChange}
            className="mf-search-input"
            autoComplete="off"
          />
          {filters.q && (
            <button className="mf-clear-btn" onClick={() => onFilterChange({ ...filters, q: '' })}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mf-controls-row">
        {/* Status Tabs */}
        <div className="mf-segmented-container">
          <div 
            className="mf-segmented-highlight" 
            style={{ 
              width: `${100 / (tabs.length || 1)}%`,
              transform: `translateX(${activeTabIndex >= 0 ? activeTabIndex * 100 : 0}%)`
            }} 
          />
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`mf-segmented-item${filters.status === tab.key ? ' active' : ''}`}
              onClick={() => handleStatusChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Age Rating Select */}
        <div className="mf-select-wrapper">
          <FilterIcon />
          <select
            name="rated"
            value={filters.rated || ''}
            onChange={handleChange}
            className="mf-select-styled"
          >
            <option value="">Độ tuổi: Tất cả</option>
            {ratings.map(r => <option key={r} value={r}>Từ {r} trở lên</option>)}
          </select>
        </div>
      </div>

      {/* Genres Scrollable Row */}
      <div className="mf-genre-container">
        <div className="mf-genre-label">Thể loại:</div>
        <div className="mf-genre-scroll">
          <button 
            className={`mf-genre-pill ${!filters.genre ? 'active' : ''}`}
            onClick={() => onFilterChange({ ...filters, genre: '' })}
          >
            Tất cả
          </button>
          {genres.map(g => (
            <button
              key={g}
              className={`mf-genre-pill ${filters.genre === g ? 'active' : ''}`}
              onClick={() => handleGenreChange(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieFilters;

