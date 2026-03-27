import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/reports/export-excel', { 
        responseType: 'blob',
        params: {
          startDate: '2024-01-01',
          endDate: new Date().toISOString().split('T')[0]
        }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao-cao-doanh-thu-${new Date().toLocaleDateString('vi-VN')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Xuất file Excel thành công');
    } catch (err) {
      toast.error('Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="admin-loading">Đang phân tích dữ liệu...</div>;
  if (!data) return <div className="admin-error">Không có dữ liệu báo cáo</div>;

  const { stats, monthlyRevenue, topMovies } = data;

  // Transform monthlyRevenue for Recharts: { _id: { year, month }, revenue, count }
  const chartData = monthlyRevenue.map(m => ({
    name: `T${m._id.month}/${m._id.year}`,
    revenue: m.revenue,
    bookings: m.count
  }));

  return (
    <div className="admin-reports">
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 className="admin-title">Báo Cáo & Thống Kê</h1>
            <p className="admin-subtitle">Tổng quan hoạt động kinh doanh và doanh thu</p>
          </div>
          <button className="movie-btn-add" onClick={handleExport} disabled={exporting}>
            {exporting ? '⌛ Đang chuẩn bị...' : '📥 Xuất Báo Cáo Excel'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ background: '#fff', borderTop: '4px solid #e50914' }}>
          <div className="stat-icon" style={{ color: '#e50914' }}>💰</div>
          <div className="stat-value" style={{ color: '#1a1a2e' }}>{stats.totalRevenue.toLocaleString()}đ</div>
          <div className="stat-label" style={{ color: '#555' }}>Tổng Doanh Thu</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', borderTop: '4px solid #00c853' }}>
          <div className="stat-icon" style={{ color: '#00c853' }}>🎟️</div>
          <div className="stat-value" style={{ color: '#1a1a2e' }}>{stats.totalBookings.toLocaleString()}</div>
          <div className="stat-label" style={{ color: '#555' }}>Vé Đã Bán</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', borderTop: '4px solid #2979ff' }}>
          <div className="stat-icon" style={{ color: '#2979ff' }}>👥</div>
          <div className="stat-value" style={{ color: '#1a1a2e' }}>{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-label" style={{ color: '#555' }}>Khách Hàng</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', borderTop: '4px solid #ff9100' }}>
          <div className="stat-icon" style={{ color: '#ff9100' }}>🎬</div>
          <div className="stat-value" style={{ color: '#1a1a2e' }}>{stats.totalMovies.toLocaleString()}</div>
          <div className="stat-label" style={{ color: '#555' }}>Phim Đã Chiếu</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Revenue Chart */}
        <div className="report-chart-container" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ddd' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1a1a2e' }}>Biểu Đồ Doanh Thu Theo Tháng</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" stroke="#555" tick={{ fill: '#555', fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fill: '#555', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #ddd', color: '#333' }}
                  itemStyle={{ color: '#e50914' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="revenue" name="Doanh thu (VNĐ)" fill="#e50914" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Movies */}
        <div className="top-movies-panel" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ddd' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1a1a2e' }}>Top 5 Phim Doanh Thu Cao</h3>
          <div className="top-movies-list">
             {topMovies.map((m, idx) => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem', padding: '0.8rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                   <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: idx === 0 ? '#e50914' : '#888', minWidth: '24px' }}>
                     {idx + 1}
                   </div>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontWeight: 'bold', color: '#333' }}>{m.title}</div>
                     <div style={{ fontSize: '0.8rem', color: '#666' }}>{m.count} vé - {m.revenue.toLocaleString()}đ</div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Booking Trends (Optional Line Chart) */}
      <div className="report-chart-container" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #ddd', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1a1a2e' }}>Xu Hướng Đặt Vé</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" stroke="#555" tick={{ fill: '#555', fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fill: '#555', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ddd', color: '#333' }} />
                <Line type="monotone" dataKey="bookings" name="Số lượng vé" stroke="#00c853" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default AdminReports;
