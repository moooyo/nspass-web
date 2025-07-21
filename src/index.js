/**
 * Cloudflare Workers Entry Point for NSPass Web Application
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Edge runtime compatibility
const STATIC_CACHE_CONTROL = 'public, max-age=86400'; // 1 day
const HTML_CACHE_CONTROL = 'public, max-age=0, must-revalidate'; // No cache for HTML

/**
 * Fetch handler for Cloudflare Workers
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const url = new URL(request.url);

    // Handle API routes - proxy to backend API
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request);
    }

    // Handle static assets
    if (isStaticAsset(url.pathname)) {
      return handleStaticAsset(request);
    }

    // Handle all other routes as SPA (Single Page Application)
    return handleSPARoute(request);
  } catch (error) {
    console.error('Worker error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Handle API requests by proxying to the backend
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Get API base URL from environment or construct from hostname
  const apiBaseUrl = getApiBaseUrl(request);
  
  // Construct the target API URL
  const targetUrl = new URL(url.pathname + url.search, apiBaseUrl);
  
  // Create a new request with the same method, headers, and body
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
  });

  // Forward the request to the API server
  try {
    const response = await fetch(modifiedRequest);
    
    // Create a new response with CORS headers
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return modifiedResponse;
  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'API request failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle static assets (CSS, JS, images, etc.)
 */
async function handleStaticAsset(request) {
  try {
    return await getAssetFromKV({
      request,
      cacheControl: {
        browserTTL: 86400, // 1 day
        edgeTTL: 86400, // 1 day
      },
    });
  } catch (e) {
    // If asset not found, return 404
    return new Response('Not Found', { status: 404 });
  }
}

/**
 * Handle SPA routes (serve index.html for all non-API, non-static routes)
 */
async function handleSPARoute(request) {
  try {
    // Serve index.html for all SPA routes
    const indexRequest = new Request(new URL('/', request.url), request);
    
    const response = await getAssetFromKV({
      request: indexRequest,
      mapRequestToAsset: req => new Request(new URL('/index.html', req.url), req),
    });

    // Set cache headers for HTML
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Cache-Control', HTML_CACHE_CONTROL);
    
    return modifiedResponse;
  } catch (e) {
    return new Response('Application Error', { status: 500 });
  }
}

/**
 * Check if the path is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', 
    '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt'
  ];
  
  return staticExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
}

/**
 * Get API base URL from environment or infer from request
 */
function getApiBaseUrl(request) {
  // Try to get from environment variable first
  if (typeof API_BASE_URL !== 'undefined') {
    return API_BASE_URL;
  }
  
  // Try to get from hostname mapping
  const hostname = new URL(request.url).hostname;
  
  // Map hostnames to API URLs
  const apiMappings = {
    'nspass.com': 'https://api.nspass.com',
    'www.nspass.com': 'https://api.nspass.com',
    'localhost': 'http://localhost:8080',
    '127.0.0.1': 'http://localhost:8080',
  };
  
  return apiMappings[hostname] || 'https://api.nspass.com';
}
