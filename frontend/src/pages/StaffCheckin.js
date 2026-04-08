import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { lookupBooking, performCheckin, getTodayCheckins, serveFoods, getMyShiftReport } from '../api/checkin.api';
import QRScanner from '../components/QRScanner';

const StaffCheckin = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [bookingCode, setBookingCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [fnbLoading, setFnbLoading] = useState(false);
  const [todayCheckins, setTodayCheckins] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, checkedInCount: 0, notCheckedInCount: 0 });
  const [activeTab, setActiveTab] = useState('lookup');
  const [showScanner, setShowScanner] = useState(false);
  const [showShiftReport, setShowShiftReport] = useState(false);
  const [shiftData, setShiftData] = useState(null);
  const [alreadyCheckedInAlert, setAlreadyCheckedInAlert] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setBookingCode('');
    setBooking(null);
    setShowScanner(false);
    setAlreadyCheckedInAlert(null);
    // Làm mới danh sách check-in khi chuyển sang tab "Hôm Nay"
    if (tab === 'today') {
      fetchTodayCheckins();
    }
  };

  const fetchTodayCheckins = useCallback(async () => {
    try {
      const res = await getTodayCheckins();
      setTodayCheckins(res.data.data.checkins || []);
      setStats(res.data.data.stats || { totalBookings: 0, checkedInCount: 0, notCheckedInCount: 0 });
    } catch (err) {
      // Silent fail for background fetch
    }
  }, []);

  useEffect(() => {
    fetchTodayCheckins();
    const interval = setInterval(fetchTodayCheckins, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchTodayCheckins]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!bookingCode.trim()) {
      toast.warning('Vui lòng nhập mã vé');
      return;
    }
    setLoading(true);
    setBooking(null);
    setAlreadyCheckedInAlert(null);
    try {
      const res = await lookupBooking(bookingCode.trim());
      const data = res.data.data;
      // Nếu vé đã được check-in rồi → chỉ thông báo, không hiển thị thông tin vé
      if (data.checkedIn) {
        setAlreadyCheckedInAlert(data);
        return;
      }
      setBooking(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tìm thấy vé với mã này');
    } finally {
      setLoading(false);
    }
  };

  const scanProcessing = useRef(false);

  const handleScanSuccess = useCallback((decodedText) => {
    // Chặn xử lý nếu đang xử lý lần quét trước (tránh gọi nhiều lần)
    if (scanProcessing.current) return;
    scanProcessing.current = true;

    // Tự động điền mã và đóng scanner
    setBookingCode(decodedText.toUpperCase());
    setShowScanner(false);

    // Tự động trigger tìm kiếm
    setLoading(true);
    setBooking(null);
    setAlreadyCheckedInAlert(null);
    lookupBooking(decodedText.trim().toUpperCase())
      .then(res => {
        const data = res.data.data;
        // Nếu vé đã được check-in rồi → chỉ thông báo, không hiển thị
        if (data.checkedIn) {
          setAlreadyCheckedInAlert(data);
        } else {
          toast.success('Đã quét mã QR thành công!');
          setBooking(data);
        }
      })
      .catch(err => toast.error(err.response?.data?.message || 'Không tìm thấy vé với mã quét được'))
      .finally(() => {
        setLoading(false);
        // Cho phép quét lại sau khi xử lý xong
        setTimeout(() => { scanProcessing.current = false; }, 2000);
      });
  }, []);

  const handleScanFailure = useCallback((error) => {
    // Bỏ qua lỗi báo không tìm thấy mã
  }, []);

  const handleCheckin = async () => {
    if (!booking) return;
    setCheckinLoading(true);
    try {
      const res = await performCheckin(booking._id);
      setBooking(res.data.data);
      toast.success('✅ Check-in thành công!');
      // Cập nhật danh sách check-in ngay lập tức
      await fetchTodayCheckins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi check-in');
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleServeFoods = async () => {
    if (!booking) return;
    setFnbLoading(true);
    try {
      const res = await serveFoods(booking._id);
      setBooking(res.data.data);
      toast.success('🍿 Đã xác nhận trả bắp nước!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xác nhận trả bắp nước');
    } finally {
      setFnbLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      const res = await getMyShiftReport();
      setShiftData(res.data.data);
      setShowShiftReport(true);
    } catch (err) {
      toast.error('Lỗi khi lấy báo cáo ca làm việc');
      // Lỗi thì vẫn cho đăng xuất
      await logout();
      navigate('/login');
    }
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—';
  const formatPrice = (p) => p ? p.toLocaleString('vi-VN') + ' ₫' : '—';

  const getStatusInfo = (status) => {
    const map = {
      confirmed: { label: 'Đã xác nhận', cls: 'sc-status-confirmed', icon: '✅' },
      pending: { label: 'Chờ xử lý', cls: 'sc-status-pending', icon: '⏳' },
      cancelled: { label: 'Đã huỷ', cls: 'sc-status-cancelled', icon: '❌' },
      refunded: { label: 'Hoàn tiền', cls: 'sc-status-refunded', icon: '💸' },
    };
    return map[status] || { label: status, cls: '', icon: '❓' };
  };

  return (
    <div className="sc-wrapper">
      {/* Sidebar */}
      <aside className="sc-sidebar">
        <div className="sc-logo">
          <span className="sc-logo-icon">🎬</span>
          <span>CineBooking</span>
        </div>
        <div className="sc-staff-badge">
          <div className="sc-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="sc-staff-name">{user?.name}</div>
            <div className="sc-role-tag">
              {user?.role === 'admin' ? '👑 Quản trị viên' : '🏷️ Nhân viên'}
            </div>
          </div>
        </div>
        <nav className="sc-nav">
          <button
            className={`sc-nav-item ${activeTab === 'lookup' ? 'active' : ''}`}
            onClick={() => handleTabChange('lookup')}
          >
            <span>🔍</span> Tra Cứu Vé
          </button>
          <button
            className={`sc-nav-item ${activeTab === 'fnb' ? 'active' : ''}`}
            onClick={() => handleTabChange('fnb')}
          >
            <span>🍿</span> Quầy Bắp Nước
          </button>
          <button
            className={`sc-nav-item ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => handleTabChange('today')}
          >
            <span>📋</span> Check-in Hôm Nay
          </button>
        </nav>
        <div className="sc-sidebar-footer">
          {user?.role === 'admin' && (
            <button className="sc-nav-item" onClick={() => navigate('/admin')}>
              <span>⚙️</span> Admin Panel
            </button>
          )}
          <button className="sc-nav-item" onClick={() => navigate('/')}>
            <span>🏠</span> Trang Chủ
          </button>
          <button className="sc-nav-item sc-logout" onClick={handleLogoutClick}>
            <span>🚪</span> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sc-main">
        {/* Stats Bar */}
        <div className="sc-stats-bar">
          <div className="sc-stat-item">
            <div className="sc-stat-icon sc-stat-total">🎫</div>
            <div>
              <div className="sc-stat-value">{stats.totalBookings}</div>
              <div className="sc-stat-label">Tổng vé hôm nay</div>
            </div>
          </div>
          <div className="sc-stat-item">
            <div className="sc-stat-icon sc-stat-checked">✅</div>
            <div>
              <div className="sc-stat-value">{stats.checkedInCount}</div>
              <div className="sc-stat-label">Đã check-in</div>
            </div>
          </div>
          <div className="sc-stat-item">
            <div className="sc-stat-icon sc-stat-pending">⏳</div>
            <div>
              <div className="sc-stat-value">{stats.notCheckedInCount}</div>
              <div className="sc-stat-label">Chưa check-in</div>
            </div>
          </div>
          <div className="sc-stat-item">
            <div className="sc-stat-icon sc-stat-rate">📊</div>
            <div>
              <div className="sc-stat-value">
                {stats.totalBookings > 0 ? Math.round((stats.checkedInCount / stats.totalBookings) * 100) : 0}%
              </div>
              <div className="sc-stat-label">Tỷ lệ check-in</div>
            </div>
          </div>
        </div>

        {/* Lookup Tab */}
        {activeTab === 'lookup' && (
          <div className="sc-content">
            <div className="sc-header">
              <h1 className="sc-title">🔍 Tra Cứu & Check-in Vé</h1>
              <p className="sc-subtitle">Nhập mã đặt vé để tra cứu và thực hiện check-in cho khách hàng</p>
            </div>

            {/* Search Form */}
            <form className="sc-search-form" onSubmit={handleLookup}>
              <div className="sc-search-wrap">
                <span className="sc-search-icon">🎫</span>
                <input
                  type="text"
                  className="sc-search-input"
                  placeholder="Nhập mã đặt vé (VD: ABC12345)..."
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  autoFocus
                />
                <button type="submit" className="sc-search-btn" disabled={loading}>
                  {loading ? (
                    <span className="sc-spinner"></span>
                  ) : (
                    <>🔍 Tra Cứu</>
                  )}
                </button>
                <button type="button" className="sc-search-btn" style={{ background: '#10b981' }} onClick={() => setShowScanner(true)}>
                  📷 Quét QR
                </button>
              </div>
            </form>

            {/* QR Scanner */}
            {showScanner && (
              <div className="sc-scanner-modal">
                <button className="sc-scanner-close" onClick={() => setShowScanner(false)}>✕</button>
                <h3 style={{ color: '#fff', marginTop: 0 }}>Đưa mã QR vào khung hình</h3>
                <QRScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} />
              </div>
            )}

            {/* Already Checked In Warning Card */}
            {alreadyCheckedInAlert && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.2))',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '16px',
                padding: '24px 30px',
                marginTop: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.15)',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{ fontSize: '48px', lineHeight: 1 }}>⛔</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fca5a5', margin: '0 0 8px 0', fontSize: '20px' }}>Vé Đã Được Sử Dụng</h3>
                  <p style={{ color: '#fff', margin: '0 0 16px 0', fontSize: '15px' }}>
                    Mã vé <strong style={{ color: '#fecaca', letterSpacing: '1px' }}>{alreadyCheckedInAlert.bookingCode}</strong> không hợp lệ vì đã được check-in vào hệ thống trước đó.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
                      <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>⏰ Thời gian check-in:</div>
                      <div style={{ color: '#e5e7eb', fontWeight: '500', fontSize: '14px' }}>
                        {formatDate(alreadyCheckedInAlert.checkedInAt)}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
                      <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>👤 Nhân viên thao tác:</div>
                      <div style={{ color: '#e5e7eb', fontWeight: '500', fontSize: '14px' }}>
                        {alreadyCheckedInAlert.checkedInBy?.name || 'Không rõ'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Result */}
            {booking && (
              <div className="sc-result-card">
                <div className="sc-result-header">
                  <div className="sc-result-title">
                    <h2>🎬 {booking.movieTitle || 'Không rõ phim'}</h2>
                    <span className={`sc-badge ${getStatusInfo(booking.status).cls}`}>
                      {getStatusInfo(booking.status).icon} {getStatusInfo(booking.status).label}
                    </span>
                  </div>
                  {booking.checkedIn && (
                    <div className="sc-checkedin-badge">
                      ✅ Đã Check-in lúc {formatDate(booking.checkedInAt)}
                      {booking.checkedInBy?.name && ` — bởi ${booking.checkedInBy.name}`}
                    </div>
                  )}
                  {booking.foodsServed && (
                    <div className="sc-checkedin-badge" style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', borderColor: 'rgba(234,179,8,0.3)', marginTop: '8px' }}>
                      🍿 Đã trả Bắp Nước lúc {formatDate(booking.foodsServedAt)}
                      {booking.foodsServedBy?.name && ` — bởi ${booking.foodsServedBy.name}`}
                    </div>
                  )}
                </div>

                <div className="sc-result-grid">
                  <div className="sc-info-card">
                    <div className="sc-info-icon">👤</div>
                    <div className="sc-info-label">Khách hàng</div>
                    <div className="sc-info-value">{booking.user?.name || '—'}</div>
                    <div className="sc-info-sub">{booking.user?.email}</div>
                    <div className="sc-info-sub">{booking.user?.phone || ''}</div>
                  </div>
                  <div className="sc-info-card">
                    <div className="sc-info-icon">🏢</div>
                    <div className="sc-info-label">Rạp / Phòng</div>
                    <div className="sc-info-value">{booking.cinemaName || '—'}</div>
                    <div className="sc-info-sub">{booking.roomName || ''}</div>
                  </div>
                  <div className="sc-info-card">
                    <div className="sc-info-icon">⏰</div>
                    <div className="sc-info-label">Suất chiếu</div>
                    <div className="sc-info-value">{formatDate(booking.showstartTime)}</div>
                  </div>
                  <div className="sc-info-card">
                    <div className="sc-info-icon">💺</div>
                    <div className="sc-info-label">Ghế</div>
                    <div className="sc-info-value sc-seats">
                      {booking.tickets?.map((t, i) => (
                        <span key={i} className="sc-seat-chip">{t.seatLabel}</span>
                      )) || '—'}
                    </div>
                  </div>
                  <div className="sc-info-card">
                    <div className="sc-info-icon">🍿</div>
                    <div className="sc-info-label">Combo</div>
                    <div className="sc-info-value">
                      {booking.foods?.length > 0
                        ? booking.foods.map((f, i) => (
                          <div key={i} className="sc-food-item">{f.name} x{f.quantity}</div>
                        ))
                        : 'Không có'}
                    </div>
                  </div>
                  <div className="sc-info-card">
                    <div className="sc-info-icon">💰</div>
                    <div className="sc-info-label">Tổng tiền</div>
                    <div className="sc-info-value sc-price">{formatPrice(booking.finalPrice)}</div>
                    {booking.totalPrice !== booking.finalPrice && (
                      <div className="sc-info-sub sc-original-price">{formatPrice(booking.totalPrice)}</div>
                    )}
                  </div>
                </div>

                {/* Check-in Button */}
                {booking.status === 'confirmed' && !booking.checkedIn && (
                  <button
                    className="sc-checkin-btn"
                    onClick={handleCheckin}
                    disabled={checkinLoading}
                  >
                    {checkinLoading ? (
                      <><span className="sc-spinner"></span> Đang xử lý...</>
                    ) : (
                      <>✅ Xác Nhận Check-in</>
                    )}
                  </button>
                )}

                {booking.status !== 'confirmed' && !booking.checkedIn && (
                  <div className="sc-warning-msg">
                    ⚠️ Không thể check-in. Trạng thái vé: <strong>{getStatusInfo(booking.status).label}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* F&B Kiosk Tab */}
        {activeTab === 'fnb' && (
          <div className="sc-content">
            <div className="sc-header">
              <h1 className="sc-title">🍿 Quầy Bắp Nước</h1>
              <p className="sc-subtitle">Quét mã QR trên vé để phục vụ nhanh chóng và chính xác</p>
            </div>

            <form className="sc-search-form" onSubmit={handleLookup}>
              <div className="sc-search-wrap">
                <span className="sc-search-icon">🍿</span>
                <input
                  type="text"
                  className="sc-search-input"
                  placeholder="Nhập mã vé đặt để kiểm tra bắp nước..."
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                />
                <button type="submit" className="sc-search-btn" disabled={loading}>
                  {loading ? <span className="sc-spinner"></span> : <>🔍 Tra Cứu</>}
                </button>
                <button type="button" className="sc-search-btn" style={{ background: '#10b981' }} onClick={() => setShowScanner(true)}>
                  📷 Quét QR
                </button>
              </div>
            </form>

            {showScanner && (
              <div className="sc-scanner-modal">
                <button className="sc-scanner-close" onClick={() => setShowScanner(false)}>✕</button>
                <h3 style={{ color: '#fff', marginTop: 0 }}>Đưa mã QR vào khung hình</h3>
                <QRScanner onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} />
              </div>
            )}

            {booking && (
              <div className="sc-result-card">
                <div className="sc-result-header" style={{ marginBottom: '16px' }}>
                  <div className="sc-result-title">
                    <h2>Mã vé: {booking.bookingCode}</h2>
                    <span className={`sc-badge ${getStatusInfo(booking.status).cls}`}>
                      {getStatusInfo(booking.status).icon} {getStatusInfo(booking.status).label}
                    </span>
                  </div>
                </div>

                {(!booking.foods || booking.foods.length === 0) ? (
                  <div className="sc-warning-msg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                    ❌ Khách hàng không đặt Combo Bắp Nước nào trong vé này.
                  </div>
                ) : (
                  <>
                    <h3 style={{ color: '#fff', margin: '0 0 16px 0' }}>Chi tiết Combo Bắp Nước:</h3>
                    <div className="sc-info-card" style={{ marginBottom: '24px' }}>
                      {booking.foods.map((f, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === booking.foods.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                          <strong style={{ color: '#fff', fontSize: '16px' }}>{f.name}</strong>
                          <span style={{ background: '#e71a0f', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontWeight: 'bold' }}>x{f.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {booking.foodsServed ? (
                      <div className="sc-checkedin-badge" style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', borderColor: 'rgba(234,179,8,0.3)', textAlign: 'center', padding: '16px', fontSize: '16px' }}>
                        🍿 Khách hàng <strong>ĐÃ NHẬN</strong> phần Combo Bắp Nước này lúc {formatDate(booking.foodsServedAt)}. <br />
                        <small style={{ color: 'rgba(234,179,8,0.7)', marginTop: '6px', display: 'block' }}>Vui lòng không giao lại (Trừ khi có yêu cầu đặc biệt của Quản lý).</small>
                      </div>
                    ) : (
                      <button
                        className="sc-checkin-btn"
                        style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)' }}
                        onClick={handleServeFoods}
                        disabled={fnbLoading || booking.status !== 'confirmed'}
                      >
                        {fnbLoading ? (
                          <><span className="sc-spinner"></span> Đang xử lý...</>
                        ) : (
                          <>🍿 XÁC NHẬN ĐÃ TRẢ KHÁCH</>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Today Tab */}
        {activeTab === 'today' && (
          <div className="sc-content">
            <div className="sc-header">
              <h1 className="sc-title">📋 Danh Sách Check-in Hôm Nay</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p className="sc-subtitle" style={{ margin: 0 }}>Cập nhật mỗi 30 giây • {todayCheckins.length} vé đã check-in</p>
                <button
                  onClick={fetchTodayCheckins}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  🔄 Làm mới
                </button>
              </div>
            </div>

            {todayCheckins.length === 0 ? (
              <div className="sc-empty-state">
                <div className="sc-empty-icon">📭</div>
                <h3>Chưa có check-in nào hôm nay</h3>
                <p>Các vé được check-in sẽ hiển thị tại đây</p>
              </div>
            ) : (
              <div className="sc-table-wrap">
                <table className="sc-table">
                  <thead>
                    <tr>
                      <th>Mã Vé</th>
                      <th>Khách Hàng</th>
                      <th>Phim</th>
                      <th>Ghế</th>
                      <th>Check-in Lúc</th>
                      <th>Nhân Viên</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayCheckins.map((c) => (
                      <tr key={c._id}>
                        <td><span className="sc-code-badge">{c.bookingCode}</span></td>
                        <td>{c.user?.name || '—'}</td>
                        <td>{c.movieTitle || '—'}</td>
                        <td>
                          <div className="sc-seats-cell">
                            {c.tickets?.map((t, i) => (
                              <span key={i} className="sc-seat-chip-sm">{t.seatLabel}</span>
                            ))}
                          </div>
                        </td>
                        <td>{formatDate(c.checkedInAt)}</td>
                        <td>{c.checkedInBy?.name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Shift Report Modal */}
      {showShiftReport && shiftData && (
        <div className="sc-modal-overlay">
          <div className="sc-modal-content">
            <h2>📊 Báo Cáo Cuối Ca</h2>
            <div className="sc-shift-report">
              <p>Nhân viên: <strong style={{ color: '#fff' }}>{shiftData.staffName}</strong></p>
              <div className="sc-shift-stats">
                <div className="sc-shift-stat-item">
                  <span className="sc-shift-stat-icon">🎫</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="sc-shift-stat-value">{shiftData.checkedInCount}</span>
                    <span className="sc-shift-stat-label">Vé đã soát</span>
                  </div>
                </div>
                <div className="sc-shift-stat-item">
                  <span className="sc-shift-stat-icon">🍿</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="sc-shift-stat-value">{shiftData.foodsServedCount}</span>
                    <span className="sc-shift-stat-label">Combo đã giao</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sc-modal-actions">
              <button className="sc-btn-cancel" onClick={() => setShowShiftReport(false)}>Quay Lại Làm Việc</button>
              <button className="sc-btn-confirm" onClick={handleConfirmLogout}>🚪 Xác Nhận Đăng Xuất</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffCheckin;
