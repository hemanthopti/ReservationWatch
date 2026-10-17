export function readConfig(env: NodeJS.ProcessEnv) {
  const rawPort = env.PORT ?? '3000';
  const port = Number(rawPort);
  if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  const production = env.NODE_ENV === 'production';
  return { port, host: env.HOST ?? (production ? '0.0.0.0' : '127.0.0.1'), production };
}
