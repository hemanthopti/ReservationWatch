import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { once } from 'node:events';

const port = process.env.SMOKE_PORT ?? '43189';
const child = spawn(process.execPath, ['apps/api/dist/server.js'], {
  env: { ...process.env, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: port },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', (data) => { logs += data; });
child.stderr.on('data', (data) => { logs += data; });
const exited = once(child, 'exit');
try {
  const origin = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (child.exitCode !== null) throw new Error(`Server exited: ${logs}`);
    try {
      const health = await fetch(`${origin}/api/health`);
      assert.equal(health.status, 200);
      assert.equal((await health.json()).status, 'ok');
      ready = true;
      break;
    } catch { await setTimeout(100); }
  }
  assert.ok(ready, `Server did not start: ${logs}`);
  const page = await fetch(origin);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /ReservationWatch/);
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)];
  assert.ok(assets.length >= 2, 'Expected built JavaScript and CSS');
  for (const [, asset] of assets) assert.equal((await fetch(origin + asset)).status, 200);
  for (const route of ['/communities/example-a', '/jurisdictions/karnataka?sector=employment', '/data/demo-register']) {
    const deepLink = await fetch(origin + route, { headers: { accept: 'text/html' } });
    assert.equal(deepLink.status, 200, `Deep link ${route}`);
    assert.match(await deepLink.text(), /<div id="root">/);
  }
  assert.equal((await fetch(`${origin}/api/v1/missing`, { headers: { accept: 'text/html' } })).status, 404);
  console.log('Production smoke passed: compiled server, health, homepage, SPA deep links, JavaScript, CSS and API 404.');
} finally {
  child.kill('SIGTERM');
  await exited;
}
