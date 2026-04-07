import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../api/users.api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [infoForm, setInfoForm] = useState({ name: '', phone: '', dob: '', avatarFile: null });
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await usersApi.getProfile();
      const data = res.data.data;
      setProfile(data);
      // Format date to YYYY-MM-DD for input
      const dobStr = data.dob ? new Date(data.dob).toISOString().split('T')[0] : '';
      setInfoForm({ name: data.name || '', phone: data.phone || '', dob: dobStr, avatarFile: null });
    } catch (err) {
      toast.error('Không thể tải hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const formData = new FormData();
      formData.append('name', infoForm.name);
      formData.append('phone', infoForm.phone);
      if (infoForm.dob) formData.append('dob', infoForm.dob);
      if (infoForm.avatarFile) formData.append('avatar', infoForm.avatarFile);

      const res = await usersApi.updateProfile(formData);
      setUser(res.data.data); // Update top-level auth store
      toast.success('Cập nhật hồ sơ thành công');
      fetchProfile(); // Refresh to get fresh avatar URL and data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setSavingPass(true);
    try {
      await usersApi.updatePassword({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword });
      toast.success('Đổi mật khẩu thành công');
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally {
      setSavingPass(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setInfoForm({ ...infoForm, avatarFile: e.target.files[0] });
    }
  };

  if (loading) return <div className="prof-loading">Đang tải hồ sơ...</div>;
  if (!profile) return <div className="prof-loading">Lỗi lấy dữ liệu hồ sơ</div>;

  // Tier Card logic
  const isGold = profile.tier === 'VVIP Gold';
  const isSilver = profile.tier === 'VIP Silver';
  
  // Calculate Progress
  let nextTier = 'VIP Silver';
  let target = 1000000;
  if (isSilver) { nextTier = 'VVIP Gold'; target = 5000000; }
  else if (isGold) { nextTier = 'MAX TIER'; target = 5000000; }
  
  const spent = profile.totalSpent || 0;
  const progressPercent = isGold ? 100 : Math.min((spent / target) * 100, 100);

  return (
    <div className="prof-wrapper">
      <header className="prof-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          CINEBOOKING<span style={{color: '#e50914'}}>*</span>
        </div>
        <div onClick={() => navigate('/')} style={{ fontSize: '14px', fontWeight: '600', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #333', padding: '8px 16px', borderRadius: '30px' }} className="prof-back-btn">
          ← Quay Lại
        </div>
      </header>

      <div className="prof-container">
        
        {/* LEFT COLUMN: MEMBERSHIP TIER CARD */}
        <div className="prof-left">
          <div className={`prof-card tier-${isGold ? 'gold' : isSilver ? 'silver' : 'member'}`}>
            <div className="prof-card-top">
              <div className="prof-avatar">
                {infoForm.avatarFile ? (
                   <img src={URL.createObjectURL(infoForm.avatarFile)} alt="Preview" />
                ) : profile.avatar ? (
                   <img src={profile.avatar} alt="Avatar" />
                ) : (
                   <div className="prof-avatar-fallback">{profile.name.charAt(0).toUpperCase()}</div>
                )}
                <label className="prof-avatar-upload">
                  📷
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <div className="prof-info-base">
                <h2>{profile.name}</h2>
                <div className="prof-tier-badge">{profile.tier}</div>
              </div>
            </div>
            
            <div className="prof-card-chip"></div>
            
            <div className="prof-card-bottom">
              <div className="prof-num">**** **** **** {profile._id.substring(profile._id.length - 4)}</div>
              <div className="prof-spent">
                <span>TỔNG CHI TIÊU</span>
                <strong>{spent.toLocaleString()}đ</strong>
              </div>
            </div>
          </div>

          {!isGold && (
            <div className="prof-progress-box">
              <div style={{display:'flex', justifyContent:'space-between', marginBottom: '8px', fontSize: '13px', color: '#999'}}>
                <span>Chi tiêu hiện tại</span>
                <span>Lên <strong>{nextTier}</strong></span>
              </div>
              <div className="prof-progress-bg">
                <div className="prof-progress-fill" style={{ width: `${progressPercent}%`, background: isSilver ? 'linear-gradient(90deg, #d4af37, #ffe55c)' : 'linear-gradient(90deg, #e5e7eb, #9ca3af)' }}></div>
              </div>
              <div style={{ textAlign: 'right', marginTop: '6px', fontSize: '13px', color: '#aaa'}}>
                Còn {(target - spent).toLocaleString()}đ
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FORMS */}
        <div className="prof-right">
          
          <div className="prof-section">
            <div className="prof-section-title">THÔNG TIN CÁ NHÂN</div>
            <form onSubmit={handleInfoSubmit} className="prof-form">
              <div className="prof-form-row">
                <div className="prof-form-group">
                  <label>Họ và Tên</label>
                  <input type="text" value={infoForm.name} onChange={e => setInfoForm({...infoForm, name: e.target.value})} required />
                </div>
                <div className="prof-form-group">
                  <label>Email (Không thể đổi)</label>
                  <input type="email" value={profile.email} disabled className="disabled" />
                </div>
              </div>
              <div className="prof-form-row">
                <div className="prof-form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" value={infoForm.phone} onChange={e => setInfoForm({...infoForm, phone: e.target.value})} />
                </div>
                <div className="prof-form-group">
                  <label>Ngày sinh</label>
                  <input type="date" value={infoForm.dob} onChange={e => setInfoForm({...infoForm, dob: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={savingInfo} className="prof-btn-primary">
                {savingInfo ? 'ĐANG LƯU...' : 'CẬP NHẬT HỒ SƠ'}
              </button>
            </form>
          </div>

          <div className="prof-section" style={{ marginTop: '2.5rem' }}>
            <div className="prof-section-title" style={{ color: '#e50914' }}>ĐỔI MẬT KHẨU</div>
            <form onSubmit={handlePassSubmit} className="prof-form">
              <div className="prof-form-group">
                <label>Mật khẩu hiện tại</label>
                <input type="password" value={passForm.oldPassword} onChange={e => setPassForm({...passForm, oldPassword: e.target.value})} required />
              </div>
              <div className="prof-form-row">
                <div className="prof-form-group">
                  <label>Mật khẩu mới</label>
                  <input type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} required />
                </div>
                <div className="prof-form-group">
                  <label>Nhập lại mật khẩu mới</label>
                  <input type="password" value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} required />
                </div>
              </div>
              <button type="submit" disabled={savingPass} className="prof-btn-danger">
                {savingPass ? 'ĐANG LƯU...' : 'LƯU MẬT KHẨU MỚI'}
              </button>
            </form>
          </div>

        </div>
      </div>

      <style>{`
        .prof-wrapper {
          min-height: 100vh;
          background: #0a0a0f; /* Deep dark background */
          color: #fff;
          font-family: 'Inter', sans-serif;
        }
        .prof-loading {
          display: flex; align-items: center; justify-content: center; min-height: 100vh;
          color: #888; font-size: 1.2rem; background: #0a0a0f;
        }
        .prof-header {
          padding: 24px 40px; font-size: 24px; font-weight: 900; letter-spacing: 2px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .prof-back-btn:hover { color: #fff !important; border-color: #e50914 !important; background: rgba(229,9,20,0.1); }
        
        
        .prof-container {
          max-width: 1100px;
          margin: 60px auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 60px;
        }

        /* CARD STYLES */
        .prof-card {
          width: 100%; height: 230px;
          border-radius: 20px;
          padding: 24px;
          position: relative; overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          display: flex; flex-direction: column; justify-content: space-between;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .prof-card:hover { transform: translateY(-10px) rotateX(5deg); }
        .prof-card::before {
          content: ''; position: absolute; top:0; left:-100%; width:50%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-25deg); animation: profGleam 6s infinite;
        }
        @keyframes profGleam { 0% {left: -100%} 20% {left: 200%} 100% {left: 200%} }
        
        .tier-member {
          background: linear-gradient(135deg, #1f2937, #111827);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tier-silver {
          background: linear-gradient(135deg, #9ca3af, #4b5563);
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 0 30px rgba(156, 163, 175, 0.3);
        }
        .tier-gold {
          background: linear-gradient(135deg, #d4af37, #996515);
          border: 1px solid rgba(255,215,0,0.4);
          box-shadow: 0 0 40px rgba(212, 175, 55, 0.4);
        }

        .prof-card-top { display: flex; align-items: center; gap: 16px; z-index: 2; }
        .prof-avatar { position: relative; width: 64px; height: 64px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); }
        .prof-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .prof-avatar-fallback { width: 100%; height: 100%; background: rgba(0,0,0,0.3); color: #fff; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; border-radius: 50%; }
        
        .prof-avatar-upload {
          position: absolute; bottom: -4px; right: -4px; background: #e50914; color: #white; border-radius: 50%; width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; border: 2px solid #000;
        }
        .prof-avatar-upload input { display: none; }

        .prof-info-base h2 { margin: 0 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        .prof-tier-badge {
          display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); box-shadow: inset 0 1px 1px rgba(255,255,255,0.2);
        }

        .prof-card-chip { width: 44px; height: 32px; background: linear-gradient(135deg, #ffd700, #b8860b); border-radius: 6px; z-index: 2; margin-top: 20px; opacity: 0.8; box-shadow: inset 0 0 10px rgba(0,0,0,0.3);}

        .prof-card-bottom { z-index: 2; display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; }
        .prof-num { font-family: monospace; font-size: 18px; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); opacity: 0.9;}
        .prof-spent { text-align: right; }
        .prof-spent span { display: block; font-size: 10px; color: rgba(255,255,255,0.6); letter-spacing: 1px; margin-bottom: 2px; }
        .prof-spent strong { font-size: 18px; font-weight: 800; }

        .prof-progress-box { margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }
        .prof-progress-bg { width: 100%; height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden; }
        .prof-progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease-in-out; }

        /* FORMS */
        .prof-right { background: rgba(15,15,20,0.5); border: 1px solid rgba(255,255,255,0.05); padding: 40px; border-radius: 20px; }
        .prof-section-title { font-size: 14px; font-weight: 800; letter-spacing: 2px; color: #fff; margin-bottom: 24px; border-left: 3px solid #e50914; padding-left: 12px; }
        
        .prof-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .prof-form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
        .prof-form-group label { font-size: 13px; color: #888; font-weight: 600; }
        .prof-form-group input {
          width: 100%; padding: 14px 16px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: #fff; font-size: 15px; transition: 0.2s; font-family: inherit;
          box-sizing: border-box;
        }
        .prof-form-group input:focus { border-color: #e50914; outline: none; background: rgba(0,0,0,0.4); box-shadow: 0 0 0 3px rgba(229,9,20,0.15); }
        .prof-form-group input.disabled { opacity: 0.5; cursor: not-allowed; }

        .prof-btn-primary {
          background: #fff; color: #000; padding: 14px 30px; border-radius: 8px; border: none; font-weight: 700; font-size: 14px;
          cursor: pointer; transition: 0.2s; letter-spacing: 1px;
        }
        .prof-btn-primary:hover:not(:disabled) { background: #e5e5e5; transform: translateY(-2px); }
        .prof-btn-primary:disabled { opacity: 0.7; cursor: wait; }

        .prof-btn-danger {
          background: rgba(229,9,20,0.1); color: #e50914; padding: 14px 30px; border-radius: 8px; border: 1px solid rgba(229,9,20,0.3);
          font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; letter-spacing: 1px;
        }
        .prof-btn-danger:hover:not(:disabled) { background: #e50914; color: #fff; transform: translateY(-2px); }
        .prof-btn-danger:disabled { opacity: 0.7; cursor: wait; }

        @media (max-width: 900px) {
          .prof-container { grid-template-columns: 1fr; }
          .prof-card { max-width: 400px; margin: 0 auto; }
          .prof-form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
