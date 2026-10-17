import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { EmptyState, FilterBar, PageHeader, ResultCount, SearchField, Segmented } from '../components/ui';
import { searchAll, searchKinds } from '../data/explore';
import { useQueryState } from '../hooks/useQueryState';

const keys = ['q', 'kind'];

export function SearchPage() {
  const state = useQueryState();
  const query = state.get('q');
  const kind = searchKinds.find((item) => item === state.get('kind')) ?? '';
  const all = searchAll(query);
  const results = kind ? all.filter((item) => item.kind === kind) : all;
  const count = (value: string) => (value ? all.filter((item) => item.kind === value).length : all.length);

  return (
    <>
      <PageHeader eyebrow="Discovery · Global search" title="Follow your question" docTitle={query ? `Search: ${query}` : 'Search'}>
        Search fictional communities, jurisdictions, topics, studies, debates, events and sources. Matching is literal:
        a similar name never establishes legal equivalence.
      </PageHeader>
      <FilterBar onReset={() => state.reset(keys)} active={state.countActive(keys)} label="Search filters">
        <SearchField label="Search all records" value={query} onChange={(value) => state.set({ q: value })} placeholder="Name, alias, topic or source…" />
      </FilterBar>
      <Segmented
        label="Filter by record type" value={kind}
        options={[{ value: '', label: `All (${count('')})` }, ...searchKinds.map((item) => ({ value: item, label: `${item} (${count(item)})` }))]}
        onChange={(value) => state.set({ kind: value })}
      />
      <ResultCount>
        {results.length} result{results.length === 1 ? '' : 's'}{query ? ` for “${query}”` : ' in the demonstration'}{kind ? ` · ${kind}` : ''}
      </ResultCount>
      {results.length > 0 ? (
        <ul className="results">
          {results.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="result-card">
                <div>
                  <span className="eyebrow">{item.kind} · synthetic</span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
                <Icon name="arrow" />
              </Link>
            </li>
          ))}
        </ul>
      ) : <EmptyState onReset={() => state.reset(keys)}>Nothing in the demonstration matches. Check spelling — search does not guess similar names.</EmptyState>}
    </>
  );
}
