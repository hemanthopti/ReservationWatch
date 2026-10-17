import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import {
  Badge, Breadcrumbs, Callout, EmptyState, FilterBar, NotFound, PageHeader, ResultCount, SearchField, SelectField, SourceMeta,
} from '../components/ui';
import { allCategories, findCommunities, getCommunity, getJurisdiction, getSector, isEffective } from '../data/explore';
import { DEFAULT_AS_OF, entries, jurisdictions, sectors } from '../data/fixtures';
import { useQueryState } from '../hooks/useQueryState';

const keys = ['q', 'jurisdiction', 'sector', 'category', 'sort'];

export function Communities() {
  const state = useQueryState();
  const filters = { query: state.get('q'), jurisdiction: state.get('jurisdiction'), sector: state.get('sector'), category: state.get('category'), sort: state.get('sort', 'asc') };
  const records = findCommunities(filters);
  const reset = () => state.reset(keys);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Rules', to: '/rules' }, { label: 'Community explorer' }]} />
      <PageHeader eyebrow="Community explorer · fictional identities" title="Explore identities, keep scope separate">
        Search invented identities by name or alias, then filter by the jurisdiction, sector and demo category of their
        independent list entries. All filters must hold for the <em>same</em> entry.
      </PageHeader>
      <FilterBar onReset={reset} active={state.countActive(keys)} label="Community filters">
        <SearchField label="Find a fictional community" value={filters.query} onChange={(value) => state.set({ q: value })} placeholder="Name or fictional alias" />
        <SelectField label="Jurisdiction" value={filters.jurisdiction} all="All jurisdictions" onChange={(value) => state.set({ jurisdiction: value })}
          options={jurisdictions.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Sector" value={filters.sector} all="All sectors" onChange={(value) => state.set({ sector: value })}
          options={sectors.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Demo category" value={filters.category} all="All demo categories" onChange={(value) => state.set({ category: value })} options={allCategories} />
        <SelectField label="Sort" value={filters.sort} onChange={(value) => state.set({ sort: value === 'asc' ? null : value })}
          options={[{ value: 'asc', label: 'Name A–Z' }, { value: 'desc', label: 'Name Z–A' }, { value: 'entries', label: 'Most list entries' }]} />
      </FilterBar>
      <ResultCount>{records.length} of {findCommunities().length} fictional communities</ResultCount>
      {records.length ? (
        <ul className="three-grid">
          {records.map((record) => {
            const own = entries.filter((entry) => entry.communityId === record.id);
            return (
              <li key={record.id}>
                <Link className="panel community-card" to={`/communities/${record.id}`}>
                  <span className="card-meta"><Badge>Fictional identity</Badge>{record.lookalikes.length > 0 && <Badge tone="warn">Similar name exists</Badge>}</span>
                  <h2>{record.name}</h2>
                  <p>Aliases: {record.aliases.map((alias) => alias.label).join(' · ')}</p>
                  <ul className="chip-list" aria-label="Independent list entries">
                    {own.map((entry) => (
                      <li key={entry.id} className={isEffective(entry, DEFAULT_AS_OF) ? undefined : 'chip-muted'}>
                        {getJurisdiction(entry.jurisdictionId)?.name} · {entry.category.replace('Demo group ', '')}
                        {!isEffective(entry, DEFAULT_AS_OF) && ' (superseded)'}
                      </li>
                    ))}
                  </ul>
                  <span className="text-link">View independent entries <Icon name="arrow" size={14} /></span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : <EmptyState onReset={reset}>No fictional identity has a single list entry matching all of these filters.</EmptyState>}
      <Callout title="Search is literal">
        Matching uses names and recorded aliases only. Similarly spelled names are never merged or treated as the same community.
      </Callout>
    </>
  );
}

export function CommunityProfile() {
  const { id } = useParams();
  const record = getCommunity(id);
  if (!record) return <NotFound what="community" />;
  const own = entries.filter((entry) => entry.communityId === record.id);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Community explorer', to: '/communities' }, { label: record.name }]} />
      <PageHeader eyebrow="Fictional identity · demonstration only" title={record.name}>{record.description}</PageHeader>

      <Callout title="Not an eligibility check">
        A record’s presence or absence in this prototype says nothing about real official lists. No individual eligibility
        determination can be made here — and never from a name match alone.
      </Callout>

      <div className="split">
        <section className="panel" aria-labelledby="aliases-title">
          <h2 id="aliases-title">Recorded aliases · synthetic</h2>
          <table className="plain-table">
            <thead><tr><th scope="col">Alias</th><th scope="col">Kind</th></tr></thead>
            <tbody>{record.aliases.map((alias) => <tr key={alias.label}><td>{alias.label}</td><td>{alias.kind}</td></tr>)}</tbody>
          </table>
          <p className="helper">Aliases are search aids. They do not establish that any two names refer to the same legally recognised group.</p>
        </section>
        <section className="panel" aria-labelledby="identity-title">
          <h2 id="identity-title">Identity record</h2>
          <dl className="metadata">
            <div><dt>Identity type</dt><dd>Fictional illustration</dd></div>
            <div><dt>Jurisdictions with entries</dt><dd>{[...new Set(own.map((entry) => getJurisdiction(entry.jurisdictionId)?.name))].join(', ')}</dd></div>
            <div><dt>Legal equivalence across jurisdictions</dt><dd>Not assessed</dd></div>
          </dl>
          {record.lookalikes.length > 0 && (
            <div className="lookalike" role="note">
              <strong>Similarly named, separate record:</strong>{' '}
              {record.lookalikes.map((other) => <Link key={other} to={`/communities/${other}`}>{getCommunity(other)?.name}</Link>)}
              <p>These records are deliberately kept apart. A similar name is not evidence that they are the same community.</p>
            </div>
          )}
        </section>
      </div>

      <section className="section" aria-labelledby="entries-title">
        <h2 id="entries-title" className="section-label">Independent jurisdiction entries ({own.length})</h2>
        <div className="two-grid">
          {own.map((entry) => {
            const current = isEffective(entry, DEFAULT_AS_OF);
            return (
              <article className="panel entry-card" key={entry.id} aria-labelledby={`${entry.id}-title`}>
                <div className="card-meta">
                  <Badge>Synthetic entry</Badge>
                  <Badge tone={current ? 'neutral' : 'warn'}>{current ? `In effect on ${DEFAULT_AS_OF}` : 'Superseded'}</Badge>
                </div>
                <h3 id={`${entry.id}-title`}>{getJurisdiction(entry.jurisdictionId)?.name}</h3>
                <dl className="metadata">
                  <div><dt>List · entry</dt><dd>{getJurisdiction(entry.jurisdictionId)?.listName} · #{entry.entryNo}</dd></div>
                  <div><dt>Category · demonstration only</dt><dd>{entry.category}</dd></div>
                  <div><dt>Sectors in scope</dt><dd>{entry.sectors.map((sector) => getSector(sector)?.name).join(', ')}</dd></div>
                  <div><dt>Effective · synthetic</dt><dd>{entry.effectiveFrom} → {entry.effectiveTo ?? 'current'}</dd></div>
                  <div><dt>Note</dt><dd>{entry.note}</dd></div>
                </dl>
                <details className="disclosure">
                  <summary>Source and verification</summary>
                  <SourceMeta id={entry.sourceId} compact />
                </details>
                <Link className="text-link" to={`/jurisdictions/${entry.jurisdictionId}?sector=${entry.sectors[0]}`}>
                  Open {getJurisdiction(entry.jurisdictionId)?.name} profile <Icon name="arrow" size={14} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
