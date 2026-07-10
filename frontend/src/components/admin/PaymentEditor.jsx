import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../utils/api';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import { FiDollarSign, FiPlus, FiSave, FiEdit, FiTrash2 } from 'react-icons/fi';

const PaymentEditor = ({ profile, refetchProfile }) => {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMethod, setCurrentMethod] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);

    useEffect(() => {
        setMethods(profile?.paymentMethods || []);
    }, [profile]);

    const handleOpenModal = (method, index) => {
        setCurrentMethod(method ? { ...method } : { name: '', details: '', qrCodeUrl: '', iconUrl: '' });
        setCurrentIndex(index); // null for new
        setIsModalOpen(true);
    };

    const handleSaveMethod = () => {
        let newMethods = [...methods];
        if (currentIndex !== null) {
            newMethods[currentIndex] = currentMethod;
        } else {
            newMethods.push(currentMethod);
        }
        setMethods(newMethods);
        setIsModalOpen(false);
    };

    const handleDeleteMethod = (index) => {
        if (window.confirm('Are you sure you want to delete this payment method?')) {
            setMethods(methods.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const res = await profileAPI.updateProfile({ paymentMethods: methods });
        setLoading(false);

        if (res.success) {
            setMessage({ type: 'success', text: 'Payment methods updated successfully!' });
            if (refetchProfile) refetchProfile();
        } else {
            setMessage({ type: 'error', text: res.message || 'Failed to update.' });
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <h3 className="text-lg font-bold flex items-center gap-2"><FiDollarSign /> Edit Payment Methods</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                <div>
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Method List</label>
                        <button type="button" onClick={() => handleOpenModal(null, null)} className="px-3 py-1.5 bg-accent-blue text-white rounded-lg text-sm flex items-center gap-2"><FiPlus /> Add Method</button>
                    </div>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {methods.map((method, index) => (<div key={index} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"><p className="font-semibold text-sm truncate w-48">{method.name}</p><div className="flex items-center gap-3"><button type="button" onClick={() => handleOpenModal(method, index)} className="text-neutral-500 hover:text-accent-blue"><FiEdit /></button><button type="button" onClick={() => handleDeleteMethod(index)} className="text-neutral-500 hover:text-red-500"><FiTrash2 /></button></div></div>))}
                    </div>
                </div>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2 disabled:bg-neutral-500">{loading ? <Spinner /> : <FiSave />} Save Payment Changes</button>
                {message.text && <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{message.text}</p>}
            </form>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentIndex !== null ? 'Edit Method' : 'Add New Method'}>
                {currentMethod && (<div className="space-y-4"><input type="text" placeholder="Method Name (e.g., bKash)" value={currentMethod.name} onChange={(e) => setCurrentMethod({ ...currentMethod, name: e.target.value })} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" /><textarea placeholder="Details (e.g., Account: 01...)" rows="3" value={currentMethod.details} onChange={(e) => setCurrentMethod({ ...currentMethod, details: e.target.value })} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700"></textarea><input type="text" placeholder="Icon URL (optional)" value={currentMethod.iconUrl} onChange={(e) => setCurrentMethod({ ...currentMethod, iconUrl: e.target.value })} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" /><input type="text" placeholder="QR Code Image URL (optional)" value={currentMethod.qrCodeUrl} onChange={(e) => setCurrentMethod({ ...currentMethod, qrCodeUrl: e.target.value })} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" /><button onClick={handleSaveMethod} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2"><FiSave /> {currentIndex !== null ? 'Update Method' : 'Add Method'}</button></div>)}
            </Modal>
        </div>
    );
};

export default PaymentEditor;
