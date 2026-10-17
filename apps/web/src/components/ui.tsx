import { useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getSource } from '../data/explore';
import { NEVER_VERIFIED } from '../data/fixtures';
import { usePageTitle } from '../hooks/useQueryState';
import { Icon } from './Icon';

export function PageHeader({ eyebrow, title, children, actions, docTitle }: {
  eyebrow: string; title: string; children?: ReactNode; actions?: ReactNode; docTitle?: string;
}) {
  usePageTitle(docTitle ?? title);
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children && <p className="lede">{children}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={item.label}>
            {item.to && index < items.length - 1
              ? <Link to={item.to}>{item.label}</Link>
              : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

type Tone = 'demo' | 'neutral' | 'brand' | 'warn';

export function Badge({ children = 'Synthetic demo', tone = 'demo' }: { children?: ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Callout({ title, children, tone = 'demo' }: { title?: string; children: ReactNode; tone?: 'demo' | 'info' }) {
  return (
    <aside className={`callout callout-${tone}`}>
      <Icon name="info" />
      <div>
        {title && <p className="callout-title">{title}</p>}
        <div>{children}</div>
      </div>
    </aside>
  );
}

export function EmptyState({ onReset, children = 'Try a broader search or reset the filters.' }: { onReset?: () => void; children?: ReactNode }) {
  return (
    <div className="empty" role="status">
      <h2>No matching records</h2>
      <p>{children}</p>
      {onReset && <button type="button" className="button secondary" onClick={onReset}>Reset filters</button>}
    </div>
  );
}

export interface Option { value: string; label: string }

export function SelectField({ label, value, onChange, options, all }: {
  label: string; value: string; onChange: (value: string) => void; options: readonly (Option | string)[]; all?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {all !== undefined && <option value="">{all}</option>}
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option;
          return <option key={item.value} value={item.value}>{item.label}</option>;
        })}
      </select>
    </div>
  );
}

export function SearchField({ label, value, onChange, placeholder = 'Search demonstration records…' }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="field field-grow">
      <label htmlFor={id}>{label}</label>
      <div className="input-icon">
        <Icon name="search" />
        <input id={id} type="search" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

export function FilterBar({ children, onReset, active, label = 'Filters' }: {
  children: ReactNode; onReset: () => void; active: number; label?: string;
}) {
  return (
    <section className="filter-bar" aria-label={label}>
      <div className="filter-fields">{children}</div>
      <button type="button" className="button ghost" onClick={onReset} disabled={!active}>
        Reset filters{active ? ` (${active})` : ''}
      </button>
    </section>
  );
}

export function ResultCount({ children }: { children: ReactNode }) {
  return <p className="result-count" role="status" aria-live="polite">{children}</p>;
}

/** Single-choice button group; uses aria-pressed so state is announced. */
export function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button type="button" key={option.value} aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Metric({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      {note && <span className="metric-note">{note}</span>}
    </div>
  );
}

export function SourceLink({ id, label = 'Inspect demo source' }: { id: string; label?: string }) {
  return <Link className="text-link" to={`/data/${id}`}>{label} <Icon name="arrow" size={14} /></Link>;
}

/** Keeps source identity, dates and verification status visible together. */
export function SourceMeta({ id, compact = false }: { id: string; compact?: boolean }) {
  const source = getSource(id);
  if (!source) return <p>Source unavailable.</p>;
  return (
    <dl className={`metadata ${compact ? 'metadata-compact' : ''}`}>
      <div><dt>Source</dt><dd><Link to={`/data/${source.id}`}>{source.title}</Link></dd></div>
      <div><dt>Published · synthetic</dt><dd>{source.published}</dd></div>
      <div><dt>Effective · synthetic</dt><dd>{source.effective ?? 'Not applicable'}</dd></div>
      {!compact && <div><dt>Recorded</dt><dd>{source.recorded}</dd></div>}
      <div><dt>Last verified</dt><dd>{source.lastVerified ?? NEVER_VERIFIED}</dd></div>
    </dl>
  );
}

export function DemoStamp({ children = 'Synthetic demonstration · not official data' }: { children?: ReactNode }) {
  return <p className="demo-stamp"><span aria-hidden="true">◆</span> {children}</p>;
}

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <>
      <PageHeader eyebrow="Record unavailable" title="This page was not found" docTitle="Not found">
        The address does not match any {what} in this demonstration.
      </PageHeader>
      <div className="button-row">
        <Link className="button" to="/">Return home</Link>
        <Link className="button secondary" to="/search">Search the demonstration</Link>
      </div>
    </>
  );
}

export function PageLoading() {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-block" />
    </div>
  );
}
