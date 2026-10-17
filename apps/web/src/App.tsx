import { useEffect, useState } from 'react';
import type { HealthResponse } from '@reservation-watch/shared';

const topics = [
  ['Rules', 'Explore how rules are scoped by jurisdiction, sector and time.'],
  ['Reach', 'Examine representation, admissions and recruitment data.'],
  ['Effects', 'Read research with its scope and limitations in view.'],
  ['Debates', 'Understand policy arguments and the evidence behind them.'],
  ['History', 'Follow the development of laws, institutions and decisions.'],
  ['Data & Tools', 'Compare information and inspect original sources.'],
];

export function App() {
  const [health, setHealth] = useState('Checking API…');
  useEffect(() => {
    // Ignore settled requests from an earlier effect (including StrictMode cleanup).
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    void fetch('/api/health', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Health request failed');
        const data: HealthResponse = await response.json();
        if (data.status !== 'ok' || data.service !== 'reservation-watch-api') throw new Error('Unexpected health response');
        if (active) setHealth('API connected');
      })
      .catch(() => { if (active) setHealth('API unavailable — try reloading the page.'); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; window.clearTimeout(timeout); controller.abort(); };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300 py-6">
        <a href="/" className="text-xl font-bold tracking-tight">ReservationWatch<span className="text-teal-700">.</span></a>
        <nav aria-label="Main navigation" className="flex gap-6 text-sm font-semibold">
          <a href="#explore">Explore</a><a href="#about">About this project</a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="max-w-3xl py-12 sm:py-20" aria-labelledby="intro-title">
          <p className="mb-5 text-sm font-bold uppercase tracking-widest text-teal-800">Independent · Public · Evidence-led</p>
          <h1 id="intro-title" className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Understanding reservation.<br /><span className="text-teal-800">Following the evidence.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">A public-information project exploring India’s reservation rules, reach, effects, debates and history.</p>
          <a href="#explore" className="mt-8 inline-block rounded-lg bg-teal-900 px-5 py-3 font-semibold text-white hover:bg-teal-800">Explore the project ↓</a>
        </section>
        <aside aria-label="Development preview" className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950">
          <strong>Early development preview.</strong> Topic descriptions show the planned scope. No verified records or eligibility tools are available yet.
        </aside>
        <section id="explore" className="py-12" aria-labelledby="explore-title">
          <h2 id="explore-title" className="text-2xl font-semibold">Six ways to explore</h2>
          <p className="mt-2 text-slate-600">The foundation for a sourced, accessible policy portal.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map(([title, description], index) => (
              <article key={title} className="rounded-xl border border-slate-300 bg-white p-6">
                <p className="text-sm font-semibold text-teal-800">0{index + 1} <span className="float-right text-slate-500">Planned</span></p>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="about" aria-labelledby="about-title" className="max-w-3xl pb-12">
          <h2 id="about-title" className="text-2xl font-semibold">Public information, with context</h2>
          <p className="mt-3 leading-relaxed text-slate-700">ReservationWatch is an independent project, not a government website. Future content will make sources, dates and limitations visible. This site does not determine individual eligibility.</p>
        </section>
      </main>
      <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-300 py-6 text-sm text-slate-600">
        <p>ReservationWatch · No sign-in required</p>
        <p role="status">{health}</p>
      </footer>
    </div>
  );
}
