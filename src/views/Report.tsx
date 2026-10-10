import { Download, ExternalLink, FileCheck2, FolderDown, Printer, RefreshCw } from 'lucide-react';
import { BrandMark } from '../components/Brand';
import { Status, StateMark, dateTime } from '../components/Status';
import type { EvaluationRun, PacketDetail } from '../../shared/model';

const verdicts: Record<EvaluationRun['summary'], string> = {
  action_required: 'A few things need your attention.',
  ready_for_supported_checks: 'Your supported checks are reviewed.',
  processing: 'Some evidence is still processing.',
  review_required: 'A little more review is needed.',
};

export function ReportView({
  data,
  run,
  stale,
  busy,
  onSelect,
  onReview,
  onExport,
  onDownload,
}: {
  data: PacketDetail;
  run: EvaluationRun | undefined;
  stale: boolean;
  busy: string;
  onSelect: (id: string) => void;
  onReview: () => void;
  onExport: (run: EvaluationRun) => void;
  onDownload: () => void;
}) {
  if (!run)
    return (
      <section className="sheet report-empty" aria-labelledby="report-empty-title">
        <div className="report-empty-paper" aria-hidden="true">
          <FileCheck2 size={30} />
          <span />
          <span />
          <span />
        </div>
        <div>
          <h2 id="report-empty-title">Your first review is waiting.</h2>
          <p>
            Saving a review records every requirement, its evidence and anything unresolved, with
            the date and the version of the checklist used.
          </p>
          <button className="primary" disabled={!!busy} onClick={onReview}>
            {busy === 'evaluate' ? 'Saving review…' : 'Save my first review'}
          </button>
        </div>
      </section>
    );
  const unresolved = run.counts.unknown + run.counts.needs_review + run.counts.pending;
  const action = run.counts.fail + run.counts.error;
  const verdictState =
    run.summary === 'ready_for_supported_checks'
      ? 'pass'
      : run.summary === 'action_required'
        ? 'fail'
        : run.summary === 'processing'
          ? 'pending'
          : 'needs_review';
  return (
    <div className="report-view">
      <div className="report-toolbar no-print">
        {data.runs.length > 1 ? (
          <label className="report-history">
            Review history
            <select value={run.id} onChange={(e) => onSelect(e.target.value)}>
              {data.runs.map((r, i) => (
                <option key={r.id} value={r.id}>
                  {i === 0 ? 'Latest: ' : ''}revision {r.packetRevision}, {dateTime(r.createdAt)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="microcopy">One saved review</span>
        )}
        <div className="button-row">
          <button className="outline" onClick={() => onExport(run)} disabled={!!busy}>
            <Download size={16} aria-hidden="true" />
            Export JSON
          </button>
          <button className="outline" onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" />
            Print / PDF
          </button>
          <button className="outline" onClick={onDownload} disabled={!!busy}>
            <FolderDown size={16} aria-hidden="true" />
            Download folder
          </button>
        </div>
      </div>
      {stale && (
        <div className="stale-banner no-print" role="status">
          <RefreshCw size={18} aria-hidden="true" />
          <span>This report is historical. Your packet, checklist or evaluator has changed.</span>
          <button className="text-link" onClick={onReview} disabled={!!busy}>
            Run a fresh review
          </button>
        </div>
      )}
      <article className={`report-paper ${stale ? 'is-stale' : ''}`} aria-labelledby="report-title">
        <header className="letterhead">
          <span className="letterhead-brand">
            <BrandMark />
            JKY-Folder readiness review
          </span>
          <div className={`report-stamp ${stale ? 'stamp-old' : ''}`}>
            <span>{stale ? 'Historical' : 'Saved'}</span>
            <strong className="data">{dateTime(run.createdAt)}</strong>
            <span className="data">Revision {run.packetRevision}</span>
          </div>
        </header>
        <h2 id="report-title">{data.packet.title}</h2>
        <p className="report-subtitle">
          Checked against {run.checklist?.title || data.pack.title}
          {data.packet.destination ? ` for ${data.packet.destination}` : ''}.
        </p>
        <div className={`report-verdict verdict-${verdictState}`}>
          <StateMark state={verdictState} size={40} />
          <div>
            <h3>{verdicts[run.summary]}</h3>
            <p>
              <strong className="data">{run.counts.pass}</strong> reviewed,{' '}
              <strong className="data">{action}</strong> to fix,{' '}
              <strong className="data">{unresolved}</strong> unresolved,{' '}
              <strong className="data">{run.counts.not_applicable}</strong> not required.
            </p>
          </div>
        </div>
        <table className="report-table">
          <caption className="visually-hidden">Every requirement in this review</caption>
          <thead>
            <tr>
              <th scope="col">Requirement</th>
              <th scope="col">Evidence</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            {run.checks.map((check) => (
              <tr key={check.requirementId} className={`report-row row-${check.state}`}>
                <th scope="row">
                  <span className="report-requirement">{check.title}</span>
                  <span className="report-reason">{check.reason}</span>
                  {check.reviewNote && <blockquote>{check.reviewNote}</blockquote>}
                </th>
                <td>
                  {check.evidence ? (
                    <>
                      <span className="data">{check.evidence.name}</span>
                      <span className="report-reason">
                        page {check.evidence.pageFrom}
                        {check.evidence.pageTo !== check.evidence.pageFrom
                          ? `–${check.evidence.pageTo}`
                          : ''}
                        ,{' '}
                        {check.verification === 'user'
                          ? 'your content confirmation'
                          : 'technical check only'}
                      </span>
                    </>
                  ) : (
                    <span className="report-reason">None linked</span>
                  )}
                </td>
                <td>
                  <Status state={check.state} missing={!check.evidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <section className="report-limits" aria-labelledby="limits-title">
          <h3 id="limits-title">What this review does not establish</h3>
          <ul>
            {run.limitations.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
          {(run.checklist?.sourceUrl ?? data.pack.sourceUrl) && (
            <a
              className="inline-link"
              href={run.checklist?.sourceUrl ?? data.pack.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Source instructions
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </section>
        <footer className="report-footer data">
          <span>Checklist {run.packVersion}</span>
          <span>Evaluator {run.evaluatorVersion}</span>
          <span>Run {run.id.slice(0, 8)}</span>
        </footer>
      </article>
    </div>
  );
}
