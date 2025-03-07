<template>
  <!-- Vùng hiển thị HTML đã parse từ Markdown -->
  <div class="markdown-content" v-html="renderedMarkdown"></div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItKatex from 'markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

// Props: nhận chuỗi Markdown
const props = defineProps({
  source: {
    type: String,
    default: ''
  }
})

// Hàm escape dùng cho thuộc tính copy (data-clipboard-text)
function escapeForClipboard(str) {
  return str
    .replace(/\\/g, '\\\\')   // escape backslash
    .replace(/'/g, "\\'")     // escape dấu nháy đơn
    .replace(/\r?\n/g, '\\n') // thay \n -> \\n
}

// Tạo instance markdown-it, tắt parse HTML (html: false)
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  // Hàm highlight code
  highlight(str, lang) {
    // 1) Xác định ngôn ngữ
    let validLanguage = ''
    if (lang && hljs.getLanguage(lang)) {
      validLanguage = lang
    } else {
      // Auto detect
      try {
        const result = hljs.highlightAuto(str, [
          'javascript', 'typescript', 'html', 'css', 'json', 'python', 'c', 'cpp'
        ])
        validLanguage = result.language || 'plaintext'
      } catch (e) {
        console.error('Auto highlight error:', e)
        validLanguage = 'plaintext'
      }
    }

    // 2) Tô màu code
    let highlighted = ''
    try {
      highlighted = hljs.highlight(str, { language: validLanguage }).value
    } catch (e) {
      console.error('Highlight error:', e)
      highlighted = hljs.highlight(str, { language: 'plaintext' }).value
    }

    // 3) Nút Copy: Tạo chuỗi copy (escapedClipboard) => thay \n bằng \\n
    const escapedClipboard = escapeForClipboard(str)

    const copyButton = `
      <button class="copy-button" onclick="copyCode(this)"
        data-clipboard-text="${escapedClipboard}">
        Copy
      </button>
    `
    // 4) Bao code block, header hiển thị ngôn ngữ + nút Copy
    return `
      <div class="code-block-wrapper">
        <div class="code-header">
          <span class="code-language">${validLanguage}</span>
          ${copyButton}
        </div>
        <pre class="hljs"><code class="language-${validLanguage}">${highlighted}</code></pre>
      </div>
    `
  }
}).use(markdownItKatex) // Hỗ trợ công thức toán, nếu cần

// Parse Markdown → HTML
const renderedMarkdown = computed(() => {
  try {
    let src = props.source
    // Nếu src không phải string, ép kiểu
    if (typeof src !== 'string') {
      src = JSON.stringify(src, null, 2)
    }
    // Render Markdown
    return md.render(src)
  } catch (err) {
    console.error('Error rendering markdown:', err)
    return `<p class="error">Error: ${err.message}</p>`
  }
})

// Đăng ký hàm copy code cho nút Copy
onMounted(() => {
  window.copyCode = (button) => {
    const codeBlock = button.parentElement.nextElementSibling.querySelector('code')
    if (!codeBlock) return
    const textToCopy = button.getAttribute('data-clipboard-text') || codeBlock.textContent || ''
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        const originalText = button.textContent
        button.textContent = 'Copied!'
        button.classList.add('copied')
        setTimeout(() => {
          button.textContent = originalText
          button.classList.remove('copied')
        }, 2000)
      })
      .catch(err => {
        console.error('Failed to copy text:', err)
        button.textContent = 'Copy failed'
        setTimeout(() => {
          button.textContent = 'Copy'
        }, 2000)
      })
  }
})
</script>

<style>
.markdown-content {
  width: 100%;
  overflow-wrap: break-word;
  line-height: 1.6;
  font-size: 1.2em;
}

/* Bao code block */
.code-block-wrapper {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 6px;
  background-color: #1e1e1e;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* Header code block (ngôn ngữ + nút copy) */
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #2d2d2d;
  color: #fff;
  font-family: monospace;
  font-size: 0.9rem;
}

.code-language {
  font-size: 0.85em;
  color: #e6e6e6;
  text-transform: uppercase;
}

/* Nút Copy */
.copy-button {
  all: unset;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  background: #444;
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1.2;
  transition: background 0.2s;
  text-align: center;
}
.copy-button:hover {
  background: #3a3f4b;
}
.copy-button.copied {
  background: #4CAF50;
}

/* Thân code block */
pre.hljs {
  margin: 0;
  padding: 1rem;
  /* Critical fix: Ensure multiline code keeps line breaks */
  white-space: pre !important; 
  overflow-x: auto;
}

/* Fix line-height in code blocks to preserve formatting */
.hljs {
  background: none !important;
  color: #fff !important;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre !important;
}

/* Fixed code block issue - ensure line breaks are preserved */
.hljs code {
  white-space: pre !important;
  word-wrap: normal !important;
  display: block !important;
}

/* Inline code (không highlight) */
.markdown-content code:not(.hljs) {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 1.2em;
  white-space: nowrap;
}

/* Lỗi parse */
.error {
  color: #e53935;
  padding: 1em;
  background-color: #ffebee;
  border-left: 4px solid #e53935;
  border-radius: 4px;
}
</style>