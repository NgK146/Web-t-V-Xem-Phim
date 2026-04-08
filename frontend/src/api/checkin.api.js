import api from './axios';

export const lookupBooking = (bookingCode) => api.get(`/checkin/lookup/${bookingCode}`);
export const performCheckin = (bookingId) => api.post(`/checkin/${bookingId}`);
export const getTodayCheckins = () => api.get('/checkin/today');
export const serveFoods = (bookingId) => api.post(`/checkin/${bookingId}/fnb`);
export const getMyShiftReport = () => api.get('/checkin/my-shift');
