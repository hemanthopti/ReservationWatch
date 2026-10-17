import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compareJurisdictions, entriesFor, exportDatasets, exportRecords, filterEvents, filterObservations, filterStudies,
  findCommunities, isEffective, matches, pick, ruleVersionAsOf, rulesFor, searchAll, summarize, trend,
} from './explore.ts';
import { communities, DEMO, entries, observations, rules, sources, studies, events, debates } from './fixtures.ts';

test('search is literal: case/whitespace-insensitive, every token required, no fuzzy equivalence', () => {
  assert.ok(matches('  EXAMPLE  a ', 'Example Community A'));
  assert.equal(matches('Example missing', 'Example Community A'), false);
  assert.equal(matches('communty', 'Community'), false);
  assert.equal(matches('a', 'Example Community'), false, 'single letters do not match inside words');
  assert.ok(matches('d-n', 'Fictional alias D-N'));
  assert.deepEqual(searchAll('nonexistent-record'), []);
  assert.equal(searchAll('Fictional alias F')[0]?.path, '/communities/example-f');
  assert.equal(searchAll('imaginary list register')[0]?.path, '/data/demo-register');
});

test('global search ranks title prefixes first and filters by kind', () => {
  assert.equal(searchAll('Karnataka')[0]?.path, '/jurisdictions/karnataka');
  const both = searchAll('Example Community D').map((item) => item.title);
  assert.deepEqual(both.slice(0, 2), ['Example Community D', 'Example Community D North']);
  assert.ok(searchAll('', 'Study').every((item) => item.kind === 'Study'));
  assert.equal(searchAll('', 'Study').length, studies.length);
  assert.equal(searchAll('threshold')[0]?.kind, 'Study');
});

test('community filters must hold for the same independent list entry', () => {
  // Example Community A: Centre entry covers education/employment only.
  assert.deepEqual(findCommunities({ query: 'Example Community A', jurisdiction: 'centre', sector: 'representation' }), []);
  assert.equal(findCommunities({ query: 'Example Community A', jurisdiction: 'karnataka', sector: 'representation' }).length, 1);
  // Example Community B uses the same label in both places, for different sectors.
  assert.deepEqual(findCommunities({ query: 'Example Community B', jurisdiction: 'centre', category: 'Demo group Teal', sector: 'employment' }), []);
  assert.equal(findCommunities({ jurisdiction: 'centre' }).length, 6);
  assert.equal(findCommunities({ sort: 'desc' })[0]?.name, 'Example Community G');
  assert.equal(findCommunities({ sort: 'entries' })[0]?.name, 'Example Community D');
  assert.equal(findCommunities().length, communities.length);
});

test('effective dates use inclusive start and exclusive end', () => {
  const record = { effectiveFrom: '2021-04-01', effectiveTo: '2024-04-01' };
  assert.ok(isEffective(record, '2021-04-01'));
  assert.ok(isEffective(record, '2024-03-31'));
  assert.equal(isEffective(record, '2024-04-01'), false);
  assert.equal(isEffective(record, '2021-03-31'), false);
  const superseded = entries.filter((entry) => entry.communityId === 'example-d' && entry.jurisdictionId === 'karnataka');
  assert.deepEqual(superseded.filter((entry) => isEffective(entry, '2023-01-01')).map((entry) => entry.category), ['Demo group Indigo']);
  assert.deepEqual(superseded.filter((entry) => isEffective(entry, '2025-01-01')).map((entry) => entry.category), ['Demo group Slate']);
});

test('rule versions resolve by date and never overlap', () => {
  for (const rule of rules) {
    for (let i = 1; i < rule.versions.length; i++) assert.equal(rule.versions[i - 1]!.effectiveTo, rule.versions[i]!.effectiveFrom);
  }
  const revised = rules.find((rule) => rule.versions.length === 2)!;
  assert.equal(ruleVersionAsOf(revised, '2022-01-01')?.version, 1);
  assert.equal(ruleVersionAsOf(revised, '2026-01-01')?.version, 2);
  assert.equal(ruleVersionAsOf(revised, '2020-01-01'), undefined);
  assert.equal(rulesFor('centre', 'education').length, 3);
  assert.equal(rulesFor('karnataka', 'education').length, 4);
  assert.ok(rules.filter((rule) => rule.kind === 'Demo procedure').every((rule) => rule.versions.every((version) => version.demoUnits === null)));
});

test('comparison refuses identical jurisdictions and reports shared labels without equivalence', () => {
  assert.deepEqual(compareJurisdictions('centre', 'centre', ['education'], '2026-06-30'), []);
  const [row] = compareJurisdictions('centre', 'karnataka', ['education'], '2026-06-30');
  assert.equal(row?.values.left.entries, entriesFor('centre', 'education', '2026-06-30').length);
  assert.ok(row?.sharedLabels.every((label) => row.values.left.categories.includes(label) && row.values.right.categories.includes(label)));
  const early = compareJurisdictions('centre', 'karnataka', ['education'], '2021-06-30')[0]!;
  assert.ok(early.values.left.rules < row!.values.left.rules, 'later-starting rules are excluded before their effective date');
});

test('observations aggregate numerators and denominators per scope', () => {
  assert.equal(new Set(observations.map((row) => row.id)).size, observations.length);
  for (const row of observations) assert.ok(row.numerator >= 0 && row.denominator > 0 && row.numerator <= row.denominator);
  const rows = filterObservations({ jurisdiction: 'centre', sector: 'education', year: 2025 });
  assert.equal(rows.length, 4);
  const total = summarize(rows);
  assert.equal(total.numerator, rows.reduce((sum, row) => sum + row.numerator, 0));
  assert.equal(summarize([]).share, null);
  assert.deepEqual(trend('centre', 'education').map((point) => point.year), [2021, 2022, 2023, 2024, 2025]);
  assert.equal(trend('centre', 'education', 'Example institution B')[4]?.numerator, filterObservations({ jurisdiction: 'centre', sector: 'education', year: 2025, institution: 'Example institution B' })[0]?.numerator);
  assert.notEqual(filterObservations({ jurisdiction: 'karnataka', sector: 'education', year: 2025 })[0]?.numerator, rows[0]?.numerator);
});

test('study and timeline filters combine conditions and sort predictably', () => {
  assert.deepEqual(filterStudies({ topic: 'Outcomes' }).map((study) => study.id).sort(), ['imaginary-discontinuity', 'imaginary-pathways']);
  assert.equal(filterStudies({ topic: 'Outcomes', jurisdiction: 'karnataka' }).length, 1);
  assert.equal(filterStudies({ query: 'nonexistent' }).length, 0);
  assert.equal(filterStudies({ sort: 'topic' })[0]?.topic, 'Access');
  const filtered = filterEvents({ subject: 'Review', from: 2024, to: 2025 });
  assert.deepEqual(filtered.map((event) => event.id), ['labels']);
  assert.equal(filterEvents().length, events.length);
  assert.ok(filterEvents().every((event, index, list) => index === 0 || list[index - 1]!.year <= event.year));
});

test('exports label every record and escape CSV safely', () => {
  const json = JSON.parse(exportRecords(exportDatasets.sources.rows().slice(0, 1), 'json'));
  assert.equal(json.disclaimer, DEMO);
  assert.equal(json.records.length, 1);
  assert.equal(json.records[0].disclaimer, DEMO);
  const csv = exportRecords([{ id: 'x', title: 'Demo "quoted", title', note: null }], 'csv');
  assert.match(csv, /"Demo ""quoted"", title"/);
  assert.equal(csv.split('\r\n')[0], '"disclaimer","id","title","note"');
  assert.equal(JSON.parse(exportRecords([], 'json')).records.length, 0);
  assert.equal(exportDatasets.rules.rows().length, rules.reduce((sum, rule) => sum + rule.versions.length, 0));
});

test('fixture invariants: references resolve, ids are unique and nothing claims verification', () => {
  for (const collection of [entries, rules, studies, debates, events, sources, communities]) {
    assert.equal(new Set(collection.map((item) => item.id)).size, collection.length);
  }
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const item of [...entries, ...rules, ...studies, ...debates, ...events]) assert.ok(sourceIds.has(item.sourceId), item.id);
  for (const entry of entries) assert.ok(communities.some((community) => community.id === entry.communityId));
  for (const source of sources) { assert.equal(source.lastVerified, null); assert.match(source.title, /^Demo source:/); }
  for (const study of studies) assert.match(study.title, /^Imaginary study:/);
  for (const community of communities) assert.match(community.name, /^Example Community /);
  assert.equal(pick('karnataka', ['centre', 'karnataka'], 'centre'), 'karnataka');
  assert.equal(pick('<script>', ['centre', 'karnataka'], 'centre'), 'centre');
});
