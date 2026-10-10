import { readFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type {
  RulePack,
  SourceSnapshot,
  SourceCoverage,
  SourceObligation,
  Predicate,
  Requirement,
} from '../shared/model';
import { uceedPack, registrationBaseRequirements } from '../shared/packs';
import { digest } from './rule-packs';

const eq = (field: string, value: string) => ({ op: 'eq', field, value }) as Predicate;
const and = (...args: Predicate[]): Predicate => ({ op: 'and', args });
export function expandedUceedRequirements(): Requirement[] {
  const rows = structuredClone(registrationBaseRequirements).filter(
    (r) => !['category', 'principal'].includes(r.id),
  );
  const base = registrationBaseRequirements.find((r) => r.id === 'principal')!;
  rows.push({
    ...base,
    description:
      'Appendix 1 certified by the school/college principal or authorised board official for candidates appearing in 2027.',
    condition: and(eq('education', 'appearing'), eq('educationBoard', 'other')),
  });
  rows.push({
    ...base,
    id: 'nios',
    title: 'NIOS appearing-candidate evidence',
    description:
      'Official FAQ 17 permits Appendix 1 certified by the nearest NIOS office or the NIOS identity card.',
    condition: and(eq('education', 'appearing'), eq('educationBoard', 'nios')),
    evidenceMode: 'any',
    evidenceSlots: ['NIOS-certified Appendix 1', 'NIOS identity card'],
  });
  const category = registrationBaseRequirements.find((r) => r.id === 'category')!;
  for (const [id, title, appendix] of [
    ['obc', 'OBC-NCL', 2],
    ['sc', 'SC', 3],
    ['st', 'ST', 3],
    ['ews', 'EWS', 4],
  ] as const)
    rows.push({
      ...category,
      id: 'category-' + id,
      title: title + ' category evidence',
      condition: eq('category', id),
      description: `Valid ${title} certificate or the competent-authority-certified Appendix ${appendix}. Inspect Central Government format, signatures, seals and the relevant appendix.`,
      evidenceMode: 'any',
      evidenceSlots: ['Valid certificate', 'Prescribed appendix'],
    });
  rows.push({
    ...category,
    id: 'scribe-specified',
    title: 'Scribe evidence: specified categories',
    condition: and(eq('accommodation', 'yes'), eq('scribe', 'yes'), eq('scribeRoute', 'specified')),
    description:
      'For blindness, locomotor disability affecting both arms, or cerebral palsy: a valid UDID card or medical recommendation in Appendix 10. The office decides eligibility.',
    evidenceMode: 'any',
    evidenceSlots: ['Valid UDID', 'Appendix 10'],
  });
  rows.push({
    ...category,
    id: 'scribe-other',
    title: 'Scribe medical recommendation',
    condition: and(eq('accommodation', 'yes'), eq('scribe', 'yes'), eq('scribeRoute', 'other')),
    description:
      'Appendix 10 recommendation of writing limitation from the specified government medical authority; office assessment remains required.',
  });
  return rows.map((r) => ({
    ...r,
    sourceAnchor: undefined,
    reviewHint:
      r.reviewHint +
      ' Check the appendix requirements, issuer, validity and exceptions; technical checks do not certify these.',
  }));
}
export function normalizeOfficialHtml(raw: string) {
  return raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}
export async function prepareOfficialPack(
  files: { registration: string; faq: string; brochure: string },
  actor: string,
) {
  if (!actor.trim()) throw Error('An accountable author is required.');
  const snapshots: SourceSnapshot[] = [],
    coverage: SourceCoverage[] = [],
    obligations: SourceObligation[] = [];
  const source = (
    id: string,
    url: string,
    title: string,
    content: string,
    representation: SourceSnapshot['representation'],
  ) => {
    const s: SourceSnapshot = {
      id,
      url,
      title,
      content,
      representation,
      sha256: digest(content),
      retrievedAt: new Date().toISOString(),
    };
    snapshots.push(s);
    return s;
  };
  const registration = source(
    'uceed-2027-registration-v3',
    'https://www.uceed.iitb.ac.in/2027/registration.html',
    'UCEED 2027 registration',
    normalizeOfficialHtml(readFileSync(files.registration, 'utf8')),
    'normalized_html_text',
  );
  const faq = source(
    'uceed-2027-faq-v3',
    'https://www.uceed.iitb.ac.in/2027/faq.html',
    'UCEED 2027 FAQ',
    normalizeOfficialHtml(readFileSync(files.faq, 'utf8')),
    'normalized_html_text',
  );
  const task = getDocument({
    data: new Uint8Array(readFileSync(files.brochure)),
    useSystemFonts: true,
  });
  const pages: { number: number; text: string; start: number }[] = [];
  let text = '';
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 100) throw Error('Operator source PDF exceeds 100 pages.');
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n),
        data = await page.getTextContent();
      const value = data.items
        .filter((i) => 'str' in i)
        .map((i) => i.str + ('hasEOL' in i && i.hasEOL ? '\n' : ' '))
        .join('');
      pages.push({ number: n, text: value, start: text.length });
      text += value + '\n';
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }
  const brochure = source(
    'uceed-2027-brochure-v3',
    'https://www.uceed.iitb.ac.in/2027/assets/downloads/docs/UCEED2027_Information_Brochure.pdf',
    'UCEED 2027 information brochure',
    text,
    'normalized_pdf_text',
  );
  const requirements = expandedUceedRequirements();
  function obligation(
    s: SourceSnapshot,
    start: number,
    length: number,
    id: string,
    instruction: string,
    ids: string[],
    disposition: SourceObligation['disposition'] = 'review_only',
  ) {
    const o: SourceObligation = {
      id,
      sourceId: s.id,
      anchor: `${s.id}:${start}:${length}`,
      instruction,
      requirementIds: ids,
      disposition,
      rationale:
        disposition === 'unsupported'
          ? 'Outside automatic verification; official determination or a separate application stage is required.'
          : 'Review source wording, applicability, alternatives, form fields, signatures, validity and issuer against the original. File formats and evidence combinations are deterministic; legal and medical judgments remain manual.',
    };
    obligations.push(o);
    return o;
  }
  const fragments: Record<string, string> = {
    photo: 'A recent colour photograph',
    signature: 'A clear image',
    age: 'Proof of age',
    qualifying: 'If appeared in the year',
    principal: 'For candidates appearing',
    nios: 'You may upload',
    'name-change': 'In case of a difference',
    'category-obc': 'Valid OBC-NCL certificate',
    'category-sc': 'Valid SC certificate',
    'category-st': 'Valid ST certificate',
    'category-ews': 'Valid EWS certificate',
    disability: 'Valid UDID card and/or',
    dyslexia: 'Dyslexic candidates need',
    accommodation: 'PwD candidates who require',
    nationality: 'Nationality Certificate',
    oci: 'OCI/PIO card –',
    'scribe-specified': 'The facility of scribe may',
    'scribe-other': 'In the case of disabilities other',
  };
  for (const r of requirements) {
    const s = r.id === 'nios' ? faq : registration,
      phrase = fragments[r.id];
    let start = s.content!.indexOf(phrase);
    if (start < 0 && r.id === 'oci') start = s.content!.indexOf('OCI/PIO card issued before');
    if (start < 0)
      throw Error(`Source phrase absent for ${r.id}; curate the changed source before proceeding.`);
    const endMatch = s.content!.slice(start + phrase.length).match(/\.(?:\s|$)/),
      end = endMatch ? start + phrase.length + endMatch.index! : -1,
      length = (end < 0 ? Math.min(start + 600, s.content!.length) : end + 1) - start;
    const o = obligation(s, start, length, r.id, r.description, [r.id]);
    r.sourceAnchor = o.anchor;
    r.sourceSection =
      r.id === 'nios' ? 'Official FAQ 17' : 'Registration document list and scribe section';
  }
  for (const s of [registration, faq])
    coverage.push({
      id: s.id,
      sourceId: s.id,
      anchor: `${s.id}:0:${s.content!.length}`,
      title: s.title + ' (all content reviewed for registration relevance)',
      disposition: 'in_scope',
      obligationIds: obligations.filter((o) => o.sourceId === s.id).map((o) => o.id),
    });
  for (const p of pages) {
    const inScope =
      [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].includes(p.number) ||
      (p.number >= 58 && p.number <= 73);
    let ids: string[] = [];
    if (p.number >= 59 && p.number <= 73) {
      ids =
        p.number === 59
          ? ['principal', 'nios']
          : p.number <= 62
            ? ['category-obc']
            : p.number === 63
              ? ['category-sc', 'category-st']
              : p.number === 64
                ? ['category-ews']
                : p.number <= 69
                  ? ['disability']
                  : p.number <= 71
                    ? ['dyslexia']
                    : p.number === 72
                      ? ['scribe-specified', 'scribe-other']
                      : ['accommodation'];
    } else if (p.number === 28 || p.number === 29) ids = requirements.map((r) => r.id);
    else if (p.number === 26 || p.number === 27)
      ids = ['accommodation', 'scribe-specified', 'scribe-other'];
    const o = obligation(
      brochure,
      p.start,
      p.text.length,
      'brochure-page-' + p.number,
      inScope
        ? `Inspect every instruction on PDF page ${p.number} (printed ${p.number - 4}), including appendix fields and exceptions.`
        : `PDF page ${p.number}: separate eligibility, exam, admission, seat allocation, fee or contact scope.`,
      ids,
      ids.length ? 'review_only' : 'unsupported',
    );
    coverage.push({
      id: 'pdf-page-' + p.number,
      sourceId: brochure.id,
      anchor: o.anchor,
      title: `Brochure PDF page ${p.number} (printed ${p.number - 4})`,
      disposition: inScope ? 'in_scope' : 'out_of_scope',
      obligationIds: [o.id],
    });
  }
  const unsupported = [
    [
      'portrait-age',
      'Portrait date, face coverage and photo quality require inspection; no pixel or byte rules are invented.',
      ['photo'],
    ],
    [
      'issuers',
      'Issuer competence, authenticity, certificate validity and legal name equivalence require official verification.',
      ['age', 'name-change', 'category-obc', 'category-sc', 'category-st', 'category-ews'],
    ],
    [
      'medical',
      'Disability severity, writing limitation and medical entitlement require official assessment.',
      ['disability', 'dyslexia', 'scribe-specified', 'scribe-other'],
    ],
    [
      'foreign',
      'Plain foreign-national document exceptions and the exact OCI cutoff boundary need official clarification.',
      ['nationality', 'oci'],
    ],
    [
      'eligibility',
      'Eligibility, category entitlement, payment and portal submission are outside this document-check scope.',
      [],
    ],
  ] as const;
  for (const [id, instruction, ids] of unsupported)
    obligation(
      registration,
      0,
      registration.content!.length,
      'unsupported-' + id,
      instruction,
      [...ids],
      'unsupported',
    );
  coverage[0].obligationIds = obligations
    .filter((o) => o.sourceId === registration.id)
    .map((o) => o.id);
  const pack: RulePack = {
    ...structuredClone(uceedPack),
    version: '2027.reference.3',
    requirements,
    sources: snapshots.map(({ content, ...s }) => s),
    obligations,
    coverage,
    lifecycle: 'draft',
    authoredBy: actor,
    reviewedBy: undefined,
    reviewedAt: undefined,
    checkedAt: new Date().toISOString().slice(0, 10),
    limitations: [
      'Source-backed examination-registration document pack; independent completeness sign-off is pending.',
      'Complete source sections and appendix pages are included in the review dossier. Unsupported legal, medical, eligibility, foreign-national and portal obligations remain explicit.',
      'Service limits are separate from official requirements. No source-defined file size or pixel limit is asserted.',
      'Applicant content confirmation does not certify authenticity, eligibility, issuer competence, portrait recency, certificate validity or institutional acceptance.',
      'English OCR is a reading aid; uncertain and unreadable content requires manual review.',
    ],
  };
  return {
    pack,
    snapshots,
    pages: pages.map(({ text, ...p }) => ({ ...p, length: text.length })),
    scopeHash: digest(
      JSON.stringify({
        sources: pack.sources,
        requirements: pack.requirements,
        obligations: pack.obligations,
        coverage: pack.coverage,
      }),
    ),
  };
}
