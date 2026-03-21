import api from './axios';

export const reviewsApi = {
  getMovieReviews: (movieId) => api.get(`/reviews/movie/${movieId}`),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};
