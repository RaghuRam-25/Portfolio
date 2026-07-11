import React, { useState, useEffect } from 'react';
import { FiSave, FiUpload, FiX, FiPlus, FiGithub, FiLink, FiTag, FiImage, FiLoader } from 'react-icons/fi';
import { projectsAPI, resolveMediaUrl } from '../../utils/api';

export default function ProjectForm({ project, onClose, showToast, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        techStack: [],
        githubUrl: '',
        liveUrl: '',
        isFeatured: false,
        isDelivered: false,
        order: 0,
    });

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]); // For images already in DB
    const [newTechSkill, setNewTechSkill] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || '',
                description: project.description || '',
                category: project.category || '',
                techStack: project.techStack || [],
                githubUrl: project.githubUrl || '',
                liveUrl: project.liveUrl || '',
                isFeatured: project.isFeatured || false,
                isDelivered: project.isDelivered || false,
                order: project.order || 0,
            });
            setExistingImages(project.images || []);
        }
    }, [project]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleThumbnailChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setThumbnailFile(e.target.files[0]);
        }
    };

    const handleGalleryFileChange = (e) => {
        if (e.target.files) {
            setGalleryFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeGalleryFile = (index) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (urlToRemove) => {
        setExistingImages(prev => prev.filter(url => url !== urlToRemove));
    };

    const handleAddTechSkill = () => {
        if (newTechSkill.trim() && !formData.techStack.includes(newTechSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                techStack: [...prev.techStack, newTechSkill.trim()],
            }));
            setNewTechSkill('');
        }
    };

    const handleRemoveTechSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            techStack: prev.techStack.filter(skill => skill !== skillToRemove),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'techStack') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Upload thumbnail if new one is selected
            if (thumbnailFile) {
                data.append('thumbnail', thumbnailFile);
            }

            // Upload new gallery images
            if (galleryFiles.length > 0) {
                for (const file of galleryFiles) {
                    data.append('images', file);
                }
            }
            // Add existing images to the payload
            data.append('existingImages', JSON.stringify(existingImages));

            let response;
            if (project?._id) {
                response = await projectsAPI.update(project._id, data);
            } else {
                response = await projectsAPI.create(data);
            }

            if (response.success) {
                showToast(response.message, 'success');
                onSaveSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to save project.');
            }
        } catch (error) {
            console.error("Failed to save project:", error);
            showToast(error.message || 'An error occurred while saving.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-bold mb-6 text-white">{project ? 'Edit Project' : 'Add New Project'}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField label="Title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Project Title" required />
                <TextAreaField label="Description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Detailed description of the project" rows="4" required />
                <InputField label="Category" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g., Web Development, Mobile App" required />

                {/* Tech Stack */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Tech Stack</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newTechSkill}
                            onChange={(e) => setNewTechSkill(e.target.value)}
                            placeholder="Add a technology"
                            className="flex-grow p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"
                        />
                        <button type="button" onClick={handleAddTechSkill} className="px-4 py-2 bg-accent-purple text-white rounded-lg text-sm flex items-center gap-1">
                            <FiPlus /> Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.techStack.map((skill, index) => (
                            <span key={index} className="flex items-center gap-1.5 bg-neutral-800 text-neutral-300 text-xs px-3 py-1 rounded-full">
                                {skill}
                                <FiX className="cursor-pointer hover:text-white" onClick={() => handleRemoveTechSkill(skill)} />
                            </span>
                        ))}
                    </div>
                </div>

                <InputField icon={<FiGithub />} label="GitHub URL" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="https://github.com/your/project" />
                <InputField icon={<FiLink />} label="Live URL" name="liveUrl" value={formData.liveUrl} onChange={handleInputChange} placeholder="https://live-project.com" />

                {/* Thumbnail Upload */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Thumbnail Image</label>
                    <input type="file" name="thumbnailFile" onChange={handleThumbnailChange} accept="image/*" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />
                    {(thumbnailFile || (project && project.thumbnail)) && (
                        <div className="mt-3">
                            <img src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : resolveMediaUrl(project.thumbnail)} alt="Thumbnail Preview" className="w-32 h-24 object-cover rounded-lg border border-neutral-700" />
                        </div>
                    )}
                </div>

                {/* Gallery Images Upload */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Gallery Images</label>
                    <input type="file" multiple name="galleryFiles" onChange={handleGalleryFileChange} accept="image/*" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />
                    <div className="mt-3 flex flex-wrap gap-2">
                        {existingImages.map((url, index) => (
                            <div key={`existing-${index}`} className="relative">
                                <img src={resolveMediaUrl(url)} alt={`Existing ${index}`} className="w-24 h-20 object-cover rounded-lg border border-neutral-700" />
                                <FiX className="absolute top-1 right-1 text-red-400 cursor-pointer bg-neutral-900 rounded-full p-0.5" onClick={() => removeExistingImage(url)} />
                            </div>
                        ))}
                        {galleryFiles.map((file, index) => (
                            <div key={`new-${index}`} className="relative">
                                <img src={URL.createObjectURL(file)} alt={`New ${index}`} className="w-24 h-20 object-cover rounded-lg border border-neutral-700" />
                                <FiX className="absolute top-1 right-1 text-red-400 cursor-pointer bg-neutral-900 rounded-full p-0.5" onClick={() => removeGalleryFile(index)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured & Delivered & Order */}
                <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center text-sm text-white cursor-pointer">
                        <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-accent-purple rounded border-neutral-700 bg-neutral-800 focus:ring-accent-purple" />
                        <span className="ml-2">Featured Project</span>
                    </label>
                    <label className="flex items-center text-sm text-white cursor-pointer">
                        <input type="checkbox" name="isDelivered" checked={formData.isDelivered} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-emerald-500 rounded border-neutral-700 bg-neutral-800 focus:ring-emerald-500" />
                        <span className="ml-2 text-emerald-400 font-bold">Delivered (Completed)</span>
                    </label>
                    <InputField label="Order" name="order" type="number" value={formData.order} onChange={handleInputChange} placeholder="0" />
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave />
                                Save Project
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Helper InputField Component
const InputField = ({ icon, label, name, value, onChange, placeholder, type = 'text', required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">{icon}</div>}
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className={`w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple ${icon ? 'pl-10' : ''}`} />
        </div>
    </div>
);

// Helper TextAreaField Component
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3, required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} required={required} className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"></textarea>
    </div>
);
