import React, { useState, useEffect } from 'react';
import { FiBook, FiLoader, FiInfo } from 'react-icons/fi';
import { educationAPI } from '../utils/api';

export default function Education({ profile }) {
    const [educationHistory, setEducationHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const sectionCopy = profile?.educationSection || {};

    useEffect(() => {
        const fetchEducation = async () => {
            try {
                setIsLoading(true);
                const response = await educationAPI.getAll();
                if (response.success) {
                    const sorted = response.data.sort((a, b) => new Date(b.endDate || '9999') - new Date(a.endDate || '9999'));
                    setEducationHistory(sorted);
                } else {
                    throw new Error(response.message || 'Failed to fetch education history.');
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching education history:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEducation();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    if (isLoading) {
        return (
            <section id="education" className="py-24 text-center">
                <FiLoader className="animate-spin text-accent-purple text-4xl mx-auto" />
                <p className="text-sm text-neutral-400 mt-2">Loading Education...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section id="education" className="py-24 text-center text-red-400">
                <FiInfo className="text-5xl mx-auto mb-4" />
                <p>Error loading education history: {error}</p>
            </section>
        );
    }

    return (
        <section id="education" className="py-24 border-t border-neutral-900">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-16 text-center animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white inline-flex items-center gap-2">
                        <FiBook className="text-accent-purple" /> {sectionCopy.title || 'My Education'}
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2 max-w-2xl mx-auto">
                        {sectionCopy.subtitle || 'A summary of my academic background and qualifications.'}
                    </p>
                </div>

                {educationHistory.length === 0 ? (
                    <div className="text-center p-8 text-neutral-500 animate-fade-in-up">
                        <FiInfo className="text-5xl mx-auto mb-4" />
                        <p>{sectionCopy.emptyState || 'No education history has been added yet.'}</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-neutral-800 ml-4 md:ml-0 space-y-12">
                        {educationHistory.map((edu, index) => (
                            <div
                                key={edu._id}
                                className="pl-8 relative animate-fade-in-up"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                {/* Timeline dot */}
                                <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-accent-purple rounded-full border-4 border-neutral-900 shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                    <span className="absolute inset-0 rounded-full bg-accent-purple animate-ping opacity-30"></span>
                                </div>

                                <p className="text-xs text-neutral-500 font-semibold mb-1">
                                    {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                                </p>
                                <h3 className="text-lg font-bold text-white">{edu.degree}</h3>
                                <h4 className="text-sm font-medium text-neutral-300">
                                    {edu.institution}
                                    {edu.fieldOfStudy && <span className="italic text-neutral-400"> — {edu.fieldOfStudy}</span>}
                                </h4>
                                {edu.description && (
                                    <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{edu.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}