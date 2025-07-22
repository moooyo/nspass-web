/**
 * 极简静态文件托管 Workers
 * 使用新的 Assets 功能，支持Vite构建的SPA应用
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // API 代理（如果需要）
    if (url.pathname.startsWith('/api/')) {
      const apiBaseUrl = env.VITE_API_BASE_URL || 'https://api.nspass.xforward.de'
      const apiUrl = url.pathname.replace('/api', apiBaseUrl)
      const response = await fetch(new Request(apiUrl + url.search, request))
      
      // 添加 CORS 头
      const newResponse = new Response(response.body, response)
      newResponse.headers.set('Access-Control-Allow-Origin', '*')
      return newResponse
    }

    // 静态文件处理 - 使用新的 Assets 功能
    try {
      // 直接尝试获取静态资源
      const assetResponse = await env.ASSETS.fetch(request)
      
      if (assetResponse.status === 404) {
        // SPA 路由回退：如果文件不存在，返回 index.html
        const indexRequest = new Request(new URL('/index.html', request.url), request)
        const indexResponse = await env.ASSETS.fetch(indexRequest)
        
        if (indexResponse.ok) {
          return new Response(indexResponse.body, {
            ...indexResponse,
            headers: {
              ...indexResponse.headers,
              'Content-Type': 'text/html; charset=utf-8'
            }
          })
        }
        
        return new Response('Not Found', { status: 404 })
      }
      
      return assetResponse
      
    } catch (error) {
      console.error('Error serving asset:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}
