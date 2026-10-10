import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
const key = 'jky-motion-enabled';
const MotionContext = createContext({
  active: true,
  reduced: false,
  enabled: true,
  toggle: () => {},
});
export function MotionProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(key) !== 'false';
    } catch {
      return true;
    }
  });
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const active = enabled && !reduced;
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = active ? 'on' : 'off';
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [active]);
  function toggle() {
    setEnabled((previous) => {
      const next = !previous;
      try {
        localStorage.setItem(key, String(next));
      } catch {}
      return next;
    });
  }
  return (
    <MotionContext.Provider value={{ active, reduced, enabled, toggle }}>
      {children}
    </MotionContext.Provider>
  );
}
export const useMotion = () => useContext(MotionContext);
export function MotionToggle() {
  const { active, reduced, toggle } = useMotion();
  return (
    <button
      type="button"
      className="motion-toggle"
      disabled={reduced}
      aria-label={
        reduced
          ? 'System reduced motion is enabled'
          : active
            ? 'Pause animations'
            : 'Resume animations'
      }
      title={
        reduced
          ? 'Your system has reduced motion enabled'
          : active
            ? 'Pause animations'
            : 'Resume animations'
      }
      aria-pressed={!active}
      onClick={toggle}
    >
      {active ? <Pause size={15} /> : <Play size={15} />}
    </button>
  );
}
