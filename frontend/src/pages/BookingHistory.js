import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

// Logic helpers for time-based status
const isPastShowtime = (showtime) => new Date(showtime) < new Date();
const canCancel = (showtime) => {
    const showDate = new Date(showtime);
    const now = new Date();
    const diffHours = (showDate - now) / (1000 * 60 * 60);
    return diffHours >= 2;
};

const BookingHistory = () => {
    const navigate = useNavigate();
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [qrModal, setQrModal] = useState(null);
    const [cancelModal, setCancelModal] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my-bookings');
                setBookings(res.data.data?.bookings || []);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử:", error);
                toast.error("Không thể tải lịch sử vé.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // Dynamic filtering Logic
    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const title = b.movieTitle || b.showtime?.movie?.title || '';
            const code = b.bookingCode || '';
            const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                code.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (!matchesSearch) return false;

            if (activeTab === 'all') return true;
            
            const isFinished = isPastShowtime(b.showstartTime);
            if (activeTab === 'upcoming') return b.status === 'confirmed' && !isFinished;
            if (activeTab === 'finished') return b.status === 'confirmed' && isFinished;
            if (activeTab === 'cancelled') return b.status === 'cancelled';
            
            return true;
        });
    }, [bookings, activeTab, searchQuery]);

    const handleCancelConfirm = () => {
        if (!cancelModal) return;
        
        // Simulating the 2h rule
        if (!canCancel(cancelModal.showstartTime)) {
            toast.error('Chỉ được hủy vé trước suất chiếu 2 tiếng!');
            return;
        }

        setBookings(prev => prev.map(b => b._id === cancelModal._id ? { ...b, status: 'cancelled' } : b));
        toast.success('Hủy vé thành công!');
        setCancelModal(null);
    };

    return (
        <div className="bh-root">
            <header className="bh-header">
                <div className="bh-logo" onClick={() => navigate('/')}>
                    CINE<span style={{ color: '#e50914' }}>BOOKING</span>
                </div>
                <button className="bh-back-btn" onClick={() => navigate('/')}>← Trang chủ</button>
            </header>

            <div className="bh-container">
                <div className="bh-top-row">
                    <h1 className="bh-title">Lịch sử đặt vé</h1>
                    <div className="bh-search-box">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm vé hoặc phim..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bh-tabs">
                    {['all', 'upcoming', 'finished', 'cancelled'].map(tab => (
                        <button 
                            key={tab} 
                            className={`bh-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'all' && 'Tất cả'}
                            {tab === 'upcoming' && 'Sắp chiếu'}
                            {tab === 'finished' && 'Đã xong'}
                            {tab === 'cancelled' && 'Đã hủy'}
                            <span className="count">
                                ({bookings.filter(b => {
                                    const isFinished = isPastShowtime(b.showstartTime);
                                    if (tab === 'all') return true;
                                    if (tab === 'upcoming') return b.status === 'confirmed' && !isFinished;
                                    if (tab === 'finished') return b.status === 'confirmed' && isFinished;
                                    if (tab === 'cancelled') return b.status === 'cancelled';
                                    return false;
                                }).length})
                            </span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="bh-empty">
                        <p>Đang tải danh sách vé...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bh-empty">
                        <p>Không tìm thấy vé nào phù hợp.</p>
                    </div>
                ) : (
                    <div className="bh-list">
                        {filteredBookings.map(b => {
                            const startTimeStr = b.showstartTime || (b.showtime ? b.showtime.startTime : null);
                            const poster = b.poster || (b.showtime?.movie?.poster) || 'https://via.placeholder.com/150';
                            const title = b.movieTitle || (b.showtime?.movie?.title) || 'Phim rạp';
                            const cinema = b.cinemaName || (b.showtime?.room?.cinema?.name) || 'Rạp';
                            const roomName = b.roomName || (b.showtime?.room?.name) || 'Phòng';

                            const isFinished = isPastShowtime(startTimeStr);
                            const cancellationAllowed = canCancel(startTimeStr);
                            let statusLabel = 'Đã đặt';
                            let statusColor = '#4ade80';

                            if (b.status === 'cancelled') {
                                statusLabel = 'Đã hủy';
                                statusColor = '#f87171';
                            } else if (isFinished) {
                                statusLabel = 'Đã xem';
                                statusColor = '#a0a5bc';
                            } else if (!cancellationAllowed) {
                                statusLabel = 'Sắp chiếu';
                                statusColor = '#facc15';
                            }

                            return (
                                <div key={b._id} className={`bh-card ${b.status} ${isFinished ? 'is-past' : ''}`}>
                                    <div className="bh-card-poster">
                                        <img src={b.poster} alt={b.movieTitle} />
                                    </div>

                                    <div className="bh-card-info">
                                        <div className="bh-movie-title">{title}</div>
                                        <div className="bh-meta">
                                            <span>📍 {cinema}</span>
                                            <span>🎭 {roomName}</span>
                                            <span>📅 {new Date(startTimeStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(startTimeStr).toLocaleDateString('vi-VN')}</span>
                                            <span>💺 {b.tickets?.map(t => t.seatLabel).join(', ')}</span>
                                        </div>
                                        <div className="bh-code">MÃ VÉ: <strong>{b.bookingCode}</strong></div>
                                        <div className="bh-price-final">{b.finalPrice.toLocaleString()}đ</div>
                                    </div>

                                    <div className="bh-card-right">
                                        <div className="bh-status-badge" style={{ color: statusColor, borderColor: statusColor }}>
                                            {statusLabel}
                                        </div>
                                        
                                        {!isFinished && b.status === 'confirmed' && (
                                            <button className="bh-qr-btn" onClick={() => setQrModal(b)}>
                                                📱 Xem QR
                                            </button>
                                        )}

                                        {!isFinished && b.status === 'confirmed' && (
                                            <button 
                                                className={`bh-cancel-btn ${!cancellationAllowed ? 'disabled' : ''}`} 
                                                onClick={() => cancellationAllowed && setCancelModal(b)}
                                                title={!cancellationAllowed ? 'Không thể hủy vé sát giờ chiếu' : ''}
                                            >
                                                {cancellationAllowed ? '🗑️ Hủy vé' : '🔒 Khóa hủy'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals - Simplified for mock version */}
            {qrModal && (
                <div className="bh-modal-overlay" onClick={() => setQrModal(null)}>
                    <div className="bh-modal" onClick={e => e.stopPropagation()}>
                        <button className="bh-modal-close" onClick={() => setQrModal(null)}>✕</button>
                        <div className="bh-modal-title">Vé Điện Tử</div>
                        <div className="bh-modal-code">{qrModal.bookingCode}</div>
                        <img src={qrModal.qrCode} alt="QR" className="bh-modal-qr" />
                        <p style={{marginTop: '15px'}}>Vui lòng đưa mã này cho nhân viên soát vé.</p>
                    </div>
                </div>
            )}

            {cancelModal && (
                <div className="bh-modal-overlay" onClick={() => setCancelModal(null)}>
                    <div className="bh-modal" onClick={e => e.stopPropagation()}>
                        <h3>Xác nhận hủy vé?</h3>
                        <p>Bạn đang hủy vé <strong>{cancelModal.movieTitle}</strong>. Hành động này không thể hoàn tác.</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button className="bh-btn-secondary" onClick={() => setCancelModal(null)}>Quay lại</button>
                            <button className="bh-btn-danger" onClick={handleCancelConfirm}>Xác nhận hủy</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bh-root { min-height: 100vh; background: #0c0e14; color: #fff; font-family: 'Outfit', sans-serif; padding-bottom: 50px; }
                .bh-header { display: flex; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(12, 14, 20, 0.8); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100; }
                .bh-logo { cursor: pointer; font-weight: 900; letter-spacing: 2px; font-size: 20px; }
                .bh-back-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 16px; border-radius: 20px; cursor: pointer; }
                
                .bh-container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
                .bh-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
                .bh-title { margin: 0; font-size: 32px; font-weight: 800; border-left: 5px solid #e50914; padding-left: 15px; }
                
                .bh-search-box input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 20px; border-radius: 12px; width: 300px; outline: none; }
                .bh-search-box input:focus { border-color: #e50914; background: rgba(255,255,255,0.08); }

                .bh-tabs { display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; overflow-x: auto; }
                .bh-tab { background: transparent; border: none; color: #a0a5bc; padding: 10px 20px; cursor: pointer; font-size: 15px; font-weight: 600; transition: 0.3s; position: relative; white-space: nowrap; }
                .bh-tab.active { color: #fff; }
                .bh-tab.active::after { content: ''; position: absolute; bottom: -16px; left: 0; width: 100%; height: 3px; background: #e50914; border-radius: 3px 3px 0 0; }
                .bh-tab .count { margin-left: 5px; font-size: 12px; opacity: 0.6; }

                .bh-list { display: flex; flex-direction: column; gap: 20px; }
                .bh-card { display: flex; gap: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; transition: 0.3s; position: relative; }
                .bh-card:hover { transform: translateY(-3px); border-color: rgba(229, 9, 20, 0.4); background: rgba(255,255,255,0.05); }
                .bh-card.is-past { opacity: 0.6; grayscale: 50%; }
                
                .bh-card-poster img { width: 90px; height: 130px; border-radius: 10px; object-fit: cover; }
                .bh-card-info { flex: 1; }
                .bh-movie-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; color: #fff; }
                .bh-meta { display: flex; flex-wrap: wrap; gap: 10px 20px; margin-bottom: 15px; }
                .bh-meta span { font-size: 13px; color: #a0a5bc; }
                .bh-code { font-size: 12px; color: #666; margin-bottom: 8px; letter-spacing: 1px; }
                .bh-price-final { font-size: 18px; font-weight: 800; color: #4ade80; }

                .bh-card-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 10px; }
                .bh-status-badge { font-size: 11px; font-weight: 800; padding: 5px 12px; border: 1px solid; border-radius: 20px; text-transform: uppercase; }
                .bh-qr-btn { background: rgba(229, 9, 20, 0.1); border: 1px solid rgba(229, 9, 20, 0.4); color: #e50914; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; }
                .bh-qr-btn:hover { background: #e50914; color: #fff; }
                .bh-cancel-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #f87171; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 600; }
                .bh-cancel-btn:hover:not(.disabled) { background: rgba(248, 113, 113, 0.1); border-color: #f87171; }
                .bh-cancel-btn.disabled { opacity: 0.3; cursor: not-allowed; color: #888; border-color: #333; }

                .bh-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
                .bh-modal { background: #161a22; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; text-align: center; max-width: 400px; width: 100%; }
                .bh-modal-qr { width: 200px; height: 200px; background: #fff; padding: 10px; border-radius: 12px; margin: 20px 0; }
                .bh-btn-secondary { flex: 1; padding: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 12px; cursor: pointer; }
                .bh-btn-danger { flex: 1; padding: 14px; background: #dc2626; border: none; color: #fff; border-radius: 12px; cursor: pointer; font-weight: 700; }
            `}</style>
        </div>
    );
};

export default BookingHistory;
