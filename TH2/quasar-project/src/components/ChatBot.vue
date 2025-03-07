<template>
  <div class="q-pa-md" style="max-width: 600px; margin: auto;">
    <h2>AI Chat Bot (Groq)</h2>

    <!-- Ô input để gõ prompt -->
    <q-input
      v-model="userInput"
      label="Nhập câu hỏi..."
      filled
      class="q-mb-md"
    />

    <!-- Nút gửi -->
    <q-btn
      label="Gửi đi"
      color="primary"
      @click="sendPrompt"
      :loading="loading"
      class="q-mb-md"
    />

    <!-- Khung hiển thị câu trả lời -->
    <div class="q-my-md">
      <h3>Trả lời từ AI:</h3>
      <p v-if="answer">{{ answer }}</p>
      <p v-else><i>Chưa có trả lời</i></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// Biến lưu prompt người dùng
const userInput = ref('')
// Biến lưu câu trả lời từ AI
const answer = ref('')
// Biến loading để hiển thị trạng thái chờ
const loading = ref(false)

async function sendPrompt() {
  try {
    const res = await axios.post('http://localhost:3000/api/groq', {
      userMessage: userInput.value
    });
    console.log('Kết quả Groq:', res.data);
    // T tuỳ theo format trả về, ví dụ:
    // res.data.choices[0].message.content
    answer.value = res.data.choices?.[0]?.message?.content || 'No answer';
  } catch (err) {
    console.error('Lỗi gọi proxy:', err);
    answer.value = 'Có lỗi khi gọi Groq';
  }
}
</script>

<style scoped>
/* CSS tuỳ chỉnh */
h2 {
  color: #1976d2;
}
</style>
