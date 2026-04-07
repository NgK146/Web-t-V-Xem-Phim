import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const navigate = useNavigate();
  const [status, setStatus] = useState('VERIFYING');

  useEffect(() => {
    if (!orderCode) {
      setStatus('FAILED');
      return;
    }
    
    // Auto-verify with our backend
    const checkStatus = async () => {
      try {
        const res = await api.get(`/payments/payos/status/${orderCode}`);
        if (res.data.data?.status === 'PAID') {
          setStatus('PAID');
        } else {
          setStatus('PENDING');
        }
      } catch (err) {
        setStatus('FAILED');
      }
    };
    checkStatus();
  }, [orderCode]);

  return (
    <div className="payment-result-page">
      <div className="payment-result-card success">
        
        {status === 'VERIFYING' && (
           <div className="payment-status-box verifying">
             <div className="payment-spinner"></div>
             <h3>Đang xác thực giao dịch...</h3>
             <p>Vui lòng không đóng trang này.</p>
           </div>
        )}

        {status === 'PAID' && (
           <>
            <div className="payment-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="payment-icon">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 className="payment-title">Thanh Toán Thành Công</h1>
            <p className="payment-subtitle">
              Mã giao dịch: {orderCode && <span className="payment-code">{orderCode}</span>}
            </p>
            
            <div className="payment-details-box">
              <div className="detail-row">
                <span>Trạng thái vé</span>
                <span className="status-badge confirmed">Đã xác nhận</span>
              </div>
              <div className="detail-row">
                <span>Lưu ý</span>
                <span className="notice">Bạn có thể kiểm tra vé ở Lịch sử xuất vé.</span>
              </div>
            </div>

            <div className="payment-actions">
              <button onClick={() => navigate('/my-bookings')} className="btn-primary">Xem Vé Của Tôi</button>
              <button onClick={() => navigate('/')} className="btn-ghost">Trở về Trang chủ</button>
            </div>
           </>
        )}

        {status === 'PENDING' && (
           <>
            <div className="payment-icon-wrapper pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="payment-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h1 className="payment-title">Đang Chờ Xác Nhận</h1>
            <p className="payment-subtitle">
              Mã giao dịch: {orderCode && <span className="payment-code">{orderCode}</span>}
            </p>
            
            <div className="payment-details-box">
              <p style={{marginBottom: 10, lineHeight: 1.6}}>Hệ thống PayOS đang ghi nhận khoản thanh toán của bạn.</p>
              <p style={{lineHeight: 1.6}}>Vui lòng chờ ít phút hoặc kiểm tra email để nhận thông báo mới nhất.</p>
            </div>

            <div className="payment-actions">
              <button onClick={() => navigate('/my-bookings')} className="btn-primary">Về Lịch Sử Đặt</button>
              <button onClick={() => window.location.reload()} className="btn-ghost">Tải lại trạng thái</button>
            </div>
           </>
        )}

        {status === 'FAILED' && (
           <>
            <div className="payment-icon-wrapper failed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="payment-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h1 className="payment-title">Giao Dịch Có Lỗi</h1>
            <p className="payment-subtitle">Không thể xác thực mã giao dịch {orderCode}</p>
            
            <div className="payment-actions">
              <button onClick={() => navigate('/')} className="btn-ghost">Trở về Trang chủ</button>
            </div>
           </>
        )}
      </div>

      <style>{`
        .payment-result-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }
        .payment-result-card {
          background: #12121c;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
          animation: slideUpFade 0.5s ease-out;
        }
        @keyframes slideUpFade {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* Loading State */
        .payment-status-box.verifying h3 { color: #fff; font-size: 20px; margin: 20px 0 8px; }
        .payment-status-box.verifying p { color: rgba(255,255,255,0.5); font-size: 14px; }
        .payment-spinner {
          width: 40px; height: 40px; margin: 0 auto;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #3b82f6; border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Icons */
        .payment-icon-wrapper {
          width: 64px; height: 64px; margin: 0 auto 24px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          background: rgba(34,197,94,0.1); color: #22c55e;
        }
        .payment-icon-wrapper.pending { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .payment-icon-wrapper.failed { background: rgba(239,68,68,0.1); color: #ef4444; }
        .payment-icon { width: 32px; height: 32px; }

        /* Typography */
        .payment-title { font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 8px; }
        .payment-subtitle { color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 32px; }
        .payment-code { display: inline-block; margin-left: 6px; font-family: monospace; color: #fff; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 14px; }

        /* Details Box */
        .payment-details-box {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 20px; margin-bottom: 32px;
          text-align: left;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .detail-row:last-child { border-bottom: none; }
        .detail-row span:first-child { color: rgba(255,255,255,0.5); font-size: 14px; }
        .status-badge.confirmed { background: rgba(34,197,94,0.15); color: #4ade80; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .notice { font-size: 13px; color: #fff; text-align: right; max-width: 60%; }

        /* Buttons */
        .payment-actions { display: flex; flex-direction: column; gap: 12px; }
        .btn-primary { width: 100%; border: none; padding: 14px; background: #fff; color: #000; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,255,255,0.15); }
        .btn-ghost { width: 100%; border: none; padding: 14px; background: transparent; color: rgba(255,255,255,0.5); font-weight: 600; font-size: 15px; cursor: pointer; transition: 0.2s; }
        .btn-ghost:hover { color: #fff; background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
