/** Pure query helpers over the synthetic fixtures. No network or storage access. */
import {
  communities, debates, DEMO, entries, events, jurisdictions, observations, rules, sectors, sources, studies, topics,
} from './fixtures.ts';
import type {
  Community, JurisdictionId, ListEntry, Observation, Rule, RuleVersion, SectorId, Study, TimelineEvent,
} from './types.ts';

/**
 * Case-insensitive literal match: every query token must start a word in the
 * values (single characters must equal a word). No fuzzy, phonetic or alias-based equivalence is inferred.
 */
export function matches(query: string, ...values: string[]) {
  const words = tokens(values.join(' '));
  // Single characters (e.g. the letter in "Example Community A") must match a whole word.
  return tokens(query).every((term) => words.some((word) => (term.length === 1 ? word === term : word.startsWith(term))));
}

function tokens(text: string) {
  return text.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

export const getJurisdiction = (id: string | undefined) => jurisdictions.find((item) => item.id === id);
export const getSector = (id: string | undefined) => sectors.find((item) => item.id === id);
export const getCommunity = (id: string | undefined) => communities.find((item) => item.id === id);
export const getSource = (id: string | undefined) => sources.find((item) => item.id === id);
export const getStudy = (id: string | undefined) => studies.find((item) => item.id === id);

/** Returns a known id from a URL value, otherwise the fallback. */
export function pick<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export const jurisdictionIds = jurisdictions.map((item) => item.id);
export const sectorIds = sectors.map((item) => item.id);

/** Effective-dated check with an inclusive start and exclusive end (ISO date strings). */
export function isEffective(record: { effectiveFrom: string; effectiveTo: string | null }, asOf: string) {
  return record.effectiveFrom <= asOf && (record.effectiveTo === null || asOf < record.effectiveTo);
}

export function ruleVersionAsOf(rule: Rule, asOf: string): RuleVersion | undefined {
  return rule.versions.find((version) => isEffective(version, asOf));
}

export function rulesFor(jurisdictionId: JurisdictionId, sectorId: SectorId) {
  return rules.filter((rule) => rule.jurisdictionId === jurisdictionId && rule.sectorId === sectorId);
}

export function entriesFor(jurisdictionId: JurisdictionId, sectorId?: SectorId, asOf?: string) {
  return entries.filter((entry) => entry.jurisdictionId === jurisdictionId
    && (!sectorId || entry.sectors.includes(sectorId))
    && (!asOf || isEffective(entry, asOf)));
}

export interface CommunityFilters {
  query?: string;
  jurisdiction?: string;
  sector?: string;
  category?: string;
  sort?: string;
}

/** Jurisdiction, sector and category must all hold for the same independent list entry. */
export function findCommunities({ query = '', jurisdiction = '', sector = '', category = '', sort = 'asc' }: CommunityFilters = {}) {
  const matching = (entry: ListEntry) => (!jurisdiction || entry.jurisdictionId === jurisdiction)
    && (!sector || entry.sectors.includes(sector as SectorId))
    && (!category || entry.category === category);
  const filtered = communities.filter((community) => matches(query, community.name, ...community.aliases.map((alias) => alias.label))
    && entries.some((entry) => entry.communityId === community.id && matching(entry)));
  const entryCount = (community: Community) => entries.filter((entry) => entry.communityId === community.id).length;
  return filtered.sort((a, b) => sort === 'entries'
    ? entryCount(b) - entryCount(a) || a.name.localeCompare(b.name)
    : (sort === 'desc' ? -1 : 1) * a.name.localeCompare(b.name));
}

export const allCategories = [...new Set(jurisdictions.flatMap((item) => item.categories))].sort();

export type SearchKind = 'Community' | 'Jurisdiction' | 'Topic' | 'Study' | 'Debate' | 'Event' | 'Source';
export const searchKinds: SearchKind[] = ['Community', 'Jurisdiction', 'Topic', 'Study', 'Debate', 'Event', 'Source'];

export interface SearchResult {
  kind: SearchKind;
  title: string;
  description: string;
  path: string;
  keywords: string;
}

const searchIndex: SearchResult[] = [
  ...communities.map((item) => ({ kind: 'Community' as const, title: item.name, description: `Aliases: ${item.aliases.map((alias) => alias.label).join(', ')}`, path: `/communities/${item.id}`, keywords: item.aliases.map((alias) => alias.label).join(' ') })),
  ...jurisdictions.map((item) => ({ kind: 'Jurisdiction' as const, title: item.name, description: 'Jurisdiction profile · navigation label with fictional records', path: `/jurisdictions/${item.id}`, keywords: `${item.listName} ${item.categories.join(' ')} rules jurisdiction` })),
  ...topics.map((item) => ({ kind: 'Topic' as const, title: item.name, description: item.description, path: item.path, keywords: item.detail })),
  ...studies.map((item) => ({ kind: 'Study' as const, title: item.title, description: item.question, path: `/effects?study=${item.id}`, keywords: `${item.topic} ${item.design}` })),
  ...debates.map((item) => ({ kind: 'Debate' as const, title: item.title, description: item.question, path: `/debates?issue=${item.id}`, keywords: item.context })),
  ...events.map((item) => ({ kind: 'Event' as const, title: item.title, description: `${item.year} · ${item.summary}`, path: `/history?event=${item.id}`, keywords: `${item.subject} ${item.year}` })),
  ...sources.map((item) => ({ kind: 'Source' as const, title: item.title, description: item.scope, path: `/data/${item.id}`, keywords: item.kind })),
];

/** Literal search ranked by where the match occurs: title prefix, title, then other fields. */
export function searchAll(query: string, kind = ''): SearchResult[] {
  const phrase = tokens(query).join(' ');
  const score = (item: SearchResult) => {
    if (!phrase) return 0;
    const title = tokens(item.title).join(' ');
    if (title === phrase) return 5;
    if (title.startsWith(phrase)) return 4;
    if (` ${title} `.includes(` ${phrase} `)) return 3;
    if (` ${tokens(`${item.description} ${item.keywords}`).join(' ')} `.includes(` ${phrase} `)) return 2;
    return matches(query, item.title) ? 1 : 0;
  };
  return searchIndex
    .filter((item) => (!kind || item.kind === kind) && matches(query, item.title, item.description, item.keywords))
    .map((item, index) => ({ item, index, score: score(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}

export interface ObservationFilters {
  jurisdiction: JurisdictionId;
  sector: SectorId;
  year?: number;
  institution?: string;
}

export function filterObservations({ jurisdiction, sector, year, institution }: ObservationFilters): Observation[] {
  return observations.filter((row) => row.jurisdictionId === jurisdiction && row.sectorId === sector
    && (year === undefined || row.year === year) && (!institution || row.institution === institution));
}

export function summarize(rows: Pick<Observation, 'numerator' | 'denominator'>[]) {
  const numerator = rows.reduce((total, row) => total + row.numerator, 0);
  const denominator = rows.reduce((total, row) => total + row.denominator, 0);
  return { numerator, denominator, share: denominator ? numerator / denominator : null };
}

export function formatShare(share: number | null) {
  return share === null ? '—' : `${(share * 100).toFixed(1)}%`;
}

/** Year-by-year aggregate for the trend chart. */
export function trend(jurisdiction: JurisdictionId, sector: SectorId, institution = '') {
  const rows = filterObservations({ jurisdiction, sector, institution });
  const years = [...new Set(rows.map((row) => row.year))].sort();
  return years.map((year) => ({ year, ...summarize(rows.filter((row) => row.year === year)) }));
}

export type CompareMetric = 'entries' | 'rules' | 'units';

export interface ComparisonRow {
  sector: SectorId;
  sectorName: string;
  values: Record<'left' | 'right', { entries: number; rules: number; units: number; categories: string[] }>;
  sharedLabels: string[];
}

/** Side-by-side counts for two different jurisdictions as of one date. */
export function compareJurisdictions(left: JurisdictionId, right: JurisdictionId, sectorList: SectorId[], asOf: string): ComparisonRow[] {
  if (left === right) return [];
  const side = (jurisdiction: JurisdictionId, sector: SectorId) => {
    const applicable = rulesFor(jurisdiction, sector).filter((rule) => ruleVersionAsOf(rule, asOf));
    return {
      entries: entriesFor(jurisdiction, sector, asOf).length,
      rules: applicable.length,
      units: applicable.reduce((total, rule) => total + (ruleVersionAsOf(rule, asOf)?.demoUnits ?? 0), 0),
      categories: [...new Set(entriesFor(jurisdiction, sector, asOf).map((entry) => entry.category))].sort(),
    };
  };
  return sectorList.map((sector) => {
    const values = { left: side(left, sector), right: side(right, sector) };
    return {
      sector, sectorName: getSector(sector)?.name ?? sector, values,
      sharedLabels: values.left.categories.filter((label) => values.right.categories.includes(label)),
    };
  });
}

export interface StudyFilters { query?: string; topic?: string; design?: string; jurisdiction?: string; sort?: string }

export function filterStudies({ query = '', topic = '', design = '', jurisdiction = '', sort = 'title' }: StudyFilters = {}): Study[] {
  return studies
    .filter((study) => matches(query, study.title, study.question, study.design, study.methods)
      && (!topic || study.topic === topic) && (!design || study.design === design)
      && (!jurisdiction || study.jurisdictionIds.includes(jurisdiction as JurisdictionId)))
    .sort((a, b) => sort === 'topic' ? a.topic.localeCompare(b.topic) || a.title.localeCompare(b.title) : a.title.localeCompare(b.title));
}

export interface EventFilters { subject?: string; jurisdiction?: string; from?: number; to?: number; query?: string }

export function filterEvents({ subject = '', jurisdiction = '', from, to, query = '' }: EventFilters = {}): TimelineEvent[] {
  return events
    .filter((event) => (!subject || event.subject === subject)
      && (!jurisdiction || event.jurisdictionIds.includes(jurisdiction as JurisdictionId))
      && (from === undefined || event.year >= from) && (to === undefined || event.year <= to)
      && matches(query, event.title, event.summary, event.detail))
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

export function sourceUsage(sourceId: string) {
  return {
    entries: entries.filter((item) => item.sourceId === sourceId).length,
    rules: rules.filter((item) => item.sourceId === sourceId).length,
    studies: studies.filter((item) => item.sourceId === sourceId).length,
    debates: debates.filter((item) => item.sourceId === sourceId).length,
    events: events.filter((item) => item.sourceId === sourceId).length,
    observations: sourceId === 'demo-counts' ? observations.length : 0,
  };
}

type Cell = string | number | boolean | null;
export type ExportRow = Record<string, Cell>;

export const exportDatasets = {
  sources: { label: 'Source registry', rows: (): ExportRow[] => sources.map(({ audit, jurisdictions: scope, ...rest }) => ({ ...rest, jurisdictions: scope.join(' | '), audit_events: audit.length })) },
  entries: { label: 'List entries', rows: (): ExportRow[] => entries.map(({ sectors: list, ...rest }) => ({ ...rest, community: getCommunity(rest.communityId)?.name ?? '', sectors: list.join(' | ') })) },
  rules: { label: 'Rule versions', rows: (): ExportRow[] => rules.flatMap(({ versions, ...rule }) => versions.map((version) => ({ id: rule.id, jurisdictionId: rule.jurisdictionId, sectorId: rule.sectorId, title: rule.title, kind: rule.kind, category: rule.category, sourceId: rule.sourceId, ...version }))) },
  observations: { label: 'Reach observations', rows: (): ExportRow[] => observations.map((row) => ({ ...row })) },
} as const;
export type DatasetId = keyof typeof exportDatasets;

/** Serialises rows with the disclaimer at file level and on every record. */
export function exportRecords(rows: ExportRow[], format: 'csv' | 'json') {
  const labelled: ExportRow[] = rows.map((row) => ({ disclaimer: DEMO, ...row }));
  if (format === 'json') return JSON.stringify({ disclaimer: DEMO, generated: 'ReservationWatch UI prototype', records: labelled }, null, 2);
  const keys = [...new Set(['disclaimer', ...labelled.flatMap((row) => Object.keys(row))])];
  const cell = (value: Cell | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [keys.map(cell).join(','),...labelled.map((row) => keys.map((key) => cell(row[key])).join(','))].join('\r\n');
}
