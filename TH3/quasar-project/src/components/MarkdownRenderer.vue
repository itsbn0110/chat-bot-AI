<template>
  <!-- Vùng hiển thị HTML đã parse từ Markdown -->
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

    // Escape code để copy multiline
    const escapedCode = str
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')

    // Nút copy ở góc phải
    const copyButton = `
      <button class="copy-btn"
        onclick="navigator.clipboard.writeText('${escapedCode}')">
        Copy
      </button>
    `

    // Gói code block vào .dark-code-block
    return `
      <div class="dark-code-block">
        ${copyButton}
        <pre class="hljs"><code>${codeHtml}</code></pre>
      </div>
    `
  }
}).use(markdownItKatex) // plugin công thức toán

// Tạo HTML từ chuỗi Markdown
const renderedMarkdown = computed(() => md.render(props.source))
</script>

<style>

.markdown-content {
  width: 100%;
  overflow-wrap: break-word;
}

/* Khối code nền tối */
.dark-code-block {
  position: relative;
  margin: 1em 0;
  background: #2b2b2b;
  border-radius: 6px;
  padding: 1.5em 1em 1em; /* chừa chỗ cho nút copy */
  overflow: auto;
}

/* Xoá margin mặc định của <pre> */
.dark-code-block pre {
  margin: 0;
  white-space: pre; /* hoặc pre-wrap nếu muốn code tự xuống dòng */
}

/* Nút Copy */
.copy-btn {
  position: absolute;
  background: #555;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.8rem;    /* giảm cỡ chữ */
  line-height: 1.2;
  cursor: pointer;
  appearance: none;     /* xoá kiểu nút mặc định */
  -webkit-appearance: none;
  -moz-appearance: none;
  /* Quasar có thể thêm style button, ta ghi đè bằng !important nếu cần */
  min-width: auto !important;
  min-height: auto !important;
  transition: background 0.2s;
  right: 0px;
}
.copy-btn:hover {
  background: #666;
}
/* highlight.js chỉ set màu chữ, nền do .dark-code-block */
.hljs {
  background: none !important;
  color: #fff !important;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
}
</style>
