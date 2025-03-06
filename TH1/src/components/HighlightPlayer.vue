<template>
  <div class="q-pa-md">
    <audio ref="audioPlayer" controls @timeupdate="onTimeUpdate">
      <source src="/jameslan.ogg" type="audio/ogg">
      Trình duyệt của bạn không hỗ trợ âm thanh.
    </audio>
    <p class="transcript">
      <span
        v-for="(token, idx) in tokens"
        :key="idx"
        :class="{ highlight: idx === highlightedIndex }"
      >
        {{ token.word }}
      </span>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import useTranscript from "src/composables/useTranscript.js";

// Lấy mảng timestamps từ composable đã tạo
const { timestamps } = useTranscript();

// Tạo mảng tokens từ timestamps
const tokens = computed(() => {
  return timestamps.value.map(item => {
    const [startTime, duration, word, startIndex, length] = item;
    return {
      startTime,
      endTime: startTime + duration,
      word,
      startIndex,
      length
    };
  });
});

// Tạo biến để lưu chỉ số token đang highlight
const highlightedIndex = ref(-1);

const audioPlayer = ref(null);

// Hàm cập nhật highlight dựa trên thời gian hiện tại của audio
const onTimeUpdate = () => {
  if (!audioPlayer.value) return;
  const currentMs = audioPlayer.value.currentTime * 1000; // chuyển giây thành ms
  const index = tokens.value.findIndex(
    token => currentMs >= token.startTime && currentMs <= token.endTime
  );
  highlightedIndex.value = index;
};
</script>

<style scoped>
.transcript {
  font-size: 18px;
  line-height: 1.5;
}
.highlight {
  background-color: yellow;
}
</style>
