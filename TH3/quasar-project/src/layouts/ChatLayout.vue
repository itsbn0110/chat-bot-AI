<template>
  <!-- Layout chính -->
  <q-layout view="hHh lpr fFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>AI Bot</q-toolbar-title>
        <!-- Checkbox trong header (hoặc có thể đặt ở nơi khác) -->
        <q-checkbox v-model="showThink" label="Show Think" />
      </q-toolbar>
    </q-header>

    <!-- Drawer bên trái: Chat history -->
    <q-drawer v-model="leftDrawerOpen" side="left" show-if-above>
      <div class="q-pa-md">
        <div class="text-h6 q-mb-sm">Chat History</div>
        <div v-for="(session, index) in sessions" :key="index" class="q-mb-sm">
          <q-item clickable @click="selectSession(index)">
            <q-item-section>{{ session.title }}</q-item-section>
          </q-item>
        </div>
      </div>
    </q-drawer>

    <!-- Nội dung chính -->
    <q-page-container>
      <q-page class="column">
        <!-- Checkbox "Show Think" (nếu không đặt trong header) -->
        <div class="q-pa-md">
          <q-checkbox v-model="showThink" label="Show Think" />
        </div>

        <!-- Khu vực hiển thị hội thoại (scrollable) -->
        <div ref="messagesContainer" class="messages-area q-pa-md scroll" style="flex: 1;">
          <div v-for="(msg, idx) in currentSession.messages" :key="idx" class="q-my-sm">
            <div v-if="msg.role === 'user'" class="text-right">
              <q-chip label="You" color="primary" text-color="white" size="sm" />
              <div class="q-my-xs user-message">{{ msg.content }}</div>
            </div>
            <div v-else class="text-left">
              <q-chip label="AI" color="secondary" text-color="white" size="sm" />
              <div class="q-my-xs ai-message">
                <!-- Render nội dung của AI dưới dạng Markdown -->
                <MarkdownRenderer :source="filterThinking(msg.content)" />
              </div>
            </div>
          </div>
        </div>

        <!-- Ô input và nút gửi, đặt ở dưới -->
        <div class="q-pa-md row items-center">
          <q-input
            v-model="userPrompt"
            filled
            class="col q-mr-sm"
            placeholder="Type your message here..."
            @keyup.enter="sendPrompt"
          />
          <q-btn label="Send" color="primary" @click="sendPrompt" :loading="loading" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import axios from 'axios'
import MarkdownRenderer from 'src/components/MarkdownRenderer.vue'

// Drawer trạng thái mở/tắt
const leftDrawerOpen = ref(true)

// Danh sách session (chat history)
const sessions = ref([
  {
    title: 'Session 1',
    messages: [
      { role: 'user', content: 'Hello AI!' },
      { role: 'assistant', content: 'Hello! How can I help you?' }
    ]
  },
  {
    title: 'Session 2',
    messages: [
      { role: 'user', content: 'What is Vue.js?' },
      { role: 'assistant', content: 'Vue.js is a progressive JavaScript framework...' }
    ]
  }
])

// Chỉ số session hiện tại và computed để lấy session đó
const currentSessionIndex = ref(0)
const currentSession = computed(() => sessions.value[currentSessionIndex.value])

// Biến lưu prompt người dùng và trạng thái loading
const userPrompt = ref('')
const loading = ref(false)

// Biến để bật/tắt hiển thị bước suy nghĩ của AI
const showThink = ref(false)

// Hàm chọn session từ drawer
function selectSession(index) {
  currentSessionIndex.value = index
  leftDrawerOpen.value = false
}

// Gửi prompt và gọi API AI qua proxy (Node server)
async function sendPrompt() {
  if (!userPrompt.value.trim()) return
  loading.value = true

  // Thêm tin nhắn của user
  currentSession.value.messages.push({
    role: 'user',
    content: userPrompt.value
  })

  // Tạo placeholder tin nhắn AI
  const aiMsg = {
    role: 'assistant',
    content: '...'
  }
  currentSession.value.messages.push(aiMsg)

  // Lưu vị trí tin nhắn AI vừa thêm
  const aiIndex = currentSession.value.messages.length - 1

  scrollToBottom()

  try {
    const res = await axios.post('http://localhost:3000/api/groq', {
      userMessage: userPrompt.value
    })
    // Giả sử Groq trả về: res.data.choices[0].message.content
    currentSession.value.messages[aiIndex].content = res.data.choices[0].message.content
  } catch (err) {
    console.error('Error calling AI:', err)
    aiMsg.content = 'Error: ' + err.message
  } finally {
    userPrompt.value = ''
    loading.value = false
    scrollToBottom()
  }
}

// Tham chiếu đến khung tin nhắn để cuộn xuống đáy
const messagesContainer = ref(null)
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Hàm lọc bỏ phần "bước suy nghĩ" (chain-of-thought) nếu checkbox không được bật
function filterThinking(text) {
  if (!showThink.value) {
    return text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '')
  }
  return text
}
</script>

<style scoped>
.messages-area {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-bottom: 1px solid #ddd;
}
.user-message {
  display: inline-block;
  background-color: #e3f2fd;
  padding: 8px;
  border-radius: 8px;
}
.ai-message {
  display: inline-block;
  background-color: #f1f1f1;
  padding: 8px;
  border-radius: 8px;
}
</style>
