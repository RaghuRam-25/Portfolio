import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiLoader, FiInfo, FiStar } from 'react-icons/fi';
import { testimonialAPI, SOCKET_URL } from '../utils/api';

export default function Testimonials({ profile }) {
    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const sectionCopy = profile?.testimonialSection || {};

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setIsLoading(true);
                const response = await testimonialAPI.getAll();
                if (response.success) {
                    setTestimonials(response.data);
                } else {
                    throw new Error(response.message || 'Failed to fetch testimonials.');
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching testimonials:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <FiStar key={i} className={`w-4 h-4 transition-colors ${i < fullStars ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-600'}`} />
            );
        }
        return <div className="flex gap-1">{stars}</div>;
    };

    if (isLoading) {
        return (
            <section id="testimonials" className="py-24 text-center">
                <FiLoader className="animate-spin text-accent-purple text-4xl mx-auto" />
                <p className="text-sm text-neutral-400 mt-2">Loading Testimonials...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section id="testimonials" className="py-24 text-center text-red-400">
                <FiInfo className="text-5xl mx-auto mb-4" />
                <p>Error loading testimonials: {error}</p>
            </section>
        );
    }

    return (
        <section id="testimonials" className="pt-2 pb-24 border-t border-neutral-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12 text-center animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white inline-flex items-center gap-2">
                        <FiMessageSquare className="text-accent-purple" /> {sectionCopy.title || 'Client Testimonials'}
                    </h2>
                    <p className="text-sm text-neutral-400 mt-2 max-w-2xl mx-auto">
                        {sectionCopy.subtitle || 'Words from clients who have experienced the quality and impact of my work firsthand.'}
                    </p>
                </div>

                {testimonials.length === 0 ? (
                    <div className="text-center p-8 text-neutral-500 animate-fade-in-up">
                        <FiInfo className="text-5xl mx-auto mb-4" />
                        <p>{sectionCopy.emptyState || 'No testimonials have been added yet. Please check back later!'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((item, index) => (
                            <div
                                key={item._id}
                                className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-accent-purple/10 hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex-grow">
                                    {item.rating && <div className="mb-4">{renderStars(item.rating)}</div>}
                                    <p className="text-neutral-300 text-sm leading-relaxed">"{item.review}"</p>
                                </div>
                                <div className="flex items-center mt-6 pt-6 border-t border-neutral-800">
                                    {item.clientImage && (
                                        <img src={`${SOCKET_URL}/${item.clientImage.replace(/\\/g, '/')}`} alt={item.clientName} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-neutral-700" />
                                    )}
                                    <div>
                                        <h4 className="font-bold text-white">{item.clientName}</h4>
                                        <p className="text-xs text-neutral-400">{item.company}</p>
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
