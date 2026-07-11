import React, { useState, useEffect } from 'react';
import { FiAward, FiArchive, FiCheckCircle } from 'react-icons/fi';
import { projectsAPI } from '../../utils/api';
import { calculateExperience } from '../../utils/experience';

const iconMap = {
    "Years Exp": <FiAward />,
    "Experience": <FiAward />,
    "Projects": <FiArchive />,
    "Delivery": <FiCheckCircle />,
};

const colorMap = {
    "Years Exp": 'text-blue-500',
    "Experience": 'text-blue-500',
    "Projects": 'text-emerald-500',
    "Delivery": 'text-purple-500',
};

export default function DashboardSummary({ profile }) {
    const [projectCount, setProjectCount] = useState(0);
    const [deliveryRate, setDeliveryRate] = useState(100);

    // অভিজ্ঞতা start date থেকে স্বয়ংক্রিয়ভাবে Days/Weeks/Months/Years হিসেবে
    const experienceText = calculateExperience(profile?.careerStartDate);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const response = await projectsAPI.getAll();
                if (response.success) {
                    const allProjects = response.data || [];
                    setProjectCount(allProjects.length);
                    if (allProjects.length > 0) {
                        const deliveredCount = allProjects.filter(p => p.isDelivered).length;
                        const rate = Math.round((deliveredCount / allProjects.length) * 100);
                        setDeliveryRate(rate);
                    } else {
                        setDeliveryRate(100);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch projects in DashboardSummary:", error);
            }
        };
        fetchProjectData();
    }, []);

    const rawStats = profile?.stats || [];

    const stats = rawStats.map(stat => {
        if (stat.label && stat.label.toLowerCase().includes('project')) {
            return { ...stat, value: `${projectCount}+` };
        }
        if (stat.label && (stat.label.toLowerCase().includes('year') || stat.label.toLowerCase().includes('exp'))) {
            return { ...stat, label: 'Experience', value: experienceText };
        }
        if (stat.label && stat.label.toLowerCase().includes('delivery')) {
            return { ...stat, value: `${deliveryRate}%` };
        }
        return stat;
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((item, index) => (
                <div key={index} className="p-6 rounded-2xl border border-light-border dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 ${colorMap[item.label] || 'text-gray-500'}`}>
                        {React.cloneElement(iconMap[item.label] || <FiAward />, { className: 'w-6 h-6' })}
                    </div>
                    <div>
                        <p className="text-2xl font-black text-light-textPrimary dark:text-dark-textPrimary">{item.value}</p>
                        <p className="text-xs text-light-textSecondary dark:text-neutral-400">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}