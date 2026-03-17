import api from './axios';

export const bookingsApi = {
  create:      (data)   => api.post('/bookings', data),
  lockSeats:   (data)   => api.post('/bookings/lock-seats', data),
  cancel:      (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  getMyHistory:(params) => api.get('/bookings/my-bookings', { params }),
};
