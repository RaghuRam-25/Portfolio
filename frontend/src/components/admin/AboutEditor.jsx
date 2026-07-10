import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../utils/api';
import Spinner from '../ui/Spinner';
import { FiAward, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';

const AboutEditor = ({ profile, refetchProfile }) => {
    const [stats, setStats] = useState([]);
    const [aboutSection, setAboutSection] = useState({
        eyebrow: '',
        title: '',
        subtitle: '',
    });
    const [careerStartDate, setCareerStartDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        setStats(profile?.stats || []);
        setAboutSection({
            eyebrow: profile?.aboutSection?.eyebrow || '',
            title: profile?.aboutSection?.title || '',
            subtitle: profile?.aboutSection?.subtitle || '',
        });
        if (profile?.careerStartDate) {
            setCareerStartDate(new Date(profile.careerStartDate).toISOString().split('T')[0]);
        } else {
            setCareerStartDate('');
        }
    }, [profile]);

    const handleStatChange = (index, field, value) => {
        const newStats = [...stats];
        newStats[index] = { ...newStats[index], [field]: value };
        setStats(newStats);
    };

    const addStat = () => {
        setStats(prev => [...prev, { value: '', label: '' }]);
    };

    const deleteStat = (index) => {
        setStats(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        const res = await profileAPI.updateProfile({ stats, aboutSection, careerStartDate });
        setLoading(false);
        if (res.success) {
            setMessage({ type: 'success', text: 'About section updated successfully!' });
            if (refetchProfile) refetchProfile();
        } else {
            setMessage({ type: 'error', text: res.message || 'Failed to update.' });
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <h3 className="text-lg font-bold flex items-center gap-2"><FiAward /> Edit About Section</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <input type="text" placeholder="Eyebrow text" value={aboutSection.eyebrow} onChange={(e) => setAboutSection({ ...aboutSection, eyebrow: e.target.value })} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                    <input type="text" placeholder="About section title" value={aboutSection.title} onChange={(e) => setAboutSection({ ...aboutSection, title: e.target.value })} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                    <textarea placeholder="About section subtitle" rows="3" value={aboutSection.subtitle} onChange={(e) => setAboutSection({ ...aboutSection, subtitle: e.target.value })} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700"></textarea>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5">Career Start Date (for Years Exp calculation)</label>
                        <input type="date" value={careerStartDate} onChange={(e) => setCareerStartDate(e.target.value)} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Highlight Stats</label>
                        <button type="button" onClick={addStat} className="px-3 py-1.5 bg-accent-blue text-white rounded-lg text-sm flex items-center gap-2"><FiPlus /> Add Stat</button>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="space-y-1 rounded-lg border border-light-border dark:border-neutral-800 p-3">
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => deleteStat(index)} className="text-neutral-500 hover:text-red-500"><FiTrash2 /></button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Value (e.g., 3+)"
                                    value={(stat.label.toLowerCase().includes('project') || stat.label.toLowerCase().includes('year') || stat.label.toLowerCase().includes('deliver')) ? 'Auto-calculated' : stat.value}
                                    onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                                    className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800/50 disabled:cursor-not-allowed"
                                    disabled={stat.label.toLowerCase().includes('project') || stat.label.toLowerCase().includes('year') || stat.label.toLowerCase().includes('deliver')}
                                />
                                <input type="text" placeholder="Label (e.g., Years Exp)" value={stat.label} onChange={(e) => handleStatChange(index, 'label', e.target.value)} className="w-full p-2 text-xs rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2 disabled:bg-neutral-500">{loading ? <Spinner /> : <FiSave />} Save About Changes</button>
                {message.text && <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{message.text}</p>}
            </form>
        </div>
    );
};

export default AboutEditor;
