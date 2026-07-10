import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiHome, FiLogIn } from 'react-icons/fi';

export default function EmailVerificationStatus({ status, setActiveTab }) {
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (status === 'success') {
            setMessage('Your email has been successfully verified! You can now log in.');
            setIsSuccess(true);
        } else {
            setMessage('Email verification failed. The link might be invalid or expired.');
            setIsSuccess(false);
        }
    }, [status]);

    return (
        <section className="flex items-center justify-center min-h-[70vh] py-12 px-6 text-center">
            <div className="max-w-md animate-fadeIn">
                {isSuccess ? <FiCheckCircle className="mx-auto text-7xl text-emerald-500 mb-6" /> : <FiXCircle className="mx-auto text-7xl text-red-500 mb-6" />}
                <h1 className="text-2xl font-bold mt-2 text-light-textPrimary dark:text-dark-textPrimary">{message}</h1>
                <button onClick={() => setActiveTab('auth-portal')} className="mt-8 px-6 py-3 rounded-xl text-sm font-bold bg-accent-blue text-white flex items-center gap-2 mx-auto hover:opacity-90 transition-all">
                    <FiLogIn /> Go to Login
                </button>
            </div>
        </section>
    );
}