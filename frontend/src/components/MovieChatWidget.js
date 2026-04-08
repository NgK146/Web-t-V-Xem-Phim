import React, { useState, useEffect, useRef } from "react";
import { sendMovieChatMessage } from "../api/aiChatApi";
import "./MovieChatWidget.css";

const quickQuestions = [
  "Hôm nay mình buồn, nên xem phim gì?",
  "Có phim nào hài nhẹ nhàng không?",
  "Gợi ý phim hành động đang chiếu",
  "Có phim nào xem cùng người yêu được không?",
];

export default function MovieChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào 👋 Mình là Trợ lý tư vấn phim AI CineBooking. Bạn muốn mình gợi ý phim theo tâm trạng, thể loại hay khung giờ nào ạ?",
    },
  ]);
  const endOfMessageRef = useRef(null);

  useEffect(() => {
    endOfMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const appendMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleSend = async (customMessage) => {
    const finalMessage = (customMessage || input).trim();
    if (!finalMessage || loading) return;

    appendMessage("user", finalMessage);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMovieChatMessage(finalMessage);
      appendMessage("bot", data.reply || "Mình chưa có gợi ý phù hợp lúc này.");
    } catch (error) {
      appendMessage(
        "bot",
        error.response?.data?.message ||
          "Đã có lỗi xảy ra khi kết nối tới Trợ lý AI..."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="movie-chat-toggle" onClick={() => setOpen(!open)}>
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div className="movie-chat-box">
          <div className="movie-chat-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: "2rem" }}>🤖</div>
              <div>
                <div className="movie-chat-title">AI Trợ Lý Phim</div>
                <div className="movie-chat-subtitle">CineBooking Gemini</div>
              </div>
            </div>
          </div>

          <div className="movie-chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`movie-chat-message ${
                  msg.sender === "user" ? "user" : "bot"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="movie-chat-message bot loading-dots">
                Đang suy nghĩ
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={endOfMessageRef} />
          </div>

          {!loading && (
            <div className="movie-chat-quick-list">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="movie-chat-quick-btn"
                  onClick={() => handleSend(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="movie-chat-input-wrap">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={loading}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
