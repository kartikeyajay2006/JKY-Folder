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
  mime: 'application/pdf' | 'image/jpeg';
  extension: '.pdf' | '.jpg';
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
  assurance: 'reference';
  requirements: Requirement[];
  limitations: string[];
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
  pages: { number: number; text: string }[];
  width?: number;
  height?: number;
  error?: string;
  createdAt: string;
}
export interface EvidenceLink {
  documentId: string;
  pageFrom: number;
  pageTo: number;
  review: 'unreviewed' | 'confirmed' | 'concern';
  note: string;
}
export interface Packet {
  id: string;
  title: string;
  packId: string;
  revision: number;
  profile: Profile;
  links: Record<string, EvidenceLink>;
  createdAt: string;
  updatedAt: string;
}
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
}
export interface PacketDetail {
  packet: Packet;
  documents: DocumentRecord[];
  runs: EvaluationRun[];
}
export interface User {
  id: string;
  name: string;
  email: string;
  demo: boolean;
}
