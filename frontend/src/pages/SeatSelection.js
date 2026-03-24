import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimesApi } from '../api/showtimes.api';
import { bookingsApi } from '../api/bookings.api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [showtime, setShowtime] = useState(null);
  const [roomSeats, setRoomSeats] = useState([]);
  const [seatStatuses, setSeatStatuses] = useState({});
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // connect to socket socket.io server
    const newSocket = io('http://localhost:5001', { withCredentials: true });
    setSocket(newSocket);

    newSocket.emit('join_showtime', id);

    newSocket.on('seat_status', (data) => {
       const statuses = {};
       data.forEach(s => {
         statuses[s.id] = s.status;
       });
       setSeatStatuses(statuses);
    });

    newSocket.on('seats_updated', (data) => {
       setSeatStatuses(prev => {
         const updated = { ...prev };
         data.seats.forEach(s => {
           updated[s.id] = s.status;
         });
         return updated;
       });
    });

    return () => {
      newSocket.emit('leave_showtime', id);
      newSocket.disconnect();
    };
  }, [id]);

  const fetchShowtime = useCallback(async () => {
    try {
      const res = await showtimesApi.getDetails(id);
      setShowtime(res.data.data);
      if (res.data.data.room && res.data.data.room.seats) {
        setRoomSeats(res.data.data.room.seats);
      }
    } catch (err) {
      toast.error('Không thể tải suất chiếu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShowtime();
  }, [fetchShowtime]);

  const toggleSeat = (seatId) => {
    const status = seatStatuses[seatId] || 'available';
    if (status === 'booked' || status === 'locked') {
      return; // Cannot select
    }

    setSelectedSeatIds(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt vé');
      navigate('/login');
      return;
    }
    
    if (selectedSeatIds.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 ghế');
      return;
    }
    
    try {
      // First lock the seats
      await bookingsApi.lockSeats({ showtimeId: id, seatIds: selectedSeatIds });
      
      // Then create the booking (simplified for MVP: pay immediately)
      await bookingsApi.create({ showtimeId: id, seatIds: selectedSeatIds });
      toast.success('Đặt vé thành công!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt vé');
      fetchShowtime(); // refresh if conflicting state
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ color: '#E71A0F', fontSize: '24px', fontWeight: 'bold' }}>Đang tải sơ đồ ghế...</div>
    </div>
  );
  if (!showtime) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ color: 'white', fontSize: '20px' }}>Không có dữ liệu suất chiếu.</div>
    </div>
  );

  // Group seats by row
  const rows = {};
  roomSeats.forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });
  const rowNames = Object.keys(rows).sort();

  const totalPrice = selectedSeatIds.length * showtime.basePrice;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at top, #1a1a2e 0%, #0a0a0a 100%)', 
      color: 'white', 
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          background: 'rgba(255,255,255,0.05)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '10px 20px',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#E71A0F'; e.currentTarget.style.borderColor = '#E71A0F'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      >
        <span>←</span> Quay lại Phim
      </button>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header Info */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {showtime.movie?.title}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', color: '#aaa', fontSize: '16px' }}>
            <span><strong style={{ color: '#fff' }}>Rạp:</strong> {showtime.room?.cinema?.name}</span>
            <span>|</span>
            <span><strong style={{ color: '#fff' }}>Phòng:</strong> {showtime.room?.name}</span>
            <span>|</span>
            <span><strong style={{ color: '#fff' }}>Giờ:</strong> {new Date(showtime.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(showtime.startTime).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Screen Visual */}
        <div style={{
          position: 'relative',
          margin: '0 auto 60px auto',
          width: '80%',
          height: '60px',
          borderTop: '4px solid rgba(255,255,255,0.7)',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          boxShadow: '0 -20px 40px -10px rgba(255,255,255,0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '15px'
        }}>
          <span style={{ letterSpacing: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 'bold' }}>MÀN HÌNH</span>
          {/* Subtle screen glow */}
          <div style={{
            position: 'absolute',
            top: 0, left: '10%', right: '10%', height: '100px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)',
            pointerEvents: 'none',
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          }}></div>
        </div>
        
        {/* Seat Grid */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          alignItems: 'center',
          perspective: '1000px'
        }}>
          {rowNames.map(row => (
            <div key={row} style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '30px', fontWeight: 'bold', color: '#666', fontSize: '14px', textAlign: 'right', paddingRight: '10px' }}>
                {row}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {rows[row].sort((a,b) => a.number - b.number).map((seat, index) => {
                  const status = seatStatuses[seat._id] || 'available';
                  const isSelected = selectedSeatIds.includes(seat._id);
                  
                  // Gap in the middle for aisles if needed (pseudo logic)
                  const isAisle = index === Math.floor(rows[row].length / 2) - 1;

                  let bgColor = '#2a2a35'; // default available
                  let borderColor = '#3a3a45';
                  let shadow = '0 4px 6px rgba(0,0,0,0.3)';
                  let color = '#fff';

                  if (status === 'booked' || status === 'locked') {
                    bgColor = '#111';
                    borderColor = '#222';
                    color = '#444';
                    shadow = 'none';
                  } else if (isSelected) {
                    bgColor = '#E71A0F';
                    borderColor = '#ff4d4d';
                    shadow = '0 0 15px rgba(231,26,15,0.6), 0 4px 10px rgba(0,0,0,0.4)';
                  } else if (seat.type === 'vip') {
                    bgColor = '#503520'; 
                    borderColor = '#FFD700'; // Gold border for VIP
                  } else if (seat.type === 'couple') {
                    bgColor = '#6d28d9';
                    borderColor = '#8b5cf6';
                  }

                  return (
                    <div 
                      key={seat._id}
                      onClick={() => toggleSeat(seat._id)}
                      style={{
                        position: 'relative',
                        width: seat.type === 'couple' ? '80px' : '36px',
                        height: '36px',
                        backgroundColor: bgColor,
                        borderTop: `3px solid ${borderColor}`,
                        borderRadius: '6px 6px 4px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (status === 'booked' || status === 'locked') ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: color,
                        marginRight: isAisle ? '30px' : '0',
                        boxShadow: shadow,
                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: isSelected ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
                        userSelect: 'none'
                      }}
                      title={`Ghế ${row}${seat.number} - ${seat.type.toUpperCase()}`}
                      onMouseOver={(e) => {
                        if (status === 'available' && !isSelected) {
                          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 15px rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (status === 'available' && !isSelected) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = shadow;
                        }
                      }}
                    >
                      {/* Little seat armrests effect */}
                      <div style={{ position: 'absolute', left: '-2px', top: '10px', bottom: '2px', width: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px' }}></div>
                      <div style={{ position: 'absolute', right: '-2px', top: '10px', bottom: '2px', width: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px' }}></div>
                      
                      {status === 'locked' ? '🔒' : (status === 'booked' ? '×' : seat.number)}
                    </div>
                  );
                })}
              </div>

              <div style={{ width: '30px', fontWeight: 'bold', color: '#666', fontSize: '14px', textAlign: 'left', paddingLeft: '10px' }}>
                {row}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '30px', 
          marginTop: '50px',
          padding: '20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <div style={{ width: 24, height: 24, backgroundColor: '#2a2a35', borderTop: '3px solid #3a3a45', borderRadius: 4 }}></div> Thường
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <div style={{ width: 24, height: 24, backgroundColor: '#503520', borderTop: '3px solid #FFD700', borderRadius: 4 }}></div> VIP
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <div style={{ width: 40, height: 24, backgroundColor: '#6d28d9', borderTop: '3px solid #8b5cf6', borderRadius: 4 }}></div> Couple
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <div style={{ width: 24, height: 24, backgroundColor: '#E71A0F', borderTop: '3px solid #ff4d4d', borderRadius: 4, boxShadow: '0 0 10px rgba(231,26,15,0.5)' }}></div> Đang chọn
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#666' }}>
            <div style={{ width: 24, height: 24, backgroundColor: '#111', borderTop: '3px solid #222', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent:'center', color: '#444' }}>×</div> Đã bán
          </div>
        </div>

        {/* Checkout Bar Container */}
        <div style={{ height: '100px' }}></div>
        
        {/* Sticky Checkout Bar */}
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          background: 'rgba(15, 15, 20, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
          zIndex: 100
        }}>
          <div>
            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>
              {selectedSeatIds.length === 0 ? 'Vui lòng chọn ghế' : `Đã chọn ${selectedSeatIds.length} ghế`}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
              {selectedSeatIds.map(id => {
                 const s = roomSeats.find(seat => seat._id === id);
                 return s ? `${s.row}${s.number}` : '';
              }).join(', ')}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: '#aaa' }}>Tổng thanh toán</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#E71A0F' }}>
                {totalPrice.toLocaleString()} đ
              </div>
            </div>
            <button 
              onClick={handleBooking}
              disabled={selectedSeatIds.length === 0}
              style={{
                background: selectedSeatIds.length > 0 ? 'linear-gradient(135deg, #E71A0F, #ff4d4d)' : '#333',
                color: selectedSeatIds.length > 0 ? '#fff' : '#666',
                border: 'none',
                padding: '16px 40px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: selectedSeatIds.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: selectedSeatIds.length > 0 ? '0 10px 20px rgba(231,26,15,0.3)' : 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Thanh Toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
