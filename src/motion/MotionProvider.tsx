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
  useEffect(() => {
    if (!active) return;
    return startSurfaceMotion();
  }, [active]);
  useEffect(() => {
    // Continuous effects pause while the tab is hidden.
    const visibility = () => {
      document.documentElement.dataset.motionVisibility = document.hidden ? 'hidden' : 'visible';
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
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
      {active ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
    </button>
  );
}

const glareSurfaces = '.folder-card,.starter-tile,.catalog-folder,.template-card';

/**
 * Scroll reveals for [data-reveal] elements and a metallic glare that follows the pointer
 * across cards. Returns a cleanup that restores every element to its resting state.
 */
function startSurfaceMotion() {
  const root = document.documentElement;
  const reveal = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        reveal.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  const watch = (scope: ParentNode) =>
    scope.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => reveal.observe(el));
  watch(document);
  const mutations = new MutationObserver((records) => {
    for (const record of records)
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches('[data-reveal]')) reveal.observe(node);
        watch(node);
      });
  });
  mutations.observe(document.body, { childList: true, subtree: true });
  root.dataset.revealArmed = '';

  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let surface: HTMLElement | null = null;
  let point = { x: 0, y: 0 };
  const move = (event: PointerEvent) => {
    if (!fine.matches) return;
    surface = (event.target as Element).closest<HTMLElement>(glareSurfaces);
    if (!surface || frame) return;
    point = { x: event.clientX, y: event.clientY };
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!surface) return;
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty('--mx', `${point.x - rect.left}px`);
      surface.style.setProperty('--my', `${point.y - rect.top}px`);
    });
  };
  document.addEventListener('pointermove', move, { passive: true });
  return () => {
    reveal.disconnect();
    mutations.disconnect();
    cancelAnimationFrame(frame);
    document.removeEventListener('pointermove', move);
    delete root.dataset.revealArmed;
    document.querySelectorAll('.is-revealed').forEach((el) => el.classList.remove('is-revealed'));
  };
}
