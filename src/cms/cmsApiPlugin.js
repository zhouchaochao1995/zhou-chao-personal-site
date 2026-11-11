import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const maxUploadBytes = 80 * 1024 * 1024;

function sendJson(response, status, value) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(value));
}

function collect(request, limit = maxUploadBytes + 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('文件超过 80 MB 上传上限。'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function createCmsApi() {
  const projectRoot = process.cwd();
  const contentFile = path.join(projectRoot, 'src', 'data', 'site-content.json');
  const uploadsDirectory = path.join(projectRoot, 'public', 'uploads');

  async function handle(request, response, next) {
    const url = new URL(request.url || '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/cms/')) return next();

    try {
      await fs.mkdir(path.dirname(contentFile), { recursive: true });
      if (url.pathname === '/api/cms/content' && request.method === 'GET') {
        try {
          const json = await fs.readFile(contentFile, 'utf8');
          return sendJson(response, 200, JSON.parse(json));
        } catch (error) {
          if (error.code === 'ENOENT') return sendJson(response, 200, { texts: {}, images: {}, ratios: {}, extraImages: [] });
          throw error;
        }
      }

      if (url.pathname === '/api/cms/content' && request.method === 'PUT') {
        const body = await collect(request, 8 * 1024 * 1024);
        const parsed = JSON.parse(body.toString('utf8'));
        const safeContent = {
          texts: parsed.texts && typeof parsed.texts === 'object' ? parsed.texts : {},
          images: parsed.images && typeof parsed.images === 'object' ? parsed.images : {},
          ratios: parsed.ratios && typeof parsed.ratios === 'object' ? parsed.ratios : {},
          extraImages: Array.isArray(parsed.extraImages) ? parsed.extraImages
            .filter((entry) => entry && typeof entry.id === 'string' && typeof entry.label === 'string' && typeof entry.category === 'string')
            .map(({ id, label, category, ratio }) => ({ id, label, category, ratio: Number(ratio) > 0 ? Number(ratio) : 1 })) : [],
        };
        await fs.writeFile(contentFile, `${JSON.stringify(safeContent, null, 2)}\n`, 'utf8');
        return sendJson(response, 200, safeContent);
      }

      if (url.pathname === '/api/cms/upload' && request.method === 'POST') {
        const contentType = request.headers['content-type'] || '';
        const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.slice(1).find(Boolean);
        if (!boundary) return sendJson(response, 400, { error: '无法读取上传文件。' });
        const body = await collect(request);
        const marker = Buffer.from(`--${boundary}`);
        const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'));
        const fileStart = headerEnd + 4;
        let fileEnd = body.indexOf(marker, fileStart);
        if (headerEnd < 0 || fileEnd < 0) return sendJson(response, 400, { error: '上传内容格式无效。' });
        while (fileEnd > fileStart && body[fileEnd - 1] === 13) fileEnd -= 1;
        if (body[fileEnd - 1] === 10) fileEnd -= 1;
        const headers = body.subarray(0, headerEnd).toString('utf8');
        const filename = headers.match(/filename="([^"]*)"/i)?.[1] || 'image';
        const extension = path.extname(filename).toLowerCase();
        if (!allowedExtensions.has(extension)) return sendJson(response, 415, { error: '请上传 JPG、PNG、WebP、AVIF 或 GIF 图片。' });
        const fileBuffer = body.subarray(fileStart, fileEnd);
        if (!fileBuffer.length) return sendJson(response, 400, { error: '上传文件为空。' });
        await fs.mkdir(uploadsDirectory, { recursive: true });
        const storedName = `${randomUUID()}${extension}`;
        await fs.writeFile(path.join(uploadsDirectory, storedName), fileBuffer, { flag: 'wx' });
        return sendJson(response, 201, { src: `/uploads/${storedName}`, name: path.basename(filename) });
      }

      if (url.pathname === '/api/cms/upload' && request.method === 'DELETE') {
        const src = url.searchParams.get('src') || '';
        const match = src.match(/^\/uploads\/([a-zA-Z0-9-]+\.(?:jpg|jpeg|png|webp|avif|gif))$/i);
        if (!match) return sendJson(response, 400, { error: '只能删除本地后台上传的图片。' });
        await fs.rm(path.join(uploadsDirectory, match[1]), { force: true });
        return sendJson(response, 200, { deleted: true });
      }

      return sendJson(response, 405, { error: '不支持的管理操作。' });
    } catch (error) {
      if (!response.headersSent) sendJson(response, error.message.includes('80 MB') ? 413 : 500, { error: error.message || '管理接口发生错误。' });
    }
  }

  return {
    name: 'local-portfolio-cms-api',
    configureServer(server) { server.middlewares.use(handle); },
    configurePreviewServer(server) { server.middlewares.use(handle); },
  };
}

export default createCmsApi;
