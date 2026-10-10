export type Answer = 'yes' | 'no' | 'unknown';
export interface Profile {
  education: 'completed' | 'appearing' | 'unknown';
  category: 'general' | 'ews' | 'obc' | 'sc' | 'st' | 'unknown';
  nameChanged: Answer;
  disability: 'none' | 'pwd' | 'dyslexia' | 'unknown';
  accommodation: Answer;
  nationality: 'indian' | 'foreign_before' | 'foreign_after' | 'unknown';
}
export const emptyProfile: Profile = {
  education: 'unknown',
  category: 'unknown',
  nameChanged: 'unknown',
  disability: 'unknown',
  accommodation: 'unknown',
  nationality: 'unknown',
};
export type Predicate =
  | { op: 'always' }
  | { op: 'eq'; field: keyof Profile; value: string }
  | { op: 'in'; field: keyof Profile; values: string[] }
  | { op: 'and' | 'or'; args: Predicate[] }
  | { op: 'not'; arg: Predicate };
export interface Requirement {
  id: string;
  title: string;
  description: string;
  group: 'Identity' | 'Education' | 'Supporting evidence';
  condition: Predicate;
  mime: 'application/pdf' | 'image/jpeg' | 'any';
  extension: '.pdf' | '.jpg' | 'any';
  optional?: boolean;
  maxBytes?: number;
  minBytes?: number;
  minPages?: number;
  maxPages?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  evidenceMode?: 'all' | 'any';
  evidenceSlots?: string[];
  dateCheck?: {
    field: Exclude<FactKind, 'name'>;
    operation: 'on_or_before' | 'on_or_after';
    reference: string;
  };
  sourceAnchor?: string;
  expectedText?: string;
  sourceSection: string;
  reviewHint: string;
}
export interface RulePack {
  id: string;
  version: string;
  title: string;
  cycle: string;
  sourceUrl: string;
  checkedAt: string;
  assurance: 'reference' | 'user_defined';
  requirements: Requirement[];
  limitations: string[];
  stage?: string;
  lifecycle?: 'draft' | 'reviewed' | 'published' | 'retired';
  sources?: SourceSnapshot[];
  obligations?: SourceObligation[];
  authoredBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
export interface SourceSnapshot {
  id: string;
  url: string;
  title: string;
  retrievedAt: string;
  sha256: string;
  content?: string;
  representation?: 'browser_rendered_text' | 'normalized_html_text';
}
export interface SourceObligation {
  id: string;
  sourceId: string;
  anchor: string;
  instruction: string;
  disposition: 'implemented' | 'review_only' | 'unsupported';
  requirementIds: string[];
  rationale: string;
}
export type FactKind = 'name' | 'birth_date' | 'issue_date' | 'expiry_date';
export interface FactRevision {
  revision: number;
  value: string;
  confirmed: boolean;
  actor: string;
  reason: string;
  createdAt: string;
}
export interface DocumentFact {
  id: string;
  kind: FactKind;
  page: number;
  originalText: string;
  origin?: 'extracted' | 'manual';
  value: string;
  confidence: number;
  box?: [number, number, number, number];
  history: FactRevision[];
}
export interface TextToken {
  text: string;
  box: [number, number, number, number];
  confidence: number;
}
export interface DocumentPage {
  number: number;
  text: string;
  method?: 'native' | 'ocr' | 'unreadable';
  width?: number;
  height?: number;
  confidence?: number;
  tokens?: TextToken[];
  warning?: string;
}
export interface DocumentRecord {
  id: string;
  packetId: string;
  name: string;
  size: number;
  hash: string;
  mime: string;
  status: 'processing' | 'ready' | 'error';
  pageCount: number;
  pages: DocumentPage[];
  facts?: DocumentFact[];
  extractionVersion?: string;
  width?: number;
  height?: number;
  error?: string;
  createdAt: string;
}
export interface EvidenceAnchor {
  documentId: string;
  pageFrom: number;
  pageTo: number;
  review: 'unreviewed' | 'confirmed' | 'concern';
  note: string;
  slot?: string;
  actor?: string;
  reviewedAt?: string;
}
export interface EvidenceLink extends EvidenceAnchor {
  additional?: EvidenceAnchor[];
}
export const evidenceAnchors = (link?: EvidenceLink): EvidenceAnchor[] =>
  link ? [link, ...(link.additional || [])] : [];
export interface Packet {
  mode?: 'uploads' | 'instructions';
  intakeId?: string;
  id: string;
  title: string;
  packId: string;
  revision: number;
  profile: Profile;
  links: Record<string, EvidenceLink>;
  createdAt: string;
  updatedAt: string;
  customPack?: RulePack;
  kind?: ApplicationKind;
  destination?: string;
  deadline?: string;
  notes?: string;
  archived?: boolean;
  packSnapshot?: RulePack;
}
export type ApplicationKind = 'college' | 'scholarship' | 'job' | 'custom';
export type CheckState =
  'pass' | 'fail' | 'unknown' | 'needs_review' | 'not_applicable' | 'pending' | 'error';
export interface CheckResult {
  requirementId: string;
  title: string;
  group: Requirement['group'];
  state: CheckState;
  fileState: CheckState;
  contentState: CheckState;
  reason: string;
  sourceUrl: string;
  sourceSection: string;
  evidence?: { documentId: string; name: string; hash: string; pageFrom: number; pageTo: number };
  evidenceSet?: {
    documentId: string;
    name: string;
    hash: string;
    pageFrom: number;
    pageTo: number;
    slot?: string;
    state: CheckState;
    reason: string;
  }[];
  factRevisions?: {
    documentId: string;
    factId: string;
    revision: number;
    value: string;
    page: number;
  }[];
  reviewNote?: string;
  verification: 'none' | 'technical' | 'user';
}
export interface EvaluationRun {
  id: string;
  packetId: string;
  packetRevision: number;
  packVersion: string;
  evaluatorVersion: string;
  createdAt: string;
  summary: 'action_required' | 'review_required' | 'processing' | 'ready_for_supported_checks';
  checks: CheckResult[];
  limitations: string[];
  counts: Record<CheckState, number>;
  checklist?: { id: string; title: string; sourceUrl: string; assurance: RulePack['assurance'] };
  sourceSnapshots?: SourceSnapshot[];
  sourceObligations?: SourceObligation[];
  consistencyConcerns?: {
    kind: 'name' | 'birth_date';
    facts: { documentId: string; name: string; factId: string; value: string; page: number }[];
    reason: string;
  }[];
}
export interface PacketDetail {
  packet: Packet;
  documents: DocumentRecord[];
  runs: EvaluationRun[];
  /** The checklist this packet is evaluated against, resolved by the server. */
  pack: RulePack;
  /** A live, unsaved evaluation of the current packet revision. */
  live: EvaluationRun;
  evaluatorVersion: string;
  sourceChanged?: boolean;
  suggestions?: EvidenceSuggestion[];
  consistencyConcerns?: {
    kind: 'name' | 'birth_date';
    facts: { documentId: string; name: string; factId: string; value: string; page: number }[];
    reason: string;
  }[];
}
export interface EvidenceSuggestion {
  requirementId: string;
  documentId: string;
  pageFrom: number;
  pageTo: number;
  confidence: number;
  reason: string;
}
export interface Reminder {
  id: string;
  packetId: string;
  kind: 'deadline' | 'source_changed';
  title: string;
  message: string;
  createdAt: string;
  readAt?: string;
}
export interface NotificationPreferences {
  deadlines: boolean;
  sourceChanges: boolean;
}
export interface User {
  id: string;
  name: string;
  email: string;
  demo: boolean;
}
