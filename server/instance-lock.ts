import { spawn } from 'node:child_process';
import { mkdirSync, openSync, closeSync, chmodSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Kernel lock, automatically released after a crash; the SQLite runtime has one owner. */
export async function acquireInstanceLock(
  directory: string,
  lost: () => void,
  options: { waitSeconds?: number } = {},
) {
  if (process.platform !== 'linux')
    throw Error('The supported server runtime requires Linux and flock.');
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = join(resolve(directory), 'runtime.lock');
  closeSync(openSync(file, 'a', 0o600));
  chmodSync(file, 0o600);
  const child = spawn(
    'flock',
    [
      '--exclusive',
      ...(options.waitSeconds ? ['--wait', String(options.waitSeconds)] : ['--nonblock']),
      '--conflict-exit-code',
      '73',
      file,
      process.execPath,
      '-e',
      'process.stdout.write("locked\\n");process.stdin.resume();',
    ],
    {
      env: { PATH: '/usr/local/bin:/usr/bin:/bin' },
      stdio: ['pipe', 'pipe', 'ignore'],
    },
  );
  let acquired = false,
    released = false;
  await new Promise<void>((resolveLock, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(Error('Workspace lock did not answer.'));
    }, 5000);
    child.stdout.once('data', (value) => {
      if (String(value) !== 'locked\n') return;
      acquired = true;
      clearTimeout(timer);
      resolveLock();
    });
    child.once('error', () => {
      clearTimeout(timer);
      reject(Error('Install flock before starting the server.'));
    });
    child.once('exit', () => {
      clearTimeout(timer);
      if (!acquired)
        reject(
          Error(
            'Another server owns this workspace. Use a separate DATA_DIR; multiple API instances are unsupported.',
          ),
        );
      else if (!released) lost();
    });
  });
  return async () => {
    released = true;
    if (child.exitCode !== null) return;
    await new Promise<void>((resolveExit) => {
      child.once('exit', () => resolveExit());
      child.stdin.end();
    });
  };
}
