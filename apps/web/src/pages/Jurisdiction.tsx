import { useId } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { RuleCard } from '../components/RuleCard';
import { Badge, Breadcrumbs, Callout, NotFound, PageHeader, Segmented, SourceLink } from '../components/ui';
import { entriesFor, getCommunity, getJurisdiction, isEffective, pick, rulesFor, sectorIds } from '../data/explore';
import { DEFAULT_AS_OF, jurisdictions, sectors } from '../data/fixtures';
import { useQueryState } from '../hooks/useQueryState';

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function JurisdictionProfile() {
  const { id } = useParams();
  const state = useQueryState();
  const dateId = useId();
  const jurisdiction = getJurisdiction(id);
  if (!jurisdiction) return <NotFound what="jurisdiction" />;

  const sector = pick(state.get('sector'), sectorIds, 'education');
  const sectorName = sectors.find((item) => item.id === sector)!.name;
  const requested = state.get('asOf');
  const asOf = isoDate.test(requested) ? requested : DEFAULT_AS_OF;
  const showHistory = state.get('history') === '1';
  const rows = entriesFor(jurisdiction.id, sector).filter((entry) => showHistory || isEffective(entry, asOf));
  const inEffect = rulesFor(jurisdiction.id, sector);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Rules', to: '/rules' }, { label: jurisdiction.name }]} />
      <PageHeader eyebrow="Jurisdiction profile · synthetic" title={jurisdiction.name}
        actions={<Link className="button secondary" to={`/compare?left=${jurisdiction.id}&sector=${sector}`}><Icon name="swap" /> Compare</Link>}>
        {jurisdiction.summary}
      </PageHeader>

      <nav className="tabs" aria-label="Switch jurisdiction">
        {jurisdictions.map((item) => (
          <Link key={item.id} to={`/jurisdictions/${item.id}?sector=${sector}${requested ? `&asOf=${asOf}` : ''}`}
            aria-current={item.id === jurisdiction.id ? 'page' : undefined}>{item.name}</Link>
        ))}
      </nav>

      <div className="control-row">
        <Segmented label="Sector" value={sector} onChange={(value) => state.set({ sector: value })}
          options={sectors.map((item) => ({ value: item.id, label: item.name }))} />
        <div className="field field-inline">
          <label htmlFor={dateId}>View records as of · synthetic date</label>
          <input id={dateId} type="date" min="2019-01-01" max="2030-12-31" value={asOf}
            onChange={(event) => state.set({ asOf: event.target.value === DEFAULT_AS_OF ? null : event.target.value })} />
        </div>
      </div>

      <dl className="context-grid">
        <div><dt>Jurisdiction</dt><dd>{jurisdiction.name}<small>Navigation label</small></dd></div>
        <div><dt>Sector</dt><dd>{sectorName}</dd></div>
        <div><dt>Time</dt><dd>As of {asOf}<small>Synthetic effective dates</small></dd></div>
        <div><dt>Categories · demo</dt><dd>{jurisdiction.categories.join(', ')}</dd></div>
        <div><dt>Verification</dt><dd>Never verified<small>Synthetic fixture</small></dd></div>
      </dl>

      <section className="section" aria-labelledby="rules-title">
        <h2 id="rules-title" className="section-label">Rule records · {sectorName}</h2>
        <div className="two-grid">
          {inEffect.map((rule) => <RuleCard key={rule.id} rule={rule} asOf={asOf} />)}
        </div>
      </section>

      <section className="section" aria-labelledby="entries-title">
        <div className="section-heading">
          <div><p className="eyebrow">{jurisdiction.listName} · fictional</p><h2 id="entries-title">Independent list entries</h2></div>
          <label className="toggle">
            <input type="checkbox" checked={showHistory} onChange={(event) => state.set({ history: event.target.checked ? '1' : null })} />
            Include records not in effect on {asOf}
          </label>
        </div>
        {rows.length ? (
          <div className="table-scroll stack-on-mobile">
            <table>
              <caption>{jurisdiction.name} · {sectorName} · {showHistory ? 'all demo records' : `in effect on ${asOf}`} · Synthetic demonstration only</caption>
              <thead>
                <tr><th scope="col">Fictional identity</th><th scope="col">Category · demo</th><th scope="col">Effective · synthetic</th><th scope="col">Status</th><th scope="col">Source</th></tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <td><Link to={`/communities/${entry.communityId}`}>{getCommunity(entry.communityId)?.name}</Link><small>Entry #{entry.entryNo} · {entry.note}</small></td>
                    <td data-label="Category">{entry.category}</td>
                    <td data-label="Effective">{entry.effectiveFrom} → {entry.effectiveTo ?? 'current'}</td>
                    <td data-label="Status">{isEffective(entry, asOf) ? <Badge tone="neutral">In effect</Badge> : <Badge tone="warn">{entry.effectiveFrom > asOf ? 'Not yet effective' : 'Superseded'}</Badge>}</td>
                    <td data-label="Source"><SourceLink id={entry.sourceId} label="Inspect" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty" role="status"><h3>No entries in effect on {asOf}</h3><p>Choose a later date or include records not in effect.</p></div>
        )}
      </section>
      <Callout title="Limits">
        These fictional records do not establish legal classification, benefits, actual rules or personal eligibility. Similar labels
        in another jurisdiction must not be treated as equivalent.
      </Callout>
    </>
  );
}
