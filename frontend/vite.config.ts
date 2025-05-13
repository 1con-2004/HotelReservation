import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: false, // 如果端口被占用，尝试下一个可用端口
    open: true, // 自动打开浏览器
    host: '0.0.0.0', // 允许外部访问
    proxy: {
      // 配置API代理，解决跨域问题
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  define: {
    global: {}
  }
})
