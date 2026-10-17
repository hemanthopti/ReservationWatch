import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import {
  Badge, Breadcrumbs, Callout, EmptyState, FilterBar, NotFound, PageHeader, ResultCount, SearchField, SelectField, SourceMeta,
} from '../components/ui';
import { exportDatasets, exportRecords, getSource, matches, sourceUsage, type DatasetId, type ExportRow } from '../data/explore';
import { jurisdictions, sources } from '../data/fixtures';
import { useQueryState } from '../hooks/useQueryState';

const keys = ['q', 'kind', 'jurisdiction'];
const kinds = [...new Set(sources.map((source) => source.kind))].sort();

function download(name: string, rows: ExportRow[], format: 'csv' | 'json') {
  const blob = new Blob([exportRecords(rows, format)], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reservationwatch-SYNTHETIC-DEMO-${name}.${format}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DataTools() {
  const state = useQueryState();
  const [message, setMessage] = useState('');
  const [dataset, setDataset] = useState<DatasetId | 'filtered'>('filtered');
  const rows = sources.filter((source) => matches(state.get('q'), source.title, source.scope, source.note)
    && (!state.get('kind') || source.kind === state.get('kind'))
    && (!state.get('jurisdiction') || source.jurisdictions.includes(state.get('jurisdiction') as never)));
  const reset = () => state.reset(keys);

  const exportRows = (): [string, ExportRow[]] => {
    if (dataset === 'filtered') {
      const ids = new Set(rows.map((row) => row.id));
      return ['sources-filtered', exportDatasets.sources.rows().filter((row) => ids.has(String(row.id)))];
    }
    return [dataset, exportDatasets[dataset].rows()];
  };
  const [, preview] = exportRows();

  function runExport(format: 'csv' | 'json') {
    const [name, data] = exportRows();
    download(name, data, format);
    setMessage(`${data.length} synthetic records exported as ${format.toUpperCase()}. Each record carries the demonstration disclaimer.`);
  }

  return (
    <>
      <PageHeader eyebrow="06 · Data & Tools" title="Keep the source in sight">
        Inspect the fictional source registry, compare jurisdictions and export clearly labelled demonstration data. There are no official documents here.
      </PageHeader>

      <section className="tool-grid" aria-label="Tools">
        <Link className="tool-card" to="/compare"><Icon name="swap" size={22} /><h2>Compare jurisdictions</h2><p>Side-by-side scope, dates and counts.</p></Link>
        <Link className="tool-card" to="/communities"><Icon name="search" size={22} /><h2>Community explorer</h2><p>Literal search over fictional identities.</p></Link>
        <Link className="tool-card" to="/reach"><Icon name="arrow" size={22} /><h2>Reach charts</h2><p>Numerators, denominators and table views.</p></Link>
        <div className="tool-card is-disabled" aria-disabled="true"><Icon name="doc" size={22} /><h2>Admin & verification</h2><p><Badge tone="neutral">Coming later</Badge> No login or editor exists in this prototype.</p></div>
      </section>

      <section className="section" aria-labelledby="registry-title">
        <div className="section-heading">
          <div><p className="eyebrow">Demonstration source registry</p><h2 id="registry-title">Sources behind every record</h2></div>
        </div>
        <FilterBar onReset={reset} active={state.countActive(keys)} label="Source filters">
          <SearchField label="Search sources" value={state.get('q')} onChange={(value) => state.set({ q: value })} />
          <SelectField label="Source type" value={state.get('kind')} all="All source types" options={kinds} onChange={(value) => state.set({ kind: value })} />
          <SelectField label="Jurisdiction" value={state.get('jurisdiction')} all="All jurisdictions" onChange={(value) => state.set({ jurisdiction: value })}
            options={jurisdictions.map((item) => ({ value: item.id, label: item.name }))} />
        </FilterBar>
        <ResultCount>{rows.length} of {sources.length} synthetic source records</ResultCount>
        {rows.length ? (
          <ul className="two-grid">
            {rows.map((source) => {
              const usage = Object.entries(sourceUsage(source.id)).filter(([, count]) => count > 0);
              return (
                <li key={source.id}>
                  <Link className="panel source-card" to={`/data/${source.id}`}>
                    <span className="card-meta"><Badge>{source.kind} · synthetic</Badge><Badge tone="warn">Never verified</Badge></span>
                    <h3>{source.title}</h3>
                    <p>{source.scope}</p>
                    <small>Published {source.published} · used by {usage.map(([kind, count]) => `${count} ${kind}`).join(', ') || 'no records'}</small>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : <EmptyState onReset={reset} />}
      </section>

      <section className="panel section export-panel" aria-labelledby="export-title">
        <div>
          <p className="eyebrow">Demonstration export</p>
          <h2 id="export-title">Download labelled synthetic data</h2>
          <p>Exports are generated in your browser from local fixtures. Every file and every record includes: <em>SYNTHETIC DEMONSTRATION ONLY</em>.</p>
        </div>
        <div className="export-controls">
          <SelectField label="Dataset" value={dataset} onChange={(value) => setDataset(value as DatasetId | 'filtered')}
            options={[{ value: 'filtered', label: `Sources matching the filters above (${rows.length})` },
              ...Object.entries(exportDatasets).map(([id, item]) => ({ value: id, label: `${item.label} (${item.rows().length})` }))]} />
          <div className="button-row">
            <button type="button" className="button" disabled={!preview.length} onClick={() => runExport('csv')}><Icon name="download" /> Export demo CSV</button>
            <button type="button" className="button secondary" disabled={!preview.length} onClick={() => runExport('json')}><Icon name="download" /> Export demo JSON</button>
          </div>
          <p className="helper" role="status">{message || (preview.length ? `${preview.length} records will be exported.` : 'No records to export — adjust the filters.')}</p>
        </div>
      </section>

      <section className="panel section" aria-labelledby="legend-title">
        <h2 id="legend-title">Transparency legend</h2>
        <dl className="legend-grid">
          <div><dt><Badge>Synthetic</Badge></dt><dd>Invented for this prototype; never evidence of actual policy or outcomes.</dd></div>
          <div><dt><Badge tone="warn">Never verified</Badge></dt><dd>No check against an official source has occurred.</dd></div>
          <div><dt><Badge tone="neutral">In effect</Badge></dt><dd>Applies on the chosen synthetic date; superseded versions remain visible.</dd></div>
          <div><dt><Badge tone="brand">Normative</Badge></dt><dd>A value judgement, kept apart from empirical claims.</dd></div>
          <div><dt>Published · Effective · Recorded</dt><dd>Separate dates: when a source appeared, when it applies and when it entered this database.</dd></div>
          <div><dt><Badge tone="neutral">Coming later</Badge></dt><dd>Admin, verification workflow and real document previews are not implemented.</dd></div>
        </dl>
      </section>
    </>
  );
}

export function SourceDetail() {
  const { id } = useParams();
  const source = getSource(id);
  if (!source) return <NotFound what="source" />;
  const usage = sourceUsage(source.id);
  const usageLinks: [keyof typeof usage, string, string][] = [
    ['entries', 'list entries', '/communities'], ['rules', 'rules', '/rules'], ['observations', 'observations', '/reach'],
    ['studies', 'studies', '/effects'], ['debates', 'debates', '/debates'], ['events', 'timeline events', '/history'],
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Data & Tools', to: '/data' }, { label: source.title }]} />
      <PageHeader eyebrow="Source transparency · synthetic metadata" title={source.title}>{source.scope}</PageHeader>
      <div className="split">
        <section className="panel" aria-labelledby="meta-title">
          <div className="card-meta"><Badge>Not an actual publication</Badge><Badge tone="warn">Never verified</Badge></div>
          <h2 id="meta-title">Metadata</h2>
          <SourceMeta id={source.id} />
          <h3>Limits and provenance</h3>
          <p>{source.note}</p>
          <h3>Used by</h3>
          <ul className="link-list">
            {usageLinks.filter(([key]) => usage[key] > 0).map(([key, label, path]) => (
              <li key={key}><Link to={path}>{usage[key]} {label}</Link></li>
            ))}
          </ul>
          <details className="disclosure">
            <summary>Audit history ({source.audit.length})</summary>
            <ol className="versions">{source.audit.map((item) => <li key={item.action}><strong>{item.date}</strong> <span>{item.action}</span></li>)}</ol>
          </details>
        </section>
        <aside className="document-placeholder" aria-labelledby="preview-title">
          <div aria-hidden="true" className="document-icon"><Icon name="doc" size={36} /></div>
          <h2 id="preview-title">Document preview is not available</h2>
          <p>This source is a fictional metadata example. No PDF, Gazette, official URL or downloadable source document exists, so none is shown.</p>
          <Badge tone="neutral">Verified document previews · Coming later</Badge>
        </aside>
      </div>
      <Callout title="Why no link?">
        Inventing an official-looking document or URL could be mistaken for a real source. Real previews will only be added for verified documents.
      </Callout>
    </>
  );
}
