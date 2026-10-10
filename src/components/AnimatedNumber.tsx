import { useEffect, useRef, useState } from 'react';
import { useMotion } from '../motion/MotionProvider';
export function AnimatedNumber({ value }: { value: number }) {
  const { active } = useMotion();
  const [display, setDisplay] = useState(active ? 0 : value);
  const current = useRef(active ? 0 : value);
  useEffect(() => {
    if (!active) {
      current.current = value;
      setDisplay(value);
      return;
    }
    const from = current.current;
    if (from === value) return;
    let frame = 0,
      start: number | undefined;
    const tick = (time: number) => {
      start ??= time;
      const progress = Math.min(1, (time - start) / 600);
      const next = Math.round(from + (value - from) * (1 - Math.pow(1 - progress, 3)));
      current.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, active]);
  return (
    <span className="animated-number" data-value={value}>
      <span aria-hidden="true">{active ? display : value}</span>
      <span className="visually-hidden">{value}</span>
    </span>
  );
}
export function ReadinessRing({
  reviewed,
  total,
  onOpen,
}: {
  reviewed: number;
  total: number;
  onOpen: () => void;
}) {
  const { active } = useMotion();
  const target = total ? Math.max(0, Math.min(100, (reviewed / total) * 100)) : 0;
  const [percent, setPercent] = useState(active ? 0 : target);
  useEffect(() => {
    if (!active) {
      setPercent(target);
      return;
    }
    const frame = requestAnimationFrame(() => setPercent(target));
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return (
    <button
      className="progress-ring animated-readiness-ring"
      aria-label={`Open readiness report: ${reviewed} of ${total} evidence items reviewed`}
      title="Open your readiness report"
      onClick={onOpen}
    >
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <circle className="ring-track" cx="90" cy="90" r="82" />
        <circle
          className="ring-value"
          cx="90"
          cy="90"
          r="82"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - (active ? percent : target)}
        />
      </svg>
      <span className="ring-content">
        <strong>
          <AnimatedNumber value={reviewed} />
          <span> / {total}</span>
        </strong>
        <small>evidence items reviewed</small>
        <span className="ring-action">View report ↗</span>
      </span>
    </button>
  );
}
