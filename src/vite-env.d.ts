/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly NODE_ENV: 'development' | 'production' | 'test'
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_BASE_URL?: string
      NODE_ENV?: string
    }
  }
}
