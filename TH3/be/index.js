const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(express.json());

// Sử dụng cors() để cho phép mọi origin, hoặc cấu hình origin cụ thể
app.use(cors());

// Route POST để nhận prompt từ frontend
app.post("/api/groq", async (req, res) => {
  try {
    const { userMessage } = req.body; // Lấy tin nhắn người dùng từ frontend

    // Gọi API Groq
    const groqRes = await axios.post(
      process.env.API_COMPLETION,
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant who answers succinctly.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    // Trả kết quả về cho frontend
    res.json(groqRes.data);
  } catch (err) {
    console.error("Lỗi gọi Groq:", err.message);
    // In chi tiết để debug
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    }
    res.status(500).json({ error: "Lỗi khi gọi Groq" });
  }
});

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy ở cổng ${PORT}`);
});
