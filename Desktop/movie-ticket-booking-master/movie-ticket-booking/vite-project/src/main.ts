import './style.css';
import { movies, type Movie } from './data/movies';

const movieGrid = document.getElementById('movieGrid') as HTMLDivElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const genreFilter = document.getElementById('genreFilter') as HTMLSelectElement;
const noResults = document.getElementById('noResults') as HTMLDivElement;

const renderMovies = (movieList: Movie[]) => {
  movieGrid.innerHTML = '';
  
  if (movieList.length === 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
    movieList.forEach(movie => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      
      const header = document.createElement('div');
      header.className = 'movie-header';
      header.innerHTML = `<h3>${movie.title}</h3><span class="rating">⭐ ${movie.rating.toFixed(1)}</span>`;
      
      const badge = document.createElement('span');
      badge.className = 'genre-badge';
      badge.textContent = movie.genre;
      
      const desc = document.createElement('p');
      desc.textContent = movie.description;
      
      const ratingContainer = document.createElement('div');
      ratingContainer.className = 'user-rating';
      ratingContainer.innerHTML = '<span>Đánh giá: </span>';
      const starsContainer = document.createElement('div');
      starsContainer.className = 'stars';
      
      // We will store user ratings in a local map (or just visually show it)
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '★';
        star.dataset.value = i.toString();
        
        star.addEventListener('click', (e) => {
          const target = e.target as HTMLSpanElement;
          const val = parseInt(target.dataset.value || '0');
          
          // Update active stars
          Array.from(starsContainer.children).forEach((s, idx) => {
            if (idx < val) s.classList.add('active');
            else s.classList.remove('active');
          });
          
        });
        starsContainer.appendChild(star);
      }
      ratingContainer.appendChild(starsContainer);
      
      card.appendChild(badge);
      card.appendChild(header);
      card.appendChild(desc);
      card.appendChild(ratingContainer);
      movieGrid.appendChild(card);
    });
  }
};

const filterMovies = () => {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedGenre = genreFilter.value;

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
    const matchesGenre = selectedGenre === 'All' || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  renderMovies(filteredMovies);
};

searchInput.addEventListener('input', filterMovies);
genreFilter.addEventListener('change', filterMovies);

// Initial render
renderMovies(movies);
