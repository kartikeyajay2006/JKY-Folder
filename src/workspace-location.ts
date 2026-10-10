export const workspaceViews = [
  'overview',
  'applications',
  'requirements',
  'documents',
  'report',
  'activity',
  'help',
  'settings',
] as const;
export type WorkspaceView = (typeof workspaceViews)[number];

export function readWorkspaceLocation() {
  const query = new URLSearchParams(window.location.search);
  const candidate = query.get('view');
  const application = query.get('application') || '';
  return {
    view: workspaceViews.includes(candidate as WorkspaceView)
      ? (candidate as WorkspaceView)
      : ('overview' as WorkspaceView),
    application: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(application)
      ? application
      : '',
  };
}

export function writeWorkspaceLocation(
  view: WorkspaceView,
  application: string,
  mode: 'push' | 'replace',
) {
  const url = new URL(window.location.href);
  url.search = '';
  if (view !== 'overview') url.searchParams.set('view', view);
  if (application) url.searchParams.set('application', application);
  url.hash = '';
  if (url.href !== window.location.href)
    window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
}
