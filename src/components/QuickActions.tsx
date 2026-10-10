import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Upload,
  FileCheck2,
  FolderOpen,
  ListChecks,
  Files,
  Activity,
  Settings,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Dialog } from './Dialog';
import type { WorkspaceView } from '../workspace-location';
export function QuickActions({
  hasApplication,
  busy,
  onClose,
  onCreate,
  onUpload,
  onReview,
  onNavigate,
}: {
  hasApplication: boolean;
  busy: boolean;
  onClose: () => void;
  onCreate: () => void;
  onUpload: () => void;
  onReview: () => void;
  onNavigate: (view: WorkspaceView) => void;
}) {
  const [query, setQuery] = useState('');
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    search.current?.focus();
  }, []);
  const items = useRef<HTMLButtonElement[]>([]);
  const actions = [
    {
      id: 'create',
      title: 'Create an application',
      hint: 'Choose a starter or use your instructions',
      Icon: Plus,
      action: onCreate,
      disabled: busy,
    },
    {
      id: 'upload',
      title: 'Upload documents',
      hint: hasApplication
        ? 'Add originals to the current application'
        : 'Choose files, then create their application',
      Icon: Upload,
      action: onUpload,
      disabled: busy,
    },
    {
      id: 'review',
      title: 'Run a readiness review',
      hint: hasApplication
        ? 'Save a dated snapshot of your checks'
        : 'Create an application before running a review',
      Icon: FileCheck2,
      action: onReview,
      disabled: busy || !hasApplication,
    },
    ...(
      [
        ['applications', 'Your applications', 'Open, archive or restore a folder', FolderOpen],
        [
          'requirements',
          'Document checklist',
          'Connect each requirement to supporting evidence',
          ListChecks,
        ],
        ['documents', 'Document library', 'Inspect and download your originals', Files],
        ['report', 'Readiness report', 'Inspect saved findings and export your report', FileCheck2],
        ['activity', 'Workspace activity', 'See real events in your account', Activity],
        ['settings', 'Settings & privacy', 'Manage your profile, password and sessions', Settings],
        ['help', 'Help center', 'Understand the workflow and checklist limits', HelpCircle],
      ] as const
    ).map(([id, title, hint, Icon]) => ({
      id,
      title,
      hint,
      Icon,
      action: () => onNavigate(id),
      disabled: false,
    })),
  ].filter((item) => `${item.title} ${item.hint}`.toLowerCase().includes(query.toLowerCase()));
  function move(current: number, direction: number) {
    for (let i = 1; i <= actions.length; i++) {
      const next = (current + direction * i + actions.length) % actions.length;
      if (!actions[next].disabled) {
        items.current[next]?.focus();
        break;
      }
    }
  }
  return (
    <Dialog title="Quick actions" onClose={onClose}>
      <div className="quick-actions-body">
        <label className="quick-search">
          <Search size={19} />
          <input
            ref={search}
            aria-label="Search quick actions"
            placeholder="What would you like to do?"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                move(-1, 1);
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                const first = actions.find((item) => !item.disabled);
                if (first) {
                  onClose();
                  first.action();
                }
              }
            }}
          />
        </label>
        <div className="command-results" role="group" aria-label="Available actions">
          {actions.map(({ id, title, hint, Icon, action, disabled }, i) => (
            <button
              ref={(element) => {
                if (element) items.current[i] = element;
              }}
              key={id}
              className="command-item"
              disabled={disabled}
              onClick={() => {
                onClose();
                action();
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  move(i, event.key === 'ArrowDown' ? 1 : -1);
                }
              }}
            >
              <span className="command-icon">
                <Icon size={18} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{hint}</small>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
          {!actions.length && (
            <p className="empty-small" role="status">
              No matching actions. Try “upload”, “review” or “settings”.
            </p>
          )}
        </div>
        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to navigate · <kbd>Enter</kbd> to choose
          </span>
          <span>
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </Dialog>
  );
}
