import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiLayers } from 'react-icons/fi';
import { skillAPI } from '../../utils/api';

// আসল প্রোজেক্টে এই mockApi এর পরিবর্তে utils/api.js থেকে আসল API কল করতে হবে।
const mockApi = {
    createSkill: async (data) => { console.log("Creating skill:", data); await new Promise(r => setTimeout(r, 1000)); return { success: true, message: "Skill created!" }; },
    updateSkill: async (id, data) => { console.log(`Updating skill ${id}:`, data); await new Promise(r => setTimeout(r, 1000)); return { success: true, message: "Skill updated!" }; },
};

export default function SkillForm({ skill, onClose, showToast, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'frontend',
        level: 75,
        years: 1,
        order: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (skill) {
            setFormData({
                name: skill.name || '',
                description: skill.description || '',
                category: skill.category || 'frontend',
                level: skill.level || 75,
                years: skill.years || 1,
                order: skill.order || 0,
            });
        }
    }, [skill]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let response;
            if (skill?._id) {
                response = await skillAPI.update(skill._id, formData);
            } else {
                response = await skillAPI.create(formData);
            }

            if (response.success) {
                showToast(response.message, 'success');
                onSaveSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to save skill.');
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
                <FiLayers /> {skill ? 'Edit Skill' : 'Add New Skill'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField label="Skill Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., React" required />
                <TextAreaField label="Description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief description of the skill" required />

                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple">
                        <option value="frontend">Frontend</option>
                        <option value="backend">Backend</option>
                        <option value="database">Database</option>
                        <option value="devops">DevOps</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Proficiency Level (0-100)" name="level" type="number" value={formData.level} onChange={handleInputChange} required />
                    <InputField label="Years of Experience" name="years" type="number" value={formData.years} onChange={handleInputChange} required />
                </div>

                <InputField label="Display Order" name="order" type="number" value={formData.order} onChange={handleInputChange} />

                <div className="pt-4 border-t border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600">
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Skill</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} min={type === 'number' ? 0 : undefined} className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
    </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows="3" className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"></textarea>
    </div>
);
