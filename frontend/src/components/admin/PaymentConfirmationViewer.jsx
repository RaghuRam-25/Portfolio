import React, { useState, useEffect } from 'react';
import { messagesAPI } from '../../utils/api';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import { FiCreditCard, FiTrash2 } from 'react-icons/fi';

const PaymentConfirmationViewer = () => {
    const [confirmations, setConfirmations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);

    const loadConfirmations = async () => {
        setIsLoading(true);
        const res = await messagesAPI.getPaymentConfirmations();
        if (res.success) {
            setConfirmations(res.data);
        } else {
            setError(res.message || 'Failed to load payment confirmations.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadConfirmations();
    }, []);

    const handleSelect = async (item) => {
        setSelected(item);
        if (!item.isRead) {
            const res = await messagesAPI.markAsRead(item._id);
            if (res.success) {
                setConfirmations(prev =>
                    prev.map(c => (c._id === item._id ? { ...c, isRead: true } : c))
                );
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this confirmation?')) {
            const res = await messagesAPI.delete(id);
            if (res.success) {
                setConfirmations(prev => prev.filter(c => c._id !== id));
                setSelected(null);
            } else {
                alert(res.message || 'Failed to delete confirmation.');
            }
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <h3 className="text-lg font-bold flex items-center gap-2"><FiCreditCard /> Payment Confirmations</h3>
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><Spinner /></div>
            ) : error ? (
                <p className="text-red-500 mt-4">{error}</p>
            ) : (
                <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {confirmations.length === 0 ? (
                        <p className="text-sm text-neutral-500 text-center py-10">No payment confirmations yet.</p>
                    ) : (
                        confirmations.map(item => (
                            <div key={item._id} onClick={() => handleSelect(item)} className="p-3 rounded-lg cursor-pointer transition-colors flex items-start gap-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                {!item.isRead && <div className="w-2 h-2 rounded-full bg-accent-blue mt-1.5 flex-shrink-0 animate-pulse"></div>}
                                <div className={`flex-grow ${item.isRead ? 'ml-5' : ''}`}>
                                    <div className="flex justify-between items-center">
                                        <p className={`font-bold text-sm ${!item.isRead ? 'text-light-textPrimary dark:text-dark-textPrimary' : 'text-neutral-600 dark:text-neutral-400'}`}>{item.senderName}</p>
                                        <span className="text-xs text-neutral-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                                        TrxID: <span className="font-mono">{item.transactionId}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Confirmation from ${selected?.senderName}`}>
                {selected && (
                    <div className="space-y-4 text-sm">
                        <div className="text-xs text-neutral-500 space-y-1">
                            <p><strong>From:</strong> {selected.senderName} &lt;{selected.senderEmail}&gt;</p>
                            <p><strong>Received:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
                            <p><strong>Transaction ID:</strong> <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{selected.transactionId}</span></p>
                            {selected.amount && <p><strong>Amount:</strong> <span className="font-bold text-emerald-500">${selected.amount}</span></p>}
                        </div>
                        <p className="whitespace-pre-wrap bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-lg border border-light-border dark:border-neutral-700/50">{selected.message}</p>
                        <div className="pt-4 border-t border-light-border dark:border-neutral-700/50">
                            <button onClick={() => handleDelete(selected._id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs flex items-center gap-2 hover:bg-red-700 transition-colors"><FiTrash2 /> Delete Confirmation</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PaymentConfirmationViewer;