/**
 * ErrorBoundary — React Class Error Catcher
 *
 * Catches JavaScript errors during rendering of child components and
 * displays a user-friendly error card instead of a white screen.
 * Logs the error to console for debugging and provides a "Reload page"
 * button to attempt recovery. Accepts an optional custom fallback UI.
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md w-full text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="font-display text-lg font-bold text-slate-800">Something went wrong</h2>
            <p className="text-sm text-slate-500">
              {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
