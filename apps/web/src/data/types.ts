/**
 * Types for the synthetic demonstration dataset.
 * Community identity, jurisdiction-specific list entries and effective-dated
 * rules are deliberately separate records (see AGENTS.md rule 3).
 */

export type JurisdictionId = 'centre' | 'karnataka';
export type SectorId = 'education' | 'employment' | 'representation';

export interface Jurisdiction {
  id: JurisdictionId;
  name: string;
  /** Short code used in fictional record identifiers. */
  code: string;
  summary: string;
  /** Fictional list name; not a real schedule or government list. */
  listName: string;
  categories: string[];
}

export interface Sector {
  id: SectorId;
  name: string;
  /** What a synthetic Reach observation counts in this sector. */
  unit: string;
  description: string;
}

export interface Topic {
  id: string;
  name: string;
  path: string;
  mark: string;
  description: string;
  detail: string;
}

export type VerificationStatus = 'never-verified';

export interface AuditEvent {
  date: string;
  action: string;
}

export interface Source {
  id: string;
  title: string;
  kind: 'Register' | 'Dataset' | 'Study' | 'Timeline' | 'Brief';
  jurisdictions: JurisdictionId[];
  scope: string;
  published: string;
  effective: string | null;
  recorded: string;
  lastVerified: string | null;
  status: VerificationStatus;
  note: string;
  audit: AuditEvent[];
}

export interface Alias {
  label: string;
  kind: 'Spelling variant' | 'Translated label' | 'Historical label';
}

export interface Community {
  id: string;
  name: string;
  aliases: Alias[];
  description: string;
  /** Ids of fixtures with deliberately similar names that are NOT equivalent. */
  lookalikes: string[];
}

export interface ListEntry {
  id: string;
  communityId: string;
  jurisdictionId: JurisdictionId;
  category: string;
  entryNo: number;
  sectors: SectorId[];
  effectiveFrom: string;
  /** Exclusive end date; null while the demo record is current. */
  effectiveTo: string | null;
  sourceId: string;
  note: string;
}

export interface RuleVersion {
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  /** Placeholder units — deliberately not a percentage or a quota. */
  demoUnits: number | null;
  change: string;
}

export interface Rule {
  id: string;
  jurisdictionId: JurisdictionId;
  sectorId: SectorId;
  title: string;
  kind: 'Demo allocation' | 'Demo procedure';
  category: string | null;
  summary: string;
  limits: string;
  sourceId: string;
  versions: RuleVersion[];
}

export interface Observation {
  id: string;
  jurisdictionId: JurisdictionId;
  sectorId: SectorId;
  year: number;
  institution: string;
  numerator: number;
  denominator: number;
}

export interface Study {
  id: string;
  title: string;
  topic: 'Access' | 'Outcomes' | 'Implementation' | 'Measurement';
  design: string;
  jurisdictionIds: JurisdictionId[];
  period: string;
  question: string;
  methods: string;
  results: string;
  limitations: string;
  sourceId: string;
}

export type ClaimKind = 'normative' | 'empirical';

export interface DebateClaim {
  kind: ClaimKind;
  text: string;
}

export interface DebatePosition {
  label: string;
  framing: string;
  claims: DebateClaim[];
}

export interface Debate {
  id: string;
  title: string;
  question: string;
  context: string;
  positions: [DebatePosition, DebatePosition];
  evidenceNeeded: string[];
  limits: string;
  relatedStudyIds: string[];
  sourceId: string;
}

export interface TimelineEvent {
  id: string;
  year: number;
  month: number;
  subject: 'Design' | 'Measurement' | 'Review' | 'Data';
  jurisdictionIds: JurisdictionId[];
  title: string;
  summary: string;
  detail: string;
  sourceId: string;
}
