import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MotionProvider } from './motion/MotionProvider';
import { ThemeProvider } from './theme';
import { watchInstall } from './install';
import '@fontsource-variable/manrope';
import '@fontsource-variable/bodoni-moda';
import './styles/tokens.css';
import './styles/theme-dark.css';
import './styles/base.css';
import './styles/controls.css';
import './styles/dialog.css';
import './styles/shell.css';
import './styles/landing.css';
import './styles/views.css';
import './styles/forms.css';
import './styles/tools.css';
import './styles/luxe.css';
import './styles/motion.css';
import './styles/print.css';
watchInstall();
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="boot">
          <h1>Let’s reopen your workspace.</h1>
          <p>Something interrupted this view. Your saved applications are safe on the server.</p>
          <button className="primary" onClick={() => location.reload()}>
            Reload workspace
          </button>
        </main>
      );
    return this.props.children;
  }
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <MotionProvider>
          <App />
        </MotionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
