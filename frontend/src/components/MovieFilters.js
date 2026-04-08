import React, { useState, useRef, useEffect } from 'react';

const MovieFilters = ({ filters, onFilterChange }) => {
  const genres = [
    'Hành động', 'Hài hước', 'Hoạt hình', 'Kinh dị', 'Phiêu lưu', 'Viễn tưởng',
    'Tình cảm', 'Tâm lý', 'Khoa học'
  ];
  const ratings = ['P', 'K', 'T13', 'T16', 'T18'];
  const ratingLabels = { P: 'Mọi lứa tuổi', K: 'Dưới 13 tuổi', T13: 'Từ 13+', T16: 'Từ 16+', T18: 'Từ 18+' };

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const advancedRef = useRef(null);
  const [advancedHeight, setAdvancedHeight] = useState(0);

  useEffect(() => {
    if (advancedRef.current) {
      setAdvancedHeight(advancedRef.current.scrollHeight);
    }
  }, [showAdvanced, filters.genre, filters.rated]);

  const handleStatusChange = (status) => {
    onFilterChange({ ...filters, status });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleGenreClick = (g) => {
    onFilterChange({ ...filters, genre: filters.genre === g ? '' : g });
  };

  const handleRatedClick = (r) => {
    onFilterChange({ ...filters, rated: filters.rated === r ? '' : r });
  };

  const clearAll = () => {
    onFilterChange({ ...filters, q: '', genre: '', rated: '' });
  };

  const hasActiveFilters = filters.q || filters.genre || filters.rated;

  const statusTabs = [
    { key: 'today', label: 'Hôm Nay', icon: '📅' },
    { key: 'now_showing', label: 'Đang Chiếu', icon: '🎬' },
    { key: 'coming_soon', label: 'Sắp Chiếu', icon: '🔜' },
  ];

  return (
    <div className="mf-root">
      {/* ── STATUS TABS ── */}
      <div className="mf-tabs">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            className={`mf-tab ${filters.status === tab.key ? 'active' : ''}`}
            onClick={() => handleStatusChange(tab.key)}
          >
            <span className="mf-tab-icon">{tab.icon}</span>
            <span className="mf-tab-label">{tab.label}</span>
            {filters.status === tab.key && <span className="mf-tab-indicator" />}
          </button>
        ))}
      </div>

      {/* ── SEARCH BAR ── */}
      <div className={`mf-search-wrap ${searchFocused ? 'focused' : ''}`}>
        <div className="mf-search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          type="text"
          name="q"
          placeholder="Tìm kiếm phim theo tên, đạo diễn, diễn viên..."
          value={filters.q || ''}
          onChange={handleChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="mf-search-input"
        />
        {filters.q && (
          <button className="mf-search-clear" onClick={() => onFilterChange({ ...filters, q: '' })}>
            ✕
          </button>
        )}
        <button
          className={`mf-advanced-toggle ${showAdvanced ? 'open' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="Bộ lọc nâng cao"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="20" y2="12"/>
            <line x1="12" y1="18" x2="20" y2="18"/>
            <circle cx="6" cy="12" r="2" fill="currentColor"/>
            <circle cx="10" cy="18" r="2" fill="currentColor"/>
          </svg>
          <span>Bộ lọc</span>
          {hasActiveFilters && <span className="mf-filter-badge" />}
        </button>
      </div>

      {/* ── ADVANCED FILTERS PANEL ── */}
      <div
        className="mf-advanced-panel"
        style={{ maxHeight: showAdvanced ? advancedHeight + 40 : 0 }}
      >
        <div ref={advancedRef} className="mf-advanced-inner">
          {/* Genre Chips */}
          <div className="mf-filter-group">
            <div className="mf-filter-label">
              <span className="mf-filter-label-icon">🎭</span>
              Thể loại
            </div>
            <div className="mf-chips">
              {genres.map(g => (
                <button
                  key={g}
                  className={`mf-chip ${filters.genre === g ? 'active' : ''}`}
                  onClick={() => handleGenreClick(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Chips */}
          <div className="mf-filter-group">
            <div className="mf-filter-label">
              <span className="mf-filter-label-icon">🔞</span>
              Độ tuổi
            </div>
            <div className="mf-chips">
              {ratings.map(r => (
                <button
                  key={r}
                  className={`mf-chip mf-chip-rating ${filters.rated === r ? 'active' : ''}`}
                  onClick={() => handleRatedClick(r)}
                >
                  <span className={`mf-rated-dot rated-${r}`} />
                  {r} — {ratingLabels[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <div className="mf-clear-row">
              <button className="mf-clear-btn" onClick={clearAll}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── ACTIVE FILTER TAGS ── */}
      {hasActiveFilters && !showAdvanced && (
        <div className="mf-active-tags">
          {filters.q && (
            <span className="mf-tag">
              🔍 "{filters.q}"
              <button onClick={() => onFilterChange({ ...filters, q: '' })}>✕</button>
            </span>
          )}
          {filters.genre && (
            <span className="mf-tag">
              🎭 {filters.genre}
              <button onClick={() => onFilterChange({ ...filters, genre: '' })}>✕</button>
            </span>
          )}
          {filters.rated && (
            <span className="mf-tag">
              🔞 {filters.rated}
              <button onClick={() => onFilterChange({ ...filters, rated: '' })}>✕</button>
            </span>
          )}
          <button className="mf-tag-clear" onClick={clearAll}>Xóa tất cả</button>
        </div>
      )}

      <style>{`
        .mf-root {
          margin-bottom: 2.5rem;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        /* ── TABS ── */
        .mf-tabs {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 28px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 6px;
          max-width: 560px;
          margin-left: auto;
          margin-right: auto;
        }

        .mf-tab {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          background: transparent;
          color: rgba(255,255,255,0.45);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex: 1;
          justify-content: center;
          white-space: nowrap;
        }

        .mf-tab:hover {
          color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.04);
        }

        .mf-tab.active {
          background: linear-gradient(135deg, #E71A0F, #ff4d4d);
          color: #fff;
          box-shadow: 0 4px 20px rgba(231,26,15,0.35);
        }

        .mf-tab-icon {
          font-size: 16px;
        }

        .mf-tab-indicator {
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 3px;
          background: #fff;
          border-radius: 3px;
          opacity: 0.5;
        }

        /* ── SEARCH ── */
        .mf-search-wrap {
          display: flex;
          align-items: center;
          gap: 0;
          max-width: 700px;
          margin: 0 auto 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 4px 6px 4px 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mf-search-wrap.focused {
          border-color: rgba(231,26,15,0.5);
          box-shadow: 0 0 0 3px rgba(231,26,15,0.1), 0 8px 30px rgba(0,0,0,0.2);
          background: rgba(255,255,255,0.07);
        }

        .mf-search-icon {
          color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: color 0.3s;
        }

        .mf-search-wrap.focused .mf-search-icon {
          color: #E71A0F;
        }

        .mf-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 15px;
          padding: 12px 14px;
          font-family: inherit;
        }

        .mf-search-input::placeholder {
          color: rgba(255,255,255,0.25);
        }

        .mf-search-clear {
          background: rgba(255,255,255,0.1);
          border: none;
          color: rgba(255,255,255,0.5);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.2s;
          flex-shrink: 0;
          margin-right: 6px;
        }

        .mf-search-clear:hover {
          background: rgba(231,26,15,0.2);
          color: #ff6b6b;
        }

        .mf-advanced-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.25s;
          flex-shrink: 0;
          position: relative;
        }

        .mf-advanced-toggle:hover {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
        }

        .mf-advanced-toggle.open {
          background: rgba(231,26,15,0.15);
          border-color: rgba(231,26,15,0.3);
          color: #ff6b6b;
        }

        .mf-filter-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: #E71A0F;
          border-radius: 50%;
          animation: mfPulse 2s infinite;
        }

        @keyframes mfPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }

        /* ── ADVANCED PANEL ── */
        .mf-advanced-panel {
          max-width: 700px;
          margin: 0 auto;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mf-advanced-inner {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .mf-filter-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mf-filter-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .mf-filter-label-icon {
          font-size: 16px;
        }

        /* ── CHIPS ── */
        .mf-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .mf-chip {
          padding: 8px 18px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mf-chip:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.85);
          transform: translateY(-1px);
        }

        .mf-chip.active {
          background: linear-gradient(135deg, rgba(231,26,15,0.2), rgba(255,77,77,0.15));
          border-color: rgba(231,26,15,0.5);
          color: #ff8a80;
          box-shadow: 0 2px 12px rgba(231,26,15,0.15);
        }

        .mf-rated-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .mf-rated-dot.rated-P { background: #48bb78; }
        .mf-rated-dot.rated-K { background: #3182ce; }
        .mf-rated-dot.rated-T13 { background: #ed8936; }
        .mf-rated-dot.rated-T16 { background: #e53e3e; }
        .mf-rated-dot.rated-T18 { background: #9b2c2c; }

        /* ── CLEAR ── */
        .mf-clear-row {
          display: flex;
          justify-content: flex-end;
          padding-top: 4px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .mf-clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          color: #f87171;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .mf-clear-btn:hover {
          background: rgba(239,68,68,0.2);
          border-color: rgba(239,68,68,0.4);
        }

        /* ── ACTIVE TAGS ── */
        .mf-active-tags {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          max-width: 700px;
          margin: 0 auto 8px;
          animation: mfFadeIn 0.3s ease;
        }

        @keyframes mfFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mf-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(231,26,15,0.1);
          border: 1px solid rgba(231,26,15,0.25);
          border-radius: 100px;
          color: #ff8a80;
          font-size: 13px;
          font-weight: 500;
        }

        .mf-tag button {
          background: rgba(255,255,255,0.1);
          border: none;
          color: rgba(255,255,255,0.5);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          transition: all 0.2s;
          padding: 0;
        }

        .mf-tag button:hover {
          background: rgba(239,68,68,0.3);
          color: #fff;
        }

        .mf-tag-clear {
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.4);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .mf-tag-clear:hover {
          border-color: rgba(239,68,68,0.4);
          color: #f87171;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .mf-tabs {
            flex-direction: column;
            max-width: 100%;
            border-radius: 14px;
          }

          .mf-tab {
            padding: 10px 16px;
          }

          .mf-search-wrap {
            flex-wrap: wrap;
            border-radius: 14px;
          }

          .mf-search-input {
            min-width: 0;
          }

          .mf-advanced-toggle span {
            display: none;
          }

          .mf-advanced-inner {
            padding: 16px;
          }

          .mf-chip {
            padding: 6px 14px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default MovieFilters;
