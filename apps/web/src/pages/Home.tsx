import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { SearchBox } from '../components/SearchBox';
import { Badge, DemoStamp } from '../components/ui';
import { usePageTitle } from '../hooks/useQueryState';
import { entriesFor, rulesFor, sourceUsage } from '../data/explore';
import { communities, events, jurisdictions, sectors, sources, studies, topics } from '../data/fixtures';

export function Home() {
  usePageTitle('Explore');
  const latestEvents = [...events].sort((a, b) => b.year - a.year || b.month - a.month).slice(0, 3);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" aria-hidden="true" /> A public research workspace · prototype</p>
          <h1 id="hero-title">See the context.<br />Follow the <em>evidence.</em></h1>
          <p className="hero-description">
            Explore reservation through rules, reach, research and history — with the scope, date and source kept in view.
            Every record in this prototype is a clearly labelled synthetic demonstration.
          </p>
          <SearchBox
            variant="hero" label="Search communities, topics or sources" buttonLabel="Search"
            placeholder="Try “Example Community A”, “denominator” or “Karnataka”"
          />
          <div className="quick-links">
            <span>Jurisdiction profiles</span>
            {jurisdictions.map((item) => (
              <Link key={item.id} to={`/jurisdictions/${item.id}`}>{item.name} <Icon name="arrow" size={14} /></Link>
            ))}
            <Link to="/compare">Compare both <Icon name="arrow" size={14} /></Link>
          </div>
        </div>
        <aside className="hero-note" aria-label="The research lens">
          <p className="eyebrow">The research lens</p>
          <div className="lens-diagram" aria-hidden="true"><div>RULES</div><div>REACH</div><div>EFFECTS</div></div>
          <h2>One question.<br />More than one dimension.</h2>
          <p>A rule, an observed count and a research finding tell different stories. Read each with its scope and limitations.</p>
          <Badge>Interactive demo · No official data</Badge>
        </aside>
      </section>

      <section className="overview-strip" aria-label="Demonstration coverage">
        <div><strong>{jurisdictions.length}</strong><span>jurisdiction navigation labels</span></div>
        <div><strong>{communities.length}</strong><span>fictional community identities</span></div>
        <div><strong>{studies.length}</strong><span>imaginary study designs</span></div>
        <div><strong>{sources.length}</strong><span>demo sources, none verified</span></div>
      </section>

      <section className="section" aria-labelledby="topics-title">
        <div className="section-heading">
          <div><p className="eyebrow">Build your understanding</p><h2 id="topics-title">Six ways into the question</h2></div>
          <Link to="/communities" className="text-link">Open the community explorer <Icon name="arrow" size={14} /></Link>
        </div>
        <div className="topic-grid">
          {topics.map((topic) => (
            <Link to={topic.path} className="topic-card" key={topic.id}>
              <span className="card-top"><span>{topic.mark}</span><Icon name="arrow" /></span>
              <h3>{topic.name}</h3>
              <p>{topic.description}</p>
              <small>{topic.detail}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="jurisdictions-title">
        <div className="section-heading">
          <div><p className="eyebrow">Quick access</p><h2 id="jurisdictions-title">Jurisdiction profiles</h2></div>
        </div>
        <div className="two-grid">
          {jurisdictions.map((item) => (
            <Link to={`/jurisdictions/${item.id}`} key={item.id} className="jurisdiction-card">
              <span className="eyebrow">Navigation label · fictional records</span>
              <h3>{item.name}</h3>
              <p>{item.summary}</p>
              <dl className="mini-stats">
                {sectors.map((sector) => (
                  <div key={sector.id}>
                    <dt>{sector.name}</dt>
                    <dd>{rulesFor(item.id, sector.id).length} demo rules · {entriesFor(item.id, sector.id).length} entries</dd>
                  </div>
                ))}
              </dl>
              <span className="card-arrow"><Icon name="arrow" size={22} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section split" aria-labelledby="insights-title">
        <div>
          <p className="eyebrow">Recent demonstration insights</p>
          <h2 id="insights-title">Evidence needs a little more context.</h2>
          <p className="lede">These examples show how a question, a method, a source and its limits belong together. None is a real finding.</p>
          <div className="button-row">
            <Link className="button" to="/effects">Browse imaginary studies</Link>
            <Link className="button secondary" to="/history">Open the timeline</Link>
          </div>
        </div>
        <div className="stack">
          {studies.slice(0, 2).map((study) => (
            <Link className="insight-card" to={`/effects?study=${study.id}`} key={study.id}>
              <span className="card-meta"><Badge>Fictional study</Badge><span>{study.topic} · {study.design}</span></span>
              <h3>{study.title}</h3>
              <p>{study.question}</p>
              <span className="text-link">Read methods &amp; limitations</span>
            </Link>
          ))}
          <div className="insight-card insight-list">
            <span className="card-meta"><Badge>Fictional change log</Badge></span>
            <ul>
              {latestEvents.map((event) => (
                <li key={event.id}><Link to={`/history?event=${event.id}`}><strong>{event.year}</strong> {event.title}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="sources-title">
        <div className="section-heading">
          <div><p className="eyebrow">Source examples</p><h2 id="sources-title">Every record points to a source</h2></div>
          <Link to="/data" className="text-link">Open the source registry <Icon name="arrow" size={14} /></Link>
        </div>
        <div className="three-grid">
          {sources.slice(0, 3).map((source) => {
            const usage = sourceUsage(source.id);
            const used = Object.values(usage).reduce((total, count) => total + count, 0);
            return (
              <Link className="panel source-card" key={source.id} to={`/data/${source.id}`}>
                <span className="card-meta"><Badge>{source.kind} · synthetic</Badge><span>Never verified</span></span>
                <h3>{source.title}</h3>
                <p>{source.scope}</p>
                <small>Referenced by {used} demo records</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="principle" aria-labelledby="principle-title">
        <p className="eyebrow">A note on this prototype</p>
        <h2 id="principle-title">Clarity begins with saying what we don’t know.</h2>
        <p>
          No record here has been verified against an official source. Centre and Karnataka are navigation labels, not a claim about
          their actual rules. This workspace demonstrates how sourced research could be explored — it does not determine anyone’s eligibility.
        </p>
        <DemoStamp />
      </section>
    </>
  );
}
