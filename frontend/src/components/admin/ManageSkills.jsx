import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiInfo, FiLayers } from 'react-icons/fi';
import SkillForm from './SkillForm';
import Modal from '../ui/Modal';
import { skillAPI } from '../../utils/api';

// আসল প্রোজেক্টে এই mockApi এর পরিবর্তে utils/api.js থেকে আসল API কল করতে হবে।
const mockApi = {
    getSkills: async () => {
        await new Promise(r => setTimeout(r, 1000));
        return {
            success: true, data: [
                { _id: 'skill1', name: 'React', category: 'frontend', level: 95, years: 4, order: 1 },
                { _id: 'skill2', name: 'Node.js', category: 'backend', level: 90, years: 4, order: 2 },
            ]
        };
    },
    deleteSkill: async (id) => {
        await new Promise(r => setTimeout(r, 800));
        return { success: true, message: 'Skill deleted!' };
    }
};

export default function ManageSkills({ showToast }) {
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);

    const fetchSkills = async () => {
        setIsLoading(true);
        try {
            const response = await skillAPI.getAll();
            if (response.success) {
                setSkills(response.data);
            } else {
                showToast(response.message || 'Failed to fetch skills.', 'error');
            }
        } catch (error) {
            showToast('An error occurred while fetching skills.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleAdd = () => {
        setEditingSkill(null);
        setIsModalOpen(true);
    };

    const handleEdit = (skill) => {
        setEditingSkill(skill);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                const response = await skillAPI.delete(id);
                if (response.success) {
                    showToast(response.message, 'success');
                    fetchSkills();
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
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiLayers /> Manage Skills</h2>
                <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-bold hover:bg-accent-purple/90">
                    <FiPlus /> Add New Skill
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-accent-purple text-4xl" /></div>
            ) : skills.length === 0 ? (
                <div className="text-center p-8 text-neutral-400"><FiInfo className="text-5xl mx-auto mb-4" /><p>No skills found. Add your first skill!</p></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-800">
                        <thead>
                            <tr className="text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Level</th>
                                <th className="px-4 py-3">Years</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {skills.map((skill) => (
                                <tr key={skill._id} className="hover:bg-neutral-800/50">
                                    <td className="px-4 py-4 text-sm font-medium text-white">{skill.name}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300 capitalize">{skill.category}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{skill.level}%</td>
                                    <td className="px-4 py-4 text-sm text-neutral-300">{skill.years}</td>
                                    <td className="px-4 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(skill)} className="text-accent-purple hover:text-accent-purple/80 mr-3"><FiEdit /></button>
                                        <button onClick={() => handleDelete(skill._id)} className="text-red-500 hover:text-red-400"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSkill ? 'Edit Skill' : 'Add New Skill'}>
                <SkillForm skill={editingSkill} onClose={() => setIsModalOpen(false)} showToast={showToast} onSaveSuccess={fetchSkills} />
            </Modal>
        </div>
    );
}
