import axios from "./axios";

export const sendMovieChatMessage = async (message) => {
  const res = await axios.post("/ai/movie-chat", { message });
  return res.data.data; // Because response is wrapped in ApiResponse
};
