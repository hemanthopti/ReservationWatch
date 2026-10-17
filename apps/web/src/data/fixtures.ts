/**
 * SYNTHETIC DEMONSTRATION FIXTURES.
 * Every community, list entry, rule, number, study, debate claim, event and
 * source below is invented for the UI prototype. None of it is legal,
 * empirical or official information. "Centre" and "Karnataka" are navigation
 * labels only; nothing here describes their actual rules.
 */
import type {
  Community, Debate, Jurisdiction, JurisdictionId, ListEntry, Observation, Rule,
  Sector, SectorId, Source, Study, TimelineEvent, Topic,
} from './types.ts';

export const DEMO = 'SYNTHETIC DEMONSTRATION ONLY — not official data, legal information or an eligibility assessment';
export const NEVER_VERIFIED = 'Never verified — synthetic fixture';
/** Default "as of" date for effective-dated demo records. */
export const DEFAULT_AS_OF = '2026-06-30';

export const jurisdictions: Jurisdiction[] = [
  {
    id: 'centre', name: 'Centre', code: 'C', listName: 'Demo list C',
    summary: 'A navigation label for a fictional national-level workspace. Records here are invented and do not summarise any actual central rule or list.',
    categories: ['Demo group Amber', 'Demo group Teal'],
  },
  {
    id: 'karnataka', name: 'Karnataka', code: 'K', listName: 'Demo list K',
    summary: 'A navigation label for a fictional state-level workspace. Records here are invented and do not summarise any actual state rule or list.',
    categories: ['Demo group Indigo', 'Demo group Slate', 'Demo group Teal'],
  },
];

export const sectors: Sector[] = [
  { id: 'education', name: 'Education', unit: 'fictional admissions', description: 'Demo admissions to imaginary institutions.' },
  { id: 'employment', name: 'Public employment', unit: 'fictional filled posts', description: 'Demo posts in imaginary public bodies.' },
  { id: 'representation', name: 'Political representation', unit: 'fictional seats', description: 'Demo seats in imaginary elected bodies.' },
];

export const topics: Topic[] = [
  { id: 'rules', name: 'Rules', path: '/rules', mark: '01', description: 'Read scope before drawing conclusions.', detail: 'Jurisdictions, sectors, effective dates & list entries' },
  { id: 'reach', name: 'Reach', path: '/reach', mark: '02', description: 'Put a number in its proper context.', detail: 'Numerators, denominators, years & institutions' },
  { id: 'effects', name: 'Effects', path: '/effects', mark: '03', description: 'Ask what the evidence can establish.', detail: 'Study designs, results panels & limitations' },
  { id: 'debates', name: 'Debates', path: '/debates', mark: '04', description: 'Explore more than one perspective.', detail: 'Normative positions kept apart from empirical claims' },
  { id: 'history', name: 'History', path: '/history', mark: '05', description: 'Follow change through time.', detail: 'A fictional timeline for practising chronology' },
  { id: 'data', name: 'Data & Tools', path: '/data', mark: '06', description: 'Look behind every demonstration.', detail: 'Source registry, metadata & labelled exports' },
];

const fixtureAudit = [
  { date: '2026-10-17', action: 'Fixture created by hand for UI-001 prototype' },
  { date: '2026-10-17', action: 'Marked synthetic; no official extraction or verification performed' },
];

export const sources: Source[] = [
  {
    id: 'demo-register', title: 'Demo source: imaginary list register', kind: 'Register', jurisdictions: ['centre', 'karnataka'],
    scope: 'Fictional list entries for invented identities in two navigation jurisdictions',
    published: '2024-01-10', effective: '2024-04-01', recorded: '2026-10-17', lastVerified: null, status: 'never-verified',
    note: 'Hand-authored fixture that demonstrates independent, effective-dated list entries. No official list, schedule or Gazette exists behind it.',
    audit: fixtureAudit,
  },
  {
    id: 'demo-rulebook', title: 'Demo source: placeholder rule book', kind: 'Register', jurisdictions: ['centre', 'karnataka'],
    scope: 'Fictional rule records with versioned placeholder units',
    published: '2024-02-15', effective: '2021-04-01', recorded: '2026-10-17', lastVerified: null, status: 'never-verified',
    note: 'Placeholder units illustrate how a versioned rule could be displayed. They are not percentages, quotas or real allocations.',
    audit: [...fixtureAudit, { date: '2026-10-17', action: 'Version 2 records added to demonstrate superseded history' }],
  },
  {
    id: 'demo-counts', title: 'Demo source: sample participation workbook', kind: 'Dataset', jurisdictions: ['centre', 'karnataka'],
    scope: 'Deterministic invented counts for four example institutions, 2021–2025',
    published: '2025-07-01', effective: null, recorded: '2026-10-17', lastVerified: null, status: 'never-verified',
    note: 'Generated numbers illustrate numerator and denominator labelling. Not survey, census or administrative data.',
    audit: fixtureAudit,
  },
  {
    id: 'demo-methods', title: 'Demo source: imaginary methods notebook', kind: 'Study', jurisdictions: ['centre', 'karnataka'],
    scope: 'Invented research designs used to practise critical reading',
    published: '2025-08-01', effective: null, recorded: '2026-10-17', lastVerified: null, status: 'never-verified',
    note: 'No real authors, journal, dataset, empirical finding or publication. The designs are teaching examples.',
    audit: fixtureAudit,
  },
  {
    id: 'demo-brief', title: 'Demo source: debate framing brief', kind: 'Brief', jurisdictions: ['centre', 'karnataka'],
    scope: 'Fictional framings of policy-design questions',
    published: '2025-08-20', effective: null, recorded: '2026-10-17', lastVerified: null, status: 'never-verified',
    note: 'Positions are written as neutral illustrations. They do not quote real people, parties or organisations and recommend nothing.',
    audit: fixtureAudit,
  },
  {
    id: 'demo-timeline', title: 'Demo source: fictional change log', kind: 'Timeline', jurisdictions: ['centre', 'karnataka'],
    scope: 'A fictional design exercise, 2019–2025',
    published: '2025-09-01', effective: null, recorded: '2026-10-17', lastVerified: null, status: 'never-verified',
    note: 'Events are invented. This is not a chronology of Indian laws, court judgments, commissions or government orders.',
    audit: fixtureAudit,
  },
];

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

export const communities: Community[] = [
  ...letters.map((letter, index): Community => ({
    id: `example-${letter.toLowerCase()}`,
    name: `Example Community ${letter}`,
    aliases: [
      { label: `Fictional alias ${letter}`, kind: 'Spelling variant' },
      { label: `Sample identity ${index + 1}`, kind: index % 2 ? 'Historical label' : 'Translated label' },
    ],
    description: 'An invented identity used only to demonstrate the explorer. It does not represent any real community.',
    lookalikes: letter === 'D' ? ['example-d-north'] : [],
  })),
  {
    id: 'example-d-north', name: 'Example Community D North',
    aliases: [{ label: 'Fictional alias D-N', kind: 'Spelling variant' }],
    description: 'An invented identity whose name deliberately resembles Example Community D. The two are separate records; a similar name does not establish equivalence.',
    lookalikes: ['example-d'],
  },
];

type EntrySeed = [communityId: string, jurisdictionId: JurisdictionId, category: string, sectors: SectorId[], from: string, to: string | null];

const entrySeeds: EntrySeed[] = [
  ['example-a', 'centre', 'Demo group Amber', ['education', 'employment'], '2021-04-01', null],
  ['example-a', 'karnataka', 'Demo group Indigo', ['education', 'employment', 'representation'], '2022-04-01', null],
  ['example-b', 'centre', 'Demo group Teal', ['education'], '2021-04-01', null],
  ['example-b', 'karnataka', 'Demo group Teal', ['employment'], '2023-04-01', null],
  ['example-c', 'centre', 'Demo group Amber', ['employment', 'representation'], '2022-04-01', null],
  ['example-c', 'karnataka', 'Demo group Slate', ['education'], '2021-04-01', null],
  ['example-d', 'centre', 'Demo group Teal', ['education', 'employment'], '2021-04-01', null],
  ['example-d', 'karnataka', 'Demo group Indigo', ['education'], '2021-04-01', '2024-04-01'],
  ['example-d', 'karnataka', 'Demo group Slate', ['education', 'employment'], '2024-04-01', null],
  ['example-d-north', 'karnataka', 'Demo group Indigo', ['education', 'employment'], '2022-04-01', null],
  ['example-e', 'centre', 'Demo group Amber', ['representation'], '2023-04-01', null],
  ['example-f', 'karnataka', 'Demo group Slate', ['education', 'representation'], '2021-04-01', null],
  ['example-g', 'centre', 'Demo group Teal', ['education', 'employment', 'representation'], '2021-04-01', null],
  ['example-g', 'karnataka', 'Demo group Indigo', ['employment'], '2025-04-01', null],
];

export const entries: ListEntry[] = entrySeeds.map(([communityId, jurisdictionId, category, sectorIds, from, to], index) => ({
  id: `entry-${jurisdictionId === 'centre' ? 'c' : 'k'}-${String(index + 1).padStart(2, '0')}`,
  communityId, jurisdictionId, category, sectors: sectorIds, effectiveFrom: from, effectiveTo: to,
  entryNo: index + 1, sourceId: 'demo-register',
  note: to
    ? 'Superseded demo record kept for history; it is not silently overwritten.'
    : 'Applies only within this mock record. Not evidence of any real listing.',
}));

/** Rules are generated deterministically from jurisdiction × sector × category. */
export const rules: Rule[] = jurisdictions.flatMap((jurisdiction, j) => sectors.flatMap((sector, s): Rule[] => {
  const allocation = jurisdiction.categories.map((category, c): Rule => {
    const base = 6 + ((j * 7 + s * 5 + c * 3) % 11);
    const revised = (j + s + c) % 3 !== 0;
    return {
      id: `rule-${jurisdiction.code.toLowerCase()}-${sector.id}-${c + 1}`,
      jurisdictionId: jurisdiction.id, sectorId: sector.id, kind: 'Demo allocation', category,
      title: `${jurisdiction.code}-${sector.id.slice(0, 3).toUpperCase()}-${c + 1}: placeholder allocation for ${category}`,
      summary: `Illustrates how a rule could attach placeholder units to ${category} in the ${sector.name.toLowerCase()} sector of this fictional workspace.`,
      limits: 'Placeholder units are not percentages, quotas or seats. They cannot be added up into a real allocation and say nothing about eligibility.',
      sourceId: 'demo-rulebook',
      versions: revised
        ? [
          { version: 1, effectiveFrom: '2021-04-01', effectiveTo: '2024-04-01', demoUnits: base, change: 'Initial demo version.' },
          { version: 2, effectiveFrom: '2024-04-01', effectiveTo: null, demoUnits: base + ((c + s) % 2 ? 2 : -1), change: 'Demo revision; earlier version retained as superseded.' },
        ]
        : [{ version: 1, effectiveFrom: '2022-04-01', effectiveTo: null, demoUnits: base, change: 'Initial demo version.' }],
    };
  });
  const procedure: Rule = {
    id: `rule-${jurisdiction.code.toLowerCase()}-${sector.id}-procedure`,
    jurisdictionId: jurisdiction.id, sectorId: sector.id, kind: 'Demo procedure', category: null,
    title: `${jurisdiction.code}-${sector.id.slice(0, 3).toUpperCase()}-P: imaginary document check`,
    summary: 'Illustrates a procedural rule: a fictional step describing how a record would be checked, without allocating anything.',
    limits: 'A procedure in this demo does not describe any real certificate, authority or verification process.',
    sourceId: 'demo-rulebook',
    versions: [{ version: 1, effectiveFrom: '2023-04-01', effectiveTo: null, demoUnits: null, change: 'Initial demo version.' }],
  };
  return [...allocation, procedure];
}));

export const years = [2021, 2022, 2023, 2024, 2025] as const;
export const institutions = ['Example institution A', 'Example institution B', 'Example institution C', 'Example institution D'] as const;

/** Deterministic pseudo-random integer in [0, modulo) for stable fixtures. */
function seeded(...parts: number[]) {
  let hash = 2166136261;
  for (const part of parts) { hash ^= part + 0x9e3779b9; hash = Math.imul(hash, 16777619) >>> 0; }
  return hash;
}

export const observations: Observation[] = jurisdictions.flatMap((jurisdiction, j) => sectors.flatMap((sector, s) => years.flatMap((year, y) => institutions.map((institution, i) => {
  const denominator = 120 + i * 45 + s * 30 + (seeded(j, s, i) % 40);
  const share = 0.14 + ((seeded(j, s, i, 7) % 18) / 100) + y * 0.018 * ((i % 2) ? 1 : 0.5);
  return {
    id: `obs-${jurisdiction.code.toLowerCase()}-${sector.id}-${year}-${i + 1}`,
    jurisdictionId: jurisdiction.id, sectorId: sector.id, year, institution,
    numerator: Math.min(denominator, Math.round(denominator * share)), denominator,
  };
}))));

export const studies: Study[] = [
  {
    id: 'imaginary-access', title: 'Imaginary study: a doorway to learning', topic: 'Access', design: 'Cohort comparison',
    jurisdictionIds: ['centre'], period: '2021–2024 (fictional)', sourceId: 'demo-methods',
    question: 'How might access be measured across two fictional admission cohorts?',
    methods: 'Compares invented entry counts for two cohorts before and after a made-up rule change.',
    results: 'No results exist. A real version would report effect sizes with uncertainty, not a single headline number.',
    limitations: 'Cohort composition, concurrent changes and selection would all prevent a causal reading.',
  },
  {
    id: 'imaginary-pathways', title: 'Imaginary study: pathways after entry', topic: 'Outcomes', design: 'Longitudinal design',
    jurisdictionIds: ['karnataka'], period: '2021–2025 (fictional)', sourceId: 'demo-methods',
    question: 'What would tracking outcomes over several years require?',
    methods: 'Follows an invented cohort through several stages, separating entry from later outcomes.',
    results: 'No participants or findings exist. The panel shows where results would be presented.',
    limitations: 'Attrition, unobserved differences and changing definitions would need investigation.',
  },
  {
    id: 'imaginary-context', title: 'Imaginary study: the role of context', topic: 'Implementation', design: 'Qualitative interviews',
    jurisdictionIds: ['centre', 'karnataka'], period: '2023 (fictional)', sourceId: 'demo-methods',
    question: 'How might institutional processes shape applicants’ experience?',
    methods: 'Organises hypothetical interview themes without claiming their frequency or prevalence.',
    results: 'No interviews occurred. Themes in a real study could not be generalised to a population.',
    limitations: 'Small, purposive samples describe experience, not population-wide effects.',
  },
  {
    id: 'imaginary-denominators', title: 'Imaginary study: counting what counts', topic: 'Measurement', design: 'Administrative data audit',
    jurisdictionIds: ['karnataka'], period: '2022–2024 (fictional)', sourceId: 'demo-methods',
    question: 'How sensitive is a participation share to the choice of denominator?',
    methods: 'Recalculates invented shares using three alternative fictional denominators.',
    results: 'No real data was audited. The design shows why a share is meaningless without its denominator.',
    limitations: 'Administrative records can have missing categories, duplicates and inconsistent definitions.',
  },
  {
    id: 'imaginary-discontinuity', title: 'Imaginary study: near the threshold', topic: 'Outcomes', design: 'Threshold comparison',
    jurisdictionIds: ['centre'], period: '2020–2023 (fictional)', sourceId: 'demo-methods',
    question: 'Could people just above and below a cut-off be compared fairly?',
    methods: 'Sketches a comparison around an invented score threshold.',
    results: 'No estimate exists. A real design would only speak about people near the threshold.',
    limitations: 'Findings near a cut-off cannot be extended to everyone; manipulation of scores must be ruled out.',
  },
  {
    id: 'imaginary-survey', title: 'Imaginary study: what people report', topic: 'Access', design: 'Survey design',
    jurisdictionIds: ['centre', 'karnataka'], period: '2024 (fictional)', sourceId: 'demo-methods',
    question: 'What can a survey tell us about awareness of a rule?',
    methods: 'Drafts questionnaire modules for a fictional sample frame.',
    results: 'No survey was fielded. The panel illustrates how response rates and weights would be disclosed.',
    limitations: 'Self-reports, non-response and sampling frames limit what a survey can establish.',
  },
];

export const debates: Debate[] = [
  {
    id: 'access', title: 'Access and support', sourceId: 'demo-brief', relatedStudyIds: ['imaginary-access', 'imaginary-pathways'],
    question: 'How should an imagined programme balance opening entry with support after entry?',
    context: 'A fictional design question. It is not a summary of any real policy controversy.',
    positions: [
      {
        label: 'Perspective A', framing: 'Prioritise opening entry points.',
        claims: [
          { kind: 'normative', text: 'Where opportunity is constrained, widening entry should come first.' },
          { kind: 'empirical', text: 'Entry changes would be visible in admission counts — this would need comparable data to test.' },
        ],
      },
      {
        label: 'Perspective B', framing: 'Prioritise support after entry.',
        claims: [
          { kind: 'normative', text: 'Entry alone is not sufficient; completion matters as much as admission.' },
          { kind: 'empirical', text: 'Support affects completion rates — this would need longitudinal evidence to test.' },
        ],
      },
    ],
    evidenceNeeded: ['Comparable entry, retention and completion data', 'A credible comparison group', 'Clearly stated denominators'],
    limits: 'No evidence for either position is supplied here. Values and measured effects are different questions.',
  },
  {
    id: 'measurement', title: 'What should be measured?', sourceId: 'demo-brief', relatedStudyIds: ['imaginary-denominators', 'imaginary-survey'],
    question: 'Which indicators would make an imagined programme accountable?',
    context: 'A fictional measurement question used to show how indicator choice shapes debate.',
    positions: [
      {
        label: 'Perspective A', framing: 'Favour simple public indicators.',
        claims: [
          { kind: 'normative', text: 'Accountability is best served by measures the public can easily understand.' },
          { kind: 'empirical', text: 'Simple shares are stable across years — this depends on denominator quality and is testable.' },
        ],
      },
      {
        label: 'Perspective B', framing: 'Favour richer context.',
        claims: [
          { kind: 'normative', text: 'A fair picture needs context, even if measurement becomes more complex.' },
          { kind: 'empirical', text: 'Institution-level differences are large — this would need disaggregated data to test.' },
        ],
      },
    ],
    evidenceNeeded: ['Audits of denominators and missing data', 'Differences across institutions and years', 'Documentation of definitions'],
    limits: 'A single indicator cannot establish fairness or explain why a difference exists.',
  },
  {
    id: 'review', title: 'Review and continuity', sourceId: 'demo-brief', relatedStudyIds: ['imaginary-context'],
    question: 'How often should an imagined rule be reviewed?',
    context: 'A fictional governance question with no reference to any real review body.',
    positions: [
      {
        label: 'Perspective A', framing: 'Review regularly.',
        claims: [
          { kind: 'normative', text: 'Rules should be revisited as circumstances change.' },
          { kind: 'empirical', text: 'Circumstances change measurably over a review cycle — this needs time-series data to test.' },
        ],
      },
      {
        label: 'Perspective B', framing: 'Value predictability.',
        claims: [
          { kind: 'normative', text: 'Stable rules let people plan; frequent change has costs.' },
          { kind: 'empirical', text: 'Frequent changes cause confusion — this would need implementation evidence to test.' },
        ],
      },
    ],
    evidenceNeeded: ['Implementation histories', 'Time series of outcomes', 'Experiences of people affected by changes'],
    limits: 'Review frequency is a value-sensitive design choice; this exercise recommends nothing.',
  },
  {
    id: 'scope', title: 'Comparing across places', sourceId: 'demo-brief', relatedStudyIds: ['imaginary-discontinuity'],
    question: 'When is it reasonable to compare records from two jurisdictions?',
    context: 'A fictional methodology question about comparison, not about any real jurisdictions.',
    positions: [
      {
        label: 'Perspective A', framing: 'Compare to learn.',
        claims: [
          { kind: 'normative', text: 'Side-by-side comparison helps the public ask better questions.' },
          { kind: 'empirical', text: 'Comparable definitions exist across places — this must be checked record by record.' },
        ],
      },
      {
        label: 'Perspective B', framing: 'Compare with caution.',
        claims: [
          { kind: 'normative', text: 'Comparisons can mislead when the same label means different things.' },
          { kind: 'empirical', text: 'Similar labels differ in scope — this is checkable against each source.' },
        ],
      },
    ],
    evidenceNeeded: ['Source text for each jurisdiction', 'Effective dates for each record', 'Explicit scope statements'],
    limits: 'A shared label never establishes legal equivalence. Each record must be read in its own source.',
  },
];

export const events: TimelineEvent[] = [
  { id: 'start', year: 2019, month: 3, subject: 'Design', jurisdictionIds: ['centre', 'karnataka'], title: 'Fictional exercise begins', summary: 'An imaginary working group sketches a sample programme.', detail: 'This is a design exercise used to demonstrate the timeline, not a historical event.', sourceId: 'demo-timeline' },
  { id: 'scope', year: 2020, month: 7, subject: 'Design', jurisdictionIds: ['centre'], title: 'Demo scope separated by sector', summary: 'Sector and jurisdiction become separate fields.', detail: 'The fictional exercise separates sector and jurisdiction to show why context should stay attached to records.', sourceId: 'demo-timeline' },
  { id: 'list-v1', year: 2021, month: 4, subject: 'Data', jurisdictionIds: ['centre', 'karnataka'], title: 'First demo list entries recorded', summary: 'Invented list entries gain effective dates.', detail: 'Demo list entries receive effective-from dates so that later revisions can be shown without overwriting history.', sourceId: 'demo-register' },
  { id: 'counts', year: 2021, month: 9, subject: 'Measurement', jurisdictionIds: ['centre', 'karnataka'], title: 'Invented counts introduced', summary: 'Synthetic numerators and denominators are added.', detail: 'Synthetic numerators and denominators are added to a mock workbook. No real data collection took place.', sourceId: 'demo-counts' },
  { id: 'karnataka-list', year: 2022, month: 4, subject: 'Data', jurisdictionIds: ['karnataka'], title: 'Second fictional list expanded', summary: 'More invented identities appear in Demo list K.', detail: 'Additional invented entries are added to the fictional Karnataka workspace to demonstrate independent records.', sourceId: 'demo-register' },
  { id: 'denominators', year: 2023, month: 2, subject: 'Measurement', jurisdictionIds: ['karnataka'], title: 'Denominator labels made explicit', summary: 'Every demo share shows what it is divided by.', detail: 'The mock workbook adds a label for every denominator, illustrating why shares need context.', sourceId: 'demo-counts' },
  { id: 'review', year: 2023, month: 11, subject: 'Review', jurisdictionIds: ['centre'], title: 'Imaginary review checkpoint', summary: 'A fictional review asks how the design could be evaluated.', detail: 'No commission, committee or court is represented. The checkpoint exists only to populate the demo.', sourceId: 'demo-timeline' },
  { id: 'revision', year: 2024, month: 4, subject: 'Data', jurisdictionIds: ['centre', 'karnataka'], title: 'Demo rules revised to version 2', summary: 'Earlier versions are kept as superseded.', detail: 'Placeholder units change for some fictional rules. Version 1 records remain visible as superseded history.', sourceId: 'demo-rulebook' },
  { id: 'labels', year: 2025, month: 1, subject: 'Review', jurisdictionIds: ['centre', 'karnataka'], title: 'Verification labels added', summary: 'Every record shows its verification status.', detail: 'The mock change log adds explicit “never verified” labels. It has no legal effect.', sourceId: 'demo-timeline' },
  { id: 'late-entry', year: 2025, month: 4, subject: 'Data', jurisdictionIds: ['karnataka'], title: 'Late fictional entry recorded', summary: 'One invented identity gains a new demo record.', detail: 'Shows that a record can begin later than others. It says nothing about any real community.', sourceId: 'demo-register' },
];
