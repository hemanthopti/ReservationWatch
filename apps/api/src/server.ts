import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';
import { readConfig } from './config.js';

const config = readConfig(process.env);
const app = await buildApp({
  logger: true,
  webRoot: config.production ? fileURLToPath(new URL('../../web/dist/', import.meta.url)) : undefined,
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().catch((error: unknown) => { app.log.error(error); process.exitCode = 1; });
  });
}
try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
  await app.close();
}
