import { z } from 'zod';
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
const condition = z
  .discriminatedUnion('op', [
    z.object({ op: z.literal('always') }).strict(),
    z
      .object({
        op: z.literal('eq'),
        field: z.enum([
          'education',
          'category',
          'nameChanged',
          'disability',
          'accommodation',
          'nationality',
        ]),
        value: z.string().max(30),
      })
      .strict(),
  ])
  .refine(
    (p) => p.op === 'always' || (answers[p.field] as string[]).includes(p.value),
    'Choose a supported profile answer.',
  );
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
    expectedText: z.string().trim().max(150).optional(),
    sourceSection: z.string().max(300),
    reviewHint: z.string().max(1200),
  })
  .strict()
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
