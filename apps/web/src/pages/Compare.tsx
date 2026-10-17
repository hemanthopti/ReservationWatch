import { useId } from 'react';
import { Link } from 'react-router-dom';
import { PairedBarChart } from '../components/charts';
import { Icon } from '../components/Icon';
import { Callout, PageHeader, SelectField, Segmented, SourceLink } from '../components/ui';
import { compareJurisdictions, getJurisdiction, jurisdictionIds, pick, type CompareMetric } from '../data/explore';
import { DEFAULT_AS_OF, jurisdictions, sectors } from '../data/fixtures';
import type { JurisdictionId, SectorId } from '../data/types';
import { useQueryState } from '../hooks/useQueryState';

const metrics: { value: CompareMetric; label: string; unit: string }[] = [
  { value: 'entries', label: 'List entries', unit: 'fictional entries' },
  { value: 'rules', label: 'Rules in effect', unit: 'fictional rules' },
  { value: 'units', label: 'Placeholder units', unit: 'placeholder units' },
];
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function Compare() {
  const state = useQueryState();
  const dateId = useId();
  const left = pick(state.get('left'), jurisdictionIds, 'centre');
  const right = pick(state.get('right'), jurisdictionIds, left === 'centre' ? 'karnataka' : 'centre');
  const metric = pick(state.get('metric'), metrics.map((item) => item.value), 'entries');
  const chosen = state.get('sector') ? state.get('sector').split(',').filter((value): value is SectorId => sectors.some((item) => item.id === value)) : [];
  const sectorList = chosen.length ? chosen : sectors.map((item) => item.id);
  const asOf = isoDate.test(state.get('asOf')) ? state.get('asOf') : DEFAULT_AS_OF;
  const differencesOnly = state.get('diff') === '1';
  const same = left === right;
  const rows = compareJurisdictions(left, right, sectorList, asOf);
  const leftName = getJurisdiction(left)!.name;
  const rightName = getJurisdiction(right)!.name;
  const selected = state.get('focus');
  const unit = metrics.find((item) => item.value === metric)!.unit;

  const toggleSector = (id: SectorId) => {
    const next = sectorList.includes(id) ? sectorList.filter((item) => item !== id) : [...sectorList, id];
    const ordered = sectors.map((item) => item.id).filter((item) => next.includes(item));
    state.set({ sector: ordered.length === sectors.length || !ordered.length ? null : ordered.join(',') });
  };

  const dimensions = rows.flatMap((row) => [
    { key: `${row.sector}-entries`, sector: row.sector, label: 'Fictional list entries in effect', l: String(row.values.left.entries), r: String(row.values.right.entries) },
    { key: `${row.sector}-rules`, sector: row.sector, label: 'Fictional rules in effect', l: String(row.values.left.rules), r: String(row.values.right.rules) },
    { key: `${row.sector}-units`, sector: row.sector, label: 'Placeholder units (not a quota)', l: String(row.values.left.units), r: String(row.values.right.units) },
    { key: `${row.sector}-categories`, sector: row.sector, label: 'Demo categories with entries', l: row.values.left.categories.join(', ') || 'None', r: row.values.right.categories.join(', ') || 'None' },
  ]).filter((row) => !differencesOnly || row.l !== row.r);

  return (
    <>
      <PageHeader eyebrow="Data & Tools · Comparison workspace" title="Compare scope, not assumptions">
        Choose two jurisdictions, the sectors to include and a date. Every value is fictional, and no equivalence between
        categories is implied — even where a label is shared.
      </PageHeader>

      <section className="filter-bar compare-controls" aria-label="Comparison controls">
        <div className="filter-fields">
          <SelectField label="Left jurisdiction" value={left} onChange={(value) => state.set({ left: value })}
            options={jurisdictions.map((item) => ({ value: item.id, label: item.name }))} />
          <button type="button" className="swap-button" aria-label="Swap jurisdictions" onClick={() => state.set({ left: right, right: left })}>
            <Icon name="swap" />
          </button>
          <SelectField label="Right jurisdiction" value={right} onChange={(value) => state.set({ right: value })}
            options={jurisdictions.map((item) => ({ value: item.id, label: item.name }))} />
          <div className="field">
            <label htmlFor={dateId}>As of · synthetic date</label>
            <input id={dateId} type="date" min="2019-01-01" max="2030-12-31" value={asOf} onChange={(event) => state.set({ asOf: event.target.value === DEFAULT_AS_OF ? null : event.target.value })} />
          </div>
        </div>
        <fieldset className="checkbox-group">
          <legend>Sectors to compare</legend>
          {sectors.map((item) => (
            <label key={item.id}>
              <input type="checkbox" checked={sectorList.includes(item.id)} disabled={sectorList.length === 1 && sectorList.includes(item.id)} onChange={() => toggleSector(item.id)} />
              {item.name}
            </label>
          ))}
          <label className="toggle">
            <input type="checkbox" checked={differencesOnly} onChange={(event) => state.set({ diff: event.target.checked ? '1' : null })} />
            Show differences only
          </label>
        </fieldset>
      </section>

      {same ? (
        <div className="guidance" role="alert">
          <h2>Choose two different jurisdictions</h2>
          <p>Comparing {leftName} with itself would show identical columns and could suggest a difference that is not there.</p>
          <button type="button" className="button" onClick={() => state.set({ right: jurisdictionIds.find((item) => item !== left) as JurisdictionId })}>
            Compare {leftName} with {getJurisdiction(jurisdictionIds.find((item) => item !== left))?.name}
          </button>
        </div>
      ) : (
        <>
          <section className="panel chart-panel" aria-labelledby="compare-chart-title">
            <div className="section-heading">
              <div><p className="eyebrow">Synthetic illustration · as of {asOf}</p><h2 id="compare-chart-title">{metrics.find((item) => item.value === metric)!.label} by sector</h2></div>
              <Segmented label="Chart metric" value={metric} onChange={(value) => state.set({ metric: value === 'entries' ? null : value })} options={metrics} />
            </div>
            <PairedBarChart
              label={`${unit} by sector, ${leftName} and ${rightName}`} leftName={leftName} rightName={rightName} unit={unit}
              selectedId={selected} onSelect={(id) => state.set({ focus: id === selected ? null : id })}
              data={rows.map((row) => ({ id: row.sector, label: row.sectorName, left: row.values.left[metric], right: row.values.right[metric] }))}
            />
            <p className="helper">Select a sector to highlight its rows in the table below. Same values appear in the table.</p>
          </section>

          <div className="table-scroll comparison stack-on-mobile">
            <table>
              <caption>Synthetic comparison as of {asOf} · {leftName} vs {rightName} · Not actual legal rules</caption>
              <thead><tr><th scope="col">Sector</th><th scope="col">Dimension</th><th scope="col">{leftName}</th><th scope="col">{rightName}</th></tr></thead>
              <tbody>
                {dimensions.map((row) => (
                  <tr key={row.key} className={row.sector === selected ? 'is-highlighted' : undefined}>
                    <th scope="row">{sectors.find((item) => item.id === row.sector)?.name}</th>
                    <td data-label="Dimension">{row.label}</td>
                    <td data-label={leftName}>{row.l}</td>
                    <td data-label={rightName}>{row.r}</td>
                  </tr>
                ))}
                {!dimensions.length && <tr><td colSpan={4}>No differences in the selected sectors on this date.</td></tr>}
              </tbody>
            </table>
          </div>

          {rows.some((row) => row.sharedLabels.length) && (
            <Callout title="Shared label ≠ shared legal status">
              {[...new Set(rows.flatMap((row) => row.sharedLabels))].join(', ')} appears in both fictional workspaces. The records are
              independent and may differ in scope, sector and date; this comparison does not treat them as equivalent.
            </Callout>
          )}
          <div className="button-row">
            <Link className="button secondary" to={`/jurisdictions/${left}`}>Open {leftName} profile</Link>
            <Link className="button secondary" to={`/jurisdictions/${right}`}>Open {rightName} profile</Link>
            <SourceLink id="demo-rulebook" label="Inspect the fictional rule book" />
          </div>
        </>
      )}
      <Callout title="Comparison limits">
        Counts describe this tiny demonstration dataset, not policy coverage. Placeholder units are not percentages or quotas and cannot be added into a real allocation.
      </Callout>
    </>
  );
}
