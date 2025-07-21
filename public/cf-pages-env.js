
// Cloudflare Pages 环境变量注入脚本
(function() {
  'use strict';
  
  console.log('🔧 Cloudflare Pages 环境变量初始化...');
  
  // 构建时环境变量
  const buildTimeVars = {
    NODE_ENV: 'production',
    NEXT_PUBLIC_API_BASE_URL: '',
    CF_PAGES: 'false',
    CF_PAGES_BRANCH: '',
    BUILD_TIME: '2025-07-21T15:51:29.682Z'
  };
  
  // 初始化运行时配置
  window.__RUNTIME_CONFIG__ = {
    ...buildTimeVars,
    DETECTED_API_URL: null
  };
  
  // API URL 检测和设置函数
  function detectAndSetApiUrl() {
    let detectedUrl = null;
    
    // 1. 优先使用构建时设置的环境变量
    if (buildTimeVars.NEXT_PUBLIC_API_BASE_URL && 
        buildTimeVars.NEXT_PUBLIC_API_BASE_URL !== '' && 
        buildTimeVars.NEXT_PUBLIC_API_BASE_URL !== 'undefined') {
      detectedUrl = buildTimeVars.NEXT_PUBLIC_API_BASE_URL;
      console.log('✅ 使用构建时环境变量:', detectedUrl);
    }
    // 2. 如果是开发环境
    else if (buildTimeVars.NODE_ENV === 'development') {
      detectedUrl = 'http://localhost:8080';
      console.log('🛠️ 开发环境默认API:', detectedUrl);
    }
    // 3. 根据域名推断（生产环境）
    else if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname.includes('nspass')) {
        detectedUrl = 'https://api.nspass.com';
        console.log('🎯 根据域名推断API:', detectedUrl);
      }
    }
    
    // 4. 最后的默认值
    if (!detectedUrl) {
      detectedUrl = 'https://api.nspass.com';
      console.warn('⚠️ 使用默认API地址:', detectedUrl);
      console.warn('💡 建议在 Cloudflare Pages 控制台设置 NEXT_PUBLIC_API_BASE_URL 环境变量');
    }
    
    // 设置到全局配置
    window.__RUNTIME_CONFIG__.DETECTED_API_URL = detectedUrl;
    window.__RUNTIME_CONFIG__.NEXT_PUBLIC_API_BASE_URL = detectedUrl;
    
    console.log('📦 最终运行时配置:', window.__RUNTIME_CONFIG__);
    
    return detectedUrl;
  }
  
  // 立即执行检测
  detectAndSetApiUrl();
  
  // 提供全局访问函数
  window.__GET_API_BASE_URL__ = function() {
    return window.__RUNTIME_CONFIG__.DETECTED_API_URL;
  };
  
  console.log('✅ 环境变量初始化完成');
})();
