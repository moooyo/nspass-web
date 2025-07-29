// NSPass Web - Cloudflare Workers 静态站点处理器
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // API 代理 - 将 /api/* 请求代理到后端
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = url.pathname.replace('/api', 'https://api.nspass.xforward.de')
      const response = await fetch(new Request(apiUrl + url.search, request))
      const newResponse = new Response(response.body, response)

      // 添加 CORS 头
      newResponse.headers.set('Access-Control-Allow-Origin', '*')
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return newResponse
    }

    // 处理 OPTIONS 请求（CORS 预检）
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })
    }

    // 静态文件处理
    // 对于 SPA 路由，返回 HTTP 重定向到根路径
    if (!url.pathname.includes('.') && url.pathname !== '/') {
      console.log(`SPA route detected: ${url.pathname}, returning redirect to root`)
      return Response.redirect(`${url.origin}/`, 302)
    }

    try {
      // 对于其他请求，直接处理
      return await getAssetFromKV(
        {
          request,
          waitUntil() {},
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
        }
      )
    } catch (e) {
      console.log(`getAssetFromKV failed:`, e.message)
      // 如果获取失败，返回重定向到根路径
      console.log(`Fallback: redirecting to root`)
      return Response.redirect(`${url.origin}/`, 302)
    }
  }
}
