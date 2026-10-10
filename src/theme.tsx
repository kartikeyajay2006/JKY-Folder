import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';

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

/** One-click switch between light and dark. "Match my device" lives in Settings. */
export function ThemeToggle() {
  const { resolved, setPreference } = useTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Use ${next} theme`}
      title={`Use ${next} theme`}
      onClick={() => setPreference(next)}
    >
      {resolved === 'dark' ? (
        <Sun size={17} aria-hidden="true" />
      ) : (
        <Moon size={17} aria-hidden="true" />
      )}
    </button>
  );
}
