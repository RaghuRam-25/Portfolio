import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiEye } from 'react-icons/fi';
import { profileAPI } from '../../utils/api';

const sections = [
    { key: 'hero', name: 'Hero Section' },
    { key: 'about', name: 'About Section' },
    { key: 'skills', name: 'Skills Matrix' },
    { key: 'projects', name: 'Projects Portfolio' },
    { key: 'education', name: 'Education History' },
    { key: 'videos', name: 'Video Showcases' },
    { key: 'certificates', name: 'Certificates' },
    { key: 'testimonials', name: 'Testimonials' },
    { key: 'estimator', name: 'Project Estimator' },
    { key: 'contact', name: 'Contact Section' },
];

export default function SectionVisibilityEditor({ profile, refetchProfile, showToast }) {
    const [visibility, setVisibility] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const initialVisibility = sections.reduce((acc, section) => {
            acc[section.key] = profile?.sectionVisibility?.[section.key] ?? true;
            return acc;
        }, {});
        setVisibility(initialVisibility);
    }, [profile]);

    const handleToggle = (key) => {
        setVisibility(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                sectionVisibility: visibility
            };
            await profileAPI.updateProfile(payload);
            showToast('Section visibility updated successfully!', 'success');
            if (refetchProfile) refetchProfile();
        } catch (error) {
            console.error("Failed to update section visibility:", error);
            showToast(error.message || 'An error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <FiEye /> Homepage Section Visibility
            </h2>
            <p className="text-sm text-neutral-400 mb-6 -mt-4">
                Control which sections are visible to visitors on your homepage.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {sections.map(section => (
                    <div key={section.key} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                        <label className="text-sm font-bold text-white">{section.name}</label>
                        <div
                            onClick={() => handleToggle(section.key)}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${visibility[section.key] ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${visibility[section.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </div>
                ))}

                <div className="pt-6 border-t border-neutral-800">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Visibility Settings</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
