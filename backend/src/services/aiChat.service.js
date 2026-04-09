import Groq from "groq-sdk";

let groqClient = null;

const getGroq = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const formatShowtime = (date) => {
  if (!date) return "Chua co suat chieu gan";
  return new Date(date).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const buildSystemPrompt = (movies) => {
  const movieText = movies
    .map((movie, index) => {
      return `${index + 1}. Ten phim: ${movie.title}\n- The loai: ${Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "Chua cap nhat"}\n- Mo ta: ${movie.description || "Chua co mo ta"}\n- Suat chieu gan nhat: ${formatShowtime(movie.nearestShowtime)}`;
    })
    .join("\n\n");

  return `Ban la tro ly tu van phim cho website dat ve xem phim CineBooking.
Nhiem vu cua ban la tu van phim NGAN GON, TU NHIEN, THAN THIEN bang tieng Viet.

QUY TAC:
1. Chi duoc goi y phim trong danh sach duoi day.
2. Khong duoc bia them phim ngoai danh sach.
3. Uu tien phim dang chieu va co suat chieu gan nhat.
4. Neu nguoi dung noi ve tam trang nhu buon, vui, stress, gia dinh, lang man thi chon phim phu hop.
5. Neu khong co phim phu hop, hay noi lich su rang hien rap chua co phim phu hop.
6. Goi y tu 1 den 3 phim neu co the.
7. Moi phim goi y nen neu ngan gon ly do va gio chieu gan nhat.
8. Khong tra loi lan man. Khong dung markdown phuc tap.

DANH SACH PHIM DANG CO CHIEU TAI RAP:
${movieText}`;
};

export const askGeminiMovieAssistant = async (userMessage, movies) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const completion = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: buildSystemPrompt(movies) },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content || "Xin loi, toi khong the tra loi luc nay.";
};
