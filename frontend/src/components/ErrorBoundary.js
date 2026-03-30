import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để lần render tiếp theo hiển thị UI thay thế
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Bạn có thể log lỗi vào các dịch vụ lưu trữ nhật ký ngoại lệ ở đây (VD: Sentry)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Giao diện Fallback (UI thay thế tuyệt đẹp)
      return (
        <div style={styles.container}>
          <div style={styles.glassBox}>
             <div style={styles.icon}>🛠️</div>
             <h2 style={styles.title}>Oops! Có Cố Sự Kiện Kỹ Thuật</h2>
             <p style={styles.desc}>
                Đội ngũ CineBooking đã ghi nhận sự cố này và đang tiến hành khắc phục.<br/>
                Chúng tôi xin lỗi vì sự bất tiện này!
             </p>
             <button style={styles.btn} onClick={() => window.location.href = '/'}>
                Quay Trở Về Trang Chủ
             </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
    fontFamily: "'Inter', sans-serif"
  },
  glassBox: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '40px 50px',
    textAlign: 'center',
    maxWidth: '500px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
    color: '#fff',
    animation: 'fadeIn 0.5s ease-out'
  },
  icon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#FF4D4D'
  },
  desc: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.6',
    marginBottom: '32px'
  },
  btn: {
    background: 'linear-gradient(135deg, #E71A0F, #ff4d4d)',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  }
};

export default ErrorBoundary;
