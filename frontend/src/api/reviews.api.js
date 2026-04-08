import api from './axios';

export const reviewsApi = {
  getMovieReviews: (movieId) => api.get(`/reviews/movie/${movieId}`),
  checkEligibility: (movieId) => api.get(`/reviews/eligibility/${movieId}`),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};
