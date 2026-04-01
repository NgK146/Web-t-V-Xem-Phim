import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsApi } from '../api/bookings.api';
import { toast } from 'react-toastify';

const STATUS_MAP = {
    confirmed: { label: 'Đã xác nhận', color: '#4ade80' },
    pending: { label: 'Chờ xử lý', color: '#facc15' },
    cancelled: { label: 'Đã hủy', color: '#f87171' },
    refunded: { label: 'Đã hoàn tiền', color: '#a78bfa' },
};

const BookingHistory = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrModal, setQrModal] = useState(null); // booking for modal

    useEffect(() => {
        bookingsApi.getMyHistory()
            .then(res => setBookings(res.data.data.bookings || []))
            .catch(() => toast.error('Không thể tải lịch sử đặt vé'))
            .finally(() => setLoading(false));
    }, []);

    const getMoviePoster = (b) =>
        b.showtime?.movie?.poster || null;

    const getMovieTitle = (b) =>
        b.movieTitle || b.showtime?.movie?.title || '—';

    const getCinema = (b) =>
        b.cinemaName || b.showtime?.room?.cinema?.name || '—';

    const getRoom = (b) =>
        b.roomName || b.showtime?.room?.name || '—';

    const getDate = (b) => {
        const t = b.showstartTime || b.showtime?.startTime;
        if (!t) return '—';
        return new Date(t).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    if (loading) return <div className="bh-loading">Đang tải lịch sử...</div>;

    return (
        <div className="bh-root">
            <header className="bh-header">
                <div className="bh-logo" onClick={() => navigate('/')}>
                    CINEBOOKING<span style={{ color: '#e50914' }}>*</span>
                </div>
                <button className="bh-back-btn" onClick={() => navigate('/')}>← Trang chủ</button>
            </header>

            <div className="bh-container">
                <h1 className="bh-title">🎟️ Lịch sử đặt vé</h1>

                {bookings.length === 0 ? (
                    <div className="bh-empty">
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
                        <p>Bạn chưa có vé nào. Hãy đặt vé ngay!</p>
                        <button className="bh-cta" onClick={() => navigate('/')}>Xem phim ngay</button>
                    </div>
                ) : (
                    <div className="bh-list">
                        {bookings.map(b => {
                            const status = STATUS_MAP[b.status] || { label: b.status, color: '#aaa' };
                            const poster = getMoviePoster(b);
                            return (
                                <div key={b._id} className="bh-card">
                                    {/* Poster */}
                                    <div className="bh-card-poster">
                                        {poster
                                            ? <img src={poster} alt="poster" />
                                            : <div className="bh-poster-placeholder">🎬</div>
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="bh-card-info">
                                        <div className="bh-movie-title">{getMovieTitle(b)}</div>
                                        <div className="bh-meta">
                                            <span>📍 {getCinema(b)}</span>
                                            <span>🎭 {getRoom(b)}</span>
                                            <span>📅 {getDate(b)}</span>
                                            <span>💺 {b.tickets?.map(t => t.seatLabel).join(', ') || '—'}</span>
                                        </div>
                                        <div className="bh-code">MÃ VÉ: <strong>{b.bookingCode}</strong></div>
                                        <div className="bh-price-row">
                                            {b.totalPrice !== b.finalPrice && (
                                                <span className="bh-price-old">{b.totalPrice?.toLocaleString()}đ</span>
                                            )}
                                            <span className="bh-price-final">{b.finalPrice?.toLocaleString()}đ</span>
                                        </div>
                                    </div>

                                    {/* Right: Status + QR */}
                                    <div className="bh-card-right">
                                        <div className="bh-status-badge" style={{ color: status.color, borderColor: status.color }}>
                                            {status.label}
                                        </div>
                                        {b.qrCode && b.status === 'confirmed' && (
                                            <button className="bh-qr-btn" onClick={() => setQrModal(b)}>
                                                📱 Xem QR
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* QR Modal */}
            {qrModal && (
                <div className="bh-modal-overlay" onClick={() => setQrModal(null)}>
                    <div className="bh-modal" onClick={e => e.stopPropagation()}>
                        <button className="bh-modal-close" onClick={() => setQrModal(null)}>✕</button>
                        <div className="bh-modal-title">🎟️ Vé Điện Tử</div>
                        <div className="bh-modal-code">{qrModal.bookingCode}</div>

                        <div className="bh-modal-info">
                            <div><span>Phim</span><strong>{getMovieTitle(qrModal)}</strong></div>
                            <div><span>Rạp</span><strong>{getCinema(qrModal)}</strong></div>
                            <div><span>Phòng</span><strong>{getRoom(qrModal)}</strong></div>
                            <div><span>Suất</span><strong>{getDate(qrModal)}</strong></div>
                            <div><span>Ghế</span><strong>{qrModal.tickets?.map(t => t.seatLabel).join(', ')}</strong></div>
                            <div><span>Tổng tiền</span><strong style={{ color: '#4ade80' }}>{qrModal.finalPrice?.toLocaleString()}đ</strong></div>
                        </div>

                        <div className="bh-modal-qr-wrap">
                            <img src={qrModal.qrCode} alt="QR Code" className="bh-modal-qr" />
                            <p>Quét mã này tại quầy vé để nhận vé</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .bh-root { min-height: 100vh; background: #0a0a0f; color: #fff; font-family: 'Inter', sans-serif; }
        .bh-loading { display:flex; align-items:center; justify-content:center; min-height:100vh; color:#888; font-size:1.2rem; background:#0a0a0f; }

        /* Header */
        .bh-header { display:flex; justify-content:space-between; align-items:center; padding:24px 40px; border-bottom:1px solid rgba(255,255,255,0.05); }
        .bh-logo { font-size:22px; font-weight:900; letter-spacing:2px; cursor:pointer; }
        .bh-back-btn { background:transparent; border:1px solid #333; color:#999; padding:8px 18px; border-radius:30px; cursor:pointer; font-size:13px; font-weight:600; transition:0.2s; }
        .bh-back-btn:hover { border-color:#e50914; color:#fff; }

        /* Container */
        .bh-container { max-width: 900px; margin: 50px auto; padding: 0 24px; }
        .bh-title { font-size:28px; font-weight:900; margin:0 0 32px; letter-spacing:-0.5px; }

        /* Empty */
        .bh-empty { text-align:center; padding:80px 20px; color:#666; }
        .bh-empty p { font-size:16px; margin-bottom: 24px; }
        .bh-cta { background:#e50914; color:#fff; border:none; padding:14px 32px; border-radius:8px; font-weight:700; font-size:15px; cursor:pointer; transition:0.2s; }
        .bh-cta:hover { background:#c2070f; transform:translateY(-2px); }

        /* Card */
        .bh-list { display:flex; flex-direction:column; gap:16px; }
        .bh-card { display:flex; gap:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; padding:20px; transition:0.2s; }
        .bh-card:hover { border-color:rgba(229,9,20,0.3); background:rgba(255,255,255,0.05); }

        .bh-card-poster { flex-shrink:0; width:80px; }
        .bh-card-poster img { width:80px; height:110px; object-fit:cover; border-radius:10px; }
        .bh-poster-placeholder { width:80px; height:110px; background:rgba(255,255,255,0.05); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:28px; }

        .bh-card-info { flex:1; min-width:0; }
        .bh-movie-title { font-size:18px; font-weight:800; margin-bottom:10px; line-height:1.3; }
        .bh-meta { display:flex; flex-wrap:wrap; gap:8px 20px; margin-bottom:12px; }
        .bh-meta span { font-size:13px; color:#888; }
        .bh-code { font-size:12px; color:#666; margin-bottom:8px; font-family:monospace; letter-spacing:1px; }
        .bh-price-row { display:flex; align-items:center; gap:10px; }
        .bh-price-old { font-size:13px; color:#666; text-decoration:line-through; }
        .bh-price-final { font-size:18px; font-weight:800; color:#4ade80; }

        .bh-card-right { flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; justify-content:space-between; gap:12px; }
        .bh-status-badge { font-size:11px; font-weight:700; letter-spacing:1px; padding:5px 12px; border-radius:20px; border:1px solid; text-transform:uppercase; }
        .bh-qr-btn { background:rgba(229,9,20,0.1); border:1px solid rgba(229,9,20,0.3); color:#e50914; padding:10px 16px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:600; transition:0.2s; white-space:nowrap; }
        .bh-qr-btn:hover { background:#e50914; color:#fff; }

        /* Modal */
        .bh-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; }
        .bh-modal { background:#111118; border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:36px; max-width:400px; width:100%; position:relative; text-align:center; }
        .bh-modal-close { position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.1); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:0.2s; }
        .bh-modal-close:hover { background:rgba(229,9,20,0.3); }
        .bh-modal-title { font-size:20px; font-weight:800; margin-bottom:8px; }
        .bh-modal-code { font-family:monospace; font-size:20px; font-weight:900; color:#e50914; letter-spacing:3px; margin-bottom:20px; }
        .bh-modal-info { text-align:left; margin-bottom:24px; background:rgba(255,255,255,0.03); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:10px; }
        .bh-modal-info div { display:flex; justify-content:space-between; gap:8px; font-size:13px; }
        .bh-modal-info div span { color:#666; }
        .bh-modal-info div strong { color:#fff; text-align:right; }
        .bh-modal-qr-wrap { background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.15); border-radius:12px; padding:24px; }
        .bh-modal-qr { width:180px; height:180px; border-radius:8px; background:#fff; padding:10px; box-sizing:border-box; }
        .bh-modal-qr-wrap p { color:#666; font-size:12px; margin-top:12px; margin-bottom:0; }
      `}</style>
        </div>
    );
};

export default BookingHistory;
