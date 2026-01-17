import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary', { error, errorInfo }, 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      const isProduction = process.env.NODE_ENV === 'production';
      return (
        <div className="flex items-center justify-center min-h-full p-8">
          <div className="text-center bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
            {!isProduction && (
              <p className="text-gray-600 mb-4 break-words">{this.state.error?.message}</p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="px-6 py-3 bg-[#7AB77A] text-white font-bold rounded-2xl hover:bg-[rgba(122,183,122,0.9)] transition-all active:scale-95"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

