import { Link } from 'react-router-dom';
import { Badge, Callout, PageHeader, Segmented, SourceLink } from '../components/ui';
import { getStudy } from '../data/explore';
import { debates } from '../data/fixtures';
import type { ClaimKind } from '../data/types';
import { useQueryState } from '../hooks/useQueryState';

const views: { value: '' | ClaimKind; label: string }[] = [
  { value: '', label: 'All statements' },
  { value: 'normative', label: 'Normative only' },
  { value: 'empirical', label: 'Empirical only' },
];

const kindLabel: Record<ClaimKind, string> = {
  normative: 'Normative · a value judgement',
  empirical: 'Empirical · testable, not established',
};

export function Debates() {
  const state = useQueryState();
  const active = debates.find((debate) => debate.id === state.get('issue')) ?? debates[0]!;
  const view = views.find((item) => item.value === state.get('view'))?.value ?? '';

  return (
    <>
      <PageHeader eyebrow="04 · Debates" title="Make room for the other argument">
        Explore fictional policy-design questions side by side. Values and claims that would need evidence are labelled
        separately. This page takes no position.
      </PageHeader>

      <div className="tabs" role="group" aria-label="Debate issue">
        {debates.map((debate) => (
          <button type="button" key={debate.id} aria-pressed={active.id === debate.id} onClick={() => state.set({ issue: debate.id })}>{debate.title}</button>
        ))}
      </div>

      <section className="debate-question" aria-labelledby="question-title">
        <p className="eyebrow">The question · fictional exercise</p>
        <h2 id="question-title">{active.question}</h2>
        <p>{active.context}</p>
      </section>

      <div className="control-row">
        <Segmented label="Statement type" value={view} onChange={(value) => state.set({ view: value })} options={views} />
        <p className="helper legend-inline"><Badge tone="brand">Normative</Badge> what should be <Badge tone="neutral">Empirical</Badge> what could be measured</p>
      </div>

      <div className="two-grid">
        {active.positions.map((position, index) => {
          const claims = position.claims.filter((claim) => !view || claim.kind === view);
          return (
            <article className={`panel argument ${index ? 'alternate' : ''}`} key={position.label} aria-labelledby={`${active.id}-${index}`}>
              <span className="eyebrow">{position.label}</span>
              <h3 id={`${active.id}-${index}`}>{position.framing}</h3>
              <ul className="claims">
                {claims.map((claim) => (
                  <li key={claim.text} className={`claim claim-${claim.kind}`}>
                    <Badge tone={claim.kind === 'normative' ? 'brand' : 'neutral'}>{kindLabel[claim.kind]}</Badge>
                    <p>{claim.text}</p>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <section className="panel section evidence-panel" aria-labelledby="evidence-title">
        <h2 id="evidence-title">What evidence would we need?</h2>
        <Badge>Empirical questions · nothing established here</Badge>
        <ul className="check-list">{active.evidenceNeeded.map((item) => <li key={item}>{item}</li>)}</ul>
        <details className="disclosure">
          <summary>Evidence limitations and unresolved questions</summary>
          <p>{active.limits}</p>
        </details>
        <h3>Related imaginary study designs</h3>
        <ul className="link-list">
          {active.relatedStudyIds.map((id) => <li key={id}><Link to={`/effects?study=${id}`}>{getStudy(id)?.title}</Link></li>)}
        </ul>
        <SourceLink id={active.sourceId} />
      </section>
      <Callout title="Neutrality note">
        Both perspectives are written as illustrations. They do not quote real people, parties or organisations, and ReservationWatch does not advocate either.
      </Callout>
    </>
  );
}
