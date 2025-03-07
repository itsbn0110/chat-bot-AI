<template>
  <!-- Hiển thị nội dung Markdown đã parse -->
  <div v-html="renderedMarkdown" class="markdown-content" />
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import markdownItKatex from 'markdown-it-katex'

// Theme tối cho code
import 'highlight.js/styles/atom-one-dark.css'

// Props: nhận chuỗi Markdown
const props = defineProps({
  source: { type: String, default: '' }
})

// Khởi tạo markdown-it
// LƯU Ý: html: false để tắt parse HTML -> <template>, <script> hiển thị nguyên dạng
const md = new MarkdownIt({
  highlight(str, lang) {
    
   let codeHtml = ''
if (lang && hljs.getLanguage(lang)) {
  try {
    codeHtml = hljs.highlight(str, { language: lang }).value
  } catch {
    codeHtml = md.utils.escapeHtml(str)
  }
} else {
  codeHtml = md.utils.escapeHtml(str)
}
console.log(codeHtml);
// Tạo escapedCode cho copy
// Giữ nguyên \n trong codeHtml, nhưng thay thế \n trong escapedCode => "\\n"
const escapedCode = str
  // Escape backslash trước, nếu có
  .replace(/\\/g, '\\\\')
  // Escape dấu nháy đơn
  .replace(/'/g, "\\'")
  // Escape xuống dòng
  .replace(/\r?\n/g, '\\n')
    // Nút Copy (style inline)
    const copyButton = `
      <button
        class="copy-btn"
        style="
          all: unset;
          box-sizing: border-box;
          position: absolute;
          top: 8px;
          right: 8px;
          width: 60px;
          height: 30px;
          background: #555;
          color: #fff !important;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        "
        onclick="navigator.clipboard.writeText('${escapedCode}')"
      >Copy</button>
    `

    // Bọc code block
    return `
      <div class="dark-code-block">
        ${copyButton}
        <pre class="hljs"><code>${codeHtml}</code></pre>
      </div>
    `
  }
}).use(markdownItKatex)

// Tạo HTML từ chuỗi Markdown
const renderedMarkdown = computed(() => md.render(props.source))
</script>

<style>
/* Vùng chứa Markdown */
.markdown-content {
  width: 100%;
  overflow-wrap: break-word;
}

/* Khối code nền tối */
.dark-code-block {
  position: relative;
  margin: 1em auto;
  background: #2b2b2b;
  border-radius: 6px;
  padding: 1.5em 1em 1em;
  box-sizing: border-box;
  max-width: 100%;
  width: 100%;

  /* Chỉ hiển thị thanh cuộn ngang khi code vượt chiều rộng */
  overflow-x: auto;
  overflow-y: hidden;
}

/* Xoá margin mặc định của <pre> */
.dark-code-block pre {
  margin: 0;
  white-space: pre;      /* Không tự xuống dòng => cuộn ngang khi code quá dài */
  min-width: fit-content;/* Tránh co hẹp, cho phép cuộn ngang */
}

/* Hover cho nút Copy (dù phần lớn style inline) */
.copy-btn:hover {
  background-color: #666 !important;
}

/* highlight.js chỉ set màu chữ, nền do .dark-code-block */
.hljs {
  background: none !important;
  color: #fff !important;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
}
</style>
