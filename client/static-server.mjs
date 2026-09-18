import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./build', import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const requestedPath = resolve(root, `.${pathname}`);
    const isWithinRoot = requestedPath === root || requestedPath.startsWith(`${root}${sep}`);

    if (!isWithinRoot) {
      response.writeHead(400).end('Bad request');
      return;
    }

    let filePath = requestedPath;
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isDirectory()) {
        filePath = resolve(filePath, 'index.html');
      }
      await stat(filePath);
    } catch {
      filePath = resolve(root, 'index.html');
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error(error);
    response.writeHead(500).end('Internal server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static site listening on port ${port}`);
});
