export interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: number;
  description: string;
}

export const movies: Movie[] = [
  { id: 1, title: 'The Dark Knight', genre: 'Action', rating: 9.0, description: 'Batman faces his greatest enemy in a battle for Gotham.' },
  { id: 2, title: 'Inception', genre: 'Sci-Fi', rating: 8.8, description: 'A thief who steals corporate secrets through the use of dream-sharing technology.' },
  { id: 3, title: 'Interstellar', genre: 'Sci-Fi', rating: 8.6, description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.' },
  { id: 4, title: 'Parasite', genre: 'Thriller', rating: 8.5, description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.' },
  { id: 5, title: 'Avengers: Endgame', genre: 'Action', rating: 8.4, description: 'After the devastating events of Infinity War, the universe is in ruins as the Avengers assemble once more.' },
  { id: 6, title: 'Joker', genre: 'Drama', rating: 8.4, description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.' },
  { id: 7, title: 'Toy Story 4', genre: 'Animation', rating: 7.7, description: 'When a new toy called Forky joins Woody and the gang, a road trip alongside old and new friends reveals how big the world can be for a toy.' },
  { id: 8, title: 'Spider-Man: Into the Spider-Verse', genre: 'Animation', rating: 8.4, description: 'Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals.' },
  { id: 9, title: 'Knives Out', genre: 'Comedy', rating: 7.9, description: 'A detective investigates the death of a patriarch of an eccentric, combative family.' },
  { id: 10, title: 'Mad Max: Fury Road', genre: 'Action', rating: 8.1, description: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland.' }
];
