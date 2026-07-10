import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiInfo, FiMessageSquare } from 'react-icons/fi';
import TestimonialForm from './TestimonialForm';
import Modal from '../ui/Modal';
import { testimonialAPI } from '../../utils/api';

// আসল প্রোজেক্টে এই mockApi এর পরিবর্তে utils/api.js থেকে আসল API কল করতে হবে।
const mockApi = {
    getAll: async () => {
        await new Promise(r => setTimeout(r, 1000));
        return {
            success: true, data: [
                { _id: 'testi1', clientName: 'Jane Doe', company: 'Tech Solutions', review: 'Excellent work and great communication!', rating: 5 },
                { _id: 'testi2', clientName: 'Sam Wilson', company: 'Innovate LLC', review: 'Delivered the project on time and exceeded expectations.', rating: 5 },
            ]
        };
    },
    delete: async (id) => {
        await new Promise(r => setTimeout(r, 800));
        return { success: true, message: 'Testimonial deleted!' };
    }
};

export default function ManageTestimonials({ showToast }) {
    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);

    const fetchTestimonials = async () => {
        setIsLoading(true);
        try {
            const response = await testimonialAPI.getAll();
            if (response.success) {
                setTestimonials(response.data);
            } else {
                showToast(response.message || 'Failed to fetch testimonials.', 'error');
            }
        } catch (error) {
            showToast('An error occurred while fetching testimonials.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleAdd = () => {
        setEditingTestimonial(null);
        setIsModalOpen(true);
    };

    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            try {
                const response = await testimonialAPI.delete(id);
                if (response.success) {
                    showToast(response.message, 'success');
                    fetchTestimonials();
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
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiMessageSquare /> Manage Testimonials</h2>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-bold hover:bg-accent-purple/90">
                    <FiPlus /> Add Testimonial
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-accent-purple text-4xl" /></div>
            ) : testimonials.length === 0 ? (
                <div className="text-center p-8 text-neutral-400"><FiInfo className="text-5xl mx-auto mb-4" /><p>No testimonials found. Add your first one!</p></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-800">
                        <thead>
                            <tr className="text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Client Name</th>
                                <th className="px-4 py-3">Company</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {testimonials.map((item) => (
                                <tr key={item._id} className="hover:bg-neutral-800/50">
                                    <td className="px-4 py-4 text-sm font-medium text-white">{item.clientName}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{item.company}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{item.rating ? `${item.rating} / 5` : 'N/A'}</td>
                                    <td className="px-4 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(item)} className="text-accent-purple hover:text-accent-purple/80 mr-3"><FiEdit /></button>
                                        <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-400"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}>
                <TestimonialForm testimonial={editingTestimonial} onClose={() => setIsModalOpen(false)} showToast={showToast} onSaveSuccess={fetchTestimonials} />
            </Modal>
        </div>
    );
}
