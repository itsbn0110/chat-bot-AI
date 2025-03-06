import { ref, onMounted } from 'vue'
import axios from 'axios'

export default function useTranscript() {
  // Biến lưu trữ hội thoại đã ghép (một chuỗi thuần text)
  const transcript = ref('')
  // Biến lưu mảng timestamp để dùng highlight sau này
  const timestamps = ref([])

  // Hàm lấy dữ liệu từ file JSON và xử lý hội thoại
  const fetchTranscript = async () => {
    try {
      // Lấy file JSON từ public folder
      const response = await axios.get('/jameslan.json')
      const data = response.data

      // Ghép các câu hội thoại lại thành 1 đoạn văn duy nhất
      // Loại bỏ ký tự xuống dòng (\n) và ghép nối bằng dấu cách
      transcript.value = data.dialog.map((item) => item.text.replace(/\n/g, ' ').trim()).join(' ')

      // Lưu mảng timestamp để sau này dùng cho highlight
      timestamps.value = data.timestamp
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu hội thoại:', error)
    }
  }

  // Gọi hàm fetchTranscript khi component được mount
  onMounted(() => {
    fetchTranscript()
  })

  // Trả về các biến để component khác sử dụng
  return { transcript, timestamps }
}
