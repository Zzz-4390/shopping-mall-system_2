import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // 自动导入 Element Plus 组件 + 组件专属样式
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'css',
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/product': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/cart': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/message': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
