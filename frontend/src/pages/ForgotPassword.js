import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSentEmail(data.email);
      setIsSent(true);
      toast.success('Liên kết đặt lại mật khẩu đã được gửi!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decorations */}
      <div style={styles.bgDeco1} />
      <div style={styles.bgDeco2} />

      {/* Card */}
      <div style={styles.card}>
        {/* Logo */}
        <Link to="/login" style={styles.logo}>
          CINEBOOKING<span style={styles.logoStar}>*</span>
        </Link>

        {isSent ? (
          /* ── Success State ── */
          <div style={styles.successBox}>
            <div style={styles.successIcon}>📬</div>
            <h2 style={styles.successTitle}>Email đã được gửi!</h2>
            <p style={styles.successText}>
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến:
            </p>
            <div style={styles.emailBadge}>{sentEmail}</div>
            <p style={styles.successHint}>
              Kiểm tra hộp thư (kể cả mục Spam) và nhấp vào liên kết trong vòng{' '}
              <strong style={{ color: '#E50914' }}>15 phút</strong>.
            </p>
            <Link to="/login" style={styles.submitBtn}>
              ← Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            {/* Icon */}
            <div style={styles.pageIcon}>🔑</div>

            <h1 style={styles.title}>Quên mật khẩu?</h1>
            <p style={styles.subtitle}>
              Nhập email đã đăng ký — chúng tôi sẽ gửi liên kết khôi phục ngay cho bạn.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ marginRight: 6, verticalAlign: 'middle' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' }
                  })}
                  placeholder="example@email.com"
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : {})
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = errors.email ? '#E50914' : 'rgba(255,255,255,0.3)';
                    e.target.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = errors.email ? '#E50914cc' : 'rgba(255,255,255,0.1)';
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
                {errors.email && (
                  <span style={styles.errorMsg}>⚠ {errors.email.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...styles.submitBtn,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={styles.spinner} /> Đang gửi...
                  </span>
                ) : (
                  '📨 Gửi liên kết khôi phục'
                )}
              </button>
            </form>

            <div style={styles.backLink}>
              <Link to="/login" style={styles.link}>
                ← Nhớ mật khẩu rồi? Đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Bottom brand */}
      <div style={styles.bottomBrand}>
        © 2025 CineBooking Vietnam · Mọi quyền được bảo lưu
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 30% 20%, rgba(229,9,20,0.12) 0%, #0A0A0A 50%, #0A0A0A 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', 'Noto Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgDeco1: {
    position: 'absolute',
    top: '-120px',
    right: '-120px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(229,9,20,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDeco2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(229,9,20,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(229,9,20,0.08)',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#E50914',
    letterSpacing: '-1px',
    textDecoration: 'none',
    fontFamily: "'Oswald', sans-serif",
    textShadow: '0 0 20px rgba(229,9,20,0.4)',
    marginBottom: '20px',
    display: 'block',
  },
  logoStar: {
    fontSize: '16px',
    verticalAlign: 'super',
  },
  pageIcon: {
    fontSize: '40px',
    marginBottom: '12px',
    filter: 'drop-shadow(0 0 12px rgba(229,9,20,0.4))',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#ECECEC',
    margin: '0 0 8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '13px',
    color: 'rgba(236,236,236,0.55)',
    textAlign: 'center',
    margin: '0 0 28px',
    lineHeight: 1.6,
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(236,236,236,0.65)',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.3px',
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#ECECEC',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '48px',
  },
  inputError: {
    borderColor: 'rgba(229,9,20,0.8)',
    background: 'rgba(229,9,20,0.06)',
  },
  errorMsg: {
    fontSize: '12px',
    color: '#ff6b6b',
    marginTop: '2px',
  },
  submitBtn: {
    display: 'block',
    width: '100%',
    background: 'linear-gradient(135deg, #E50914, #ff2d38)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.4px',
    boxShadow: '0 6px 20px rgba(229,9,20,0.35)',
    textAlign: 'center',
    textDecoration: 'none',
    marginTop: '4px',
    minHeight: '48px',
    fontFamily: 'inherit',
  },
  backLink: {
    marginTop: '20px',
    textAlign: 'center',
  },
  link: {
    fontSize: '13px',
    color: 'rgba(236,236,236,0.5)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  // Success state
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    width: '100%',
  },
  successIcon: {
    fontSize: '52px',
    marginBottom: '4px',
  },
  successTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#ECECEC',
    margin: 0,
  },
  successText: {
    fontSize: '14px',
    color: 'rgba(236,236,236,0.6)',
    margin: 0,
  },
  emailBadge: {
    background: 'rgba(229,9,20,0.12)',
    border: '1px solid rgba(229,9,20,0.3)',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#E50914',
    wordBreak: 'break-all',
  },
  successHint: {
    fontSize: '13px',
    color: 'rgba(236,236,236,0.5)',
    margin: 0,
    lineHeight: 1.5,
  },
  bottomBrand: {
    marginTop: '24px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
};

export default ForgotPassword;
