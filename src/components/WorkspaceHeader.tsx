import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  FolderOpen,
  HelpCircle,
  LogOut,
  Search,
  Settings,
  UserRound,
  Zap,
} from 'lucide-react';
import { MotionToggle } from '../motion/MotionProvider';
import { ThemeToggle } from '../theme';
import { Wordmark } from './Brand';
import type { User } from '../../shared/model';
import type { WorkspaceView } from '../workspace-location';
import type { PacketCard } from './WorkspaceHome';

export const folderTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'requirements', label: 'Checklist' },
  { id: 'documents', label: 'Documents' },
  { id: 'report', label: 'Report' },
] as const;

export function WorkspaceHeader({
  user,
  view,
  search,
  onSearch,
  onNavigate,
  onSwitch,
  onLogout,
  busy,
  attention,
  documents,
  packets,
  activeId,
  searchRef,
  onQuickActions,
}: {
  user: User;
  view: WorkspaceView;
  search: string;
  onSearch: (value: string) => void;
  onNavigate: (view: WorkspaceView) => void;
  onSwitch: (id: string) => void;
  onLogout: () => void;
  busy: boolean;
  attention: number;
  documents: number;
  packets: PacketCard[];
  activeId: string;
  searchRef: React.RefObject<HTMLInputElement | null>;
  onQuickActions: () => void;
}) {
  const [open, setOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const active = packets.find((p) => p.packet.id === activeId)?.packet;
  const tabStrip = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    // Keep the current tab visible when the strip scrolls horizontally on narrow screens.
    const strip = tabStrip.current;
    const current = strip?.querySelector<HTMLElement>('.is-current');
    if (!strip || !current) return;
    const left =
      current.getBoundingClientRect().left -
      strip.getBoundingClientRect().left +
      strip.scrollLeft -
      (strip.clientWidth - current.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: 'instant' });
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
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <header className="workspace-header">
      <div className="masthead">
        <a
          className="masthead-brand"
          href={packets.length ? '?view=applications' : '?'}
          aria-label={
            packets.length ? 'JKY-Folder, all applications' : 'JKY-Folder, upload documents'
          }
          onClick={(event) => {
            event.preventDefault();
            navigate(packets.length ? 'applications' : 'overview');
          }}
        >
          <Wordmark />
        </a>
        {user.demo && <span className="demo-badge">Demo</span>}
        <label className="header-search">
          <Search size={17} aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            aria-label="Search requirements or documents"
            placeholder={view === 'applications' ? 'Find an application' : 'Search this folder'}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
          <kbd aria-hidden="true">Ctrl K</kbd>
        </label>
        <nav aria-label="Account" className="masthead-tools">
          <button
            className={`masthead-button ${view === 'activity' ? 'is-current' : ''}`}
            aria-label="Activity"
            aria-current={view === 'activity' ? 'page' : undefined}
            onClick={() => navigate('activity')}
          >
            <Activity size={17} aria-hidden="true" />
            <span>Activity</span>
          </button>
          <button
            className="masthead-button"
            aria-label="Quick actions"
            title="Quick actions (Ctrl + .)"
            onClick={onQuickActions}
          >
            <Zap size={17} aria-hidden="true" />
            <span>Quick actions</span>
          </button>
          <ThemeToggle />
          <MotionToggle />
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
              <span className="account-initials" aria-hidden="true">
                {initials}
              </span>
              <ChevronDown size={15} aria-hidden="true" />
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
                  <UserRound size={16} aria-hidden="true" />
                  Settings & privacy
                  <ArrowUpRight size={14} aria-hidden="true" />
                </button>
                <button role="menuitem" onClick={() => navigate('help')}>
                  <HelpCircle size={16} aria-hidden="true" />
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
                  <LogOut size={16} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
      <div className="folder-tabs-bar" id="workspace-navigation">
        <nav aria-label="Workspace" className="folder-tabs" ref={tabStrip}>
          {packets.length > 0 && (
            <button
              className={`folder-tab drawer-tab ${view === 'applications' ? 'is-current' : ''}`}
              aria-current={view === 'applications' ? 'page' : undefined}
              onClick={() => navigate('applications')}
            >
              <FolderOpen size={16} aria-hidden="true" />
              Applications
              <span className="count" aria-hidden="true">
                {packets.length}
              </span>
            </button>
          )}
          {active && (
            <span className="folder-name" title={active.title}>
              {packets.length > 1 ? (
                <label>
                  <span className="visually-hidden">Current application</span>
                  <select
                    value={activeId}
                    disabled={busy}
                    onChange={(event) => onSwitch(event.target.value)}
                  >
                    {packets.map((item) => (
                      <option key={item.packet.id} value={item.packet.id}>
                        {item.packet.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <span>{active.title}</span>
              )}
            </span>
          )}
          {(active ? folderTabs : []).map(({ id, label }) => (
            <button
              key={id}
              className={`folder-tab ${view === id ? 'is-current' : ''}`}
              aria-current={view === id ? 'page' : undefined}
              onClick={() => navigate(id)}
            >
              {label}
              {id === 'requirements' && attention > 0 && (
                <>
                  <span className="count attention" aria-hidden="true">
                    {attention}
                  </span>
                  <span className="visually-hidden">, {attention} need attention</span>
                </>
              )}
              {id === 'documents' && documents > 0 && (
                <span className="count" aria-hidden="true">
                  {documents}
                </span>
              )}
            </button>
          ))}
          <span className="tabs-spacer" aria-hidden="true" />
          <button
            className={`folder-tab utility-tab ${view === 'help' ? 'is-current' : ''}`}
            aria-current={view === 'help' ? 'page' : undefined}
            aria-label="Help & guidance"
            onClick={() => navigate('help')}
          >
            <HelpCircle size={16} aria-hidden="true" />
            <span>Help</span>
          </button>
          <button
            className={`folder-tab utility-tab ${view === 'settings' ? 'is-current' : ''}`}
            aria-current={view === 'settings' ? 'page' : undefined}
            aria-label="Settings & privacy"
            onClick={() => navigate('settings')}
          >
            <Settings size={16} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
}
