import { useEffect, useState } from 'react';
import type { HealthResponse } from '@reservation-watch/shared';
export function HealthStatus() {
  const [health, setHealth] = useState('Checking API…');
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    void fetch('/api/health', { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Health request failed');
      const data: HealthResponse = await response.json();
      if (data.status !== 'ok' || data.service !== 'reservation-watch-api') throw new Error('Unexpected health response');
      if (active) setHealth('API connected');
    }).catch(() => { if (active) setHealth('API unavailable — try reloading the page.'); }).finally(() => window.clearTimeout(timeout));
    return () => { active = false; window.clearTimeout(timeout); controller.abort(); };
  }, []);
  return <p role="status" className="health">{health}</p>;
}
