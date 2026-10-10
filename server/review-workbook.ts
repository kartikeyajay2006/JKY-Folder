import type { RulePack, SourceSnapshot } from '../shared/model';

/**
 * Offline review workbooks for people outside the product: one self-contained HTML file that
 * shows exactly what must be reviewed and produces the signed JSON the CLI verifies. The file
 * makes no network requests; progress is kept only in the reviewer's own browser.
 */
export interface PackDossier {
  pack: RulePack;
  snapshots: SourceSnapshot[];
  scopeHash: string;
}
export interface BlindExport {
  manifest: {
    version: number | string;
    author: string;
    cases: ({ id: string } & Record<string, unknown>)[];
  };
  manifestHash: string;
}

// Plain-language meaning of each answer, matching the contract the evaluator implements.
export const STATE_CONTRACT: Record<string, string> = {
  pass: 'Applies, evidence is linked and inspected, every supported check passes, and the applicant recorded a substantive content review.',
  fail: 'Applies and evidence is missing, or a supported check (format, size, pages, dimensions, dates, combination) is violated.',
  unknown: 'Whether it applies depends on an answer or fact that has not been confirmed.',
  needs_review:
    'Evidence is linked but content review is outstanding, a concern was flagged, or text recognition is too uncertain to decide.',
  not_applicable: 'Confirmed answers exclude it, or it is optional and no evidence was supplied.',
  pending: 'Linked evidence is still being inspected.',
  error: 'Linked evidence could not be safely inspected.',
};

const BASE_CASE = [
  'One requirement, required, always applicable, accepting PDF or JPEG.',
  'One inspected original, synthetic.pdf: PDF, 1,000 bytes, 2 pages, native text on page 1.',
  'The requirement is linked to page 1, with the content review confirmed and a substantive note.',
  'Every profile answer is unknown.',
];

/** Turns one case's differences from the base scenario into sentences a reviewer can check. */
export function describeChanges(input: Record<string, unknown>) {
  const out: string[] = [];
  const json = (v: unknown) => JSON.stringify(v);
  if (input.omitDocuments) out.push('No original is uploaded.');
  if (input.omitLinks) out.push('No evidence is linked to the requirement.');
  if (input.requirement) out.push(`Requirement changes: ${json(input.requirement)}`);
  if (input.profile) out.push(`Confirmed profile answers: ${json(input.profile)}`);
  if (input.document) out.push(`Original document changes: ${json(input.document)}`);
  if (input.link) out.push(`Evidence link changes: ${json(input.link)}`);
  if (input.second)
    out.push(`A second original is linked as an additional component: ${json(input.second)}`);
  if (input.date) out.push(`A confirmed issue date is recorded: ${input.date}`);
  if (input.dates) out.push(`Confirmed dates: ${json(input.dates)}`);
  return out.length ? out : ['No changes: the base scenario exactly.'];
}

const escapeJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function shell(title: string, data: unknown, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:">
<title>${escapeHtml(title)}</title>
<style>
:root{color-scheme:light dark;--ink:#0c1b45;--muted:#5b6687;--line:#d6dce8;--paper:#fff;--desk:#f3f5fa;--ok:#0b6b3a;--no:#a82b22;--gold:#c9a13b}
@media (prefers-color-scheme:dark){:root{--ink:#f5f6f8;--muted:#a3a9b3;--line:#30333a;--paper:#141519;--desk:#0a0a0c;--ok:#5fd39b;--no:#ff8f87}}
*{box-sizing:border-box}body{margin:0;background:var(--desk);color:var(--ink);font:15px/1.55 system-ui,sans-serif}
header{position:sticky;top:0;z-index:2;background:var(--paper);border-bottom:2px solid var(--gold);padding:14px 20px;display:grid;gap:10px}
header h1{margin:0;font-size:20px}main{max-width:980px;margin:0 auto;padding:20px;display:grid;gap:14px}
.row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}label{font-weight:600}input[type=text],textarea,select{font:inherit;color:inherit;background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:8px 10px}
textarea{width:100%;min-height:70px}article{background:var(--paper);border:1px solid var(--line);border-left:5px solid var(--line);border-radius:10px;padding:14px 16px;display:grid;gap:10px}
article.accepted{border-left-color:var(--ok)}article.rejected{border-left-color:var(--no)}article h2{margin:0;font-size:16px}
blockquote{margin:0;padding:10px 12px;border-left:3px solid var(--gold);background:color-mix(in srgb,var(--gold) 10%,var(--paper));white-space:pre-wrap;max-height:320px;overflow:auto;font-size:14px}
.meta{color:var(--muted);font-size:13px}ul{margin:0;padding-left:20px}button{font:inherit;font-weight:700;border-radius:8px;border:1px solid var(--line);background:var(--paper);color:inherit;padding:8px 14px;cursor:pointer}
button.primary{background:var(--ink);color:var(--paper);border-color:var(--ink)}button:disabled{opacity:.5;cursor:not-allowed}
.count{font-weight:700}.problem{color:var(--no);font-weight:600}.hint{color:var(--muted);font-size:13px}
.choices{display:flex;flex-wrap:wrap;gap:14px}.choices label{font-weight:500;display:inline-flex;gap:6px;align-items:center}
</style>
</head>
<body>
<script type="application/json" id="workbook-data">${escapeJson(data)}</script>
${body}
</body>
</html>
`;
}

/** Workbook for an independent completeness review of a pack's source coverage. */
export function packWorkbook(dossier: PackDossier) {
  const { pack } = dossier;
  const snapshot = (id: string) => dossier.snapshots.find((s) => s.id === id);
  const sections = (pack.coverage || []).map((c) => {
    const [, start, length] = c.anchor.split(':').map(Number);
    const source = snapshot(c.sourceId);
    return {
      id: c.id,
      title: c.title,
      disposition: c.disposition,
      source: source ? `${source.title} (${source.url})` : c.sourceId,
      anchor: c.anchor,
      excerpt: source?.content?.slice(start, start + length) ?? '',
      obligations: c.obligationIds.map((id) => {
        const o = pack.obligations?.find((x) => x.id === id);
        return {
          id,
          instruction: o?.instruction || '',
          disposition: o?.disposition || '',
          rationale: o?.rationale || '',
          requirements: (o?.requirementIds || []).map(
            (r) => pack.requirements.find((x) => x.id === r)?.title || r,
          ),
        };
      }),
    };
  });
  const data = {
    kind: 'pack',
    packId: pack.id,
    version: pack.version,
    title: pack.title,
    author: pack.authoredBy || '',
    scopeHash: dossier.scopeHash,
    sections,
  };
  return shell(
    `Independent review: ${pack.title} ${pack.version}`,
    data,
    `<header>
<h1>Independent completeness review: ${escapeHtml(pack.title)} (${escapeHtml(pack.version)})</h1>
<p class="hint">Read each source excerpt in full and compare it with the mapped obligations and checklist items. Accept a section only if nothing in it is missing, wrong or mis-scoped. Any rejected section blocks publication; send the downloaded file back to the author. Scope hash: <code>${escapeHtml(dossier.scopeHash)}</code></p>
<div class="row"><label>Reviewer name <input type="text" id="reviewer" autocomplete="name"></label>
<label><input type="checkbox" id="attest"> I did not author this pack and reviewed it independently${pack.authoredBy ? ` of ${escapeHtml(pack.authoredBy)}` : ''}.</label></div>
<div class="row"><span class="count" id="progress"></span><select id="filter" aria-label="Show"><option value="all">All sections</option><option value="open">Not decided yet</option><option value="rejected">Rejected</option></select>
<button class="primary" id="download" disabled>Download signed review</button><span class="problem" id="problem" role="status"></span></div>
</header>
<main id="items"></main>
<script>${WORKBOOK_SCRIPT}</script>`,
  );
}

/** Workbook for labelling the blind correctness benchmark without seeing the author's answers. */
export function benchmarkWorkbook(blind: BlindExport) {
  const data = {
    kind: 'benchmark',
    version: blind.manifest.version,
    manifestHash: blind.manifestHash,
    author: blind.manifest.author,
    base: BASE_CASE,
    states: STATE_CONTRACT,
    cases: blind.manifest.cases.map((c) => ({ id: c.id, changes: describeChanges(c) })),
  };
  return shell(
    `Blind benchmark labels, version ${blind.manifest.version}`,
    data,
    `<header>
<h1>Blind correctness benchmark, version ${escapeHtml(String(blind.manifest.version))}</h1>
<p class="hint">For every case, decide the state the checklist item should have under the definitions below, from the inputs alone. The author's answers are not in this file. Manifest hash: <code>${escapeHtml(blind.manifestHash)}</code></p>
<div class="row"><label>Reviewer name <input type="text" id="reviewer" autocomplete="name"></label>
<label><input type="checkbox" id="attest"> I am not ${escapeHtml(blind.manifest.author)} and labelled these cases independently.</label></div>
<div class="row"><span class="count" id="progress"></span><select id="filter" aria-label="Show"><option value="all">All cases</option><option value="open">Not labelled yet</option></select>
<button class="primary" id="download" disabled>Download labels</button><span class="problem" id="problem" role="status"></span></div>
</header>
<main id="items"></main>
<script>${WORKBOOK_SCRIPT}</script>`,
  );
}

// Browser code inside the workbook. Plain ES2020, no dependencies.
const WORKBOOK_SCRIPT = String.raw`
(() => {
  const data = JSON.parse(document.getElementById('workbook-data').textContent);
  const key = 'jky-workbook:' + (data.scopeHash || data.manifestHash);
  let state = {};
  try { state = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
  state.items = state.items || {};
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };
  const $ = (id) => document.getElementById(id);
  const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    for (const c of children) node.append(c);
    return node;
  };
  const isPack = data.kind === 'pack';
  const list = isPack ? data.sections : data.cases;
  const minimum = 20;
  $('reviewer').value = state.reviewer || '';
  $('attest').checked = !!state.attest;
  $('reviewer').oninput = () => { state.reviewer = $('reviewer').value; save(); refresh(); };
  $('attest').onchange = () => { state.attest = $('attest').checked; save(); refresh(); };
  $('filter').onchange = refresh;
  const done = (id) => {
    const item = state.items[id] || {};
    const decided = isPack ? typeof item.accepted === 'boolean' : !!item.expected;
    return decided && (item.note || '').trim().length >= minimum;
  };
  function render() {
    const main = $('items');
    main.textContent = '';
    if (!isPack) {
      const intro = el('article', {}, el('h2', { textContent: 'Base scenario for every case' }), el('ul'));
      for (const line of data.base) intro.lastChild.append(el('li', { textContent: line }));
      const contract = el('article', {}, el('h2', { textContent: 'State definitions' }), el('ul'));
      for (const [name, meaning] of Object.entries(data.states))
        contract.lastChild.append(el('li', { textContent: name + ': ' + meaning }));
      main.append(intro, contract);
    }
    list.forEach((entry, index) => {
      const item = (state.items[entry.id] = state.items[entry.id] || {});
      const card = el('article', { id: 'item-' + entry.id });
      card.dataset.id = entry.id;
      card.append(el('h2', { textContent: (index + 1) + '. ' + (isPack ? entry.title : entry.id) }));
      if (isPack) {
        card.append(
          el('p', { className: 'meta', textContent: entry.disposition.replace('_', ' ') + ' · ' + entry.source + ' · ' + entry.anchor }),
          el('blockquote', { textContent: entry.excerpt || '(Source text unavailable in this dossier.)' }),
        );
        const obligations = el('ul');
        for (const o of entry.obligations)
          obligations.append(el('li', { textContent: o.instruction + ' [' + o.disposition + (o.requirements.length ? '; checklist: ' + o.requirements.join(', ') : '') + '] ' + o.rationale }));
        card.append(el('p', { className: 'meta', textContent: 'Mapped obligations' }), obligations);
      } else {
        const changes = el('ul');
        for (const c of entry.changes) changes.append(el('li', { textContent: c }));
        card.append(el('p', { className: 'meta', textContent: 'Changes from the base scenario' }), changes);
      }
      const choices = el('div', { className: 'choices', role: 'radiogroup' });
      choices.setAttribute('aria-label', isPack ? 'Decision' : 'Expected state');
      const options = isPack ? [['true', 'Accept'], ['false', 'Reject']] : Object.keys(data.states).map((s) => [s, s]);
      for (const [value, label] of options) {
        const input = el('input', { type: 'radio', name: 'choice-' + entry.id, value });
        input.checked = isPack ? String(item.accepted) === value : item.expected === value;
        input.onchange = () => {
          if (isPack) item.accepted = value === 'true';
          else item.expected = value;
          save(); refresh();
        };
        choices.append(el('label', {}, input, label));
      }
      const note = el('textarea', { value: item.note || '' });
      note.setAttribute('aria-label', (isPack ? 'Reviewer note for ' : 'Rationale for ') + (isPack ? entry.title : entry.id));
      note.oninput = () => { item.note = note.value; save(); refresh(); };
      card.append(choices, el('label', { textContent: isPack ? 'Reviewer note (at least 20 characters)' : 'Rationale (at least 20 characters)' }), note);
      main.append(card);
    });
    refresh();
  }
  function refresh() {
    const filter = $('filter').value;
    let complete = 0;
    for (const entry of list) {
      const item = state.items[entry.id] || {};
      const card = document.getElementById('item-' + entry.id);
      const ok = done(entry.id);
      if (ok) complete++;
      if (card) {
        card.className = isPack && typeof item.accepted === 'boolean' ? (item.accepted ? 'accepted' : 'rejected') : '';
        card.hidden = (filter === 'open' && ok) || (filter === 'rejected' && item.accepted !== false);
      }
    }
    $('progress').textContent = complete + ' of ' + list.length + (isPack ? ' sections decided' : ' cases labelled');
    const reviewer = (state.reviewer || '').trim();
    const problem = !reviewer ? 'Enter your name.'
      : data.author && reviewer.toLowerCase() === data.author.toLowerCase() ? 'The author cannot review their own work.'
      : !state.attest ? 'Confirm your independence.'
      : complete < list.length ? 'Decide every item with a note of at least 20 characters.' : '';
    $('problem').textContent = problem;
    $('download').disabled = !!problem;
  }
  $('download').onclick = () => {
    const reviewer = state.reviewer.trim();
    const output = isPack
      ? { reviewer, scopeHash: data.scopeHash, signedAt: new Date().toISOString(), independenceAttested: true,
          decisions: list.map((s) => ({ sectionId: s.id, accepted: state.items[s.id].accepted, note: state.items[s.id].note.trim() })) }
      : { version: data.version, manifestHash: data.manifestHash, reviewer, independenceAttested: true,
          labels: list.map((c) => ({ id: c.id, expected: state.items[c.id].expected, rationale: state.items[c.id].note.trim() })) };
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const link = el('a', { href: URL.createObjectURL(blob), download: isPack ? 'signed-review-' + data.packId + '-' + data.version + '.json' : 'reviewer-labels-v' + data.version + '.json' });
    document.body.append(link); link.click(); link.remove();
  };
  render();
})();
`;
