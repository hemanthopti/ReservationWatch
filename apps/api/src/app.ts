import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import type { HealthResponse } from '@reservation-watch/shared';

export async function buildApp(options: { webRoot?: string; logger?: boolean } = {}) {
  const app = Fastify({ logger: options.logger ?? false });
  app.get<{ Reply: HealthResponse }>('/api/health', async () => ({
    status: 'ok', service: 'reservation-watch-api',
  }));

  if (options.webRoot) {
    // Fail startup clearly if the production frontend has not been built.
    await access(join(options.webRoot, 'index.html'));
    await app.register(fastifyStatic, { root: options.webRoot, wildcard: false });
    app.setNotFoundHandler((request, reply) => {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      // API errors and missing assets must never become a successful HTML response.
      const isApi = pathname === '/api' || pathname.startsWith('/api/');
      const isAsset = pathname.startsWith('/assets/') || pathname.split('/').at(-1)?.includes('.');
      if (!isApi && !isAsset && ['GET', 'HEAD'].includes(request.method)
          && request.headers.accept?.includes('text/html')) {
        return reply.type('text/html').sendFile('index.html');
      }
      return reply.code(404).send({ error: 'Not Found' });
    });
  }
  return app;
}
