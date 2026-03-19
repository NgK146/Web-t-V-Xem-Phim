import api from './axios';

export const moviesApi = {
  /** @param {object} params */
  getAll:       (params) => api.get('/movies', { params }),
  getById:      (id)     => api.get(`/movies/${id}`),
  getNowShowing:()       => api.get('/movies/now-showing'),
  getComingSoon:()       => api.get('/movies/coming-soon'),
  /** @param {FormData} formData */
  create:       (formData) => api.post('/movies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:       (id, data) => api.put(`/movies/${id}`, data),
  delete:       (id)       => api.delete(`/movies/${id}`),
};
