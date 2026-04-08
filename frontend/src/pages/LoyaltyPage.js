import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const LoyaltyPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);

    const fetchLoyalty = async () => {
        try {
            const res = await api.get('/loyalty/me');
            setData(res.data.data);
        } catch (error) {
            toast.error('Lỗi khi tải thông tin thẻ thành viên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoyalty();
    }, []);

    const handleRedeem = async (rewardType) => {
        if (redeeming) return;
        setRedeeming(true);
        try {
            const res = await api.post('/loyalty/redeem', { rewardType });
            toast.success(res.data.message);
            fetchLoyalty();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không đủ điểm để đổi phần thưởng này');
        } finally {
            setRedeeming(false);
        }
    };

    if (loading) return <div className="lp-loading">Đang tải chi tiết thành viên...</div>;
    if (!data) return <div className="lp-loading">Lỗi tải dữ liệu</div>;

    const { user: userData, history, availableVouchers } = data;
    const points = userData.points || 0;
    const membership = userData.membership || 'Bronze';

    // Tier specific colors
    let cardClass = 'lp-card-bronze';
    let nextTier = 'Silver';
    let pointsNeeded = 200;
    let progress = 0;

    if (membership === 'Platinum') {
        cardClass = 'lp-card-platinum';
        nextTier = 'MAX TIER';
        pointsNeeded = 1000;
        progress = 100;
    } else if (membership === 'Gold') {
        cardClass = 'lp-card-gold';
        nextTier = 'Platinum';
        pointsNeeded = 1000;
        progress = Math.min((points / 1000) * 100, 100);
    } else if (membership === 'Silver') {
        cardClass = 'lp-card-silver';
        nextTier = 'Gold';
        pointsNeeded = 500;
        progress = Math.min((points / 500) * 100, 100);
    } else {
        cardClass = 'lp-card-bronze';
        nextTier = 'Silver';
        pointsNeeded = 200;
        progress = Math.min((points / 200) * 100, 100);
    }

    return (
        <div className="lp-root">
            <header className="lp-header">
                <div className="lp-logo" onClick={() => navigate('/')}>
                    CINE<span style={{ color: '#e50914' }}>BOOKING</span>
                </div>
                <button className="lp-back-btn" onClick={() => navigate('/')}>← Trang chủ</button>
            </header>

            <div className="lp-container">
                <div className="lp-left-col">
                    <div className={`lp-membership-card ${cardClass}`}>
                        <div className="lp-card-chip"></div>
                        <div className="lp-card-top">
                            <span className="lp-card-label">THẺ THÀNH VIÊN</span>
                            <span className="lp-card-tier">{membership}</span>
                        </div>
                        <div className="lp-card-middle">
                            <div className="lp-card-name">{userData.name}</div>
                            <div className="lp-card-points">{points.toLocaleString()} <span>Points</span></div>
                        </div>
                    </div>

                    {membership !== 'Platinum' && (
                        <div className="lp-progress-box">
                            <div className="lp-progress-text">
                                <span>Tiến trình nâng hạng</span>
                                <span>Lên <strong>{nextTier}</strong></span>
                            </div>
                            <div className="lp-progress-bar">
                                <div className="lp-progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="lp-progress-hint">
                                Còn <strong>{Math.max(0, pointsNeeded - points)} điểm</strong> để lên hạng
                            </div>
                        </div>
                    )}

                    <div className="lp-vouchers-section">
                        <h3>Tủ đồ Voucher của tôi</h3>
                        {availableVouchers.length === 0 ? (
                            <div className="lp-empty-vouchers">Bạn chưa có voucher nào</div>
                        ) : (
                            <div className="lp-voucher-list">
                                {availableVouchers.map(v => (
                                    <div key={v._id} className="lp-voucher-item">
                                        <div className="lp-v-icon">🎟️</div>
                                        <div className="lp-v-info">
                                            <div className="lp-v-code">{v.code}</div>
                                            <div className="lp-v-desc">Giảm {v.value.toLocaleString()}đ</div>
                                            <div className="lp-v-exp">HSD: {new Date(v.endDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lp-right-col">
                    <div className="lp-shop-section">
                        <h3>Cửa hàng Nổi bật</h3>
                        <p className="lp-shop-desc">Sử dụng điểm Loyalty để đổi lấy các phần thưởng độc quyền.</p>
                        
                        <div className="lp-reward-grid">
                            {[
                                { id: 'voucher10k', title: 'Voucher 10.000đ', points: 100, color: '#fca5a5' },
                                { id: 'voucher20k', title: 'Voucher 20.000đ', points: 200, color: '#93c5fd' },
                                { id: 'voucher50k', title: 'Voucher 50.000đ', points: 500, color: '#fde047' },
                            ].map(reward => (
                                <div key={reward.id} className="lp-reward-card">
                                    <div className="lp-reward-icon" style={{ backgroundColor: reward.color + '40' }}>🎁</div>
                                    <div className="lp-reward-title">{reward.title}</div>
                                    <div className="lp-reward-cost">{reward.points} điểm</div>
                                    <button 
                                        className="lp-redeem-btn" 
                                        onClick={() => handleRedeem(reward.id)}
                                        disabled={points < reward.points || redeeming}
                                    >
                                        Đổi Ngay
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lp-history-section">
                        <h3>Lịch sử tích điểm</h3>
                        {history.length === 0 ? (
                            <p style={{ color: '#888', marginTop: 10 }}>Chưa có giao dịch nào.</p>
                        ) : (
                            <div className="lp-history-list">
                                {history.map(h => (
                                    <div key={h._id} className="lp-history-item">
                                        <div className="lp-h-left">
                                            <div className={`lp-h-icon ${h.type === 'EARN' ? 'earn' : 'redeem'}`}>
                                                {h.type === 'EARN' ? '+' : '-'}
                                            </div>
                                            <div>
                                                <div className="lp-h-desc">{h.description || 'Giao dịch'}</div>
                                                <div className="lp-h-date">{new Date(h.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className={`lp-h-points ${h.type === 'EARN' ? 'earn' : 'redeem'}`}>
                                            {h.type === 'EARN' ? '+' : '-'}{h.points} pt
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .lp-root { min-height: 100vh; background: #0c0e14; color: #fff; font-family: 'Outfit', sans-serif; padding-bottom: 60px; }
                .lp-loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #888; font-size: 1.2rem; }
                
                .lp-header { display: flex; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(12, 14, 20, 0.8); backdrop-filter: blur(10px); }
                .lp-logo { cursor: pointer; font-weight: 900; letter-spacing: 2px; font-size: 20px; }
                .lp-back-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 16px; border-radius: 20px; cursor: pointer; }
                
                .lp-container { max-width: 1100px; margin: 50px auto; padding: 0 20px; display: grid; grid-template-columns: 380px 1fr; gap: 40px; }
                
                /* CARD */
                .lp-membership-card {
                    border-radius: 20px; padding: 30px; position: relative; overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; justify-content: space-between;
                    height: 220px; transition: 0.3s;
                }
                .lp-membership-card:hover { transform: translateY(-10px) rotateX(5deg); }
                .lp-card-bronze { background: linear-gradient(135deg, #4b3621, #2e1c0d); border: 1px solid rgba(255,255,255,0.1); }
                .lp-card-silver { background: linear-gradient(135deg, #a8a9ad, #6b7280); border: 1px solid rgba(255,255,255,0.3); }
                .lp-card-gold { background: linear-gradient(135deg, #d4af37, #996515); border: 1px solid rgba(255,215,0,0.4); }
                .lp-card-platinum { background: linear-gradient(135deg, #1f2937, #000000); border: 1px solid #7dd3fc; box-shadow: 0 0 30px rgba(125, 211, 252, 0.2); }
                
                .lp-card-chip { width: 44px; height: 32px; background: linear-gradient(135deg, #ffd700, #b8860b); border-radius: 6px; box-shadow: inset 0 0 10px rgba(0,0,0,0.3); margin-bottom: 20px; opacity: 0.9; }
                .lp-card-top { display: flex; justify-content: space-between; align-items: center; }
                .lp-card-label { font-size: 11px; font-weight: 500; letter-spacing: 2px; color: rgba(255,255,255,0.7); }
                .lp-card-tier { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 4px; }
                
                .lp-card-middle { margin-top: auto; }
                .lp-card-name { font-size: 24px; font-weight: 700; margin-bottom: 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                .lp-card-points { font-size: 32px; font-weight: 900; line-height: 1; display: flex; align-items: baseline; gap: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                .lp-card-points span { font-size: 14px; font-weight: 600; opacity: 0.8; }
                
                /* PROGRESS */
                .lp-progress-box { margin-top: 25px; padding: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; }
                .lp-progress-text { display: flex; justify-content: space-between; font-size: 13px; color: #a0a5bc; margin-bottom: 12px; }
                .lp-progress-text strong { color: #fff; }
                .lp-progress-bar { width: 100%; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
                .lp-progress-fill { height: 100%; background: linear-gradient(90deg, #e50914, #ff4b4b); border-radius: 4px; transition: width 1s ease-in-out; }
                .lp-progress-hint { text-align: right; font-size: 12px; color: #666; }
                
                /* VOUCHERS */
                .lp-vouchers-section { margin-top: 30px; }
                .lp-vouchers-section h3 { margin-bottom: 15px; font-size: 18px; color: #fff; }
                .lp-empty-vouchers { padding: 30px; text-align: center; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1); color: #888; }
                .lp-voucher-list { display: flex; flex-direction: column; gap: 12px; }
                .lp-voucher-item { display: flex; gap: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 15px; border-radius: 12px; align-items: center; }
                .lp-v-icon { width: 44px; height: 44px; background: rgba(229, 9, 20, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
                .lp-v-code { font-weight: 800; color: #4ade80; font-size: 15px; margin-bottom: 2px; }
                .lp-v-desc { font-size: 13px; color: #ddd; margin-bottom: 4px; }
                .lp-v-exp { font-size: 11px; color: #888; }
                
                /* RIGHT COL */
                .lp-shop-section h3, .lp-history-section h3 { font-size: 22px; margin-bottom: 5px; }
                .lp-shop-desc { color: #a0a5bc; font-size: 14px; margin-bottom: 25px; }
                
                .lp-reward-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                .lp-reward-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 25px 20px; border-radius: 16px; text-align: center; transition: 0.3s; }
                .lp-reward-card:hover { background: rgba(255,255,255,0.05); transform: translateY(-5px); border-color: rgba(255,255,255,0.1); }
                .lp-reward-icon { width: 60px; height: 60px; margin: 0 auto 15px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
                .lp-reward-title { font-weight: 700; font-size: 15px; color: #fff; margin-bottom: 8px; }
                .lp-reward-cost { color: #facc15; font-weight: 800; font-size: 16px; margin-bottom: 20px; }
                .lp-redeem-btn { width: 100%; background: #e50914; color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .lp-redeem-btn:hover:not(:disabled) { background: #fca5a5; color: #000; }
                .lp-redeem-btn:disabled { background: rgba(255,255,255,0.1); color: #666; cursor: not-allowed; }
                
                /* HISTORY */
                .lp-history-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
                .lp-history-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(255,255,255,0.02); border-radius: 12px; }
                .lp-h-left { display: flex; gap: 15px; align-items: center; }
                .lp-h-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; }
                .lp-h-icon.earn { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
                .lp-h-icon.redeem { background: rgba(248, 113, 113, 0.1); color: #f87171; }
                .lp-h-desc { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
                .lp-h-date { font-size: 11px; color: #888; }
                .lp-h-points { font-weight: 800; font-size: 16px; }
                .lp-h-points.earn { color: #4ade80; }
                .lp-h-points.redeem { color: #f87171; }
                
                @media (max-width: 900px) {
                    .lp-container { grid-template-columns: 1fr; }
                    .lp-reward-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 500px) {
                    .lp-reward-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default LoyaltyPage;
