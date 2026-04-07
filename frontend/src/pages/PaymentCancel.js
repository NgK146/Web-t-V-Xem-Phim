import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="payment-result-page">
      <div className="payment-result-card cancel">
        <div className="payment-icon-wrapper">
          <div className="payment-icon">⚠️</div>
        </div>
        <h1 className="payment-title">Giao Dịch Đã Hủy</h1>
        <p className="payment-subtitle">
          Bạn đã hủy thanh toán hoặc giao dịch không thành công. Mọi ghế bạn đang giữ sẽ bị hủy.
        </p>
        
        <div className="payment-details-box">
          <p>Nếu có vấn đề gì xảy ra trong quá trình thanh toán, xin vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        </div>

        <div className="payment-actions">
          <Link to="/" className="btn-primary-cancel">QUAY LẠI TRANG CHỦ</Link>
        </div>
      </div>

      <style>{`
        .payment-result-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 100%);
          padding: 20px;
        }
        .payment-result-card {
          background: rgba(15, 15, 25, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 50px 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUpFade {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .payment-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.15);
          border: 2px solid rgba(239, 68, 68, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
        }
        .payment-icon {
          font-size: 40px;
        }
        .payment-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 12px;
        }
        .payment-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 15px;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .payment-details-box {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .payment-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .btn-primary-cancel {
          display: block;
          padding: 14px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn-primary-cancel:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default PaymentCancel;
