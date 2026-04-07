import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,

      /** @param {{ user: object, accessToken: string, refreshToken: string }} data */
      setAuth: (data) => {
        localStorage.setItem('accessToken',  data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, token: data.accessToken });
      },

      /** Cập nhật thông tin user (dùng sau khi update profile) */
      setUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      logout: async () => {
        await api.post('/auth/logout').catch(() => {});
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null });
      },
    }),
    {
      name:       'auth-storage',
      storage:    createJSONStorage(() => localStorage), // ✅ Đổi sang localStorage để persist khi đóng tab
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
