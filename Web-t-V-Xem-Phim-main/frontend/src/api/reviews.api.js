import axios from 'axios';

const API_URL = 'http://localhost:5001/api/reviews';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const reviewsApi = {
  getMovieReviews: (movieId) => axiosInstance.get(`/movie/${movieId}`),
  createReview: (reviewData) => axiosInstance.post('/', reviewData),
  deleteReview: (reviewId) => axiosInstance.delete(`/${reviewId}`),
};
