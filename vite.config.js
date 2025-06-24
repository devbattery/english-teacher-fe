// vite.config.js

// 1. defineConfig와 함께 loadEnv를 import 합니다.
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 2. export default defineConfig를 객체가 아닌 함수로 변경합니다.
export default defineConfig(({ mode }) => {
  // 3. 현재 작업 디렉토리의 .env 파일을 로드합니다.
  // process.cwd()는 프로젝트의 루트 디렉토리를 의미합니다.
  // 세 번째 인자 ''는 모든 환경 변수를 VITE_ 접두사 없이 불러오게 합니다.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: true,
      // 4. .env 파일에서 불러온 값으로 교체합니다.
      allowedHosts: [env.ALLOWED_HOST],
      hmr: {
        clientPort: 443
      }
    }
  }
})