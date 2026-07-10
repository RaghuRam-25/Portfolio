import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiInfo, FiAward } from 'react-icons/fi';
import CertificateForm from './CertificateForm';
import Modal from '../ui/Modal';
import { certificateAPI } from '../../utils/api';

// আসল প্রোজেক্টে এই mockApi এর পরিবর্তে utils/api.js থেকে আসল API কল করতে হবে।
const mockApi = {
    getAll: async () => {
        await new Promise(r => setTimeout(r, 1000));
        return {
            success: true, data: [
                { _id: 'cert1', name: 'Complete Web Development', organization: 'Programming Hero', issueDate: '2023-12-25', certificateImage: 'https://via.placeholder.com/300x200' },
                { _id: 'cert2', name: 'MERN Stack Bootcamp', organization: 'Udemy', issueDate: '2024-03-15', certificateImage: 'https://via.placeholder.com/300x200' },
            ]
        };
    },
    delete: async (id) => {
        await new Promise(r => setTimeout(r, 800));
        return { success: true, message: 'Certificate deleted!' };
    }
};

export default function ManageCertificates({ showToast }) {
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState(null);

    const fetchCertificates = async () => {
        setIsLoading(true);
        try {
            const response = await certificateAPI.getAll();
            if (response.success) {
                setCertificates(response.data);
            } else {
                showToast(response.message || 'Failed to fetch certificates.', 'error');
            }
        } catch (error) {
            showToast('An error occurred while fetching certificates.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const handleAdd = () => {
        setEditingCertificate(null);
        setIsModalOpen(true);
    };

    const handleEdit = (cert) => {
        setEditingCertificate(cert);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this certificate?')) {
            try {
                const response = await certificateAPI.delete(id);
                if (response.success) {
                    showToast(response.message, 'success');
                    fetchCertificates();
                } else {
                    showToast(response.message, 'error');
                }
            } catch (error) {
                showToast('An error occurred while deleting.', 'error');
            }
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiAward /> Manage Certificates</h2>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-bold hover:bg-accent-purple/90">
                    <FiPlus /> Add Certificate
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-accent-purple text-4xl" /></div>
            ) : certificates.length === 0 ? (
                <div className="text-center p-8 text-neutral-400"><FiInfo className="text-5xl mx-auto mb-4" /><p>No certificates found. Add your first one!</p></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-800">
                        <thead>
                            <tr className="text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Certificate</th>
                                <th className="px-4 py-3">Organization</th>
                                <th className="px-4 py-3">Issue Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {certificates.map((cert) => (
                                <tr key={cert._id} className="hover:bg-neutral-800/50">
                                    <td className="px-4 py-4 text-sm font-medium text-white">{cert.name}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{cert.organization}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{new Date(cert.issueDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(cert)} className="text-accent-purple hover:text-accent-purple/80 mr-3"><FiEdit /></button>
                                        <button onClick={() => handleDelete(cert._id)} className="text-red-500 hover:text-red-400"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}>
                <CertificateForm certificate={editingCertificate} onClose={() => setIsModalOpen(false)} showToast={showToast} onSaveSuccess={fetchCertificates} />
            </Modal>
        </div>
    );
}
