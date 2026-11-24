import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, 'src/data');
const ALLOWED_FILES = ['world.json', 'characters.json', 'events.json'];

function saveDataPlugin() {
  return {
    name: 'atlas-save-data',
    configureServer(server) {
      server.middlewares.use('/api/save-data', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        try {
          for await (const chunk of req) body += chunk;
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'خطا در خواندن بدنه' }));
        }

        let payload;
        try {
          payload = JSON.parse(body);
        } catch {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'JSON نامعتبر' }));
        }

        const { fileName, data } = payload || {};

        if (!ALLOWED_FILES.includes(fileName)) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: `فایل غیرمجاز: ${fileName}` }));
        }

        if (data == null) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'داده خالی است' }));
        }

        const target = path.resolve(DATA_DIR, fileName);
        if (!target.startsWith(DATA_DIR + path.sep)) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'مسیر غیرمجاز' }));
        }

        try {
          try {
            await fs.copyFile(target, target + '.bak');
          } catch {
            /* فایل قبلی نبود */
          }

          const pretty = JSON.stringify(data, null, 2) + '\n';
          await fs.writeFile(target, pretty, 'utf8');

          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, path: target }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), saveDataPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        studio: path.resolve(__dirname, 'studio.html'),
      },
    },
  },
});