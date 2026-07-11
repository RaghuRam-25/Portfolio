import React, { useState, useEffect } from 'react';
import { FiAward, FiLoader, FiInfo, FiExternalLink, FiCalendar } from 'react-icons/fi';
import { certificateAPI, PLACEHOLDER_IMAGE } from '../utils/api';

export default function Certificates({ profile }) {
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const sectionCopy = profile?.certificateSection || {};

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                setIsLoading(true);
                const response = await certificateAPI.getAll();
                if (response.success) {
                    setCertificates(response.data);
                } else {
                    throw new Error(response.message || 'Failed to fetch certificates.');
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching certificates:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    if (isLoading) {
        return (
            <section id="certificates" className="py-24 text-center">
                <FiLoader className="animate-spin text-accent-purple text-4xl mx-auto" />
                <p className="text-sm text-neutral-400 mt-2">Loading Certificates...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section id="certificates" className="py-24 text-center text-red-400">
                <FiInfo className="text-5xl mx-auto mb-4" />
                <p>Error loading certificates: {error}</p>
            </section>
        );
    }

    return (
        <section id="certificates" className="pt-2 pb-24 border-t border-neutral-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12 text-center animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white inline-flex items-center gap-2">
                        <FiAward className="text-accent-purple" /> {sectionCopy.title || 'My Achievements & Certifications'}
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2 max-w-2xl mx-auto">
                        {sectionCopy.subtitle || 'A collection of my professional certifications and awards that validate my skills and expertise.'}
                    </p>
                </div>

                {certificates.length === 0 ? (
                    <div className="text-center p-8 text-neutral-500 animate-fade-in-up">
                        <FiInfo className="text-5xl mx-auto mb-4" />
                        <p>{sectionCopy.emptyState || 'No certificates have been added yet. Please check back later!'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {certificates.map((cert, index) => (
                            <div
                                key={cert._id}
                                className="group bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-accent-purple/10 hover:-translate-y-2 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
                                    <img src={cert.certificateImage || PLACEHOLDER_IMAGE} alt={cert.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 p-2" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-base font-bold text-white mb-1 truncate" title={cert.name}>{cert.name}</h3>
                                    <p className="text-xs text-neutral-400 mb-4">Issued by <span className="font-semibold text-neutral-300">{cert.organization}</span></p>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-800">
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <FiCalendar />
                                            <span>{new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                                        </div>
                                        {cert.credentialLink && <a href={cert.credentialLink} target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:text-accent-purple/80 transition-colors text-xs font-bold inline-flex items-center gap-1" title="View Credential"><FiExternalLink /> Verify</a>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
