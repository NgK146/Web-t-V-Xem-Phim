import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const StrengthBar = ({ password }) => {
  const getStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  };

  const strength = getStrength(password);
  const labels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const colors = ['', '#e53e3e', '#ed8936', '#ecc94b', '#48bb78'];

  if (!password) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      {strength > 0 && (
        <span style={{ fontSize: 11, color: colors[strength], fontWeight: 600 }}>
          Độ mạnh: {labels[strength]}
        </span>
      )}
    </div>
  );
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      await api.patch(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Mật khẩu đã được cập nhật thành công!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.');
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

        <div style={styles.pageIcon}>🔒</div>
        <h1 style={styles.title}>Đặt lại mật khẩu</h1>
        <p style={styles.subtitle}>
          Tạo mật khẩu mới an toàn cho tài khoản CineBooking của bạn.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          {/* Password field */}
          <div style={styles.field}>
            <label style={styles.label}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ marginRight: 6, verticalAlign: 'middle' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Mật khẩu mới
            </label>
            <div style={styles.passwordWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }
                })}
                placeholder="Tối thiểu 6 ký tự"
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {})
                }}
                onFocus={e => {
                  e.target.style.borderColor = errors.password ? '#E50914' : 'rgba(255,255,255,0.3)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = errors.password ? 'rgba(229,9,20,0.8)' : 'rgba(255,255,255,0.1)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            <StrengthBar password={password} />
            {errors.password && (
              <span style={styles.errorMsg}>⚠ {errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password field */}
          <div style={styles.field}>
            <label style={styles.label}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ marginRight: 6, verticalAlign: 'middle' }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Xác nhận mật khẩu
            </label>
            <div style={styles.passwordWrap}>
              <input
                type={showConfirm ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: val => val === password || 'Mật khẩu không khớp'
                })}
                placeholder="Nhập lại mật khẩu mới"
                style={{
                  ...styles.input,
                  ...(errors.confirmPassword ? styles.inputError : {})
                }}
                onFocus={e => {
                  e.target.style.borderColor = errors.confirmPassword ? '#E50914' : 'rgba(255,255,255,0.3)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = errors.confirmPassword ? 'rgba(229,9,20,0.8)' : 'rgba(255,255,255,0.1)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {errors.confirmPassword && (
              <span style={styles.errorMsg}>⚠ {errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Tips */}
          <div style={styles.tips}>
            <div style={styles.tipsTitle}>💡 Mật khẩu mạnh cần có:</div>
            {[
              { label: 'Ít nhất 6 ký tự', ok: password.length >= 6 },
              { label: 'Chữ hoa (A-Z)', ok: /[A-Z]/.test(password) },
              { label: 'Số (0-9)', ok: /[0-9]/.test(password) },
            ].map((tip, i) => (
              <div key={i} style={{ ...styles.tipItem, color: password ? (tip.ok ? '#48bb78' : 'rgba(236,236,236,0.4)') : 'rgba(236,236,236,0.4)' }}>
                {password && tip.ok ? '✓' : '○'} {tip.label}
              </div>
            ))}
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
                <span style={styles.spinner} /> Đang cập nhật...
              </span>
            ) : (
              '🔐 Cập nhật mật khẩu'
            )}
          </button>
        </form>

        <div style={styles.backLink}>
          <Link to="/login" style={styles.link}>← Quay lại đăng nhập</Link>
        </div>
      </div>

      <div style={styles.bottomBrand}>
        © 2025 CineBooking Vietnam · Mọi quyền được bảo lưu
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 70% 20%, rgba(229,9,20,0.1) 0%, #0A0A0A 50%, #0A0A0A 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    fontFamily: "'Inter', 'Noto Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgDeco1: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(229,9,20,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDeco2: {
    position: 'absolute',
    bottom: '-60px',
    right: '-60px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(229,9,20,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '36px 34px',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(229,9,20,0.06)',
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
    marginBottom: '18px',
    display: 'block',
  },
  logoStar: { fontSize: '16px', verticalAlign: 'super' },
  pageIcon: {
    fontSize: '36px',
    marginBottom: '10px',
    filter: 'drop-shadow(0 0 10px rgba(229,9,20,0.3))',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#ECECEC',
    margin: '0 0 6px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '13px',
    color: 'rgba(236,236,236,0.5)',
    textAlign: 'center',
    margin: '0 0 24px',
    lineHeight: 1.6,
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(236,236,236,0.6)',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.3px',
  },
  passwordWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 44px 12px 14px',
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
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(236,236,236,0.4)',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    transition: 'color 0.2s',
  },
  errorMsg: {
    fontSize: '12px',
    color: '#ff6b6b',
    marginTop: '2px',
  },
  tips: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  tipsTitle: {
    fontSize: '12px',
    color: 'rgba(236,236,236,0.5)',
    fontWeight: 600,
    marginBottom: '4px',
  },
  tipItem: {
    fontSize: '12px',
    transition: 'color 0.3s',
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
    minHeight: '48px',
    fontFamily: 'inherit',
    marginTop: '4px',
  },
  backLink: { marginTop: '18px', textAlign: 'center' },
  link: {
    fontSize: '13px',
    color: 'rgba(236,236,236,0.45)',
    textDecoration: 'none',
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
  bottomBrand: {
    marginTop: '20px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.18)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
};

export default ResetPassword;
