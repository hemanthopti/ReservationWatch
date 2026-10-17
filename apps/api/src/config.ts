export function readConfig(env: NodeJS.ProcessEnv) {
  const rawPort = env.PORT ?? '3000';
  const port = Number(rawPort);
  if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  return { port, host: env.HOST ?? '0.0.0.0', production: env.NODE_ENV === 'production' };
}
