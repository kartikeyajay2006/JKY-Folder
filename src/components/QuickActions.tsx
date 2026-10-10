import { useEffect, useRef, useState, type ComponentType } from 'react';
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
  FileText,
} from 'lucide-react';
import { Dialog } from './Dialog';
import { StateMark, stateLabels } from './Status';
import type { CheckResult, DocumentRecord } from '../../shared/model';
import type { WorkspaceView } from '../workspace-location';
import type { PacketCard } from './WorkspaceHome';

interface Command {
  id: string;
  title: string;
  hint: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  /** Only listed once the person starts typing, to keep the first view short. */
  searchOnly?: boolean;
}
const icon = (Icon: ComponentType<{ size?: number }>) => <Icon size={18} />;

/**
 * A command palette over real workspace data: actions, sections, every application,
 * the current checklist and the current documents.
 */
export function QuickActions({
  hasApplication,
  busy,
  packets,
  activeId,
  checks,
  documents,
  onClose,
  onCreate,
  onUpload,
  onReview,
  onNavigate,
  onOpenApplication,
  onOpenRequirement,
  onOpenDocument,
}: {
  hasApplication: boolean;
  busy: boolean;
  packets: PacketCard[];
  activeId: string;
  checks: CheckResult[];
  documents: DocumentRecord[];
  onClose: () => void;
  onCreate: () => void;
  onUpload: () => void;
  onReview: () => void;
  onNavigate: (view: WorkspaceView) => void;
  onOpenApplication: (id: string) => void;
  onOpenRequirement: (id: string) => void;
  onOpenDocument: (doc: DocumentRecord) => void;
}) {
  const [query, setQuery] = useState('');
  const search = useRef<HTMLInputElement>(null);
  const items = useRef<HTMLButtonElement[]>([]);
  useEffect(() => {
    search.current?.focus();
  }, []);
  const sections: [WorkspaceView, string, string, ComponentType<{ size?: number }>][] = [
    ['applications', 'Your applications', 'Open, archive or restore a folder', FolderOpen],
    ['requirements', 'Checklist', 'Connect each requirement to supporting evidence', ListChecks],
    ['documents', 'Documents', 'Inspect and download your originals', Files],
    ['report', 'Readiness report', 'Inspect saved findings and export your report', FileCheck2],
    ['activity', 'Activity', 'Everything saved in your workspace', Activity],
    ['settings', 'Settings & privacy', 'Profile, password, sessions and appearance', Settings],
    ['help', 'Help & guidance', 'How the checklist works and its limits', HelpCircle],
  ];
  const all: Command[] = [
    {
      id: 'create',
      group: 'Actions',
      title: 'Create an application',
      hint: 'Choose a starter or use your instructions',
      icon: icon(Plus),
      action: onCreate,
      disabled: busy,
    },
    {
      id: 'upload',
      group: 'Actions',
      title: 'Upload documents',
      hint: hasApplication
        ? 'Add originals to the current application'
        : 'Choose files, then create their application',
      icon: icon(Upload),
      action: onUpload,
      disabled: busy,
    },
    {
      id: 'review',
      group: 'Actions',
      title: 'Run a readiness review',
      hint: hasApplication
        ? 'Save a dated snapshot of your checks'
        : 'Create an application before running a review',
      icon: icon(FileCheck2),
      action: onReview,
      disabled: busy || !hasApplication,
    },
    ...sections.map(([id, title, hint, Icon]) => ({
      id: `view-${id}`,
      group: 'Go to',
      title,
      hint,
      icon: icon(Icon),
      action: () => onNavigate(id),
    })),
    ...checks.map((check) => ({
      id: `requirement-${check.requirementId}`,
      group: 'This checklist',
      title: check.title,
      hint: `${check.state === 'fail' && !check.evidence ? 'Missing' : stateLabels[check.state]}${check.evidence ? `, linked to ${check.evidence.name}` : ''}`,
      icon: <StateMark state={check.state} size={20} />,
      action: () => onOpenRequirement(check.requirementId),
      searchOnly: true,
    })),
    ...documents.map((doc) => ({
      id: `document-${doc.id}`,
      group: 'Documents',
      title: doc.name,
      hint: doc.status === 'ready' ? 'Preview the original' : 'Still being inspected',
      icon: icon(FileText),
      action: () => onOpenDocument(doc),
      searchOnly: true,
    })),
    ...packets
      .filter((p) => p.packet.id !== activeId)
      .map(({ packet }) => ({
        id: `application-${packet.id}`,
        group: 'Applications',
        title: packet.title,
        hint: packet.archived ? 'Archived application' : packet.destination || 'Open its overview',
        icon: icon(FolderOpen),
        action: () => onOpenApplication(packet.id),
        searchOnly: packets.length > 4,
      })),
  ];
  const needle = query.trim().toLowerCase();
  const actions = all.filter((item) =>
    needle ? `${item.title} ${item.hint}`.toLowerCase().includes(needle) : !item.searchOnly,
  );
  const groups = [...new Set(actions.map((a) => a.group))];
  items.current = [];
  function move(current: number, direction: number) {
    for (let i = 1; i <= actions.length; i++) {
      const next = (current + direction * i + actions.length) % actions.length;
      if (!actions[next].disabled) {
        items.current[next]?.focus();
        break;
      }
    }
  }
  function run(item: Command) {
    onClose();
    item.action();
  }
  let index = -1;
  return (
    <Dialog title="Quick actions" onClose={onClose}>
      <div className="quick-actions-body">
        <label className="quick-search">
          <Search size={19} aria-hidden="true" />
          <input
            ref={search}
            aria-label="Search quick actions"
            placeholder="Search actions, checklist items, documents and applications"
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
                if (first) run(first);
              }
            }}
          />
        </label>
        <div className="command-results">
          {groups.map((group) => (
            <div className="command-group" role="group" aria-label={group} key={group}>
              <p className="command-group-title" aria-hidden="true">
                {group}
              </p>
              {actions
                .filter((item) => item.group === group)
                .map((item) => {
                  const position = ++index;
                  return (
                    <button
                      ref={(element) => {
                        if (element) items.current[position] = element;
                      }}
                      key={item.id}
                      className="command-item"
                      disabled={item.disabled}
                      onClick={() => run(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                          event.preventDefault();
                          move(position, event.key === 'ArrowDown' ? 1 : -1);
                        }
                      }}
                    >
                      <span className="command-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.hint}</small>
                      </span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                  );
                })}
            </div>
          ))}
          {!actions.length && (
            <p className="empty-small" role="status">
              No matching actions. Try “upload”, “review” or the name of a document.
            </p>
          )}
        </div>
        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to move, <kbd>Enter</kbd> to choose
          </span>
          <span>
            <kbd>Ctrl</kbd>
            <kbd>.</kbd> opens this, <kbd>Ctrl</kbd>
            <kbd>K</kbd> searches the page
          </span>
        </div>
      </div>
    </Dialog>
  );
}
