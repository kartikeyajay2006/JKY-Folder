import { ExternalLink } from 'lucide-react';
import { SupportRequest } from '../components/SupportRequest';
import type { PacketCard } from '../components/WorkspaceHome';
import { uploadRules, useCatalog } from '../catalog';
import { StateMark, stateLabels, stateMeaning } from '../components/Status';
import type { CheckState, RulePack } from '../../shared/model';

const states: CheckState[] = ['pass', 'fail', 'needs_review', 'unknown', 'not_applicable'];

export function HelpView({
  pack,
  packets = [],
  activeId = '',
  demo = false,
}: {
  pack?: RulePack;
  packets?: PacketCard[];
  activeId?: string;
  demo?: boolean;
}) {
  const { limits } = useCatalog();
  const rules = uploadRules(limits);
  const steps = [
    {
      title: 'Answer the questions that decide what applies',
      text: 'Some requirements depend on your situation. Leave an answer as “not sure” until you have checked; it is never treated as “no”.',
    },
    {
      title: 'Bring your originals together',
      text: `Upload ${rules.formats} files, up to ${rules.perFile} each. Each file is inspected before it can be linked or downloaded.`,
    },
    {
      title: 'Connect each requirement to its page',
      text: 'Open a requirement, choose the supporting file and page, then compare the content with the official instructions yourself.',
    },
    {
      title: 'Save a dated review',
      text: 'A saved review keeps the checklist version and every unresolved item. When anything changes, it is marked historical.',
    },
  ];
  const faqs = [
    {
      q: 'Does “Reviewed” mean my application will be accepted?',
      a: 'No. It means the supported file checks passed and you recorded your own content review. It does not establish authenticity, eligibility or acceptance.',
    },
    {
      q: 'Why does a requirement say “Answer needed”?',
      a: 'An answer that decides whether it applies has not been confirmed. Unknown answers stay visible so the checklist never gives false confidence.',
    },
    {
      q: 'How do custom checklists work?',
      a: 'Choose a starter or paste your instructions. Each nonempty line becomes an editable item. You confirm what is required, which formats are allowed and any conditions; nothing is interpreted automatically.',
    },
    {
      q: 'What if one upload fails?',
      a: 'Every file gets its own result. Accepted files stay in your folder, rejected files show the reason, and you can retry a temporary failure.',
    },
    {
      q: 'Can it read scanned PDFs?',
      a: 'Text-based PDF pages are extracted. Image-only pages need your manual review; text recognition for scans is not available yet.',
    },
    {
      q: 'Where are my documents stored?',
      a: 'In this server’s private data directory, outside anything public. Only your signed-in account can request them. Please use fictional documents until public launch reviews are complete.',
    },
    {
      q: 'What happens when I delete a document?',
      a: 'The original, its extracted text and its evidence links are removed, along with saved reports for that application, so deleted evidence never survives in a snapshot.',
    },
  ];
  return (
    <div className="help-view">
      <section className="sheet help-steps" aria-labelledby="steps-title">
        <h2 id="steps-title">How a review comes together</h2>
        <ol>
          {steps.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="sheet help-states" aria-labelledby="states-title">
        <h2 id="states-title">What each mark means</h2>
        <dl>
          {states.map((state) => (
            <div key={state}>
              <dt>
                <StateMark state={state} size={22} />
                {stateLabels[state]}
              </dt>
              <dd>{stateMeaning[state]}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="sheet help-faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions people ask</h2>
        {faqs.map((item, i) => (
          <details key={item.q} open={i === 0}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
      <SupportRequest packets={packets} activeId={activeId} demo={demo} />
      {pack && (
        <section className="sheet help-coverage" aria-labelledby="coverage-title">
          <h2 id="coverage-title">Limits of the {pack.title} checklist</h2>
          <ul>
            {pack.limitations.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
          {pack.sourceUrl && (
            <a className="inline-link" href={pack.sourceUrl} target="_blank" rel="noreferrer">
              Read the source instructions
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </section>
      )}
    </div>
  );
}
