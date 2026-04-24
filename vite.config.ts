import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    watch: {
      usePolling: true, // 开启轮询模式，确保文件变动能被 100% 监听到
      interval: 100    // 每 100ms 检查一次
    }
  }
})
