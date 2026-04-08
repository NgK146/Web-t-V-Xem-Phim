import Movie from '../models/Movie.js';
import Showtime from '../models/Showtime.js';
import { askGeminiMovieAssistant } from '../services/aiChat.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const getNearestShowtimeMap = async (movieIds) => {
  const now = new Date();

  const showtimes = await Showtime.find({
    movie: { $in: movieIds },
    startTime: { $gte: now },
  })
    .sort({ startTime: 1 })
    .lean();

  const map = new Map();

  for (const showtime of showtimes) {
    const movieId = String(showtime.movie);
    if (!map.has(movieId)) {
      map.set(movieId, showtime.startTime);
    }
  }

  return map;
};

export const chatWithMovieAI = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Tin nhắn không được để trống"));
    }

    const movies = await Movie.find({
        status: { $in: ['now_showing', 'coming_soon'] }
    })
      .select("title genre description status poster")
      .lean();

    if (!movies.length) {
      return res.status(200).json(new ApiResponse(200, {
        reply: "Hiện tại rạp chưa có phim đang chiếu để mình tư vấn cho bạn.",
        suggestions: [],
      }));
    }

    const movieIds = movies.map((m) => m._id);
    const nearestShowtimeMap = await getNearestShowtimeMap(movieIds);

    const enrichedMovies = movies.map((movie) => ({
      ...movie,
      nearestShowtime: nearestShowtimeMap.get(String(movie._id)) || null,
    }));

    let reply = "";

    try {
      reply = await askGeminiMovieAssistant(message, enrichedMovies);
    } catch (aiError) {
      console.error("Gemini error:", aiError.message);
      reply = "Mình đang gặp chút vấn đề kết nối tới Trợ lý Thông minh (hoặc Server chưa gắn API Key). Bạn có thể thử hỏi lại sau nhé.";
    }

    return res.status(200).json(new ApiResponse(200, {
      reply,
      suggestions: enrichedMovies.slice(0, 5).map((movie) => ({
        _id: movie._id,
        title: movie.title,
        genre: movie.genre,
        poster: movie.poster || "",
        nearestShowtime: movie.nearestShowtime,
      })),
    }));
  } catch (error) {
    next(error);
  }
};
