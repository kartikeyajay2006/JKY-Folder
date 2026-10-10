import { z } from 'zod';
import type { Predicate } from '../shared/model';
import { limits } from '../shared/limits';
import { profileAnswers as answers } from '../shared/profile';
export const sourceUrlSchema = z.union([
  z.literal(''),
  z
    .url()
    .max(2000)
    .refine(
      (value) => ['https:', 'http:'].includes(new URL(value).protocol),
      'Use an HTTP or HTTPS source URL.',
    ),
]);
export const deadlineSchema = z.union([
  z.literal(''),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const d = new Date(value);
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
    }, 'Choose a valid calendar date.'),
]);
const fields = z.enum([
  'education',
  'educationBoard',
  'scribe',
  'scribeRoute',
  'category',
  'nameChanged',
  'disability',
  'accommodation',
  'nationality',
]);
const predicate: z.ZodType<Predicate> = z.lazy(() =>
  z.discriminatedUnion('op', [
    z.object({ op: z.literal('always') }).strict(),
    z
      .object({ op: z.literal('eq'), field: fields, value: z.string().max(30) })
      .strict()
      .refine(
        (p) => (answers[p.field] as string[]).includes(p.value),
        'Choose a supported profile answer.',
      ),
    z
      .object({
        op: z.literal('in'),
        field: fields,
        values: z.array(z.string().max(30)).min(1).max(10),
      })
      .strict()
      .refine(
        (p) => p.values.every((v) => (answers[p.field] as string[]).includes(v)),
        'Choose supported profile answers.',
      ),
    z.object({ op: z.enum(['and', 'or']), args: z.array(predicate).min(1).max(10) }).strict(),
    z.object({ op: z.literal('not'), arg: predicate }).strict(),
  ]),
);
// Reject untrusted recursive envelopes before invoking the recursive schema.
function bounded(value: unknown, depth = 0): boolean {
  if (depth > 12 || !value || typeof value !== 'object') return false;
  const p = value as { op: string; args?: unknown[]; arg?: unknown };
  if (p.op === 'and' || p.op === 'or')
    return (
      Array.isArray(p.args) && p.args.length <= 10 && p.args.every((a) => bounded(a, depth + 1))
    );
  if (p.op === 'not') return bounded(p.arg, depth + 1);
  return ['always', 'eq', 'in'].includes(p.op);
}
const condition = z
  .unknown()
  .refine((p) => bounded(p), 'Condition nesting exceeds supported limits.')
  .pipe(predicate);
export const requirementSchema = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().min(2).max(1800),
    group: z.enum(['Identity', 'Education', 'Supporting evidence']),
    condition,
    mime: z.enum(['application/pdf', 'image/jpeg', 'any']),
    extension: z.enum(['.pdf', '.jpg', 'any']),
    optional: z.boolean().optional(),
    maxBytes: z.number().int().positive().max(limits.fileBytes).optional(),
    minBytes: z.number().int().nonnegative().max(limits.fileBytes).optional(),
    minPages: z.number().int().min(1).max(20).optional(),
    maxPages: z.number().int().min(1).max(20).optional(),
    minWidth: z.number().int().min(1).max(20000).optional(),
    maxWidth: z.number().int().min(1).max(20000).optional(),
    minHeight: z.number().int().min(1).max(20000).optional(),
    maxHeight: z.number().int().min(1).max(20000).optional(),
    evidenceMode: z.enum(['all', 'any']).optional(),
    evidenceSlots: z
      .array(z.string().trim().min(1).max(80))
      .max(10)
      .refine((s) => new Set(s).size === s.length)
      .optional(),
    dateCheck: z
      .object({
        field: z.enum(['birth_date', 'issue_date', 'expiry_date']),
        operation: z.enum(['on_or_before', 'on_or_after']),
        reference: deadlineSchema.refine((v) => !!v),
      })
      .strict()
      .optional(),
    sourceAnchor: z.string().max(500).optional(),
    expectedText: z.string().trim().max(150).optional(),
    sourceSection: z.string().max(300),
    reviewHint: z.string().max(1200),
  })
  .strict()
  .refine(
    (r) =>
      [
        ['minBytes', 'maxBytes'],
        ['minPages', 'maxPages'],
        ['minWidth', 'maxWidth'],
        ['minHeight', 'maxHeight'],
      ].every(([a, b]) => {
        const min = r[a as keyof typeof r],
          max = r[b as keyof typeof r];
        return min === undefined || max === undefined || Number(min) <= Number(max);
      }),
    'Minimum constraints must not exceed maximum constraints.',
  )
  .refine(
    (r) =>
      (r.mime === 'any' && r.extension === 'any') ||
      (r.mime === 'application/pdf' && r.extension === '.pdf') ||
      (r.mime === 'image/jpeg' && r.extension === '.jpg'),
    'Choose a matching format and extension.',
  );
export const requirementsSchema = z
  .array(requirementSchema)
  .min(1)
  .max(limits.requirements)
  .refine(
    (rows) => new Set(rows.map((r) => r.id)).size === rows.length,
    'Requirement identifiers must be unique.',
  );
export const applicationMetaSchema = z
  .object({
    title: z.string().trim().min(2).max(100),
    kind: z.enum(['college', 'scholarship', 'job', 'custom']).optional(),
    destination: z.string().trim().max(160).optional(),
    deadline: deadlineSchema.optional(),
    notes: z.string().trim().max(limits.instructionChars).optional(),
    archived: z.boolean().optional(),
  })
  .strict();
