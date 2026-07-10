import React, { useState } from 'react';
import { FiCopy, FiSend } from 'react-icons/fi';
import Toast from '../components/Toast';
import { messagesAPI } from '../utils/api';
import Spinner from '../components/ui/Spinner';

const PaymentConfirmationForm = ({ estimation }) => {
    const [transactionId, setTransactionId] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState({ loading: false, message: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!transactionId.trim()) {
            setStatus({ loading: false, message: 'Transaction ID is required.', type: 'error' });
            return;
        }
        setStatus({ loading: true, message: '', type: '' });
        const res = await messagesAPI.sendPaymentConfirmation(transactionId, message, estimation?.price, estimation?.projectType);
        if (res.success) {
            setStatus({ loading: false, message: 'Confirmation sent successfully!', type: 'success' });
            setTransactionId('');
            setMessage('');
        } else {
            setStatus({ loading: false, message: res.message || 'Failed to send confirmation.', type: 'error' });
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-light-border dark:border-neutral-800">
            <div className="max-w-xl mx-auto text-center">
                <h3 className="text-xl font-bold">Confirm Your Payment</h3>
                <p className="text-neutral-500 text-sm mt-2">After making the payment, please submit the transaction ID below.</p>
                <form onSubmit={handleSubmit} className="mt-6 text-left space-y-4">
                    <div><label htmlFor="transactionId" className="text-sm font-medium">Transaction ID</label><input type="text" id="transactionId" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter your transaction ID" required className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" /></div>
                    <div><label htmlFor="paymentMessage" className="text-sm font-medium">Optional Message</label><textarea id="paymentMessage" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any additional details..." className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700"></textarea></div>
                    <button type="submit" disabled={status.loading} className="w-full px-4 py-2.5 bg-accent-blue text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:bg-neutral-500">{status.loading ? <Spinner /> : <FiSend />} Submit Confirmation</button>
                    {status.message && <p className={`mt-2 text-center text-xs ${status.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{status.message}</p>}
                </form>
            </div>
        </div>
    );
};

const Payment = ({ profile, estimation }) => {
    const [showToast, setShowToast] = useState(false);
    const paymentMethods = profile?.paymentMethods || [];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setShowToast(true);
    };

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <section id="payment" className="py-12">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-black">Payment Information</h2>
                    {estimation && (
                        <p className="text-lg text-neutral-400 mt-2">
                            Your project estimate: <span className="font-bold text-accent-blue">${estimation.price}</span>
                        </p>
                    )}
                    <p className="text-sm text-neutral-400">Please use one of the methods below to proceed with the project deposit.</p>
                </div>

                {paymentMethods.length === 0 ? (
                    <div className="text-center py-20 rounded-2xl border border-dashed border-light-border dark:border-neutral-800">
                        <p className="text-neutral-500 font-medium">
                            No payment methods are configured. Please contact for details.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {paymentMethods.map((method, index) => (
                            <div key={index} className="p-6 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col items-center text-center">
                                {method.iconUrl && <img src={method.iconUrl} alt={method.name} className="h-12 mb-4" />}
                                <h3 className="text-lg font-bold">{method.name}</h3>
                                <p className="text-neutral-400 text-sm mt-2 mb-4 whitespace-pre-wrap">{method.details}</p>
                                {method.qrCodeUrl && (
                                    <div className="mb-4">
                                        <img src={method.qrCodeUrl} alt={`${method.name} QR Code`} className="w-40 h-40 rounded-lg bg-white p-1" />
                                        <p className="text-xs text-neutral-500 mt-2">Scan QR code</p>
                                    </div>
                                )}
                                <button onClick={() => handleCopy(method.details)} className="mt-auto px-4 py-2 text-xs font-bold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-2"><FiCopy size={12} /> Copy Details</button>
                            </div>
                        ))}
                    </div>
                )}
                <PaymentConfirmationForm estimation={estimation} />
            </div>
            {showToast && <Toast message="Details Copied!" type="success" onClose={() => setShowToast(false)} />}
        </section>
    );
};

export default Payment;