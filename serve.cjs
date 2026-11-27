const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, 'site');
const portFlag = process.argv.indexOf('--port');
const port = portFlag < 0 ? 4173 : Number(process.argv[portFlag + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Invalid port. Example: node serve.cjs --port 4180');
  process.exit(1);
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  if (!fs.existsSync(file) && pathname.startsWith('/assets/')) {
    response.writeHead(302, { Location: 'https://zhengyimo882-glitch.github.io/superink-portfolio' + pathname }).end();
    return;
  }
  fs.readFile(file, (error, content) => {
    if (error) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(content);
  });
});
server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. A preview may already be running.`);
    console.error(`Try opening: http://127.0.0.1:${port}/`);
    console.error('If that is not your preview, use another port:');
    console.error(`node "${__filename}" --port ${port === 4180 ? 4181 : 4180}`);
  } else {
    console.error(`Could not start preview: ${error.message}`);
  }
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Preview ready at http://127.0.0.1:${port}/`));
