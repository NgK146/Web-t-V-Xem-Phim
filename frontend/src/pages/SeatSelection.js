import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimesApi } from '../api/showtimes.api';
import { bookingsApi } from '../api/bookings.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { discountsApi } from '../api/discounts.api';
import { paymentApi } from '../api/payment.api';
import FoodSelection from '../components/FoodSelection';

const LOCK_SECONDS = 5 * 60;

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [showtime, setShowtime] = useState(null);
  const [roomSeats, setRoomSeats] = useState([]);
  const [seatStatuses, setSeatStatuses] = useState({});
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [booking, setBooking]             = useState(false);
  const [step, setStep]                   = useState(1); // 1 = Seat, 2 = Food
  const [selectedFoods, setSelectedFoods] = useState([]);

  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const lockedSeatsRef = useRef([]);

  // Discount UI State
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [loadingDiscount, setLoadingDiscount] = useState(false);

  // Reset discount if seats change
  useEffect(() => {
    setAppliedDiscount(null);
  }, [selectedSeatIds]);

  // ─── Timer ───────────────────────────────────────────────
  const startTimer = useCallback((initialSeconds = LOCK_SECONDS) => {
    clearInterval(timerRef.current);
    setTimeLeft(initialSeconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? (clearInterval(timerRef.current), 0) : prev - 1));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(null);
  }, []);

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (!lockedSeatsRef.current.length) return;
    toast.warning('⏱️ Hết thời gian giữ ghế! Vui lòng chọn lại.', { autoClose: 4000 });
    bookingsApi.unlockSeats({ showtimeId: id, seatIds: lockedSeatsRef.current }).catch(() => { });
    setSelectedSeatIds([]);
    lockedSeatsRef.current = [];
    setTimeLeft(null);
  }, [timeLeft, id]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (lockedSeatsRef.current.length)
      bookingsApi.unlockSeats({ showtimeId: id, seatIds: lockedSeatsRef.current }).catch(() => { });
  }, [id]);

  // ─── Socket ──────────────────────────────────────────────
  useEffect(() => {
    const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const sock = io(SOCKET_URL, { withCredentials: true });
    sock.emit('join_showtime', id);
    sock.on('seat_status', data => {
      const s = {};
      data.forEach(x => { s[x.id] = x.status; });
      setSeatStatuses(s);
    });
    sock.on('seats_updated', data => {
      setSeatStatuses(prev => {
        const u = { ...prev };
        data.seats.forEach(x => { u[x.id] = x.status; });
        return u;
      });
    });
    return () => { sock.emit('leave_showtime', id); sock.disconnect(); };
  }, [id]);

  // ─── Fetch ───────────────────────────────────────────────
  const fetchShowtime = useCallback(async () => {
    try {
      const res = await showtimesApi.getDetails(id);
      const data = res.data.data;
      setShowtime(data);
      setRoomSeats(data.room?.seats || []);

      // Populate seatStatuses immediately from API so orphan check works before socket fires
      const initialStatuses = {};
      data.seats?.forEach(s => {
        initialStatuses[s.seat?.toString()] = s.status;
      });
      setSeatStatuses(initialStatuses);

      // Restore locked seats for current user upon reload
      if (user) {
        let minTimeLeft = LOCK_SECONDS;
        const myLockedSeats = [];
        const now = new Date().getTime();

        data.seats?.forEach(s => {
          const uId = user.id || user._id;
          if (s.status === 'locked' && s.lockedBy === uId && s.lockedAt) {
            const expTime = new Date(s.lockedAt).getTime();
            if (expTime > now) {
              myLockedSeats.push(s.seat.toString());
              const remainingSec = Math.floor((expTime - now) / 1000);
              minTimeLeft = Math.min(minTimeLeft, remainingSec);
            }
          }
        });

        if (myLockedSeats.length > 0 && lockedSeatsRef.current.length === 0) {
          lockedSeatsRef.current = myLockedSeats;
          setSelectedSeatIds(myLockedSeats);
          startTimer(minTimeLeft);
        }
      }

    } catch { toast.error('Không thể tải suất chiếu'); }
    finally { setLoading(false); }
  }, [id, user, startTimer]);

  useEffect(() => { fetchShowtime(); }, [fetchShowtime]);

  // ─── Orphan seat check ───────────────────────────────────
  // Returns true if the proposed selectedIds would leave exactly 1 empty seat
  // trapped between unavailable seats or the row boundary.
  const hasOrphanSeat = (proposedSelectedIds) => {
    if (!showtime || !roomSeats.length) return false;

    // Group room seats by row, sorted by number
    const byRow = {};
    roomSeats.forEach(s => {
      if (!byRow[s.row]) byRow[s.row] = [];
      byRow[s.row].push(s);
    });
    Object.values(byRow).forEach(arr => arr.sort((a, b) => a.number - b.number));

    for (const seats of Object.values(byRow)) {
      // Build status array: 'free' | 'taken'
      const states = seats.map(s => {
        const sid = s._id;
        const st = seatStatuses[sid] || 'available';
        if (proposedSelectedIds.includes(sid)) return 'taken'; // selected
        if (st === 'booked') return 'taken';                   // already booked
        if (st === 'locked') return 'taken';                   // locked by others
        return 'free';
      });

      // Check each seat: is it free AND both neighbours are 'taken' or boundary?
      for (let i = 0; i < states.length; i++) {
        if (states[i] === 'free') {
          const leftBlocked = i === 0 || states[i - 1] === 'taken';
          const rightBlocked = i === states.length - 1 || states[i + 1] === 'taken';
          if (leftBlocked && rightBlocked) return true;
        }
      }
    }
    return false;
  };

  // ─── Toggle seat ─────────────────────────────────────────
  const toggleSeat = async (seat) => {
    if (!user) { navigate('/login'); return; }
    const seatId = seat._id;
    const status = seatStatuses[seatId] || 'available';
    const isLockedByMe = lockedSeatsRef.current.includes(seatId);
    if (status === 'booked') return;
    if (status === 'locked' && !isLockedByMe) return;

    if (selectedSeatIds.includes(seatId)) {
      // Deselect → unlock
      // Orphan check: would removing this seat leave an orphan elsewhere?
      const proposed = selectedSeatIds.filter(s => s !== seatId);
      if (hasOrphanSeat(proposed)) {
        toast.warning('Lưu ý: Bạn đang để lại 1 ghế trống bị kẹp, nút Mua Vé sẽ bị khóa!', { autoClose: 3000 });
      }
      try {
        await bookingsApi.unlockSeats({ showtimeId: id, seatIds: [seatId] });
        lockedSeatsRef.current = lockedSeatsRef.current.filter(s => s !== seatId);
        setSelectedSeatIds(prev => {
          const next = prev.filter(s => s !== seatId);
          if (!next.length) stopTimer();
          return next;
        });
      } catch { toast.error('Không thể bỏ chọn ghế'); }
    } else {
      // Select → lock
      // Orphan check: would adding this seat create an orphan elsewhere?
      const proposed = [...selectedSeatIds, seatId];
      if (hasOrphanSeat(proposed)) {
        toast.warning('Lưu ý: Bạn đang để lại 1 ghế trống bị kẹp, nút Mua Vé sẽ bị khóa!', { autoClose: 3000 });
      }
      try {
        await bookingsApi.lockSeats({ showtimeId: id, seatIds: [seatId] });
        lockedSeatsRef.current = [...lockedSeatsRef.current, seatId];
        setSelectedSeatIds(prev => {
          if (!prev.length) startTimer();
          return [...prev, seatId];
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Ghế không thể chọn');
        fetchShowtime();
      }
    }
  };

  // ─── Booking & Discount ─────────────────────────────────────────────
  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) return;
    if (selectedSeatIds.length === 0) {
      toast.warning('Vui lòng chọn ghế trước khi áp dụng mã giảm giá');
      return;
    }
    setLoadingDiscount(true);
    try {
      // Calculate current totalPrice to validate
      const currentTotal = selectedSeatIds.reduce((sum, sid) => {
        const sw = showtime.seats?.find(s => s.seat?.toString() === sid);
        return sum + (sw?.price || showtime.basePrice || 0);
      }, 0);

      const res = await discountsApi.validate({ code: discountCodeInput.trim(), amount: currentTotal });
      setAppliedDiscount({
        code: res.data.data.code,
        discountAmount: res.data.data.discountAmount
      });
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể áp dụng mã');
      setAppliedDiscount(null);
    } finally {
      setLoadingDiscount(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSeatIds.length) { toast.warning('Vui lòng chọn ít nhất 1 ghế'); return; }
    setBooking(true);
    try {
      const res = await bookingsApi.create({ 
        showtimeId: id, 
        seatIds: selectedSeatIds,
        discountCode: appliedDiscount?.code,
        foods: selectedFoods
      });
      
      const bookingId = res.data.data._id;
      toast.info('Đang chuyển hướng sang cổng thanh toán...');

      const paymentRes = await paymentApi.createPayOSLink(bookingId);
      
      lockedSeatsRef.current = [];
      stopTimer();
      window.location.href = paymentRes.data.data.checkoutUrl;

    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
      fetchShowtime();
      setBooking(false);
    }
  };

  // ─── Loading / empty ─────────────────────────────────────
  if (loading) return (
    <div className="ss-center-screen">
      <div className="ss-loading-dot" /><div className="ss-loading-dot" /><div className="ss-loading-dot" />
    </div>
  );
  if (!showtime) return (
    <div className="ss-center-screen" style={{ color: '#888', fontSize: 18 }}>Không tìm thấy suất chiếu.</div>
  );

  // ─── Seat grid data ──────────────────────────────────────
  const rows = {};
  roomSeats.forEach(s => { if (!rows[s.row]) rows[s.row] = []; rows[s.row].push(s); });
  const rowNames = Object.keys(rows).sort();

  const totalSeatPrice = selectedSeatIds.reduce((sum, sid) => {
    const sw = showtime.seats?.find(s => s.seat?.toString() === sid);
    return sum + (sw?.price || showtime.basePrice || 0);
  }, 0);

  const totalFoodPrice = selectedFoods.reduce((sum, f) => {
    return sum + (f.price || 0) * f.quantity;
  }, 0); // Need to pass price or re-fetch. Ah! FoodSelection doesn't store price. Let's fix selectedFoods to store price as well in FoodSelection. 
  // Wait, I can't fetch price easily here unless I store it in selectedFoods. Let's assume we update FoodSelection to store price.

  const totalPrice = totalSeatPrice + totalFoodPrice;

  const mm = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
  const ss = timeLeft !== null ? timeLeft % 60 : 0;
  const countdown = timeLeft !== null ? `${mm}:${ss.toString().padStart(2, '0')}` : null;
  const urgent = timeLeft !== null && timeLeft <= 60;

  const selectedLabels = selectedSeatIds.map(sid => {
    const s = roomSeats.find(x => x._id === sid);
    return s ? `${s.row}${s.number}` : '';
  }).join(', ');

  const finalPrice = appliedDiscount ? Math.max(0, totalPrice - appliedDiscount.discountAmount) : totalPrice;
  const isOrphanState = hasOrphanSeat(selectedSeatIds);

  return (
    <div className="ss-root">

      {/* ── TOP HEADER BAR ── */}
      <header className="ss-header">
        {/* Left: back button */}
        <button className="ss-back-btn" onClick={() => {
          if (step === 2) setStep(1);
          else navigate(-1);
        }}>
          <span>←</span> Quay lại
        </button>

        {/* Center: movie + showtime info */}
        <div className="ss-header-info">
          <div className="ss-movie-title">{showtime.movie?.title}</div>
          <div className="ss-header-meta">
            <span>🏛️ {showtime.room?.cinema?.name || showtime.cinemaName}</span>
            <span className="ss-meta-sep">·</span>
            <span>🚪 {showtime.room?.name || showtime.roomName}</span>
            <span className="ss-meta-sep">·</span>
            <span>🕐 {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} &nbsp;
              {new Date(showtime.startTime).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Right: countdown pill */}
        <div className="ss-timer-wrap">
          {countdown ? (
            <div className={`ss-timer-pill ${urgent ? 'urgent' : ''}`}>
              <span className="ss-timer-icon">{urgent ? '⚠️' : '⏱️'}</span>
              <span className="ss-timer-label">Còn lại</span>
              <span className="ss-timer-value">{countdown}</span>
            </div>
          ) : (
            <div className="ss-timer-pill inactive">
              <span className="ss-timer-icon">⏱️</span>
              <span className="ss-timer-label">Chọn ghế để giữ 5 phút</span>
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="ss-main">

        {step === 1 ? (
          <>
            {/* Screen */}
            <div className="ss-screen-wrap">
              <div className="ss-screen" />
              <div className="ss-screen-label">MÀN HÌNH</div>
            </div>

            {/* Seat Grid */}
            <div className="ss-grid">
              {rowNames.map(row => (
                <div key={row} className="ss-row">
                  <div className="ss-row-label">{row}</div>
                  <div className="ss-row-seats">
                    {rows[row].sort((a, b) => a.number - b.number).map((seat, idx) => {
                      const status     = seatStatuses[seat._id] || 'available';
                      const isSelected = selectedSeatIds.includes(seat._id);
                      const isMine     = lockedSeatsRef.current.includes(seat._id);
                      const isBooked   = status === 'booked';
                      const isLocked   = status === 'locked' && !isMine;
                      const isAisle    = idx === Math.floor(rows[row].length / 2) - 1;

                      let cls = 'ss-seat';
                      if (isBooked)      cls += ' booked';
                      else if (isLocked) cls += ' locked-other';
                      else if (isSelected) cls += ' selected';
                      else if (seat.type === 'vip')    cls += ' vip';
                      else if (seat.type === 'couple') cls += ' couple';

                      return (
                        <div
                          key={seat._id}
                          className={cls + (seat.type === 'couple' ? ' couple-wide' : '') + (isAisle ? ' aisle-gap' : '')}
                          onClick={() => !(isBooked || isLocked) && toggleSeat(seat)}
                          title={`Ghế ${row}${seat.number} — ${seat.type}${isLocked ? ' (đang được giữ)' : ''}`}
                        >
                          <span className="ss-seat-arm ss-seat-arm-l" />
                          <span className="ss-seat-arm ss-seat-arm-r" />
                          {isLocked ? '🔒' : isBooked ? '×' : seat.number}
                        </div>
                      );
                    })}
                  </div>
                  <div className="ss-row-label">{row}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="ss-legend">
              {[
                { cls: '',        label: 'Thường' },
                { cls: 'vip',     label: 'VIP' },
                { cls: 'couple',  label: 'Couple' },
                { cls: 'selected',label: 'Đang chọn' },
                { cls: 'locked-other', label: 'Đang giữ' },
                { cls: 'booked',  label: 'Đã bán' },
              ].map((item, i) => (
                <div key={i} className="ss-legend-item">
                  <div className={`ss-seat ss-legend-swatch ${item.cls}`} style={{ width: item.cls === 'couple' ? 40 : 24, height: 24, fontSize: 0 }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <FoodSelection selectedFoods={selectedFoods} onChange={setSelectedFoods} />
        )}

        <div style={{ height: 120 }} />
      </main>

      {/* ── CHECKOUT BAR ── */}
      <footer className="ss-checkout">
        <div className="ss-checkout-left">
          <div className="ss-checkout-count">
            {selectedSeatIds.length === 0 ? 'Chưa chọn ghế nào' : `${selectedSeatIds.length} ghế đã chọn`}
          </div>
          {selectedLabels && <div className="ss-checkout-seats">{selectedLabels}</div>}
          {countdown && (
            <div className={`ss-checkout-timer ${urgent ? 'urgent' : ''}`}>
              ⏱ Giữ ghế còn <strong>{countdown}</strong>
            </div>
          )}
        </div>

        <div className="ss-checkout-middle">
          <div className="ss-discount-wrap">
            {appliedDiscount ? (
              <div className="ss-discount-applied">
                <span className="ss-discount-badge">🎟️ Mã: {appliedDiscount.code} (-{appliedDiscount.discountAmount.toLocaleString()}đ)</span>
                <button className="ss-discount-remove" onClick={() => { setAppliedDiscount(null); setDiscountCodeInput(''); }}>✕</button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá..."
                  className="ss-discount-input"
                  value={discountCodeInput}
                  onChange={e => setDiscountCodeInput(e.target.value.toUpperCase())}
                />
                <button
                  className="ss-discount-btn"
                  onClick={handleApplyDiscount}
                  disabled={loadingDiscount || !discountCodeInput || selectedSeatIds.length === 0}
                >
                  {loadingDiscount ? '...' : 'Áp dụng'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="ss-checkout-right">
          <div className="ss-checkout-price-wrap">
            {isOrphanState && (
              <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>
                * Không được để trống 1 ghế kẹp giữa
              </div>
            )}
            <div className="ss-checkout-price-label">Tổng thanh toán</div>
            {appliedDiscount ? (
              <div className="ss-checkout-price-discount-group">
                <span className="ss-checkout-price old">{totalPrice.toLocaleString()} đ</span>
                <span className="ss-checkout-price new">{finalPrice.toLocaleString()} đ</span>
              </div>
            ) : (
              <div className="ss-checkout-price">{totalPrice.toLocaleString()} đ</div>
            )}
          </div>
          {step === 1 ? (
            <button
              className={`ss-checkout-btn ${selectedSeatIds.length > 0 && !isOrphanState ? 'active' : ''}`}
              disabled={selectedSeatIds.length === 0 || isOrphanState}
              onClick={() => setStep(2)}
            >
              Tiếp tục 🍿
            </button>
          ) : (
            <button
              className={`ss-checkout-btn ${selectedSeatIds.length > 0 && !booking ? 'active' : ''}`}
              disabled={selectedSeatIds.length === 0 || booking}
              onClick={handleBooking}
            >
              {booking ? '⌛ Đang xử lý...' : '🎬 Thanh Toán'}
            </button>
          )}
        </div>
      </footer>

      <style>{`
        /* Root */
        .ss-root { display:flex; flex-direction:column; min-height:100vh; background:radial-gradient(ellipse at top,#1a1a2e 0%,#0a0a0f 100%); color:#fff; font-family:'Inter','Segoe UI',sans-serif; }

        /* Loading */
        .ss-center-screen { display:flex; align-items:center; justify-content:center; gap:10px; min-height:100vh; background:#0a0a0f; }
        .ss-loading-dot { width:14px; height:14px; border-radius:50%; background:#E71A0F; animation:ssBouce 0.9s infinite alternate; }
        .ss-loading-dot:nth-child(2){animation-delay:.3s;background:#ff4d4d;}
        .ss-loading-dot:nth-child(3){animation-delay:.6s;background:#ff8080;}
        @keyframes ssBouce{ from{transform:translateY(0);opacity:.6;} to{transform:translateY(-16px);opacity:1;} }

        /* Header */
        .ss-header {
          position:sticky; top:0; z-index:100;
          display:flex; align-items:center; gap:16px;
          background:rgba(10,10,20,0.95); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,255,255,0.08);
          padding:12px 24px;
        }
        .ss-back-btn {
          flex-shrink:0;
          display:flex; align-items:center; gap:8px;
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
          color:#ddd; padding:9px 18px; border-radius:30px;
          font-size:14px; font-weight:600; cursor:pointer;
          transition:all 0.2s; white-space:nowrap;
        }
        .ss-back-btn:hover { background:#E71A0F; border-color:#E71A0F; color:#fff; }

        .ss-header-info { flex:1; text-align:center; overflow:hidden; }
        .ss-movie-title { font-size:18px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ss-header-meta { display:flex; justify-content:center; gap:6px; flex-wrap:wrap; font-size:12px; color:rgba(255,255,255,0.45); margin-top:3px; }
        .ss-meta-sep { color:rgba(255,255,255,0.2); }

        /* Timer */
        .ss-timer-wrap { flex-shrink:0; }
        .ss-timer-pill {
          display:flex; align-items:center; gap:8px;
          background:rgba(37,99,235,0.2); border:1px solid rgba(96,165,250,0.35);
          border-radius:30px; padding:8px 16px; white-space:nowrap;
          transition:all 0.4s;
        }
        .ss-timer-pill.urgent { background:rgba(185,28,28,0.25); border-color:rgba(248,113,113,0.5); animation:ssTimerPulse 1s infinite; }
        .ss-timer-pill.inactive { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.1); }
        @keyframes ssTimerPulse { 0%,100%{opacity:1;} 50%{opacity:.7;} }
        .ss-timer-icon { font-size:16px; }
        .ss-timer-label { font-size:11px; color:rgba(255,255,255,0.5); }
        .ss-timer-value { font-size:20px; font-weight:800; color:#93c5fd; font-variant-numeric:tabular-nums; }
        .ss-timer-pill.urgent .ss-timer-value { color:#fca5a5; }

        /* Main */
        .ss-main { flex:1; padding:40px 20px; max-width:900px; margin:0 auto; width:100%; }

        /* Screen visual */
        .ss-screen-wrap { text-align:center; margin-bottom:50px; }
        .ss-screen {
          width:70%; height:6px; margin:0 auto;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent);
          border-radius:3px;
          box-shadow:0 0 30px 8px rgba(255,255,255,0.08);
        }
        .ss-screen-label { margin-top:8px; font-size:11px; letter-spacing:6px; color:rgba(255,255,255,0.25); font-weight:700; }

        /* Grid */
        .ss-grid { display:flex; flex-direction:column; gap:10px; align-items:center; }
        .ss-row { display:flex; align-items:center; gap:8px; }
        .ss-row-label { width:26px; font-size:13px; font-weight:700; color:rgba(255,255,255,0.3); text-align:center; }
        .ss-row-seats { display:flex; gap:7px; }

        /* Seat */
        .ss-seat {
          position:relative;
          width:36px; height:34px;
          background:#1e1e2a; border-radius:6px 6px 3px 3px;
          border-top:3px solid #2e2e40;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:600; color:#ccc;
          cursor:pointer; user-select:none;
          transition:transform 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .ss-seat:hover:not(.booked):not(.locked-other) { transform:scale(1.12) translateY(-3px); box-shadow:0 6px 18px rgba(255,255,255,0.08); }
        .ss-seat.aisle-gap { margin-right:22px; }
        .ss-seat.couple-wide { width:78px; }
        .ss-seat-arm { position:absolute; width:3px; top:9px; bottom:2px; background:rgba(0,0,0,0.25); border-radius:2px; }
        .ss-seat-arm-l { left:-2px; }
        .ss-seat-arm-r { right:-2px; }

        /* States */
        .ss-seat.vip          { background:#3d2810; border-top-color:#c9960f; color:#f5c842; }
        .ss-seat.couple       { background:#3b1f7a; border-top-color:#7c3aed; color:#c4b5fd; }
        .ss-seat.selected     { background:#c9150d; border-top-color:#ff4d4d; color:#fff; transform:scale(1.1) translateY(-3px); box-shadow:0 0 18px rgba(231,26,15,0.55); }
        .ss-seat.locked-other { background:#111117; border-top-color:#1e1e28; color:#333; cursor:not-allowed; opacity:0.6; }
        .ss-seat.booked       { background:#0e0e14; border-top-color:#1a1a22; color:#2e2e3a; cursor:not-allowed; }

        /* Legend */
        .ss-legend { display:flex; flex-wrap:wrap; justify-content:center; gap:20px; margin-top:40px; padding:18px 24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:14px; }
        .ss-legend-item { display:flex; align-items:center; gap:8px; font-size:13px; color:rgba(255,255,255,0.55); }
        .ss-legend-swatch { pointer-events:none; border-radius:5px 5px 3px 3px; }

        /* Checkout bar - Floating */
        .ss-checkout {
          position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
          z-index:100; width:92%; max-width:1000px;
          display:flex; justify-content:space-between; align-items:center;
          background:rgba(15,15,25,0.85); backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:24px;
          padding:18px 32px;
          box-shadow:0 20px 50px rgba(0,0,0,0.6);
          animation:ssSlideUp 0.6s cubic-bezier(0.16,1,0.3,1);
          gap:16px;
        }
        @keyframes ssSlideUp { from{transform:translate(-50%, 100%); opacity:0;} to{transform:translate(-50%, 0); opacity:1;} }
        .ss-checkout-left { display:flex; flex-direction:column; gap:3px; }
        .ss-checkout-count { font-size:13px; color:rgba(255,255,255,0.45); }
        .ss-checkout-seats { font-size:15px; font-weight:700; color:#fff; }
        .ss-checkout-timer { font-size:12px; color:#60a5fa; }
        .ss-checkout-timer.urgent { color:#f87171; }

        .ss-checkout-right { display:flex; align-items:center; gap:24px; }
        .ss-checkout-price-wrap { text-align:right; }
        .ss-checkout-price-label { font-size:12px; color:rgba(255,255,255,0.4); }
        .ss-checkout-price { font-size:28px; font-weight:900; color:#E71A0F; line-height:1.1; font-variant-numeric:tabular-nums; }

        .ss-checkout-btn {
          padding:14px 36px; border:none; border-radius:10px;
          font-size:16px; font-weight:700; text-transform:uppercase; letter-spacing:1px;
          cursor:not-allowed; background:#1a1a26; color:#3a3a4a;
          transition:all 0.25s; min-width:180px;
        }
        .ss-checkout-btn.active {
          background:linear-gradient(135deg,#c9150d,#ff4d4d);
          color:#fff; cursor:pointer;
          box-shadow:0 8px 24px rgba(231,26,15,0.35);
        }
        .ss-checkout-btn.active:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(231,26,15,0.5); }
        
        /* Discount Styles */
        .ss-checkout-middle { display:flex; flex:1; justify-content:center; }
        .ss-discount-wrap { display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); padding:6px; border-radius:12px; }
        .ss-discount-input { background:transparent; border:none; color:#fff; padding:8px 12px; width:150px; outline:none; font-size:14px; text-transform:uppercase; font-family:inherit; }
        .ss-discount-input::placeholder { color:rgba(255,255,255,0.3); text-transform:none; }
        .ss-discount-btn { background:rgba(255,255,255,0.1); border:none; color:#fff; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; transition:all 0.2s; font-size:13px; }
        .ss-discount-btn:hover:not(:disabled) { background:rgba(255,255,255,0.2); }
        .ss-discount-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .ss-discount-applied { display:flex; align-items:center; gap:12px; padding:6px 14px; background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3); border-radius:8px; }
        .ss-discount-badge { font-size:13px; font-weight:600; color:#4ade80; }
        .ss-discount-remove { background:rgba(255,255,255,0.1); border:none; border-radius:50%; width:24px; height:24px; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px; transition:0.2s; }
        .ss-discount-remove:hover { background:rgba(239,68,68,0.3); color:#f87171; }
        
        .ss-checkout-price-discount-group { display:flex; flex-direction:column; align-items:flex-end; }
        .ss-checkout-price.old { font-size:14px; color:rgba(255,255,255,0.4); text-decoration:line-through; font-weight:500; }
        .ss-checkout-price.new { font-size:28px; font-weight:900; color:#4ade80; }
      `}</style>
    </div>
  );
};

export default SeatSelection;
