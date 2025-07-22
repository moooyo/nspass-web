import React from 'react';
import { logger } from './utils/logger'

function SimpleApp() {
  logger.debug('SimpleApp is rendering...')
  
  return (
    <div style={{ padding: '20px', fontSize: '18px', color: '#333' }}>
      <h1>NSPass Web - Vite Version</h1>
      <p>✅ 应用正在正常运行</p>
      <p>🚀 从 Next.js 成功迁移到 Vite</p>
      <p>📊 当前环境: {import.meta.env.MODE}</p>
      <p>🌐 API Base URL: {import.meta.env.VITE_API_BASE_URL || '未设置'}</p>
    </div>
  );
}

export default SimpleApp;
