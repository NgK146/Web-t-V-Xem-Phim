import axios from 'axios';

const test = async () => {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5001/api' });
    
    // Get a movie first
    const moviesRes = await api.get('/movies');
    const movie = moviesRes.data.data.movies[0];
    const id = movie._id;
    console.log(`Testing movie ID: ${id}`);
    
    const [movieRes, reviewsRes, showtimesRes] = await Promise.all([
      api.get(`/movies/${id}`),
      api.get(`/reviews/movie/${id}`),
      api.get(`/showtimes/movie/${id}`)
    ]);
    
    console.log('movie data:', movieRes.data);
    console.log('reviews data:', reviewsRes.data);
    console.log('showtimes data:', showtimesRes.data);
    
    // Also test get details
    if (showtimesRes.data.data.length > 0) {
      const showtimeId = showtimesRes.data.data[0]._id;
      const detailsRes = await api.get(`/showtimes/${showtimeId}`);
      console.log('showtime details:', detailsRes.data.message, 'success:', detailsRes.data.success);
    }
    
  } catch (error) {
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

test();
