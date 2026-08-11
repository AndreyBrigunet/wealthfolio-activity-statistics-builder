import { Alert, AlertDescription, AlertTitle } from '@wealthfolio/ui';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error?: Error }

export class AddonErrorBoundary extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Activity Statistics Builder failed', error, info);
  }

  render() {
    if (this.state.error) {
      return <Alert variant="destructive" className="m-6"><AlertTitle>Statistics could not be displayed</AlertTitle><AlertDescription>{this.state.error.message}</AlertDescription></Alert>;
    }
    return this.props.children;
  }
}
