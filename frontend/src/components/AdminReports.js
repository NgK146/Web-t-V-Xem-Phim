import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
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
    <div className="admin-reports" style={{ maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden', padding: '0.5rem' }}>
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>Báo Cáo Doanh Thu</h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '15px' }}>Tổng quan hoạt động kinh doanh</p>
          </div>
          <button 
            style={{
              padding: '10px 20px', background: 'rgba(229, 9, 20, 0.08)', color: '#e50914',
              border: '1px solid rgba(229, 9, 20, 0.2)', borderRadius: '8px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px'
            }}
            onClick={handleExport} disabled={exporting}>
            {exporting ? 'Đang chuẩn bị...' : 'Xuất Excel'}
          </button>
        </div>
      </div>

      {/* Stats Overview - Premium Light */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'TỔNG DOANH THU', value: `${stats.totalRevenue.toLocaleString()}đ`, color: '#e50914' },
          { label: 'VÉ ĐÃ BÁN', value: stats.totalBookings.toLocaleString(), color: '#00c853' },
          { label: 'KHÁCH HÀNG', value: stats.totalUsers.toLocaleString(), color: '#2979ff' },
          { label: 'PHIM ĐÃ CHIẾU', value: stats.totalMovies.toLocaleString(), color: '#ff9100' }
        ].map((s, i) => (
          <div key={i} style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            borderRadius: '16px', padding: '24px',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: s.color, opacity: 0.8 }} />
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '1px', marginBottom: '8px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#111827', letterSpacing: '-1px' }}>
               {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem', width: '100%' }}>
        {/* Revenue Chart */}
        <div style={{ 
          background: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
          padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' 
        }}>
          <h3 style={{ marginBottom: '2rem', color: '#111827', fontSize: '18px', fontWeight: '700' }}>Biểu Đồ Doanh Thu Tổng Hợp</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 13 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 13 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#111827', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" name="Doanh thu (VNĐ)" fill="#e50914" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Movies - Clean List */}
        <div style={{ 
          background: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
          padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#111827', fontSize: '18px', fontWeight: '700' }}>Phim Thịnh Hành Nhất</h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {topMovies.map((m, idx) => (
                <div key={m._id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', 
                  background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6', transition: 'background 0.2s', cursor: 'default'
                }}>
                   <div style={{ fontSize: '24px', fontWeight: '800', color: idx === 0 ? '#e50914' : '#9ca3af', width: '32px', textAlign: 'center' }}>
                     {idx + 1}
                   </div>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontWeight: '700', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{m.title}</div>
                     <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{m.count} vé bán ra • {m.revenue.toLocaleString()}đ</div>
                   </div>
                </div>
             ))}
             {topMovies.length === 0 && <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>Chưa có dữ liệu</div>}
          </div>
        </div>
      </div>

      {/* Ticket Sales Trend */}
      <div style={{ 
        background: '#ffffff', boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
        padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', marginTop: '2.5rem' 
      }}>
          <h3 style={{ marginBottom: '2rem', color: '#111827', fontSize: '18px', fontWeight: '700' }}>Tốc Độ Bán Vé Qua Các Tháng</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c853" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00c853" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 13 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#d1d5db" tick={{ fill: '#6b7280', fontSize: 13 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#111827', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="bookings" name="Vé Bán" stroke="#00c853" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default AdminReports;
