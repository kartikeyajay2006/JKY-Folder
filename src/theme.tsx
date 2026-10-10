import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import { useMotion } from './motion/MotionProvider';

export type ThemePreference = 'system' | 'light' | 'dark';
const key = 'jky-theme';
const ThemeContext = createContext({
  preference: 'system' as ThemePreference,
  resolved: 'light' as 'light' | 'dark',
  setPreference: (_: ThemePreference) => {},
});

function stored(): ThemePreference {
  try {
    const value = localStorage.getItem(key);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(stored);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (preference === 'system') delete root.dataset.theme;
    else root.dataset.theme = preference;
  }, [preference]);
  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    try {
      if (next === 'system') localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    } catch {}
  }
  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);

/** One-click switch between Gold (light) and Silver (dark). "Match my device" lives in Settings. */
export function ThemeToggle() {
  const { resolved, setPreference } = useTheme();
  const { active } = useMotion();
  const next = resolved === 'dark' ? 'light' : 'dark';
  const name = next === 'dark' ? 'Silver' : 'Gold';
  function change(event: React.MouseEvent<HTMLButtonElement>) {
    if (!active || !document.startViewTransition) {
      setPreference(next);
      return;
    }
    // The new theme spreads out from the button in a widening circle.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    root.classList.add('theme-switching');
    const transition = document.startViewTransition(() => flushSync(() => setPreference(next)));
    void transition.ready
      .then(() =>
        root.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {
            duration: 700,
            easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        ),
      )
      .catch(() => {});
    void transition.finished.finally(() => root.classList.remove('theme-switching'));
  }
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Use ${next} theme`}
      title={`Switch to ${name}`}
      onClick={change}
    >
      {resolved === 'dark' ? (
        <Sun size={17} aria-hidden="true" />
      ) : (
        <Moon size={17} aria-hidden="true" />
      )}
    </button>
  );
}
