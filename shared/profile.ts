import type { Predicate, Profile, Requirement } from './model';

export interface ProfileQuestion {
  field: keyof Profile;
  label: string;
  help: string;
  options: { value: string; label: string; condition?: string }[];
}

// The questions that decide conditional requirements. "unknown" is always kept as an explicit answer.
export const profileQuestions: ProfileQuestion[] = [
  {
    field: 'education',
    label: 'Qualifying examination',
    help: 'Choose the route that applies to this application cycle.',
    options: [
      { value: 'unknown', label: 'I’m not sure yet' },
      { value: 'completed', label: 'Already completed', condition: 'When the exam is completed' },
      {
        value: 'appearing',
        label: 'Appearing this cycle',
        condition: 'When qualifying results are pending',
      },
    ],
  },
  {
    field: 'category',
    label: 'Application category',
    help: 'A selected category may need supporting evidence.',
    options: [
      { value: 'unknown', label: 'I’m not sure yet' },
      { value: 'general', label: 'General' },
      { value: 'ews', label: 'EWS', condition: 'When applying as EWS' },
      { value: 'obc', label: 'OBC-NCL', condition: 'When applying as OBC' },
      { value: 'sc', label: 'SC', condition: 'When applying as SC' },
      { value: 'st', label: 'ST', condition: 'When applying as ST' },
    ],
  },
  {
    field: 'nameChanged',
    label: 'Do your registration and certificate names differ?',
    help: 'Confirm this yourself. Spelling differences are never treated as a legal name change.',
    options: [
      { value: 'unknown', label: 'I need to compare them' },
      { value: 'no', label: 'No, they match' },
      { value: 'yes', label: 'Yes, they differ', condition: 'When names differ' },
    ],
  },
  {
    field: 'disability',
    label: 'Disability evidence route',
    help: 'This only decides which checklist items apply. It does not judge entitlement.',
    options: [
      { value: 'unknown', label: 'I’m not sure yet' },
      { value: 'none', label: 'Not applying under this route' },
      { value: 'pwd', label: 'PwD', condition: 'When declaring a disability' },
      { value: 'dyslexia', label: 'Dyslexia', condition: 'When declaring dyslexia' },
    ],
  },
  {
    field: 'accommodation',
    label: 'Requesting a scribe or compensatory time?',
    help: 'Medical and category-specific evidence needs a separate official review.',
    options: [
      { value: 'unknown', label: 'I’m not sure yet' },
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes', condition: 'When requesting accommodation' },
    ],
  },
  {
    field: 'nationality',
    label: 'Nationality route',
    help: 'Foreign-national exceptions are outside this checklist’s complete coverage.',
    options: [
      { value: 'unknown', label: 'I’m not sure yet' },
      { value: 'indian', label: 'Indian national' },
      {
        value: 'foreign_before',
        label: 'Foreign, OCI or PIO before the official cutoff',
        condition: 'When foreign, OCI or PIO before the cutoff',
      },
      {
        value: 'foreign_after',
        label: 'Foreign, OCI or PIO after the official cutoff',
        condition: 'When foreign, OCI or PIO after the cutoff',
      },
    ],
  },
];

/** Every allowed answer per profile field, derived from the questions above. */
export const profileAnswers = Object.fromEntries(
  profileQuestions.map((q) => [q.field, q.options.map((o) => o.value)]),
) as Record<keyof Profile, string[]>;

/** Conditions a custom checklist item may use, derived from the questions above. */
export function conditionOptions(questions: ProfileQuestion[] = profileQuestions) {
  return [
    { value: 'always', label: 'Always required' },
    ...questions.flatMap((q) =>
      q.options
        .filter((o) => o.condition)
        .map((o) => ({ value: `${q.field}:${o.value}`, label: o.condition! })),
    ),
  ];
}

function answerLabel(questions: ProfileQuestion[], field: keyof Profile, value: string) {
  const question = questions.find((q) => q.field === field);
  return {
    question: question?.label || field,
    answer: question?.options.find((o) => o.value === value)?.label || value,
  };
}

function matched(predicate: Predicate, profile: Profile): { field: keyof Profile }[] {
  if (predicate.op === 'eq' || predicate.op === 'in') return [{ field: predicate.field }];
  if (predicate.op === 'and' || predicate.op === 'or')
    return predicate.args.flatMap((arg) => matched(arg, profile));
  return [];
}

/** The profile questions a requirement's condition depends on. */
export function conditionFields(predicate: Predicate): (keyof Profile)[] {
  if (predicate.op === 'eq' || predicate.op === 'in') return [predicate.field];
  if (predicate.op === 'and' || predicate.op === 'or')
    return [...new Set(predicate.args.flatMap(conditionFields))];
  if (predicate.op === 'not') return conditionFields(predicate.arg);
  return [];
}

/** Explains, from confirmed answers, why a conditional requirement applies. */
export function applicabilityNote(
  requirement: Pick<Requirement, 'condition'>,
  profile: Profile,
  questions: ProfileQuestion[] = profileQuestions,
) {
  const fields = matched(requirement.condition, profile).filter(
    ({ field }) => profile[field] && profile[field] !== 'unknown',
  );
  if (!fields.length) return '';
  return fields
    .map(({ field }) => {
      const { question, answer } = answerLabel(questions, field, profile[field]);
      return `You answered “${answer}” to “${question}”`;
    })
    .join('; ');
}
