import api from './axios';

export const discountsApi = {
  validate: (data) => api.post('/discounts/validate', data),
};
