import { createReadStream, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The development preview can offer the checked-in APK as a real attachment,
// rather than opening the binary in a browser tab. It is not bundled in itself.
function apkDownload() {
  const apkPath = fileURLToPath(new URL('./release/Morrow.apk', import.meta.url));
  function attach(server) {
    server.middlewares.use('/download/Morrow.apk', (request, response) => {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' });
        response.end();
        return;
      }
      let size;
      try {
        size = statSync(apkPath).size;
      } catch {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('The Android APK has not been built yet.');
        return;
      }
      response.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="Morrow.apk"',
        'Content-Length': size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      if (request.method === 'HEAD') {
        response.end();
      } else {
        createReadStream(apkPath).on('error', () => response.destroy()).pipe(response);
      }
    });
  }
  return { name: 'morrow-apk-download', configureServer: attach, configurePreviewServer: attach };
}

export default defineConfig({
  // Relative paths keep the exact same build usable from the Android WebView.
  base: './',
  plugins: [apkDownload()],
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
});
