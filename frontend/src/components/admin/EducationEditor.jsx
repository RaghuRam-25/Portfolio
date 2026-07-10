import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiInfo, FiBook, FiSave } from 'react-icons/fi';
import EducationForm from './EducationForm';
import Modal from '../ui/Modal';
import { educationAPI, profileAPI } from '../../utils/api';

export default function EducationEditor({ profile, refetchProfile, showToast }) {
    const [education, setEducation] = useState([]);
    const [sectionData, setSectionData] = useState({ title: '', subtitle: '', emptyState: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchEducation = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await educationAPI.getAll();
            if (response.success) {
                setEducation(response.data);
            } else {
                showToast(response.message || 'Failed to fetch education history.', 'error');
            }
        } catch (error) {
            showToast('An error occurred while fetching education history.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        setSectionData(profile?.educationSection || { title: 'My Education', subtitle: 'A summary of my academic background and qualifications.' });
        fetchEducation();
    }, [profile, fetchEducation]);

    const handleSectionChange = (e) => {
        const { name, value } = e.target;
        setSectionData(prev => ({ ...prev, [name]: value }));
    };

    const handleSectionSave = async () => {
        try {
            const res = await profileAPI.updateProfile({ educationSection: sectionData });
            if (res.success) {
                showToast('Education section details updated!', 'success');
                if (refetchProfile) refetchProfile();
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            showToast(error.message || 'Failed to update.', 'error');
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this education entry?')) {
            try {
                const response = await educationAPI.delete(id);
                if (response.success) {
                    showToast(response.message, 'success');
                    fetchEducation();
                } else {
                    showToast(response.message, 'error');
                }
            } catch (error) {
                showToast('An error occurred while deleting.', 'error');
            }
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-8">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><FiBook /> Edit Education Section</h3>
                <div className="space-y-4 p-4 border border-neutral-800 rounded-lg">
                    <input type="text" name="title" placeholder="Section Title" value={sectionData.title} onChange={handleSectionChange} className="w-full p-2 text-sm rounded-md bg-neutral-800 border border-neutral-700" />
                    <textarea name="subtitle" placeholder="Section Subtitle" rows="2" value={sectionData.subtitle} onChange={handleSectionChange} className="w-full p-2 text-sm rounded-md bg-neutral-800 border border-neutral-700"></textarea>
                    <button onClick={handleSectionSave} className="px-3 py-1.5 bg-accent-blue text-white rounded-lg text-xs flex items-center gap-2"><FiSave /> Save Section Text</button>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Manage Entries</h3>
                    <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-bold hover:bg-accent-purple/90"><FiPlus /> Add Entry</button>
                </div>

                {isLoading ? <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-accent-purple text-4xl" /></div> : education.length === 0 ? <div className="text-center p-8 text-neutral-400"><FiInfo className="text-5xl mx-auto mb-4" /><p>No education history found.</p></div> : <div className="space-y-2">{education.map((item) => (<div key={item._id} className="flex justify-between items-center p-3 rounded-lg bg-neutral-800/50"><p className="font-semibold text-sm">{item.degree} at {item.institution}</p><div className="flex items-center gap-3"><button onClick={() => handleEdit(item)} className="text-accent-purple hover:text-accent-purple/80"><FiEdit /></button><button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-400"><FiTrash2 /></button></div></div>))}</div>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Education' : 'Add Education'}>
                <EducationForm educationItem={editingItem} onClose={() => setIsModalOpen(false)} showToast={showToast} onSaveSuccess={fetchEducation} />
            </Modal>
        </div>
    );
}