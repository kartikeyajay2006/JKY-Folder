import referenceSource from './reference-source.json';
import registrationDraft from './uceed-registration-draft.json';
import referenceObligations from './reference-obligations.json';
import type { SourceSnapshot, SourceObligation } from './model';
import type { RulePack, Requirement, Predicate } from './model';
const eq = (field: string, value: string) => ({ op: 'eq', field, value }) as Predicate;
const oneOf = (field: string, values: string[]) => ({ op: 'in', field, values }) as Predicate;
const req = (
  id: string,
  title: string,
  description: string,
  group: Requirement['group'],
  condition: Predicate,
  mime: Requirement['mime'] = 'application/pdf',
): Requirement => ({
  id,
  title,
  description,
  group,
  condition,
  mime,
  extension: mime === 'image/jpeg' ? '.jpg' : '.pdf',
  sourceSection: 'Documents required for registration',
  reviewHint:
    'Inspect the original and compare its content with the linked official instructions. Confirm only what you personally reviewed.',
});
export const uceedPack: RulePack = {
  id: 'uceed-2027-reference',
  version: '2027.reference.2',
  title: 'UCEED 2027',
  cycle: '2027',
  assurance: 'reference',
  sourceUrl: 'https://www.uceed.iitb.ac.in/2027/registration.html',
  checkedAt: '2026-10-10',
  stage: 'examination registration',
  sources: [referenceSource as SourceSnapshot],
  obligations: referenceObligations as SourceObligation[],
  authoredBy: 'kartikeyajay2006',
  lifecycle: 'draft',
  requirements: [
    req(
      'photo',
      'Recent photograph',
      'A recent colour portrait in the required image format.',
      'Identity',
      { op: 'always' },
      'image/jpeg',
    ),
    req(
      'signature',
      'Signature',
      'A clear signature image on a plain white background.',
      'Identity',
      { op: 'always' },
      'image/jpeg',
    ),
    req('age', 'Proof of age', 'An accepted document supporting your date of birth.', 'Identity', {
      op: 'always',
    }),
    req(
      'qualifying',
      'Qualifying examination certificate',
      'The certificate for the completed qualifying examination.',
      'Education',
      eq('education', 'completed'),
    ),
    req(
      'principal',
      'Principal / board certificate',
      'The prescribed supporting certificate for an appearing candidate.',
      'Education',
      eq('education', 'appearing'),
    ),
    req(
      'name-change',
      'Name-change evidence',
      'Supporting evidence when the registration and certificate names differ.',
      'Supporting evidence',
      eq('nameChanged', 'yes'),
    ),
    req(
      'category',
      'Category certificate',
      'The supporting certificate for your selected reservation category.',
      'Supporting evidence',
      oneOf('category', ['ews', 'obc', 'sc', 'st']),
    ),
    req(
      'disability',
      'Disability evidence',
      'Supporting documentation for the declared disability category.',
      'Supporting evidence',
      eq('disability', 'pwd'),
    ),
    req(
      'dyslexia',
      'Dyslexia forms',
      'Both prescribed forms, with the required category information.',
      'Supporting evidence',
      eq('disability', 'dyslexia'),
    ),
    req(
      'accommodation',
      'Accommodation request',
      'The supporting request for examination assistance.',
      'Supporting evidence',
      eq('accommodation', 'yes'),
    ),
    req(
      'nationality',
      'Nationality evidence',
      'Supporting evidence for the selected foreign-national route.',
      'Identity',
      oneOf('nationality', ['foreign_before', 'foreign_after']),
    ),
    req(
      'oci',
      'OCI / PIO evidence',
      'Card evidence for the selected foreign-national route.',
      'Identity',
      oneOf('nationality', ['foreign_before', 'foreign_after']),
    ),
  ],
  limitations: [
    'This reference checklist is not an independently approved complete rule pack. Recheck the official brochure and portal before submission.',
    'Only file format, extension, available pages and confirmed checklist evidence are checked. No official byte or pixel limits are asserted.',
    'Content confirmations are your own review, not machine verification or institutional approval.',
    'Eligibility, issuer authenticity, certificate validity, portrait quality and legal name equivalence are not verified.',
    'Foreign-national exceptions and accommodation-specific medical evidence require separate official review.',
    'English OCR is a reading aid. Uncertain text, unsupported languages and unreadable pages need manual review.',
  ],
};
uceedPack.requirements = uceedPack.requirements.map((r) => ({
  ...r,
  sourceAnchor: referenceObligations.find((o) => o.requirementIds.includes(r.id))?.anchor,
  ...(r.id === 'dyslexia'
    ? { evidenceMode: 'all' as const, evidenceSlots: ['Form 1', 'Form 2'] }
    : {}),
}));
export const registrationBaseRequirements = structuredClone(uceedPack.requirements);
Object.assign(uceedPack, registrationDraft as unknown as RulePack);
export const packs = [uceedPack];
export const findPack = (id: string) => packs.find((p) => p.id === id);
