// 环境变量类型定义

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_GITHUB_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_MICROSOFT_CLIENT_ID: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}