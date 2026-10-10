import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { install, installState, onInstallChange } from '../install';

/** Add JKY-Folder to the home screen or desktop like an app. */
export function InstallApp() {
  const [state, setState] = useState(installState);
  useEffect(() => onInstallChange(() => setState(installState())), []);
  return (
    <section className="sheet install-app" aria-labelledby="install-title">
      <h2 id="install-title">
        <Smartphone size={19} aria-hidden="true" />
        Install on this device
      </h2>
      {state === 'installed' ? (
        <p className="microcopy">JKY-Folder is installed and opens in its own window.</p>
      ) : state === 'available' ? (
        <>
          <p className="microcopy">
            Open JKY-Folder from your home screen or desktop like any other app.
          </p>
          <button className="outline" onClick={() => void install()}>
            Install JKY-Folder
          </button>
        </>
      ) : state === 'ios' ? (
        <p className="microcopy">
          On iPhone or iPad, tap the Share button in Safari, then{' '}
          <strong>Add to Home Screen</strong>.
        </p>
      ) : (
        <p className="microcopy">
          Your browser can install JKY-Folder from its menu (for example{' '}
          <strong>Install app</strong> or <strong>Add to Home screen</strong>) once the site is
          served over HTTPS.
        </p>
      )}
    </section>
  );
}
