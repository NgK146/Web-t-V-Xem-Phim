import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

// Request interceptor: gắn token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto refresh token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    
    // Tắt tự động làm mới (refresh token) nếu API trả về 401 là do đăng nhập sai
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/login') && !original.url.includes('/refresh-token')) {
      original._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        const { data } = await api.post('/auth/refresh-token', { refreshToken });
        sessionStorage.setItem('accessToken',  data.data.accessToken);
        sessionStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    // Error Handling Tập Trung
    if (!error.response) {
      // Bị timeout hoặc không kết nối được Server
      toast.error('Giao tiếp mạng bị gián đoạn. Vui lòng kiểm tra lại kết nối!');
    } else if (error.response.status >= 500) {
      // Bắt các lỗi cục bộ không lường trước từ Backend thay vì log ra console đỏ búa xua
      toast.error('Máy chủ đang gặp sự cố nhỏ. Vui lòng thử lại sau tẹo nhé!');
    } else if (error.response.status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này!');
    }
    
    return Promise.reject(error);
  }
);

export default api;
