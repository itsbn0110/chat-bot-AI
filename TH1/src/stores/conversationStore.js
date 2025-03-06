import { defineStore } from 'pinia'
import axios from 'axios'

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    dialog: [],
    timestamps: [],
  }),
  actions: {
    async fetchData() {
      try {
        const response = await axios.get('/src/data/jameslan.json')
        this.dialog = response.data.dialog
        this.timestamps = response.data.timestamp
      } catch (error) {
        console.error('Lỗi tải dữ liệu: ', error)
      }
    },
  },
})
