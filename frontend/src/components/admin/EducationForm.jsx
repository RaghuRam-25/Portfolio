import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiBook } from 'react-icons/fi';
import { educationAPI } from '../../utils/api';

export default function EducationForm({ educationItem, onClose, showToast, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: '',
        order: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (educationItem) {
            setFormData({
                institution: educationItem.institution || '',
                degree: educationItem.degree || '',
                fieldOfStudy: educationItem.fieldOfStudy || '',
                startDate: educationItem.startDate ? new Date(educationItem.startDate).toISOString().split('T')[0] : '',
                endDate: educationItem.endDate ? new Date(educationItem.endDate).toISOString().split('T')[0] : '',
                description: educationItem.description || '',
                order: educationItem.order || 0,
            });
        }
    }, [educationItem]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = { ...formData };
            // Ensure empty endDate is sent as null or undefined
            if (!data.endDate) delete data.endDate;

            const response = educationItem?._id
                ? await educationAPI.update(educationItem._id, data)
                : await educationAPI.create(data);

            if (response.success) {
                showToast(response.message || 'Saved!', 'success');
                onSaveSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to save education entry.');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <FiBook /> {educationItem ? 'Edit Education Entry' : 'Add New Education Entry'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField label="Institution" name="institution" value={formData.institution} onChange={handleInputChange} placeholder="e.g., University of Dhaka" required />
                <InputField label="Degree" name="degree" value={formData.degree} onChange={handleInputChange} placeholder="e.g., Bachelor of Science" required />
                <InputField label="Field of Study" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} placeholder="e.g., Computer Science" />
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required />
                    <InputField label="End Date (leave blank for present)" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
                </div>
                <TextAreaField label="Description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief description of your studies and achievements." />
                <InputField label="Display Order" name="order" type="number" value={formData.order} onChange={handleInputChange} />

                <div className="pt-4 border-t border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600">
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Entry</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
    </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows="3" className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"></textarea>
    </div>
);