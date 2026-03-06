/**
 * Proxy Controller
 * Handles game proxy endpoints
 */

const http = require('http');
const https = require('https');

// Allowed domains for proxy
const ALLOWED_DOMAINS = [
  'gamemonetize.com',
  'html5.gamemonetize.com',
  'img.gamemonetize.com',
  'gamemonetize.video',
  'cloudarcade.gg',
  'html5cloud.com',
  'html5.gamemonetize.co',
  'gamemonetize.co'
];

/**
 * Test proxy endpoint
 */
function testProxy(req, res) {
  res.send('Proxy is working! Time: ' + new Date().toISOString());
}

/**
 * Game sandbox - Creates a proper HTML page for GameMonetize games
 */
function gameSandbox(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Missing URL parameter');
  }

  // Validate URL
  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send('Invalid URL');
  }

  const isAllowed = ALLOWED_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  if (!isAllowed) {
    return res.status(403).send('Domain not allowed: ' + urlObj.hostname);
  }

  // Create sandbox HTML page
  const timestamp = Date.now();
  const proxyUrl = `/proxy/game?url=${encodeURIComponent(targetUrl)}`;

  const sandboxHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Game</title>
  <style type="text/css">
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    #api_game_embed {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe
    id="api_game_embed"
    src="${proxyUrl}"
    frameborder="0"
    scrolling="no"
    webkitallowfullscreen
    mozallowfullscreen
    allowfullscreen
    allow="autoplay; fullscreen; accelerometer; encrypted-media; gyroscope; picture-in-picture; gamepad"
  ></iframe>
  <script src="https://api.gamemonetize.com/cms_iframe.js?${timestamp}"></script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(sandboxHtml);
}

/**
 * Proxy for game iframes to bypass X-Frame-Options
 */
function gameProxy(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Missing URL parameter');
  }

  // Validate URL
  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send('Invalid URL');
  }

  const isAllowed = ALLOWED_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  if (!isAllowed) {
    return res.status(403).send('Domain not allowed: ' + urlObj.hostname);
  }

  // Choose http or https
  const client = urlObj.protocol === 'https:' ? https : http;

  // Forward request
  const proxyReq = client.request(targetUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': urlObj.origin,
      'Origin': urlObj.origin
    }
  }, (proxyRes) => {
    // Remove blocking headers
    const headers = {};
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'x-frame-options' &&
          lowerKey !== 'content-security-policy' &&
          lowerKey !== 'set-cookie') {
        headers[key] = value;
      }
    }

    // Set CORS headers
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';

    // Write headers
    res.writeHead(proxyRes.statusCode, headers);

    // Pipe response
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[PROXY] Request error:', err.message);
    if (!res.headersSent) {
      res.status(502).send('Proxy error: ' + err.message);
    }
  });

  proxyReq.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(504).send('Proxy timeout');
    }
    proxyReq.destroy();
  });

  proxyReq.end();
}

module.exports = {
  testProxy,
  gameSandbox,
  gameProxy
};
