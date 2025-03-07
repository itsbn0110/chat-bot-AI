<template>
  <div class="page-container">
    <!-- Hộp to bao quanh toàn bộ phần hỏi - đáp -->
    <div class="chat-wrapper">
      <!-- Khu vực hiển thị câu trả lời (phần trên) -->
      <div class="answer-area">
        <div v-if="answer" v-html="answer" class="answer-content"></div>
        <div v-else class="no-answer"><i>Chưa có câu trả lời</i></div>
      </div>

      <div class="input-area">
        <q-input
          v-model="userQuestion"
          label="Nhập câu hỏi..."
          filled
          class="q-mr-sm input-box"
          @keyup.enter="sendQuestion" 
        />
        <q-btn
          label="Gửi đi"
          color="primary"
          @click="sendQuestion"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const userQuestion = ref('')
const answer = ref('')
const loading = ref(false)

async function sendQuestion() {
  loading.value = true
  try {
    const res = await axios.post('http://localhost:3000/api/groq', {
      userMessage: userQuestion.value
    })
   
    answer.value =
      res.data.choices?.[0]?.message?.content || 'Không tìm thấy câu trả lời'
  } catch (err) {
    console.error('Lỗi gọi AI:', err)
    answer.value = 'Có lỗi xảy ra khi gọi AI.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; 
  padding: 16px;
}


.chat-wrapper {
  width: 800px;
  max-width: 1200px;       
  min-height: 600px;       
  border: 2px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;   
  padding: 16px;
  box-sizing: border-box;
}

.answer-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px; 
}

.answer-content {
  line-height: 1.5;
  white-space: pre-wrap; 
}

.no-answer {
  color: #666;
}

.input-area {
  display: flex;
  align-items: center;
  margin-top: 8px;
}


.input-box {
  flex: 1;
}
</style>
