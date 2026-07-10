import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error };
    }

    componentDidCatch(error, errorInfo) {
        // আপনি চাইলে কোনো এরর রিপোর্টিং সার্ভিসে এই এররটি লগ করতে পারেন
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // ফলব্যাক UI
            return (
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-fadeIn">
                    <FiAlertTriangle className="mx-auto text-7xl text-red-500 mb-6" />
                    <h1 className="text-2xl font-bold text-red-400">Something went wrong.</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-4">An unexpected error occurred. Please try refreshing the page.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;