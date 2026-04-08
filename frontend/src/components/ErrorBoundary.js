import React from 'react';

/**
 * Phân tích lỗi để trả về thông tin thân thiện cho người dùng
 */
function classifyError(error) {
  if (!error) return null;
  const msg = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';

  // Lỗi thiếu thư viện / module (xảy ra lúc dev)
  if (msg.includes("can't resolve") || msg.includes('module not found') || name === 'chunkloaderror') {
    return {
      icon: '📦',
      title: 'Thiếu Thành Phần Giao Diện',
      desc: 'Một số tài nguyên cần thiết chưa được tải về. Vui lòng thử làm mới trang hoặc liên hệ quản trị viên.',
      action: 'Tải lại trang',
      href: window.location.href,
    };
  }

  // Lỗi mạng / không kết nối được
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('xhr')) {
    return {
      icon: '📡',
      title: 'Mất Kết Nối Mạng',
      desc: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối Internet của bạn rồi thử lại.',
      action: 'Thử lại',
      href: window.location.href,
    };
  }

  // Lỗi quyền truy cập
  if (msg.includes('403') || msg.includes('unauthorized') || msg.includes('permission')) {
    return {
      icon: '🔒',
      title: 'Không Có Quyền Truy Cập',
      desc: 'Bạn không có quyền xem trang này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.',
      action: 'Đăng nhập lại',
      href: '/login',
    };
  }

  // Lỗi camera / QR (thường xảy ra ở trang Staff)
  if (msg.includes('camera') || msg.includes('qr') || msg.includes('notallowederror') || msg.includes('mediadevices')) {
    return {
      icon: '📷',
      title: 'Không Thể Truy Cập Camera',
      desc: 'Trình duyệt bị chặn quyền sử dụng camera. Vui lòng cấp quyền camera trong cài đặt trình duyệt và thử lại.',
      action: 'Thử lại',
      href: window.location.href,
    };
  }

  // Lỗi mặc định
  return {
    icon: '🛠️',
    title: 'Có Sự Cố Kỹ Thuật',
    desc: 'Đội ngũ CineBooking đã ghi nhận sự cố và đang tiến hành khắc phục. Thành thật xin lỗi vì sự bất tiện này!',
    action: 'Quay Về Trang Chủ',
    href: '/',
  };
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Nếu có fallback prop tùy chỉnh (VD: modal QR scanner), dùng nó
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const info = classifyError(this.state.error);

      return (
        <div style={styles.container}>
          <div style={styles.glassBox}>
            <div style={styles.icon}>{info.icon}</div>
            <h2 style={styles.title}>{info.title}</h2>
            <p style={styles.desc}>{info.desc}</p>

            {/* Chỉ hiện chi tiết lỗi khi ở môi trường dev */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.detailsSummary}>🔍 Chi tiết lỗi (dev only)</summary>
                <pre style={styles.pre}>{this.state.error?.toString()}</pre>
                <pre style={styles.pre}>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}

            <div style={styles.actions}>
              <button
                style={styles.btnPrimary}
                onClick={() => { window.location.href = info.href; }}
              >
                {info.action}
              </button>
              {info.href !== '/' && (
                <button
                  style={styles.btnSecondary}
                  onClick={() => { window.location.href = '/'; }}
                >
                  🏠 Trang Chủ
                </button>
              )}
            </div>

            <p style={styles.support}>
              Cần hỗ trợ? Liên hệ{' '}
              <a href="mailto:support@cinebooking.vn" style={{ color: '#e71a0f' }}>
                support@cinebooking.vn
              </a>
            </p>
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
    fontFamily: "'Inter', sans-serif",
    padding: '20px',
  },
  glassBox: {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '48px 52px',
    textAlign: 'center',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
    color: '#fff',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '20px',
    lineHeight: 1,
  },
  title: {
    margin: '0 0 14px 0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#FF4D4D',
  },
  desc: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: '1.7',
    marginBottom: '28px',
  },
  details: {
    textAlign: 'left',
    background: 'rgba(255,0,0,0.08)',
    border: '1px solid rgba(255,0,0,0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  detailsSummary: {
    cursor: 'pointer',
    color: 'rgba(255,100,100,0.8)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  pre: {
    fontSize: '11px',
    color: 'rgba(255,200,200,0.7)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    margin: '8px 0 0 0',
    maxHeight: '160px',
    overflowY: 'auto',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #E71A0F, #ff4d4d)',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '500',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  support: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.35)',
    margin: 0,
  },
};

export default ErrorBoundary;
