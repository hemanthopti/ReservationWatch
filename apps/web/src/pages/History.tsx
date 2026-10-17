import { useEffect, useRef } from 'react';
import { Badge, Callout, EmptyState, FilterBar, PageHeader, ResultCount, SearchField, SelectField, SourceMeta } from '../components/ui';
import { filterEvents, getJurisdiction } from '../data/explore';
import { events, jurisdictions } from '../data/fixtures';
import type { TimelineEvent } from '../data/types';
import { useQueryState } from '../hooks/useQueryState';

const keys = ['q', 'subject', 'jurisdiction', 'from', 'to', 'event'];
const subjects = [...new Set(events.map((event) => event.subject))].sort();
const allYears = [...new Set(events.map((event) => event.year))].sort();
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function History() {
  const state = useQueryState();
  const fromValue = Number(state.get('from')) || allYears[0]!;
  const toValue = Number(state.get('to')) || allYears[allYears.length - 1]!;
  const [from, to] = fromValue <= toValue ? [fromValue, toValue] : [toValue, fromValue];
  const rows = filterEvents({ query: state.get('q'), subject: state.get('subject'), jurisdiction: state.get('jurisdiction'), from, to });
  const open = state.get('event');
  const reset = () => state.reset(keys);
  const yearOnly = from === to;

  return (
    <>
      <PageHeader eyebrow="05 · History" title="Keep change in view">
        An entirely fictional timeline showing how a history explorer could work. These are not Indian legal events,
        government orders, commissions or court decisions.
      </PageHeader>

      <nav className="year-rail" aria-label="Jump to a single year">
        <button type="button" aria-pressed={!state.get('from') && !state.get('to')} onClick={() => state.set({ from: null, to: null })}>All years</button>
        {allYears.map((year) => (
          <button type="button" key={year} aria-pressed={yearOnly && from === year} onClick={() => state.set({ from: year, to: year })}>
            {year}<span>{events.filter((event) => event.year === year).length}</span>
          </button>
        ))}
      </nav>

      <FilterBar onReset={reset} active={state.countActive(keys.filter((key) => key !== 'event'))} label="Timeline filters">
        <SearchField label="Search events" value={state.get('q')} onChange={(value) => state.set({ q: value })} placeholder="Title or description" />
        <SelectField label="Timeline subject" value={state.get('subject')} all="All subjects" options={subjects} onChange={(value) => state.set({ subject: value })} />
        <SelectField label="Jurisdiction" value={state.get('jurisdiction')} all="All jurisdictions" onChange={(value) => state.set({ jurisdiction: value })}
          options={jurisdictions.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="From year" value={String(from)} options={allYears.map(String)} onChange={(value) => state.set({ from: value })} />
        <SelectField label="To year" value={String(to)} options={allYears.map(String)} onChange={(value) => state.set({ to: value })} />
      </FilterBar>
      <ResultCount>{rows.length} of {events.length} fictional events · {from}–{to}</ResultCount>

      {rows.length ? (
        <ol className="timeline">
          {rows.map((event) => (
            <TimelineRow key={event.id} event={event} open={open === event.id} onToggle={() => state.set({ event: open === event.id ? null : event.id })} />
          ))}
        </ol>
      ) : <EmptyState onReset={reset} />}
      <Callout title="No official chronology">
        A sourced history of actual reservation policy requires independent verification against primary documents and is outside this demonstration.
      </Callout>
    </>
  );
}

function TimelineRow({ event, open, onToggle }: { event: TimelineEvent; open: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => { if (open) ref.current?.scrollIntoView({ block: 'nearest' }); }, [open]);
  const panelId = `${event.id}-details`;
  return (
    <li ref={ref} className={`timeline-row ${open ? 'is-open' : ''}`}>
      <div className="timeline-date"><span>{event.year}</span><small>{months[event.month - 1]} · synthetic</small></div>
      <article className="panel" aria-labelledby={`${event.id}-title`}>
        <div className="card-meta">
          <Badge tone="neutral">{event.subject}</Badge>
          <span>{event.jurisdictionIds.map((id) => getJurisdiction(id)?.name).join(' · ')}</span>
        </div>
        <h2 id={`${event.id}-title`}>{event.title}</h2>
        <p>{event.summary}</p>
        <button type="button" className="text-button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          {open ? 'Close event details' : 'Explore event details'}
        </button>
        {open && (
          <div className="study-details" id={panelId}>
            <p>{event.detail}</p>
            <SourceMeta id={event.sourceId} compact />
          </div>
        )}
      </article>
    </li>
  );
}
