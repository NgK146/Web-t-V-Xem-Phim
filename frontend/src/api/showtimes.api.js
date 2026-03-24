import api from './axios';

export const showtimesApi = {
  getByMovie: (movieId) => api.get(`/showtimes/movie/${movieId}`),
  getDetails: (id) => api.get(`/showtimes/${id}`),
};
