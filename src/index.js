/**
 * 极简静态文件托管 Workers
 * 专门为构建出静态文件的项目设计
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // API 代理（如果需要）
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = url.pathname.replace('/api', 'https://api.nspass.xforward.de')
      const response = await fetch(new Request(apiUrl + url.search, request))
      
      // 添加 CORS 头
      const newResponse = new Response(response.body, response)
      newResponse.headers.set('Access-Control-Allow-Origin', '*')
      return newResponse
    }
    
    // 静态文件处理
    try {
      // 获取文件路径
      let filePath = url.pathname.slice(1) || 'index.html'
      
      // SPA 路由处理：如果不是文件且不存在，返回 index.html
      if (!filePath.includes('.')) {
        filePath = 'index.html'
      }
      
      // 从 KV 获取文件
      const file = await env.__STATIC_CONTENT.get(filePath)
      if (!file) {
        // 404 时返回 index.html（支持 SPA 路由）
        const indexFile = await env.__STATIC_CONTENT.get('index.html')
        if (indexFile) {
          return new Response(indexFile, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          })
        }
        return new Response('Not Found', { status: 404 })
      }
      
      // 设置正确的 Content-Type
      const contentType = getContentType(filePath)
      const headers = new Headers({
        'Content-Type': contentType,
        'Cache-Control': filePath.endsWith('.html') 
          ? 'public, max-age=0, must-revalidate' 
          : 'public, max-age=31536000' // 1年
      })
      
      return new Response(file, { headers })
      
    } catch (error) {
      console.error('Error serving file:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}

// 简单的 Content-Type 检测
function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css'
  if (filePath.endsWith('.js')) return 'application/javascript'
  if (filePath.endsWith('.json')) return 'application/json'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.ico')) return 'image/x-icon'
  if (filePath.endsWith('.woff2')) return 'font/woff2'
  if (filePath.endsWith('.woff')) return 'font/woff'
  return 'application/octet-stream'
}
