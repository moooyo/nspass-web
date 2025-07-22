import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

/**
 * Process HTML template and inject build assets
 */
function processHtml() {
  const distDir = path.join(projectRoot, 'dist')
  const htmlFile = path.join(distDir, 'index.html')
  
  if (!fs.existsSync(htmlFile)) {
    console.error('❌ HTML file not found:', htmlFile)
    process.exit(1)
  }
  
  // Find main JS file
  const assetsDir = path.join(distDir, 'assets')
  const jsFiles = fs.readdirSync(assetsDir).filter(file => 
    file.startsWith('main-') && file.endsWith('.js')
  )
  
  if (jsFiles.length === 0) {
    console.error('❌ No main-*.js file found')
    process.exit(1)
  }
  
  const mainJs = `/assets/${jsFiles[0]}`
  
  // Find CSS files
  const cssFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.css'))
  
  // Read HTML content
  let htmlContent = fs.readFileSync(htmlFile, 'utf-8')
  
  // Inject main script before closing body tag
  const scriptTag = `<script type="module" src="${mainJs}"></script>`
  
  if (htmlContent.includes('<!-- Main script will be injected by fix-html.sh -->')) {
    // Replace placeholder comment
    htmlContent = htmlContent.replace(
      '<!-- Main script will be injected by fix-html.sh -->',
      scriptTag
    )
  } else {
    // Fallback: inject before closing body tag
    htmlContent = htmlContent.replace(
      '</body>',
      `  ${scriptTag}\n</body>`
    )
  }
  
  // Add CSS links if needed
  const cssLinks = cssFiles.map(cssFile => 
    `  <link rel="stylesheet" href="/${cssFile}">`
  ).join('\n')
  
  if (cssLinks && !htmlContent.includes('stylesheet')) {
    htmlContent = htmlContent.replace(
      '</head>',
      `${cssLinks}\n</head>`
    )
  }
  
  // Write updated HTML
  fs.writeFileSync(htmlFile, htmlContent)
  
  console.log('🔧 HTML processing complete!')
  console.log(`  Main script: ${mainJs}`)
  if (cssFiles.length > 0) {
    cssFiles.forEach(css => console.log(`  CSS file: /${css}`))
  }
}

processHtml()
