import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useCatalog } from '../catalog';
import { BrandMark } from './Brand';
import { FileGlyph, Seal } from './Marks';
import { useMotion } from '../motion/MotionProvider';
import { StateMark, Status, stateLabels } from './Status';
import type { CheckState } from '../../shared/model';

const tabs = ['Checklist', 'Documents', 'Report'] as const;
const exampleStates: CheckState[] = ['pass', 'pass', 'needs_review', 'unknown', 'fail'];
const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * The landing page's folder. It is built from the first reference checklist in the catalog and
 * labelled as an example: the states shown are illustrative, the requirement names are real.
 */
export function HeroFolder() {
  const { packs, templates } = useCatalog();
  const [tab, setTabState] = useState(0);
  // The orchestrated intro plays once; later tab changes use short, direct transitions.
  const [intro, setIntro] = useState(true);
  const [settled, setSettled] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const figure = useRef<HTMLElement>(null);
  const { active } = useMotion();
  useEffect(() => {
    // After the arrival sequence the folder idles gently; it rests while off screen.
    if (!active) return;
    const timer = setTimeout(() => setSettled(true), 3600);
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
    if (figure.current) observer.observe(figure.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [active]);
  const setTab = (next: number) => {
    setIntro(false);
    setTabState(next);
  };
  const id = useId();
  const buttons = useRef<HTMLButtonElement[]>([]);
  const pack = packs[0];
  const rows = useMemo(() => {
    // Three unconditional items, then two conditional ones that depend on different questions:
    // one still waiting for an answer, one whose evidence is missing.
    const conditional = pack?.items.filter((i) => i.conditional) || [];
    const waiting = conditional[0];
    const missing = conditional.find(
      (i) => !i.dependsOn.some((f) => waiting?.dependsOn.includes(f)),
    );
    const items = pack
      ? [...pack.items.filter((i) => !i.conditional).slice(0, 3), waiting, missing]
      : templates[0]?.starter.map((r) => ({ title: r.title, mime: r.mime, conditional: false }));
    return (items || [])
      .filter((item): item is NonNullable<typeof item> => !!item)
      .slice(0, 5)
      .map((item, i) => ({
        title: item.title,
        state: exampleStates[i],
        file: `${slug(item.title)}${item.mime === 'image/jpeg' ? '.jpg' : '.pdf'}`,
        mime: item.mime === 'image/jpeg' ? 'image/jpeg' : 'application/pdf',
      }));
  }, [pack, templates]);
  const linked = rows.filter((r) => r.state === 'pass' || r.state === 'needs_review');
  const count = (state: CheckState) => rows.filter((r) => r.state === state).length;
  function select(next: number) {
    setTab(next);
    buttons.current[next]?.focus();
  }
  return (
    <figure
      ref={figure}
      className={`hero-folder ${intro ? 'is-intro' : ''} ${settled ? 'is-settled' : ''} ${offscreen ? 'is-offscreen' : ''}`}
      aria-label="An example application folder"
    >
      <div className="hf-stage">
        <div className="hf-tabs" role="tablist" aria-label="Example folder sections">
          {tabs.map((label, i) => (
            <button
              key={label}
              ref={(element) => {
                if (element) buttons.current[i] = element;
              }}
              id={`${id}-tab-${i}`}
              role="tab"
              aria-selected={tab === i}
              aria-controls={`${id}-panel`}
              tabIndex={tab === i ? 0 : -1}
              className={`hf-tab ${tab === i ? 'is-current' : ''}`}
              style={{ '--tab': i } as CSSProperties}
              onClick={() => setTab(i)}
              onKeyDown={(event) => {
                const keys: Record<string, number> = {
                  ArrowRight: (i + 1) % tabs.length,
                  ArrowLeft: (i - 1 + tabs.length) % tabs.length,
                  Home: 0,
                  End: tabs.length - 1,
                };
                if (event.key in keys) {
                  event.preventDefault();
                  select(keys[event.key]);
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="hf-back">
          <div
            className="hf-sheet"
            key={tab}
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${tab}`}
            tabIndex={0}
          >
            <div className="hf-sheet-head">
              <span>{pack ? `${pack.title} application` : 'Your application'}</span>
              <span className="hf-example">Example</span>
            </div>
            {tab === 0 && (
              <ol className="hf-checklist">
                {rows.map((row, i) => (
                  <li key={row.title} style={{ '--row': i } as CSSProperties}>
                    <StateMark state={row.state} size={24} />
                    <span>{row.title}</span>
                    <span className={`hf-note note-${row.state}`}>
                      {row.state === 'fail' ? 'Missing' : stateLabels[row.state]}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {tab === 1 && (
              <ul className="hf-documents">
                {linked.map((row, i) => (
                  <li key={row.file} style={{ '--row': i } as CSSProperties}>
                    <FileGlyph mime={row.mime} size={26} />
                    <span>
                      <strong className="data">{row.file}</strong>
                      <small>Linked to {row.title}, page 1</small>
                    </span>
                  </li>
                ))}
                <li className="hf-drop" style={{ '--row': linked.length } as CSSProperties}>
                  Drop the missing original here
                </li>
              </ul>
            )}
            {tab === 2 && (
              <div className="hf-report">
                <div className="hf-letterhead">
                  <BrandMark />
                  <span className="hf-stamp">Saved review</span>
                </div>
                <p className="hf-verdict">A few things need your attention.</p>
                <ul>
                  {(['pass', 'fail', 'needs_review', 'unknown'] as CheckState[]).map((state) => (
                    <li key={state}>
                      <Status state={state} missing={state === 'fail'} />
                      <span className="data">{count(state)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="hf-front" aria-hidden="true">
          <span className="hf-label">
            {pack ? `${pack.title}, ${pack.requirementCount} items` : 'Application folder'}
          </span>
        </div>
        {tab === 0 && (
          <div className="hf-seal" aria-hidden="true">
            <span className="hf-seal-ring" />
            <Seal />
          </div>
        )}
      </div>
      <figcaption className="visually-hidden">
        Example only. Requirement names come from the {pack?.title || 'starter'} checklist; the
        states shown are illustrative.
      </figcaption>
    </figure>
  );
}
