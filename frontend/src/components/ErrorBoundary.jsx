import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                    <h1 className="text-4xl font-bold mb-4 text-red-500">Something went wrong.</h1>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full">
                        <h2 className="text-xl font-semibold mb-2">Error Details:</h2>
                        <pre className="text-red-300 overflow-x-auto whitespace-pre-wrap">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <details className="mt-4">
                            <summary className="cursor-pointer text-gray-400">Stack Trace</summary>
                            <pre className="mt-2 text-xs text-gray-500 overflow-x-auto">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-8 px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Go Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
