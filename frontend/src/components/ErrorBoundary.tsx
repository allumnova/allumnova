import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 p-8 text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
            
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              An unexpected error occurred. We've been notified and are looking into it.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
              >
                <RefreshCcw size={18} />
                Refresh Page
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98]"
              >
                <Home size={18} />
                Back to Home
              </button>
            </div>
            
            {import.meta.env.MODE === 'development' && (
              <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-rose-500 break-all">{this.state.error?.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
