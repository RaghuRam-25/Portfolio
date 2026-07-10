import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiStar, FiUser, FiMessageSquare, FiBriefcase } from 'react-icons/fi';
import { testimonialAPI } from '../../utils/api';

// আসল প্রোজেক্টে এই mockApi এর পরিবর্তে utils/api.js থেকে আসল API কল করতে হবে।
const mockApi = {
    create: async (formData) => { console.log("Creating testimonial:", formData); await new Promise(r => setTimeout(r, 1000)); return { success: true, message: "Testimonial created!" }; },
    update: async (id, formData) => { console.log(`Updating testimonial ${id}:`, formData); await new Promise(r => setTimeout(r, 1000)); return { success: true, message: "Testimonial updated!" }; },
};

export default function TestimonialForm({ testimonial, onClose, showToast, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        clientName: '',
        company: '',
        review: '',
        rating: 5,
        order: 0,
    });
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (testimonial) {
            setFormData({
                clientName: testimonial.clientName || '',
                company: testimonial.company || '',
                review: testimonial.review || '',
                rating: testimonial.rating || 5,
                order: testimonial.order || 0,
            });
        }
    }, [testimonial]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (imageFile) {
                data.append('clientImage', imageFile);
            }

            const response = testimonial?._id
                ? await testimonialAPI.update(testimonial._id, data)
                : await testimonialAPI.create(data);

            if (response.success) {
                showToast(response.message, 'success');
                onSaveSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to save testimonial.');
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
                <FiMessageSquare /> {testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField icon={<FiUser />} label="Client Name" name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="e.g., John Doe" required />
                <InputField icon={<FiBriefcase />} label="Company (Optional)" name="company" value={formData.company} onChange={handleInputChange} placeholder="e.g., Acme Inc." />
                <TextAreaField label="Review" name="review" value={formData.review} onChange={handleInputChange} placeholder="Client's feedback..." required />

                <div className="grid grid-cols-2 gap-4">
                    <InputField icon={<FiStar />} label="Rating (1-5)" name="rating" type="number" value={formData.rating} onChange={handleInputChange} />
                    <InputField label="Display Order" name="order" type="number" value={formData.order} onChange={handleInputChange} />
                </div>

                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Client Image (Optional)</label>
                    <input type="file" name="clientImage" onChange={handleFileChange} accept="image/*" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />
                    {(imageFile || (testimonial && testimonial.clientImage)) && (
                        <div className="mt-3">
                            <img src={imageFile ? URL.createObjectURL(imageFile) : testimonial.clientImage} alt="Preview" className="w-24 h-24 object-cover rounded-full border-2 border-neutral-700" />
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600">
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Testimonial</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

const InputField = ({ icon, label, name, value, onChange, placeholder, type = 'text', required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">{icon}</div>}
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} min={type === 'number' ? 0 : undefined} max={name === 'rating' ? 5 : undefined} className={`w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple ${icon ? 'pl-10' : ''}`} />
        </div>
    </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows="4" className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"></textarea>
    </div>
);
