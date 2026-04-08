import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn("GEMINI_API_KEY is not set or invalid. Chatbot will use fallback.");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
  }
  return genAI;
};

const formatShowtime = (date) => {
  if (!date) return "Chưa có suất chiếu gần";
  return new Date(date).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const buildPrompt = (userMessage, movies) => {
  const movieText = movies
    .map((movie, index) => {
      return `
${index + 1}. Tên phim: ${movie.title}
- Thể loại: ${Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "Chưa cập nhật"}
- Mô tả: ${movie.description || "Chưa có mô tả"}
- Trạng thái: ${movie.status || "now_showing"}
- Suất chiếu gần nhất: ${formatShowtime(movie.nearestShowtime)}
`;
    })
    .join("\n");

  return `
Bạn là trợ lý tư vấn phim cho website đặt vé xem phim CineBooking.
Nhiệm vụ của bạn là tư vấn phim NGẮN GỌN, TỰ NHIÊN, THÂN THIỆN bằng tiếng Việt.

QUY TẮC:
1. Chỉ được gợi ý phim trong danh sách dưới đây.
2. Không được bịa thêm phim ngoài danh sách.
3. Ưu tiên phim đang chiếu và có suất chiếu gần nhất.
4. Nếu người dùng nói về tâm trạng như buồn, vui, stress, gia đình, lãng mạn... thì chọn phim phù hợp với tâm trạng đó.
5. Nếu không có phim phù hợp, hãy nói lịch sự rằng hiện rạp chưa có phim thật sự phù hợp.
6. Nếu có thể, hãy gợi ý từ 1 đến 3 phim.
7. Mỗi phim gợi ý nên nêu ngắn gọn lý do và giờ chiếu gần nhất.
8. Không trả lời lan man.
9. Không dùng markdown quá phức tạp, chỉ cần câu văn rõ ràng.

DANH SÁCH PHIM ĐANG CÓ CHIẾU TẠI RẠP:
${movieText}

TIN NHẮN CHAT TỪ KHÁCH HÀNG:
"${userMessage}"

Hãy đóng vai là một nhân viên tư vấn phim chuyên nghiệp và trả lời khách hàng.
`;
};

export const askGeminiMovieAssistant = async (userMessage, movies) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const model = getGenAI().getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = buildPrompt(userMessage, movies);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
