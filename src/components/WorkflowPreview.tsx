import { useId, useRef, useState } from 'react';
import {
  FileCheck2,
  FileText,
  Link2,
  Check,
  TriangleAlert,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
const steps = [
  { title: 'Define', description: 'Start from the requirement' },
  { title: 'Connect', description: 'Find its supporting page' },
  { title: 'Review', description: 'Know what still needs checking' },
];
export function WorkflowPreview() {
  const [step, setStep] = useState(0);
  const id = useId();
  const tabs = useRef<HTMLButtonElement[]>([]);
  function select(next: number) {
    setStep(next);
    tabs.current[next]?.focus();
  }
  return (
    <div className="evidence-example interactive-workflow">
      <div className="example-window-header">
        <span>
          <span />
          <span />
          <span />
        </span>
        <span>TRY THE WORKFLOW · EXAMPLE</span>
      </div>
      <div
        className="workflow-preview-tabs"
        role="tablist"
        aria-label="Example application workflow"
      >
        {steps.map(({ title }, i) => (
          <button
            key={title}
            ref={(element) => {
              if (element) tabs.current[i] = element;
            }}
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel-${i}`}
            role="tab"
            aria-selected={step === i}
            tabIndex={step === i ? 0 : -1}
            onClick={() => setStep(i)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                select((i + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3);
              }
              if (event.key === 'Home') {
                event.preventDefault();
                select(0);
              }
              if (event.key === 'End') {
                event.preventDefault();
                select(2);
              }
            }}
          >
            <span>0{i + 1}</span>
            {title}
          </button>
        ))}
      </div>
      {steps.map((definition, index) => (
        <div
          key={index}
          hidden={step !== index}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          tabIndex={0}
          className="example-window-body workflow-preview-panel"
        >
          <div className="example-window-title">
            <span className="example-symbol">
              <FileCheck2 size={23} />
            </span>
            <div>
              <small>{definition.description.toUpperCase()}</small>
              <h3>Academic transcript</h3>
            </div>
          </div>
          {index === 0 ? (
            <>
              <p className="workflow-preview-description">
                An editable checklist item based on the instructions you received.
              </p>
              <div className="preview-rule">
                <span>Required document</span>
                <strong>Academic transcript</strong>
              </div>
              <div className="preview-rule">
                <span>Accepted format</span>
                <strong>PDF</strong>
              </div>
              <div className="preview-rule">
                <span>Content review</span>
                <strong>Compare with your instructions</strong>
              </div>
            </>
          ) : index === 1 ? (
            <>
              <div className="example-connection">
                <Link2 size={15} />
                <span>Connect the requirement to a specific page</span>
              </div>
              <div className="example-file">
                <FileText size={23} />
                <div>
                  <strong>transcript.pdf</strong>
                  <span>Original document · page 1</span>
                </div>
                <Check size={17} />
              </div>
              <div className="preview-document-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p className="workflow-preview-description">
                Open the original before recording your content review.
              </p>
            </>
          ) : (
            <>
              <div className="preview-finding">
                <Check size={17} />
                <div>
                  <strong>PDF format checked</strong>
                  <small>A supported technical check.</small>
                </div>
              </div>
              <div className="preview-finding needs-review">
                <TriangleAlert size={17} />
                <div>
                  <strong>Your content review is still needed</strong>
                  <small>Confirm the right applicant and record what you inspected.</small>
                </div>
              </div>
              <div className="example-review">
                <ShieldCheck size={19} />
                <div>
                  <strong>Keep the uncertainty visible.</strong>
                  <p>A file-format pass is separate from your own content confirmation.</p>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
      <div className="workflow-preview-footer">
        <span>Illustration only · No acceptance guarantee.</span>
        <button type="button" onClick={() => setStep((step + 1) % 3)}>
          {step === 2 ? 'Start again' : 'Next step'}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
