#!/usr/bin/env node

import http from 'http';

const DEFAULT_TARGET = 'localhost:3100';
const DEFAULT_PORT = 3101;

const targetHost = process.env.TARGET_HOST || DEFAULT_TARGET;
const proxyPort = parseInt(process.env.PROXY_PORT || String(DEFAULT_PORT), 10);

console.log(`CORS Proxy Server`);
console.log(`==================`);
console.log(`Target node: ${targetHost}`);
console.log(`Proxy port: ${proxyPort}`);
console.log(``);

function parseHost(hostString) {
  const parts = hostString.split(':');
  return {
    hostname: parts[0],
    port: parts[1] ? parseInt(parts[1], 10) : 80,
  };
}

function removeCORSHeaders(headers) {
  const cleaned = { ...headers };
  delete cleaned['access-control-allow-origin'];
  delete cleaned['access-control-allow-methods'];
  delete cleaned['access-control-allow-headers'];
  delete cleaned['access-control-allow-credentials'];
  delete cleaned['access-control-max-age'];
  delete cleaned['access-control-expose-headers'];
  return cleaned;
}

const { hostname: targetHostname, port: targetPort } = parseHost(targetHost);

const server = http.createServer((req, clientRes) => {
  const fullPath = req.url;

  const options = {
    hostname: targetHostname,
    port: targetPort,
    path: fullPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: targetHost,
    },
  };

  if (req.method === 'OPTIONS') {
    clientRes.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
    clientRes.end();
    return;
  }

  const proxyReq = http.request(options, (proxyRes) => {
    const cleanedHeaders = removeCORSHeaders(proxyRes.headers);

    clientRes.writeHead(proxyRes.statusCode, {
      ...cleanedHeaders,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    proxyRes.pipe(clientRes, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    console.error(`Proxy request error: ${err.message}`);
    clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
    clientRes.end('Proxy error: ' + err.message);
  });

  proxyReq.on('timeout', () => {
    console.error(`Proxy request timeout`);
    proxyReq.destroy();
    clientRes.writeHead(504, { 'Content-Type': 'text/plain' });
    clientRes.end('Proxy timeout');
  });
});

server.listen(proxyPort, () => {
  console.log(`Proxy running at http://localhost:${proxyPort}`);
  console.log(`Point your explorer to: localhost:${proxyPort}`);
  console.log(``);
  console.log(`Press Ctrl+C to stop`);
});

process.on('SIGINT', () => {
  console.log(`\nShutting down...`);
  server.close();
  process.exit(0);
});