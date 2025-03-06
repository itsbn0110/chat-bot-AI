<template>

 <div>
   <HighlightPlayer />
  <div class="q-pa-md">
    <p>{{ transcript }}</p>
  </div>
 </div>

</template>


<script setup>
import useTranscript from 'src/composables/useTranscript.js';
import HighlightPlayer from 'src/components/HighlightPlayer.vue';
// Gọi composable để lấy dữ liệu transcript từ file JSON
const { transcript } = useTranscript();
</script>

<style scoped>
/* Bạn có thể thêm CSS tùy chỉnh ở đây */
h2 {
  color: #1976d2;
}
p {
  font-size: 18px;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>
