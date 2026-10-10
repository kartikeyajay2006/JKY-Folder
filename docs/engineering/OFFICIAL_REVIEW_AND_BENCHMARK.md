# Official pack and independent benchmark review

The bundled UCEED examination-registration reference now inventories the official registration page, FAQ and 74-page information brochure. It has 18 document requirements, 97 source obligations and 76 coverage sections. NIOS appearing candidates have the FAQ 17 alternative; category evidence is separated by category; scribe medical recommendations are separated by the specified and other routes. Dyslexia requires both forms. Appendix content is included in the review coverage, including issuer, signature, attestation, validity and open-school exceptions.

This is a scoped, author-curated draft. Independent completeness sign-off is **pending**. It does not claim to cover later B.Des. admission, institutional fee payment, examination conduct or eligibility certification. Legal and medical interpretation, portrait date/quality, foreign-national boundary ambiguities and issuer authenticity remain explicitly outside automatic checks. Applicants still choose a reference explicitly after uploading their own originals; accounts receive no seeded folders or requirements.

Prepare a reproducible private dossier from downloaded official originals:

```
DATA_DIR=/private/review npm run rules -- prepare-uceed --registration /private/registration.html --faq /private/faq.html --brochure /private/brochure.pdf --file /private/dossier.json --actor AUTHOR
```

Preparation records exact content hashes and anchors, imports source snapshots, stores a draft, and writes a private dossier with complete captured content and a scope hash. The operator source parser supports up to 100 pages, separately from applicant intake resource limits. The dossier contains every source coverage section, mapped obligations, unsupported determinations and rule predicates. Read original pages, not just labels or extracted text.

To make that review practical without giving the reviewer server access, generate an offline workbook from the dossier:

```
npm run rules -- review-sheet --dossier /private/dossier.json --out /private/uceed-review.html
```

The workbook is one self-contained HTML file with a strict content-security policy and no network access. It shows every coverage section with its captured source text, mapped obligations and rule predicates, saves progress in the reviewer's own browser, refuses the pack author as reviewer, and requires an independence attestation and a substantive note for each section before **Download signed review** produces the record described next.

A separate human reviewer supplies a review record with `reviewer`, `scopeHash`, `signedAt`, `independenceAttested: true` and one accepted decision plus substantive note for every coverage section. Use `rules review --id uceed-2027-reference --version 2027.reference.3 --actor REVIEWER --file signed-review.json`, then `rules publish` with the same reviewer. Incomplete coverage, self-review, changed content, rejected sections and stale scope hashes block approval. A typed actor name alone is not identity verification; the operator must retain signed evidence and verify reviewer independence. User authorization cannot substitute for independent sign-off.

The version 2 correctness corpus adds separately specified positive, missing-evidence, conditional, exact-boundary, combination, OCR and date cases alongside the earlier 312 negative regressions. Expected answers follow the written contract and were not generated from evaluator results. It remains author-labelled until externally adjudicated.

```
npm run benchmark:review -- export /private/blind-packets.json
npm run benchmark:review -- adjudicate /private/reviewer-labels.json /private/adjudication.json
```

For reviewers who prefer not to edit JSON, `npm run benchmark:review -- sheet /private/blind-packets.json /private/labels.html` writes an equivalent offline labelling workbook. It contains no expected answers or rationales, shows the written state definitions beside each case, and **Download labels** produces the file that `adjudicate` imports.

Blind exports exclude expected answers and rationales. Reviewers inspect packet inputs, original synthetic evidence, source constraints and applicability; supply one label and rationale per case using the provided template. Import verifies an immutable manifest hash, complete unique IDs, a separate reviewer and independence attestation. Disagreements are retained for adjudication rather than silently replacing answers. Review labels and operator identity evidence are private artifacts, not launch approval fabricated by the implementation.
