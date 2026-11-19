import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import compression from 'compression';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const apiInternalUrl = process.env['API_INTERNAL_URL'] ?? 'http://localhost:8080';

const app = express();
const angularApp = new AngularNodeAppEngine();

/** gzip every response, including proxied API JSON (SC-003: page weight on mobile). */
app.use(compression());

/** Health check for the ALB and the pipeline: answers before the SSR host check and the proxy. */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: process.env['APP_VERSION'] ?? 'local', component: 'web' });
});

/**
 * Single public entry point (research R5): API, media and sitemap requests are proxied to the
 * backend so the browser only ever talks to this origin (no CORS, simple session cookies).
 */
app.use(
  createProxyMiddleware({
    target: apiInternalUrl,
    changeOrigin: false,
    xfwd: true,
    pathFilter: (path) =>
      path.startsWith('/api/') || path.startsWith('/media/') || path === '/sitemap.xml',
  }),
);

/** robots.txt with an absolute sitemap URL for whichever host serves the site. */
app.get('/robots.txt', (req, res) => {
  res
    .type('text/plain')
    .send(
      `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml\n`,
    );
});

/** Static build assets. */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/** Everything else is rendered by Angular. */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Plisados Roldán SSR server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
