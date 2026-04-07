import api from './axios';

export const paymentApi = {
  createPayOSLink: (bookingId) => api.post('/payments/payos/create-link', { bookingId }),
};
