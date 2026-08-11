import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  failed: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
  }

  private reset = () => {
    window.localStorage.removeItem('vaxmoment.demo.snapshot.v1');
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="app-loading" id="main-content">
        <h1>The synthetic demo needs a reset</h1>
        <p>No real booking, message, or clinical action was attempted.</p>
        <button onClick={this.reset} type="button">
          Restore the canonical demo
        </button>
      </main>
    );
  }
}
