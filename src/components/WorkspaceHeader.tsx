import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  Files,
  FileCheck2,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Search,
  Settings,
  UserRound,
} from 'lucide-react';
import type { User } from '../../shared/model';
import type { WorkspaceView } from '../workspace-location';

export const navigation = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'applications', label: 'Applications', Icon: FolderOpen },
  { id: 'requirements', label: 'Requirements', Icon: ListChecks },
  { id: 'documents', label: 'My documents', Icon: Files },
  { id: 'report', label: 'Readiness report', Icon: FileCheck2 },
  { id: 'activity', label: 'Activity', Icon: Activity },
] as const;

export function WorkspaceHeader({
  user,
  view,
  search,
  onSearch,
  onNavigate,
  onLogout,
  busy,
  attention,
  searchRef,
}: {
  user: User;
  view: WorkspaceView;
  search: string;
  onSearch: (value: string) => void;
  onNavigate: (view: WorkspaceView) => void;
  onLogout: () => void;
  busy: boolean;
  attention: number;
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const activeTab = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const tab = activeTab.current;
    const strip = tab?.parentElement;
    if (tab && strip) {
      const left =
        tab.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
      strip.scrollTo({
        left: left - (strip.clientWidth - tab.clientWidth) / 2,
        behavior: 'instant',
      });
    }
  }, [view]);
  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!account.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const buttons = Array.from(
          account.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') || [],
        );
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault();
        buttons[
          (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
        ]?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  function navigate(next: WorkspaceView) {
    setOpen(false);
    onNavigate(next);
  }
  return (
    <header className="workspace-header">
      <div className="masthead">
        <a
          className="product-brand"
          href="?view=overview"
          onClick={(event) => {
            event.preventDefault();
            navigate('overview');
          }}
        >
          <img src="/favicon.svg" alt="" width="34" height="34" />
          <span>
            JKY<span className="brand-dash">—</span>Folder<span className="brand-period">.</span>
          </span>
        </a>
        <span className="workspace-edition">
          <span />
          {user.demo ? 'Demo workspace' : 'Personal workspace'}
        </span>
        <div className="masthead-tools">
          <label className="header-search">
            <Search size={16} />
            <input
              ref={searchRef}
              aria-label="Search requirements or documents"
              placeholder={
                view === 'applications' ? 'Find an application…' : 'Search your workspace…'
              }
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
            <kbd>⌘ K</kbd>
          </label>
          <div
            className="account-menu"
            ref={account}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
            }}
          >
            <button
              ref={trigger}
              className="account-trigger"
              aria-label="Open account menu"
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls="account-menu"
              onClick={() => setOpen(!open)}
            >
              <span className="account-initials">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span className="account-first-name">{user.name.split(' ')[0]}</span>
              <ChevronDown size={14} />
            </button>
            {open && (
              <div
                className="account-dropdown"
                id="account-menu"
                role="menu"
                aria-label="Account actions"
              >
                <div className="account-summary">
                  <strong>{user.name}</strong>
                  <span>{user.demo ? 'Fictional demo account' : user.email}</span>
                </div>
                <button ref={first} role="menuitem" onClick={() => navigate('settings')}>
                  <UserRound size={16} />
                  Settings & privacy
                  <ArrowUpRight size={14} />
                </button>
                <button role="menuitem" onClick={() => navigate('help')}>
                  <HelpCircle size={16} />
                  Help & guidance
                </button>
                <button
                  role="menuitem"
                  disabled={busy}
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="navigation-bar" id="workspace-navigation">
        <nav aria-label="Workspace" className="workspace-tabs">
          {navigation.map(({ id, label, Icon }) => (
            <button
              ref={view === id ? activeTab : undefined}
              key={id}
              className={`workspace-tab ${view === id ? 'is-current' : ''}`}
              aria-current={view === id ? 'page' : undefined}
              onClick={() => navigate(id)}
            >
              <Icon size={16} />
              {label}
              {id === 'requirements' && attention > 0 && (
                <span className="tab-count">{attention}</span>
              )}
            </button>
          ))}
        </nav>
        <nav aria-label="Workspace support" className="workspace-support">
          <button
            className={view === 'help' ? 'is-current' : ''}
            aria-current={view === 'help' ? 'page' : undefined}
            aria-label="Help & guidance"
            onClick={() => navigate('help')}
          >
            <HelpCircle size={17} />
            <span>Help</span>
          </button>
          <button
            className={view === 'settings' ? 'is-current' : ''}
            aria-current={view === 'settings' ? 'page' : undefined}
            aria-label="Settings & privacy"
            onClick={() => navigate('settings')}
          >
            <Settings size={17} />
          </button>
        </nav>
      </div>
    </header>
  );
}
