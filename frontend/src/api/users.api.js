import api from './axios';

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => api.put('/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updatePassword: (data) => api.put('/users/password', data),
};
