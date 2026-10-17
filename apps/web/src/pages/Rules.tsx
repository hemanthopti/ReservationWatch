import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { RuleCard } from '../components/RuleCard';
import { Callout, PageHeader, ResultCount, Segmented } from '../components/ui';
import { entriesFor, getJurisdiction, jurisdictionIds, pick, rulesFor, sectorIds } from '../data/explore';
import { DEFAULT_AS_OF, jurisdictions, sectors } from '../data/fixtures';
import { useQueryState } from '../hooks/useQueryState';

const anatomy = [
  { term: 'Rule', text: 'What a record says should happen — here, a fictional allocation or procedure.' },
  { term: 'Category', text: 'A demo group label. The same label in two places is not the same legal status.' },
  { term: 'Jurisdiction', text: 'Where the record applies. Centre and Karnataka are navigation labels only.' },
  { term: 'Sector', text: 'Education, public employment or political representation.' },
  { term: 'Time', text: 'Effective-from and effective-to dates; superseded versions stay visible.' },
  { term: 'Source & verification', text: 'Which source the record came from and when it was last checked (never, here).' },
  { term: 'Limits', text: 'What cannot be inferred — including anyone’s individual eligibility.' },
];

export function Rules() {
  const state = useQueryState();
  const jurisdiction = pick(state.get('jurisdiction'), jurisdictionIds, 'centre');
  const sector = pick(state.get('sector'), sectorIds, 'education');
  const list = rulesFor(jurisdiction, sector);
  const name = getJurisdiction(jurisdiction)?.name;

  return (
    <>
      <PageHeader eyebrow="01 · Rules" title="Read the rule in its context"
        actions={<Link className="button secondary" to="/compare"><Icon name="swap" /> Compare jurisdictions</Link>}>
        Start with a jurisdiction and a sector. Keep community identity, list entry and rule scope as separate records.
      </PageHeader>

      <section className="anatomy" aria-labelledby="anatomy-title">
        <h2 id="anatomy-title" className="section-label">Anatomy of a rule record</h2>
        <dl className="anatomy-grid">
          {anatomy.map((item, index) => (
            <div key={item.term}><dt><span>{String(index + 1).padStart(2, '0')}</span>{item.term}</dt><dd>{item.text}</dd></div>
          ))}
        </dl>
      </section>

      <section className="section" aria-labelledby="browser-title">
        <div className="section-heading">
          <div><p className="eyebrow">Rule browser · synthetic</p><h2 id="browser-title">Fictional rules by jurisdiction and sector</h2></div>
          <Link className="text-link" to={`/jurisdictions/${jurisdiction}?sector=${sector}`}>Open full {name} profile <Icon name="arrow" size={14} /></Link>
        </div>
        <div className="control-row">
          <Segmented label="Jurisdiction" value={jurisdiction} onChange={(value) => state.set({ jurisdiction: value })}
            options={jurisdictions.map((item) => ({ value: item.id, label: item.name }))} />
          <Segmented label="Sector" value={sector} onChange={(value) => state.set({ sector: value })}
            options={sectors.map((item) => ({ value: item.id, label: item.name }))} />
        </div>
        <ResultCount>
          {list.length} fictional rules · {entriesFor(jurisdiction, sector, DEFAULT_AS_OF).length} list entries in effect on {DEFAULT_AS_OF} · {name} · {sectors.find((item) => item.id === sector)?.name}
        </ResultCount>
        <div className="two-grid">
          {list.map((rule) => <RuleCard key={rule.id} rule={rule} asOf={DEFAULT_AS_OF} />)}
        </div>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Read before comparing</p>
          <h2>A shared name is not a shared legal status.</h2>
          <p className="lede">“Demo group Teal” appears in both fictional workspaces on purpose. Each record must be read in its own source and scope.</p>
          <Link className="button" to="/communities">Explore fictional communities</Link>
        </div>
        <div className="panel">
          <h3>Four questions to keep attached</h3>
          <ol className="numbered">
            <li>Which jurisdiction and sector?</li>
            <li>What does the record actually cover?</li>
            <li>When is it effective, and what is the source?</li>
            <li>What cannot be inferred from this entry?</li>
          </ol>
        </div>
      </section>
      <Callout title="Demonstration limits">
        Placeholder units are not percentages or quotas, and no rule here describes actual Centre or Karnataka policy.
      </Callout>
    </>
  );
}
