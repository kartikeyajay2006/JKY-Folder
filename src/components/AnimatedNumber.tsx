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
