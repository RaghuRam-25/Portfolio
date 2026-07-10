import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../utils/api';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import { FiSliders, FiPlus, FiSave, FiEdit, FiTrash2 } from 'react-icons/fi';

// Default data from EstimatorEditor
const defaultEstimatorData = {
    projectTypes: [
        { id: 'landing', name: 'Premium Landing Page', basePrice: 300, baseDays: 4 },
        { id: 'ecommerce', name: 'E-commerce Platform', basePrice: 800, baseDays: 10 },
        { id: 'saas', name: 'SaaS / Custom Web App', basePrice: 1200, baseDays: 14 },
    ],
    features: [
        { id: 'auth', name: 'User Authentication & Security', price: 150, days: 2 },
        { id: 'db', name: 'Database Integration (MongoDB/SQL)', price: 200, days: 3 },
        { id: 'payment', name: 'Stripe / SSLCommerz Gateway', price: 250, days: 3 },
        { id: 'ui', name: 'Dark Mode & Premium UI Micro-interactions', price: 120, days: 1 },
        { id: 'admin', name: 'Advanced Admin Control Panel', price: 350, days: 4 },
        { id: 'seo', name: 'SEO Optimization & Speed Auditing', price: 100, days: 1 },
    ]
};

// Simple Bar Chart Component
const RevenueChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-sm text-neutral-500">No data to display chart.</p>;
    }

    const maxValue = Math.max(...data.map(item => item.basePrice));

    return (
        <div className="w-full h-64 p-4 border border-light-border dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 flex items-end gap-4">
            {data.map(item => (
                <div key={item.id} className="flex-1 flex flex-col items-center gap-2">
                    <div
                        className="w-full bg-accent-blue/20 dark:bg-accent-purple/20 rounded-t-lg hover:bg-accent-blue/40 dark:hover:bg-accent-purple/40 transition-all"
                        style={{ height: `${(item.basePrice / maxValue) * 100}%` }}
                        title={`$${item.basePrice}`}
                    ></div>
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 truncate">{item.name}</p>
                </div>
            ))}
        </div>
    );
};

const ProjectPlanChart = ({ profile, refetchProfile }) => {
    const [estimatorData, setEstimatorData] = useState({ projectTypes: [], features: [] });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('projectTypes'); // 'projectTypes' or 'features'
    const [currentItem, setCurrentItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);

    useEffect(() => {
        const estimatorConfig = profile?.projectEstimator;
        if (estimatorConfig && estimatorConfig.projectTypes && estimatorConfig.features) {
            setEstimatorData(estimatorConfig);
        } else {
            setEstimatorData(defaultEstimatorData);
        }
    }, [profile]);

    const handleOpenModal = (type, item, index) => {
        setModalType(type);
        setCurrentItem(item ? { ...item } : { id: '', name: '', basePrice: 0, baseDays: 0, price: 0, days: 0 });
        setCurrentIndex(index); // null for new
        setIsModalOpen(true);
    };

    const handleSaveItem = () => {
        let newItems = [...estimatorData[modalType]];
        if (currentIndex !== null) {
            newItems[currentIndex] = currentItem;
        } else {
            const newId = currentItem.id || currentItem.name.toLowerCase().replace(/\s+/g, '-');
            newItems.push({ ...currentItem, id: newId });
        }
        setEstimatorData(prev => ({ ...prev, [modalType]: newItems }));
        setIsModalOpen(false);
    };

    const handleDeleteItem = (type, index) => {
        if (window.confirm(`Are you sure you want to delete this ${type === 'projectTypes' ? 'project type' : 'feature'}?`)) {
            const newItems = estimatorData[type].filter((_, i) => i !== index);
            setEstimatorData(prev => ({ ...prev, [type]: newItems }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const res = await profileAPI.updateProfile({ projectEstimator: estimatorData });
        setLoading(false);

        if (res.success) {
            setMessage({ type: 'success', text: 'Project plan settings updated successfully!' });
            if (refetchProfile) refetchProfile();
        } else {
            setMessage({ type: 'error', text: res.message || 'Failed to update.' });
        }
    };

    const renderModalContent = () => {
        if (!currentItem) return null;
        const isProjectType = modalType === 'projectTypes';
        return (
            <div className="space-y-4">
                <input type="text" placeholder="ID (e.g., landing-page)" value={currentItem.id || ''} onChange={(e) => setCurrentItem({ ...currentItem, id: e.target.value })} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                <input type="text" placeholder="Name" value={currentItem.name || ''} onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                <input type="number" placeholder={isProjectType ? "Base Price ($)" : "Price ($)"} value={isProjectType ? currentItem.basePrice || 0 : currentItem.price || 0} onChange={(e) => setCurrentItem({ ...currentItem, [isProjectType ? 'basePrice' : 'price']: Number(e.target.value) })} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                <input type="number" placeholder={isProjectType ? "Base Days" : "Days"} value={isProjectType ? currentItem.baseDays || 0 : currentItem.days || 0} onChange={(e) => setCurrentItem({ ...currentItem, [isProjectType ? 'baseDays' : 'days']: Number(e.target.value) })} className="w-full mt-1 p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                <button onClick={handleSaveItem} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2"><FiSave /> {currentIndex !== null ? 'Update' : 'Add'}</button>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <h3 className="text-lg font-bold flex items-center gap-2"><FiSliders /> Project Plan & Pricing</h3>
            <p className="text-sm text-neutral-500 mt-1 mb-6">Manage pricing for your project estimator and visualize the revenue.</p>
            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Project Types</label>
                        <button type="button" onClick={() => handleOpenModal('projectTypes', null, null)} className="px-3 py-1.5 bg-accent-blue text-white rounded-lg text-sm flex items-center gap-2"><FiPlus /> Add</button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {estimatorData.projectTypes.map((item, index) => (<div key={index} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"><p className="font-semibold text-sm truncate w-48">{item.name}</p><div className="flex items-center gap-3"><button type="button" onClick={() => handleOpenModal('projectTypes', item, index)} className="text-neutral-500 hover:text-accent-blue"><FiEdit /></button><button type="button" onClick={() => handleDeleteItem('projectTypes', index)} className="text-neutral-500 hover:text-red-500"><FiTrash2 /></button></div></div>))}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Features List</label>
                        <button type="button" onClick={() => handleOpenModal('features', null, null)} className="px-3 py-1.5 bg-accent-blue text-white rounded-lg text-sm flex items-center gap-2"><FiPlus /> Add</button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {estimatorData.features.map((item, index) => (<div key={index} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"><p className="font-semibold text-sm truncate w-48">{item.name}</p><div className="flex items-center gap-3"><button type="button" onClick={() => handleOpenModal('features', item, index)} className="text-neutral-500 hover:text-accent-blue"><FiEdit /></button><button type="button" onClick={() => handleDeleteItem('features', index)} className="text-neutral-500 hover:text-red-500"><FiTrash2 /></button></div></div>))}
                    </div>
                </div>
                <div className="md:col-span-2">
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2 disabled:bg-neutral-500">{loading ? <Spinner /> : <FiSave />} Save Plan & Revenue Settings</button>
                    {message.text && <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{message.text}</p>}
                </div>
            </form>

            {/* Chart */}
            <div className="mt-12 pt-8 border-t border-light-border dark:border-neutral-800">
                <h4 className="text-sm font-bold mb-2">Project Type Base Revenue</h4>
                <RevenueChart data={estimatorData.projectTypes} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Edit ${modalType === 'projectTypes' ? 'Project Type' : 'Feature'}`}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default ProjectPlanChart;