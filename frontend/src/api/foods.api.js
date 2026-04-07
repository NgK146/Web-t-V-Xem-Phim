import api from './axios';

export const foodsApi = {
  // Public
  getActive: () => api.get('/foods'),
  
  // Admin
  getAllAdmin: () => api.get('/foods/admin'),
  create: (data) => api.post('/foods', data),
  update: (id, data) => api.put(`/foods/${id}`, data),
  delete: (id) => api.delete(`/foods/${id}`),
};
