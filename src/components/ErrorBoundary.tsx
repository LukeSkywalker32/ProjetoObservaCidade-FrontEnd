import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
children: ReactNode
//UI customizada de fallback. recebe o erro e uma funcao de reset
fallback?:(error: Error, reset:() => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}


export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState>{
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    //Atualiza o state para renderizar a UI de fallback
    return { hasError: true, error};
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Aqui dá pra enviar pro Sentry, LogRocket, etc.
    // Por enquanto só loga no console com contexto rico.
    console.error("[ErrorBoundary]", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // TODO Sprint futuro: integrar com Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Se o pai passou um fallback customizado, usa ele
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Fallback padrão
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Algo deu errado
        </h1>
        <p className="text-gray-500 mb-6">
          Encontramos um problema inesperado. Tente recarregar a página.
        </p>

        {error.message && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">
              Detalhes técnicos
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}

        <button
          type="button"
          onClick={reset}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Tentar novamente
        </button>

        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}