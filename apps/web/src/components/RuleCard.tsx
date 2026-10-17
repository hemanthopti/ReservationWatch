import { useId, type ReactNode } from 'react';
import { ruleVersionAsOf } from '../data/explore';
import type { Rule } from '../data/types';
import { Badge, SourceLink } from './ui';

export function RuleCard({ rule, asOf }: { rule: Rule; asOf: string }) {
  const current = ruleVersionAsOf(rule, asOf);
  const headingId = useId();
  return (
    <article className="rule-card panel" aria-labelledby={headingId}>
      <div className="card-meta">
        <Badge tone={rule.kind === 'Demo allocation' ? 'brand' : 'neutral'}>{rule.kind}</Badge>
        {current ? <Badge tone="neutral">In effect on {asOf} · v{current.version}</Badge> : <Badge tone="warn">Not in effect on {asOf}</Badge>}
      </div>
      <h3 id={headingId}>{rule.title}</h3>
      <p>{rule.summary}</p>
      <dl className="rule-facts">
        <Fact term="Category · demo">{rule.category ?? 'None — procedural record'}</Fact>
        <Fact term="Placeholder value">{current?.demoUnits != null ? `${current.demoUnits} placeholder units` : 'Not applicable'}</Fact>
        <Fact term="Effective · synthetic">{current ? `${current.effectiveFrom} → ${current.effectiveTo ?? 'current'}` : `Starts ${rule.versions[0]?.effectiveFrom}`}</Fact>
        <Fact term="Verification">Never verified</Fact>
      </dl>
      <details className="disclosure">
        <summary>Version history ({rule.versions.length}) and limits</summary>
        <ol className="versions">
          {rule.versions.map((version) => (
            <li key={version.version} className={version === current ? 'is-current' : undefined}>
              <strong>v{version.version}</strong> {version.effectiveFrom} → {version.effectiveTo ?? 'current'}
              {version.demoUnits != null && <> · {version.demoUnits} units</>}
              {version.effectiveTo && version.effectiveTo <= asOf && <> · <em>superseded</em></>}
              <span>{version.change}</span>
            </li>
          ))}
        </ol>
        <p><strong>Limits:</strong> {rule.limits}</p>
      </details>
      <SourceLink id={rule.sourceId} />
    </article>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return <div><dt>{term}</dt><dd>{children}</dd></div>;
}
