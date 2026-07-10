import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../utils/api';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import TagInput from '../components/ui/TagInput';
import { FiBox, FiPlus, FiEdit, FiTrash2, FiSave } from 'react-icons/fi';

const ProjectManager = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const initialFormData = {
        title: '', description: '', longDescription: '', category: '', thumbnail: '',
        images: '', techStack: [], liveDemo: '', githubClient: '', githubServer: '', featured: false,
    };
    const [formData, setFormData] = useState(initialFormData);

    const loadProjects = async () => {
        setIsLoading(true);
        const res = await projectsAPI.getAll();
        if (res.success) {
            setProjects(res.data);
        } else {
            setError('Failed to load projects.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleOpenForm = (project = null) => {
        setEditingProject(project);
        if (project) {
            setFormData({
                title: project.title || '',
                description: project.description || '',
                longDescription: project.longDescription || '',
                category: project.category || '',
                thumbnail: project.thumbnail || '',
                images: (project.images || []).join(', '),
                techStack: project.techStack || [],
                liveDemo: project.liveDemo || '',
                githubClient: project.githubClient || '',
                githubServer: project.githubServer || '',
                featured: project.featured || false,
            });
        } else {
            setFormData(initialFormData);
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProject(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        const apiData = {
            ...formData,
            images: formData.images.split(',').map(item => item.trim()).filter(Boolean),
        };
        const res = editingProject
            ? await projectsAPI.update(editingProject._id, apiData)
            : await projectsAPI.add(apiData);
        if (res.success) {
            await loadProjects();
            handleCloseForm();
        } else {
            alert(res.message || 'An error occurred.');
        }
        setFormLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            const res = await projectsAPI.delete(id);
            if (res.success) {
                setProjects(projects.filter(p => p._id !== id));
            } else {
                alert(res.message || 'Failed to delete project.');
            }
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><FiBox /> Project Management</h3>
                <button onClick={() => handleOpenForm()} className="px-3 py-1.5 bg-accent-blue text-white rounded-lg text-sm flex items-center gap-2"><FiPlus /> Add Project</button>
            </div>
            {isLoading ? <Spinner /> : error ? <p className="text-red-500">{error}</p> : (
                <div className="space-y-3">
                    {projects.map(project => (
                        <div key={project._id} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                            <p className="font-semibold">{project.title}</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleOpenForm(project)} className="text-neutral-500 hover:text-accent-blue"><FiEdit /></button>
                                <button onClick={() => handleDelete(project._id)} className="text-neutral-500 hover:text-red-500"><FiTrash2 /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingProject ? 'Edit Project' : 'Add New Project'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {Object.keys(initialFormData).map(key => {
                        const isTextArea = key.includes('description');
                        const isCheckbox = key === 'featured';
                        const props = { name: key, id: key, onChange: handleChange, className: "w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700", placeholder: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1') };
                        if (key !== 'techStack') props.value = formData[key];
                        return (
                            <div key={key}>
                                <label htmlFor={key} className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                {key === 'techStack' ? <TagInput tags={formData.techStack} setTags={(newTags) => setFormData(prev => ({ ...prev, techStack: newTags }))} placeholder="Add technologies..." />
                                    : isCheckbox ? <input type="checkbox" checked={formData.featured} {...props} className="h-4 w-4 ml-2" />
                                        : isTextArea ? <textarea rows="3" {...props}></textarea>
                                            : <input type="text" {...props} />}
                                {key === 'thumbnail' && formData.thumbnail && <img src={formData.thumbnail} alt="Thumbnail Preview" className="mt-2 w-40 h-24 object-cover rounded-lg border border-light-border dark:border-neutral-700" onError={(e) => e.target.classList.add('hidden')} onLoad={(e) => e.target.classList.remove('hidden')} />}
                                {key === 'images' && (
                                    <>
                                        <p className="text-xs text-neutral-500 mt-1">Comma-separated values.</p>
                                        {formData.images && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {formData.images.split(',').map(url => url.trim()).filter(Boolean).map((url, index) => (
                                                    <img key={index} src={url} alt={`Preview ${index + 1}`} className="w-24 h-16 object-cover rounded-md border border-light-border dark:border-neutral-700" onError={(e) => e.target.classList.add('hidden')} onLoad={(e) => e.target.classList.remove('hidden')} />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                    <button type="submit" disabled={formLoading} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2 disabled:bg-neutral-500">{formLoading ? <Spinner /> : <FiSave />} {editingProject ? 'Save Changes' : 'Create Project'}</button>
                </form>
            </Modal>
        </div>
    );
};

export default ProjectManager;