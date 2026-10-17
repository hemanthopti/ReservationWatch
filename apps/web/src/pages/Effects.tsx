import { useEffect, useRef } from 'react';
import { Badge, Callout, EmptyState, FilterBar, PageHeader, ResultCount, SearchField, SelectField, SourceMeta } from '../components/ui';
import { filterStudies, getJurisdiction } from '../data/explore';
import { jurisdictions, studies } from '../data/fixtures';
import type { Study } from '../data/types';
import { useQueryState } from '../hooks/useQueryState';

const keys = ['q', 'topic', 'design', 'jurisdiction', 'sort', 'study'];
const topicsList = [...new Set(studies.map((study) => study.topic))].sort();
const designs = [...new Set(studies.map((study) => study.design))].sort();

export function Effects() {
  const state = useQueryState();
  const rows = filterStudies({ query: state.get('q'), topic: state.get('topic'), design: state.get('design'), jurisdiction: state.get('jurisdiction'), sort: state.get('sort', 'title') });
  const open = state.get('study');
  const reset = () => state.reset(keys);

  return (
    <>
      <PageHeader eyebrow="03 · Effects" title="Look past the headline">
        A library of imaginary study designs for practising careful reading. No real study, author, journal, dataset or
        empirical finding is represented.
      </PageHeader>
      <FilterBar onReset={reset} active={state.countActive(keys.filter((key) => key !== 'study'))} label="Study filters">
        <SearchField label="Search imaginary studies" value={state.get('q')} onChange={(value) => state.set({ q: value })} placeholder="Question, design or method" />
        <SelectField label="Research topic" value={state.get('topic')} all="All topics" options={topicsList} onChange={(value) => state.set({ topic: value })} />
        <SelectField label="Study design" value={state.get('design')} all="All designs" options={designs} onChange={(value) => state.set({ design: value })} />
        <SelectField label="Jurisdiction scope" value={state.get('jurisdiction')} all="Any jurisdiction" onChange={(value) => state.set({ jurisdiction: value })}
          options={jurisdictions.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Sort" value={state.get('sort', 'title')} onChange={(value) => state.set({ sort: value === 'title' ? null : value })}
          options={[{ value: 'title', label: 'Title A–Z' }, { value: 'topic', label: 'Topic' }]} />
      </FilterBar>
      <ResultCount>{rows.length} of {studies.length} imaginary studies</ResultCount>
      {rows.length ? (
        <div className="stack">
          {rows.map((study) => (
            <StudyCard key={study.id} study={study} open={open === study.id} onToggle={() => state.set({ study: open === study.id ? null : study.id })} />
          ))}
        </div>
      ) : <EmptyState onReset={reset} />}
      <Callout title="How to read an evidence card">
        Check the question, the design and the limitations before the result. A design that compares groups does not by itself
        establish cause, and findings rarely travel beyond the population studied.
      </Callout>
    </>
  );
}

function StudyCard({ study, open, onToggle }: { study: Study; open: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const panelId = `${study.id}-details`;
  // Bring a deep-linked study into view on first render.
  useEffect(() => { if (open) ref.current?.scrollIntoView({ block: 'nearest' }); }, [open]);

  return (
    <article ref={ref} className={`study-card ${open ? 'is-open' : ''}`} aria-labelledby={`${study.id}-title`}>
      <div className="study-side">
        <span className="eyebrow">{study.topic}</span>
        <Badge>Fictional study</Badge>
        <span>{study.design}</span>
        <span>{study.jurisdictionIds.map((id) => getJurisdiction(id)?.name).join(' · ')}</span>
        <span>{study.period}</span>
      </div>
      <div className="study-body">
        <h2 id={`${study.id}-title`}>{study.title}</h2>
        <p>{study.question}</p>
        <button type="button" className="text-button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          {open ? 'Close methods & limitations' : 'Read methods & limitations'}
        </button>
        {open && (
          <div className="study-details" id={panelId}>
            <div className="three-col">
              <section><h3>Methods · illustrative</h3><p>{study.methods}</p></section>
              <section><h3>Results · no actual findings</h3><p>{study.results}</p></section>
              <section><h3>Limitations</h3><p>{study.limitations}</p></section>
            </div>
            <h3>Source status</h3>
            <SourceMeta id={study.sourceId} compact />
          </div>
        )}
      </div>
    </article>
  );
}
