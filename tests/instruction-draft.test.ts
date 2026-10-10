import { describe, expect, it } from 'vitest';
import { draftInstructions } from '../shared/instruction-draft';
import type { DocumentRecord } from '../shared/model';

const doc = (...texts: string[]) =>
  ({
    id: 'doc',
    name: 'instructions.pdf',
    hash: 'hash',
    pages: texts.map((text, i) => ({ number: i + 1, text, method: 'native' })),
  }) as DocumentRecord;
const byTitle = (d: ReturnType<typeof draftInstructions>, title: string) =>
  d.candidates.find((c) => c.requirement.title === title);

describe('instruction PDF drafts', () => {
  it('joins wrapped lines into one proposal and keeps the exact source span', () => {
    const text =
      'Candidates must upload a recent colour photograph in JPG format,\nnot exceeding 200 KB.\nNext section.';
    const d = draftInstructions(doc(text));
    expect(d.candidates).toHaveLength(1);
    const c = d.candidates[0];
    expect(text.slice(c.start, c.start + c.length)).toBe(c.quote);
    expect(c.quote).toContain('\n');
    expect(c.requirement.title).toBe('Photograph');
    expect(c.requirement.maxBytes).toBe(200 * 1024);
    expect(c.requirement.mime).toBe('image/jpeg');
    expect(c.requirement.group).toBe('Identity');
    expect(c.requirement.optional).toBe(true);
  });

  it('turns a list under a documents heading into proposals even without verbs', () => {
    const d = draftInstructions(
      doc(
        'Documents to be uploaded:\n1. Class XII mark sheet (self-attested)\n2. Proof of date of birth\n3. Category certificate, if applicable\nGeneral information about the campus.',
      ),
    );
    expect(d.candidates.map((c) => c.requirement.title)).toEqual([
      'Class XII mark sheet',
      'Proof of date of birth',
      'Category certificate',
    ]);
    expect(d.candidates.every((c) => c.kind === 'list')).toBe(true);
    expect(byTitle(d, 'Class XII mark sheet')!.requirement.group).toBe('Education');
  });

  it('reads size ranges, pixel and page limits, and flags formats the workspace does not accept', () => {
    const d = draftInstructions(
      doc(
        'Upload your signature in JPG, size between 10 KB and 100 KB, 140 x 60 pixels.\nSubmit the statement of purpose as PDF, maximum 2 pages.\nUpload the portfolio as PNG or PDF up to 25 MB.',
      ),
    );
    const signature = byTitle(d, 'Signature')!.requirement;
    expect([signature.minBytes, signature.maxBytes]).toEqual([10 * 1024, 100 * 1024]);
    expect([signature.maxWidth, signature.maxHeight]).toEqual([140, 60]);
    expect(byTitle(d, 'Statement of purpose')!.requirement.maxPages).toBe(2);
    const portfolio = byTitle(d, 'Portfolio')!;
    expect(portfolio.requirement.maxBytes).toBeUndefined();
    expect(portfolio.warnings.join(' ')).toMatch(/PNG/);
    expect(portfolio.warnings.join(' ')).toMatch(/larger files than this workspace/);
  });

  it('suggests, but never applies, conditions from explicit wording', () => {
    const d = draftInstructions(
      doc(
        'SC/ST candidates must upload the caste certificate.\nIf your name has changed, submit the gazette notification.\nPwD candidates must submit the disability certificate.',
      ),
    );
    const caste = byTitle(d, 'Caste certificate')!;
    expect(caste.suggestedCondition?.condition).toEqual({
      op: 'in',
      field: 'category',
      values: ['sc', 'st'],
    });
    expect(caste.requirement.condition).toEqual({ op: 'always' });
    expect(byTitle(d, 'Gazette notification')!.suggestedCondition?.label).toBe(
      'When names differ',
    );
    expect(byTitle(d, 'Disability certificate')!.suggestedCondition?.label).toBe(
      'When declaring a disability',
    );
  });

  it('merges repeated mentions and records the other pages', () => {
    const d = draftInstructions(
      doc('Upload the passport as PDF.', 'Remember to upload a scanned copy of the passport.'),
    );
    expect(d.candidates).toHaveLength(1);
    expect(d.candidates[0].alsoOn).toEqual([2]);
  });

  it('ignores prose that merely mentions documents and warns about unreadable pages', () => {
    const d = draftInstructions({
      ...doc('Our help desk explains certificates.\nThe portal opens in October.'),
      pages: [
        { number: 1, text: 'Our help desk explains certificates.', method: 'native' },
        { number: 2, text: '', method: 'unreadable' },
      ],
    } as DocumentRecord);
    expect(d.candidates).toEqual([]);
    expect(d.warnings.join(' ')).toMatch(/Page 2 could not be read/);
  });
});
