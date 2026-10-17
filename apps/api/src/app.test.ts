import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { buildApp } from './app.js';
import { readConfig } from './config.js';

test('health works without frontend or database; unknown API stays 404', async (t) => {
  const app = await buildApp();
  t.after(() => app.close());
  const response = await app.inject('/api/health');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: 'ok', service: 'reservation-watch-api' });
  assert.equal((await app.inject('/api/v1/missing')).statusCode, 404);
});

test('production serves frontend and HTML routes, but never masks API or asset errors', async (t) => {
  const root = await mkdtemp(resolve('.test-web-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'index.html'), '<!doctype html><title>Test frontend</title>');
  const app = await buildApp({ webRoot: root });
  t.after(() => app.close());
  for (const url of ['/', '/rules']) {
    const response = await app.inject({ url, headers: { accept: 'text/html' } });
    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'] ?? '', /text\/html/);
    assert.match(response.body, /Test frontend/);
  }
  for (const url of ['/api', '/api/missing', '/api/v1/missing', '/assets/missing.js', '/missing.css']) {
    assert.equal((await app.inject({ url, headers: { accept: 'text/html' } })).statusCode, 404);
  }
  assert.equal((await app.inject({ method: 'POST', url: '/rules', headers: { accept: 'text/html' } })).statusCode, 404);
  assert.equal((await app.inject('/rules')).statusCode, 404);
  assert.equal((await app.inject('/api/health')).statusCode, 200);
});

test('production fails early when the frontend build is absent', async () => {
  await assert.rejects(buildApp({ webRoot: resolve('missing-build-for-test') }), /ENOENT/);
});

test('configuration honors hosting environment and rejects invalid ports', () => {
  assert.deepEqual(readConfig({ PORT: '8080', HOST: '127.0.0.1', NODE_ENV: 'production' }),
    { port: 8080, host: '127.0.0.1', production: true });
  assert.equal(readConfig({}).port, 3000);
  for (const PORT of ['', '0', '-1', '65536', 'abc', '3.5', '1e3']) {
    assert.throws(() => readConfig({ PORT }), /PORT/);
  }
});


test('development defaults to loopback and production defaults to all interfaces', () => {
  for (const NODE_ENV of [undefined, 'development', 'test']) {
    assert.deepEqual(readConfig({ NODE_ENV }), { port: 3000, host: '127.0.0.1', production: false });
  }
  assert.deepEqual(readConfig({ NODE_ENV: 'production' }),
    { port: 3000, host: '0.0.0.0', production: true });
});

test('explicit HOST overrides the default in every environment', () => {
  for (const NODE_ENV of [undefined, 'development', 'production']) {
    for (const HOST of ['127.0.0.1', '0.0.0.0', '::1']) {
      assert.equal(readConfig({ NODE_ENV, HOST }).host, HOST);
    }
  }
});
