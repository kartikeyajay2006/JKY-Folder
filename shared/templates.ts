import type { ApplicationKind, Packet, Requirement, RulePack } from './model';
import { findPack } from './packs';

export interface ApplicationTemplate {
  id: string;
  kind: ApplicationKind;
  title: string;
  description: string;
  requirements: {
    title: string;
    group: Requirement['group'];
    format: 'pdf' | 'jpg' | 'any';
    optional?: boolean;
  }[];
}
export const templates: ApplicationTemplate[] = [
  {
    id: 'college',
    kind: 'college',
    title: 'College admission',
    description: 'Organize your academic records and supporting documents.',
    requirements: [
      { title: 'Academic transcript', group: 'Education', format: 'pdf' },
      { title: 'Statement of purpose', group: 'Supporting evidence', format: 'pdf' },
      { title: 'Identity document', group: 'Identity', format: 'any' },
      {
        title: 'Recommendation letter',
        group: 'Supporting evidence',
        format: 'pdf',
        optional: true,
      },
    ],
  },
  {
    id: 'scholarship',
    kind: 'scholarship',
    title: 'Scholarship',
    description: 'Keep academic, financial and eligibility evidence together.',
    requirements: [
      { title: 'Academic transcript', group: 'Education', format: 'pdf' },
      { title: 'Scholarship statement', group: 'Supporting evidence', format: 'pdf' },
      { title: 'Identity document', group: 'Identity', format: 'any' },
      { title: 'Income evidence', group: 'Supporting evidence', format: 'pdf', optional: true },
    ],
  },
  {
    id: 'job',
    kind: 'job',
    title: 'Job application',
    description: 'Prepare a focused packet for your next role.',
    requirements: [
      { title: 'Resume', group: 'Supporting evidence', format: 'pdf' },
      { title: 'Cover letter', group: 'Supporting evidence', format: 'pdf', optional: true },
      { title: 'Qualification certificate', group: 'Education', format: 'any', optional: true },
      { title: 'Portfolio', group: 'Supporting evidence', format: 'pdf', optional: true },
    ],
  },
  {
    id: 'custom',
    kind: 'custom',
    title: 'Build your own',
    description: 'Start from your actual instructions and define each requirement.',
    requirements: [],
  },
];
export function templateRequirement(
  title: string,
  index: number,
  format: 'pdf' | 'jpg' | 'any' = 'any',
  group: Requirement['group'] = 'Supporting evidence',
  optional = false,
): Requirement {
  return {
    id: `requirement-${index + 1}`,
    title,
    description: `Provide evidence for: ${title}. Confirm the exact requirement against the instructions you received.`,
    group,
    condition: { op: 'always' },
    mime: format === 'pdf' ? 'application/pdf' : format === 'jpg' ? 'image/jpeg' : 'any',
    extension: format === 'pdf' ? '.pdf' : format === 'jpg' ? '.jpg' : 'any',
    optional,
    sourceSection: 'Your application instructions',
    reviewHint:
      'Inspect the original, compare its content to your instructions, and record what you checked.',
  };
}
export function starterRequirements(templateId: string): Requirement[] {
  return (templates.find((t) => t.id === templateId)?.requirements || []).map((r, i) =>
    templateRequirement(r.title, i, r.format, r.group, r.optional),
  );
}
// This is a mechanical line importer, never a claim of interpreting conditional instructions.
export function importInstructionLines(text: string): Requirement[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((line, i) => templateRequirement(line.slice(0, 160), i));
}
export function makeCustomPack(input: {
  id: string;
  title: string;
  sourceUrl?: string;
  requirements: Requirement[];
  now?: string;
}): RulePack {
  const now = input.now || new Date().toISOString();
  return {
    id: input.id,
    title: input.title,
    version: 'custom.1',
    cycle: String(new Date(now).getFullYear()),
    checkedAt: now,
    sourceUrl: input.sourceUrl || '',
    assurance: 'user_defined',
    requirements: input.requirements,
    limitations: [
      'This checklist was configured by the account owner. Starter items and imported lines are not independently verified application requirements.',
      'Confirm completeness, conditional exceptions, dates and formats against your actual instructions.',
      'Content confirmation records your review; it does not establish authenticity, eligibility or acceptance.',
    ],
  };
}
export function packetPack(packet: Packet): RulePack {
  const pack = packet.customPack || findPack(packet.packId);
  if (!pack) throw new Error('This application checklist is unavailable.');
  return pack;
}
export function deadlineInfo(deadline?: string) {
  if (!deadline) return { label: 'No deadline set', days: null, urgent: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${deadline}T00:00:00`);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);
  return {
    days,
    urgent: days <= 7,
    label:
      days < 0
        ? `${Math.abs(days)}d overdue`
        : days === 0
          ? 'Due today'
          : days === 1
            ? 'Due tomorrow'
            : `${days} days left`,
  };
}
