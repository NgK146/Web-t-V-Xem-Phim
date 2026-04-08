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
        sessionStorage.setItem('accessToken',  data.accessToken);
        sessionStorage.setItem('refreshToken', data.refreshToken);
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
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        set({ user: null, token: null });
      },
    }),
    {
      name:       'auth-storage',
      storage:    createJSONStorage(() => sessionStorage), // ✅ Dùng sessionStorage để đăng nhập nhiều tài khoản trên nhiều tab
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
