import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiInfo, FiHelpCircle, FiSave, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { faqAPI } from '../../utils/api';
import Modal from '../ui/Modal';

// ─── FAQ Form ─────────────────────────────────────────────────────────────────
function FaqForm({ faq, onClose, showToast, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
        order: 0,
        isPublished: true,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (faq) {
            setFormData({
                question: faq.question || '',
                answer: faq.answer || '',
                category: faq.category || 'general',
                order: faq.order || 0,
                isPublished: faq.isPublished ?? true,
            });
        }
    }, [faq]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (name === 'order' ? Number(value) : value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = faq?._id
                ? await faqAPI.update(faq._id, formData)
                : await faqAPI.create(formData);

            if (response.success) {
                showToast(response.message || 'Saved!', 'success');
                onSaveSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to save FAQ.');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <FiHelpCircle /> {faq ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Question <span className="text-red-500">*</span></label>
                    <input name="question" value={formData.question} onChange={handleChange} required placeholder="What question does a client ask?"
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Answer <span className="text-red-500">*</span></label>
                    <textarea name="answer" value={formData.answer} onChange={handleChange} required rows="4" placeholder="Write a clear, helpful answer..."
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5">Category</label>
                        <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g., pricing, timeline"
                            className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5">Display Order</label>
                        <input name="order" type="number" value={formData.order} onChange={handleChange} min="0"
                            className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                    <input type="checkbox" id="isPublished" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="w-4 h-4 accent-accent-purple" />
                    <label htmlFor="isPublished" className="text-sm text-white font-medium cursor-pointer">Published (visible on website)</label>
                </div>
                <div className="pt-4 border-t border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600">
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save FAQ</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Manage FAQs ──────────────────────────────────────────────────────────────
export default function ManageFaqs({ showToast }) {
    const [faqs, setFaqs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);

    const fetchFaqs = async () => {
        setIsLoading(true);
        try {
            // Admin route দিয়ে সব FAQs (published + unpublished) আনা হচ্ছে
            const data = await faqAPI.getAdminAll();
            if (data.success) {
                setFaqs(data.data);
            } else {
                showToast(data.message || 'Failed to fetch FAQs.', 'error');
            }
        } catch {
            showToast('An error occurred while fetching FAQs.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchFaqs(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this FAQ?')) return;
        try {
            const res = await faqAPI.delete(id);
            if (res.success) {
                showToast(res.message, 'success');
                fetchFaqs();
            } else {
                showToast(res.message, 'error');
            }
        } catch {
            showToast('Delete failed.', 'error');
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiHelpCircle /> Manage FAQs</h2>
                <button onClick={() => { setEditingFaq(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-bold hover:bg-accent-purple/90">
                    <FiPlus /> Add FAQ
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-accent-purple text-4xl" /></div>
            ) : faqs.length === 0 ? (
                <div className="text-center p-8 text-neutral-400"><FiInfo className="text-5xl mx-auto mb-4" /><p>No FAQs yet. Add your first FAQ!</p></div>
            ) : (
                <div className="space-y-2">
                    {faqs.map((f, i) => (
                        <div key={f._id} className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors">
                            <span className="text-xs text-neutral-500 font-mono mt-1 w-5 shrink-0">{i + 1}.</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{f.question}</p>
                                <p className="text-xs text-neutral-400 mt-0.5 truncate">{f.answer}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-neutral-600">{f.category}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${f.isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {f.isPublished ? 'Published' : 'Hidden'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => { setEditingFaq(f); setIsModalOpen(true); }} className="text-accent-purple hover:text-accent-purple/80"><FiEdit size={15} /></button>
                                <button onClick={() => handleDelete(f._id)} className="text-red-500 hover:text-red-400"><FiTrash2 size={15} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}>
                <FaqForm faq={editingFaq} onClose={() => setIsModalOpen(false)} showToast={showToast} onSaveSuccess={fetchFaqs} />
            </Modal>
        </div>
    );
}
