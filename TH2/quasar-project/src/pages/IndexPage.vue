<template>
  <q-page class="flex flex-center">
    <AIAnswerBox />
  </q-page>
</template>

<script setup>
import AIAnswerBox from 'src/components/AIAnswerBox.vue'
</script>
<script>
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'IndexPage'
});
</script>
