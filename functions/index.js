/**
 * Static file hosting Workers for Rolldown-built SPA
 * Uses the new Assets functionality with optimized routing
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // API proxy (if needed)
    if (url.pathname.startsWith('/api/')) {
      const apiBaseUrl = env.VITE_API_BASE_URL || 'https://api.nspass.xforward.de'
      const apiUrl = url.pathname.replace('/api', apiBaseUrl)
      const response = await fetch(new Request(apiUrl + url.search, request))
      
      // Add CORS headers
      const newResponse = new Response(response.body, response)
      newResponse.headers.set('Access-Control-Allow-Origin', '*')
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      return newResponse
    }

    // Static file handling - use new Assets functionality
    try {
      // Try to get static asset directly
      const assetResponse = await env.ASSETS.fetch(request)
      
      if (assetResponse.status === 404) {
        // SPA routing fallback: if file doesn't exist, return index.html
        const indexRequest = new Request(new URL('/index.html', request.url), request)
        const indexResponse = await env.ASSETS.fetch(indexRequest)
        
        if (indexResponse.ok) {
          return new Response(indexResponse.body, {
            status: 200,
            headers: {
              ...Object.fromEntries(indexResponse.headers),
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache'
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
