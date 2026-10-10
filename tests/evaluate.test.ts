import { describe, it, expect } from 'vitest';
import { applicability, evaluate } from '../shared/evaluate';
import { uceedPack } from '../shared/packs';
import { emptyProfile, type Packet, type DocumentRecord } from '../shared/model';
import { makeCustomPack, starterRequirements } from '../shared/templates';
const packet = (): Packet => ({
  id: 'p',
  title: 'Test',
  packId: uceedPack.id,
  revision: 3,
  profile: {
    education: 'completed',
    category: 'general',
    nameChanged: 'no',
    disability: 'none',
    accommodation: 'no',
    nationality: 'indian',
  },
  links: {},
  createdAt: '2026-10-10',
  updatedAt: '2026-10-10',
});
describe('custom checklist checks', () => {
  function fixture() {
    const p = packet();
    const requirements = starterRequirements('job');
    const pack = makeCustomPack({ id: 'custom-test', title: 'Custom test', requirements });
    p.customPack = pack;
    p.packId = pack.id;
    p.links['requirement-1'] = {
      documentId: 'd',
      pageFrom: 1,
      pageTo: 1,
      review: 'confirmed',
      note: 'Inspected the original selected page.',
    };
    return { p, pack };
  }
  it('does not demand absent optional evidence', () => {
    const { p, pack } = fixture();
    expect(evaluate(p, [pdf], pack, 'r').counts.not_applicable).toBe(3);
  });
  it('checks user-defined file size constraints before accepting confirmation', () => {
    const { p, pack } = fixture();
    pack.requirements[0].maxBytes = 100;
    const check = evaluate(p, [pdf], pack, 'r').checks[0];
    expect(check.state).toBe('fail');
    expect(check.reason).toContain('limit recorded in your checklist');
  });
  it('finds normalized phrases only inside the linked page range', () => {
    const { p, pack } = fixture();
    pack.requirements[0].expectedText = 'Fresh Applicant';
    const docs = [
      {
        ...pdf,
        pages: [
          { number: 1, text: 'FRESH  APPLICANT resume' },
          { number: 2, text: 'Another page' },
        ],
      },
    ];
    expect(evaluate(p, docs, pack, 'r').checks[0].state).toBe('pass');
    p.links['requirement-1'].pageFrom = 2;
    p.links['requirement-1'].pageTo = 2;
    expect(evaluate(p, docs, pack, 'r').checks[0].state).toBe('needs_review');
  });
  it('does not treat missing extraction as a proven content failure', () => {
    const { p, pack } = fixture();
    pack.requirements[0].expectedText = 'Fresh Applicant';
    const c = evaluate(p, [pdf], pack, 'r').checks[0];
    expect(c.state).toBe('needs_review');
    expect(c.contentState).toBe('unknown');
  });
  it('accepts either supported format when the owner chooses PDF or JPEG', () => {
    const { p, pack } = fixture();
    pack.requirements[0].mime = 'any';
    pack.requirements[0].extension = 'any';
    expect(
      evaluate(p, [{ ...pdf, mime: 'image/jpeg', name: 'resume.jpeg', pageCount: 1 }], pack, 'r')
        .checks[0].state,
    ).toBe('pass');
  });
});
const pdf: DocumentRecord = {
  id: 'd',
  packetId: 'p',
  name: 'evidence.pdf',
  mime: 'application/pdf',
  size: 200,
  hash: 'hash',
  status: 'ready',
  pageCount: 2,
  pages: [],
  createdAt: '2026-10-10',
};
const run = (p: Packet, docs: DocumentRecord[] = []) => evaluate(p, docs, uceedPack, 'r');
describe('conditional applicability', () => {
  it('preserves unknown instead of omitting a requirement', () =>
    expect(applicability({ op: 'eq', field: 'nameChanged', value: 'yes' }, emptyProfile)).toBe(
      null,
    ));
  it('uses three-valued conjunction and disjunction', () => {
    const a = { op: 'eq', field: 'nameChanged', value: 'yes' } as const;
    expect(
      applicability(
        { op: 'and', args: [a, { op: 'eq', field: 'category', value: 'ews' }] },
        { ...emptyProfile, category: 'general' },
      ),
    ).toBe(false);
    expect(
      applicability(
        { op: 'or', args: [a, { op: 'eq', field: 'category', value: 'ews' }] },
        { ...emptyProfile, category: 'ews' },
      ),
    ).toBe(true);
    expect(applicability({ op: 'not', arg: a }, emptyProfile)).toBe(null);
  });
  it('covers all conditional profile branches', () => {
    for (const r of uceedPack.requirements) {
      if (r.condition.op === 'eq') {
        const p = packet();
        p.profile = { ...emptyProfile, [r.condition.field]: r.condition.value };
        expect(applicability(r.condition, p.profile)).toBe(true);
      }
    }
  });
});
describe('conservative evidence evaluation', () => {
  it('flags missing evidence and excludes only confirmed inapplicable requirements', () => {
    const r = run(packet());
    expect(r.summary).toBe('action_required');
    expect(r.checks.find((c) => c.requirementId === 'age')?.state).toBe('fail');
    expect(r.checks.find((c) => c.requirementId === 'name-change')?.state).toBe('not_applicable');
  });
  it('requires content review even after file format passes', () => {
    const p = packet();
    p.links.age = { documentId: 'd', pageFrom: 1, pageTo: 1, review: 'unreviewed', note: '' };
    const c = run(p, [pdf]).checks.find((c) => c.requirementId === 'age');
    expect(c?.fileState).toBe('pass');
    expect(c?.state).toBe('needs_review');
  });
  it('keeps user confirmations distinct from machine verification', () => {
    const p = packet();
    p.links.age = {
      documentId: 'd',
      pageFrom: 1,
      pageTo: 2,
      review: 'confirmed',
      note: 'I checked the date of birth against the original.',
    };
    const c = run(p, [pdf]).checks.find((c) => c.requirementId === 'age');
    expect(c?.state).toBe('pass');
    expect(c?.verification).toBe('user');
    expect(c?.evidence?.hash).toBe('hash');
  });
  it('does not accept another packet document', () => {
    const p = packet();
    p.links.age = {
      documentId: 'd',
      pageFrom: 1,
      pageTo: 1,
      review: 'confirmed',
      note: 'Reviewed evidence.',
    };
    expect(
      run(p, [{ ...pdf, packetId: 'other' }]).checks.find((c) => c.requirementId === 'age')?.state,
    ).toBe('fail');
  });
  it('rejects invalid page ranges and disguised formats', () => {
    const p = packet();
    p.links.age = {
      documentId: 'd',
      pageFrom: 1,
      pageTo: 3,
      review: 'confirmed',
      note: 'Reviewed evidence.',
    };
    expect(run(p, [pdf]).checks.find((c) => c.requirementId === 'age')?.fileState).toBe('fail');
    p.links.age.pageTo = 1;
    expect(
      run(p, [{ ...pdf, mime: 'image/jpeg' }]).checks.find((c) => c.requirementId === 'age')?.state,
    ).toBe('fail');
  });
  it('preserves error, pending and concern outcomes', () => {
    const p = packet();
    p.links.age = {
      documentId: 'd',
      pageFrom: 1,
      pageTo: 1,
      review: 'concern',
      note: 'Name is inconsistent.',
    };
    expect(run(p, [pdf]).checks.find((c) => c.requirementId === 'age')?.state).toBe('needs_review');
    expect(
      run(p, [{ ...pdf, status: 'processing' }]).checks.find((c) => c.requirementId === 'age')
        ?.state,
    ).toBe('pending');
    expect(
      run(p, [{ ...pdf, status: 'error' }]).checks.find((c) => c.requirementId === 'age')?.state,
    ).toBe('error');
  });
  it('retains reproducible input versions and all limitations', () => {
    const r = run(packet());
    expect(r.packetRevision).toBe(3);
    expect(r.packVersion).toBe(uceedPack.version);
    expect(r.limitations).toEqual(uceedPack.limitations);
    expect(r.counts.pass).toBe(0);
  });
  it('changing conditional answers makes obligations unresolved', () => {
    const p = packet();
    p.profile.nameChanged = 'unknown';
    expect(run(p).checks.find((c) => c.requirementId === 'name-change')?.state).toBe('unknown');
  });
});
describe('applicability notes', () => {
  it('explains a conditional requirement from confirmed answers only', async () => {
    const { applicabilityNote, conditionOptions } = await import('../shared/profile');
    const { emptyProfile } = await import('../shared/model');
    const requirement = { condition: { op: 'eq', field: 'nameChanged', value: 'yes' } as const };
    expect(applicabilityNote(requirement, emptyProfile)).toBe('');
    expect(applicabilityNote(requirement, { ...emptyProfile, nameChanged: 'yes' })).toBe(
      'You answered “Yes, they differ” to “Do your registration and certificate names differ?”',
    );
    expect(applicabilityNote({ condition: { op: 'always' } }, emptyProfile)).toBe('');
    expect(conditionOptions().every((c) => c.value === 'always' || c.value.includes(':'))).toBe(
      true,
    );
  });
});
