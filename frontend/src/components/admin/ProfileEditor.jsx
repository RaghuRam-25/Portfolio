import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../utils/api';
import Spinner from '../ui/Spinner';
import { FiUser, FiSave, FiCalendar } from 'react-icons/fi';

const ProfileEditor = ({ profile, refetchProfile }) => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        bio: '',
        avatarUrl: '',
        careerStartDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                title: profile.title || '',
                bio: profile.bio || '',
                avatarUrl: profile.avatarUrl || '',
                careerStartDate: profile.careerStartDate ? profile.careerStartDate.split('T')[0] : '',
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const res = await profileAPI.updateProfile(formData);
        setLoading(false);

        if (res.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            if (refetchProfile) refetchProfile();
        } else {
            setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <h3 className="text-lg font-bold flex items-center gap-2"><FiUser /> Edit Profile Information</h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                    </div>
                    <div>
                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="avatarUrl" className="text-sm font-medium">Avatar URL</label>
                        <input type="text" name="avatarUrl" id="avatarUrl" value={formData.avatarUrl} onChange={handleChange} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                        {formData.avatarUrl && <img src={formData.avatarUrl} alt="Avatar Preview" className="mt-3 w-20 h-20 object-cover rounded-full border-2 border-light-border dark:border-neutral-700" onError={(e) => e.target.classList.add('hidden')} onLoad={(e) => e.target.classList.remove('hidden')} />}
                    </div>
                    <div>
                        <label htmlFor="careerStartDate" className="text-sm font-medium flex items-center gap-1"><FiCalendar /> Career Start Date</label>
                        <input type="date" name="careerStartDate" id="careerStartDate" value={formData.careerStartDate} onChange={handleChange} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                    </div>
                </div>
                <div>
                    <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                    <textarea name="bio" id="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700"></textarea>
                </div>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2 disabled:bg-neutral-500">{loading ? <Spinner /> : <FiSave />} Save Changes</button>
                {message.text && <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{message.text}</p>}
            </form>
        </div>
    );
};

export default ProfileEditor;