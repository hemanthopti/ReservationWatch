import { BarChart, TrendChart } from '../components/charts';
import { Callout, FilterBar, Metric, PageHeader, ResultCount, SelectField, SourceLink } from '../components/ui';
import { filterObservations, formatShare, getJurisdiction, jurisdictionIds, pick, sectorIds, summarize, trend } from '../data/explore';
import { institutions, jurisdictions, sectors, years } from '../data/fixtures';
import { useQueryState } from '../hooks/useQueryState';

const keys = ['jurisdiction', 'sector', 'year', 'institution', 'selected', 'trendYear'];
const latest = years[years.length - 1];

export function Reach() {
  const state = useQueryState();
  const jurisdiction = pick(state.get('jurisdiction'), jurisdictionIds, 'centre');
  const sector = pick(state.get('sector'), sectorIds, 'education');
  const yearValue = Number(state.get('year'));
  const year = (years as readonly number[]).includes(yearValue) ? yearValue : latest;
  const institution = (institutions as readonly string[]).includes(state.get('institution')) ? state.get('institution') : '';
  const sectorInfo = sectors.find((item) => item.id === sector)!;
  const scope = `${year} · ${getJurisdiction(jurisdiction)?.name} · ${sectorInfo.name}`;

  const rows = filterObservations({ jurisdiction, sector, year, institution });
  const total = summarize(rows);
  const active = rows.find((row) => row.id === state.get('selected')) ?? rows[0];
  const series = trend(jurisdiction, sector, institution);
  const trendYear = Number(state.get('trendYear')) || year;
  const trendPoint = series.find((point) => point.year === trendYear);

  return (
    <>
      <PageHeader eyebrow="02 · Reach" title="A number is only the beginning">
        Explore invented participation counts for example institutions. These are synthetic illustrations with labelled numerators
        and denominators — not published statistics, quotas or estimates of representation.
      </PageHeader>
      <FilterBar onReset={() => state.reset(keys)} active={state.countActive(['jurisdiction', 'sector', 'year', 'institution'])} label="Reach filters">
        <SelectField label="Jurisdiction" value={jurisdiction} onChange={(value) => state.set({ jurisdiction: value, selected: null })}
          options={jurisdictions.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Sector" value={sector} onChange={(value) => state.set({ sector: value, selected: null })}
          options={sectors.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectField label="Year" value={String(year)} onChange={(value) => state.set({ year: value, selected: null, trendYear: null })} options={years.map(String)} />
        <SelectField label="Institution" value={institution} all="All example institutions" onChange={(value) => state.set({ institution: value, selected: null })} options={institutions} />
      </FilterBar>
      <ResultCount>{rows.length} synthetic observation{rows.length === 1 ? '' : 's'} · {scope}</ResultCount>

      <section className="metric-grid" aria-label="Summary for the selected scope">
        <Metric label="Numerator · synthetic" value={total.numerator.toLocaleString('en-IN')} note={`Demo-category ${sectorInfo.unit}`} />
        <Metric label="Denominator · synthetic" value={total.denominator.toLocaleString('en-IN')} note={`All ${sectorInfo.unit} observed`} />
        <Metric label="Demo share" value={formatShare(total.share)} note="Numerator ÷ denominator, fictional" />
        <Metric label="Scope" value={year} note={`${getJurisdiction(jurisdiction)?.name} · ${sectorInfo.name}`} />
      </section>

      <div className="chart-layout">
        <section className="panel chart-panel" aria-labelledby="bars-title">
          <p className="eyebrow">Synthetic illustration · {scope}</p>
          <h2 id="bars-title">Demo share within each example institution</h2>
          <p className="helper">Select a bar to inspect its numerator and denominator. Bar length is the fraction of that institution’s fictional denominator.</p>
          <BarChart
            label={`Demo share by institution, ${scope}`} selectedId={active?.id}
            onSelect={(id) => state.set({ selected: id })}
            data={rows.map((row) => ({
              id: row.id, label: row.institution, value: row.numerator / row.denominator,
              valueLabel: formatShare(row.numerator / row.denominator), detail: `${row.numerator} of ${row.denominator}`,
            }))}
          />
        </section>
        <aside className="panel detail-panel" aria-labelledby="detail-title" aria-live="polite">
          <p className="eyebrow">Selected observation</p>
          <h2 id="detail-title">{active?.institution ?? 'No observation'}</h2>
          {active && (
            <>
              <p className="big-fraction">{active.numerator} <span>/ {active.denominator}</span></p>
              <dl className="metadata metadata-compact">
                <div><dt>Numerator</dt><dd>{active.numerator} demo-category {sectorInfo.unit}</dd></div>
                <div><dt>Denominator</dt><dd>{active.denominator} {sectorInfo.unit} in total</dd></div>
                <div><dt>Year · scope</dt><dd>{active.year} · {getJurisdiction(active.jurisdictionId)?.name} · {sectorInfo.name}</dd></div>
                <div><dt>Record</dt><dd>{active.id}</dd></div>
              </dl>
            </>
          )}
          <SourceLink id="demo-counts" />
        </aside>
      </div>

      <section className="panel chart-panel section" aria-labelledby="trend-title">
        <p className="eyebrow">Synthetic illustration · {years[0]}–{latest}</p>
        <h2 id="trend-title">Demo share over time · {institution || 'all example institutions combined'}</h2>
        <p className="helper">Hover, focus or select a point. Pooled shares combine numerators and denominators before dividing.</p>
        <TrendChart
          label={`Demo share by year, ${getJurisdiction(jurisdiction)?.name}, ${sectorInfo.name}`}
          selectedX={trendYear} onSelect={(x) => state.set({ trendYear: x })}
          points={series.map((point) => ({ x: point.year, y: point.share ?? 0, label: formatShare(point.share), detail: `${point.numerator} of ${point.denominator}` }))}
        />
        {trendPoint && <p className="trend-readout" aria-live="polite"><strong>{trendPoint.year}:</strong> {formatShare(trendPoint.share)} · {trendPoint.numerator} of {trendPoint.denominator} {sectorInfo.unit} (synthetic)</p>}
      </section>

      <details className="disclosure section" open>
        <summary>Accessible data table · same synthetic values</summary>
        <div className="table-scroll stack-on-mobile">
          <table>
            <caption>Fictional observations · {scope}</caption>
            <thead><tr><th scope="col">Institution</th><th scope="col">Numerator: demo-category {sectorInfo.unit}</th><th scope="col">Denominator: all {sectorInfo.unit}</th><th scope="col">Demo share</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}><th scope="row">{row.institution}</th><td data-label="Numerator">{row.numerator}</td><td data-label="Denominator">{row.denominator}</td><td data-label="Demo share">{formatShare(row.numerator / row.denominator)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <details className="disclosure">
        <summary>Trend table · same synthetic values</summary>
        <div className="table-scroll stack-on-mobile">
          <table>
            <caption>Fictional yearly totals · {getJurisdiction(jurisdiction)?.name} · {sectorInfo.name} · {institution || 'all example institutions'}</caption>
            <thead><tr><th scope="col">Year</th><th scope="col">Numerator</th><th scope="col">Denominator</th><th scope="col">Demo share</th></tr></thead>
            <tbody>{series.map((point) => <tr key={point.year}><th scope="row">{point.year}</th><td data-label="Numerator">{point.numerator}</td><td data-label="Denominator">{point.denominator}</td><td data-label="Demo share">{formatShare(point.share)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
      <Callout title="Reading limit">
        Invented counts cannot establish actual reach, fairness or causal effects. Each percentage is a fraction of a fictional
        denominator — never an official reservation quota.
      </Callout>
    </>
  );
}
