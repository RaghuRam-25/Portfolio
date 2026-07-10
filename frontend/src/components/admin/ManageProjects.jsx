import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiInfo } from 'react-icons/fi';
import ProjectForm from './ProjectForm';
import Modal from '../ui/Modal';
import { projectsAPI } from '../../utils/api';

// এই কম্পোনেন্টটি ব্যবহারের জন্য আপনার প্রোজেক্টের api.js ফাইল থেকে projectAPI ইম্পোর্ট করতে হবে।
// import { projectAPI } from '../../utils/api';

// === ডেমো এর জন্য মক API ফাংশন (প্রোডাকশনে আসল API ব্যবহার করতে হবে) ===
const mockApi = {
    getProjects: async () => {
        console.log("Fetching projects...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            data: [
                {
                    _id: 'proj1', title: 'E-commerce Platform', description: 'Full-stack e-commerce solution.', category: 'Web Development',
                    techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'], githubUrl: '#', liveUrl: '#', isFeatured: true, order: 1,
                    thumbnail: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=E-commerce', images: []
                },
                {
                    _id: 'proj2', title: 'Portfolio Website', description: 'Personal portfolio showcasing skills.', category: 'Web Design',
                    techStack: ['React', 'Tailwind CSS'], githubUrl: '#', liveUrl: '#', isFeatured: false, order: 2,
                    thumbnail: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Portfolio', images: []
                },
            ]
        };
    },
    deleteProject: async (id) => {
        console.log(`Deleting project ${id}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, message: 'Project deleted successfully!' };
    }
};
// ========================================================================

export default function ManageProjects({ showToast }) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null); // null for add, project object for edit

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await projectsAPI.getAll();
            if (response.success) {
                setProjects(response.data);
            } else {
                showToast(response.message || 'Failed to fetch projects.', 'error');
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            showToast('An error occurred while fetching projects.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleAddProject = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                setIsLoading(true); // Optionally show loading state for delete
                const response = await projectsAPI.delete(id);
                if (response.success) {
                    showToast(response.message, 'success');
                    fetchProjects(); // Re-fetch projects to update the list
                } else {
                    showToast(response.message || 'Failed to delete project.', 'error');
                }
            } catch (error) {
                console.error("Error deleting project:", error);
                showToast('An error occurred while deleting the project.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSaveSuccess = () => {
        fetchProjects(); // Refresh the list after a project is added/edited
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Manage Projects</h2>
                <button
                    onClick={handleAddProject}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-bold hover:bg-accent-purple/90 transition-colors"
                >
                    <FiPlus /> Add New Project
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <FiLoader className="animate-spin text-accent-purple text-4xl" />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center p-8 text-neutral-400">
                    <FiInfo className="text-5xl mx-auto mb-4" />
                    <p>No projects found. Add your first project!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-800">
                        <thead>
                            <tr className="text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Featured</th>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {projects.map((project) => (
                                <tr key={project._id} className="hover:bg-neutral-800/50">
                                    <td className="px-4 py-4 text-sm font-medium text-white">{project.title}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{project.category}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{project.isFeatured ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{project.order}</td>
                                    <td className="px-4 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleEditProject(project)} className="text-accent-purple hover:text-accent-purple/80 mr-3">
                                            <FiEdit className="inline-block" />
                                        </button>
                                        <button onClick={() => handleDeleteProject(project._id)} className="text-red-500 hover:text-red-400">
                                            <FiTrash2 className="inline-block" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add New Project'}>
                <ProjectForm
                    project={editingProject}
                    onClose={() => setIsModalOpen(false)}
                    showToast={showToast}
                    onSaveSuccess={handleSaveSuccess}
                />
            </Modal>
        </div>
    );
}
