// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import imagemin from 'vite-plugin-imagemin'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      visualizer({
        open: false,
        filename: 'dist/stats.html',
      }),
      imagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 20,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
            },
            {
              name: 'removeEmptyAttrs',
              active: false,
            },
          ],
        },
      }),
      // ✅ PWA 설정 수정
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        // 'public/index.html'에서 직접 manifest를 링크하므로,
        // VitePWA가 manifest를 자동으로 주입하지 않도록 설정합니다.
        // 이것을 true로 두면 <link rel="manifest"> 태그가 중복으로 생길 수 있습니다.
        injectManifest: false, 
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // RealFaviconGenerator로 생성된 아이콘들이 Workbox에 의해
          // 중복으로 캐싱되는 것을 방지합니다.
          globIgnores: [
            '**/favicon.ico',
            '**/favicon-16x16.png',
            '**/favicon-32x32.png',
            '**/apple-touch-icon.png',
            '**/android-chrome-192x192.png',
            '**/android-chrome-512x512.png',
            // 혹시 아직 남아있을 수 있는 이전 아이콘 파일도 제외
            '**/icon.png', 
          ],
        },
        // 'public/site.webmanifest' 파일을 직접 사용하므로
        // VitePWA 플러그인 내의 manifest 객체는 제거합니다.
        // manifest: { ... }  <-- 이 부분을 완전히 삭제했습니다.
      }),
    ],
    server: {
      host: true,
      allowedHosts: [env.ALLOWED_HOST],
      hmr: {
        clientPort: 443
      }
    }
  }
})