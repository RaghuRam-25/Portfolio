import React, { useState, useEffect } from 'react';
import { FiSave, FiUpload, FiLink, FiType, FiFileText, FiEye, FiEyeOff, FiLoader, FiUser, FiBriefcase, FiMessageSquare, FiEdit2 } from 'react-icons/fi';

// এই কম্পোনেন্টটি ব্যবহারের জন্য আপনার প্রোজেক্টের api.js ফাইল থেকে profileAPI এবং uploadAPI ইম্পোর্ট করতে হবে।
import { profileAPI, uploadAPI } from '../../utils/api';

export default function HeroSectionEditor({ profile, refetchProfile, showToast }) {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        headline: '',
        description: '',
        heroImageUrl: '',
        resumeUrl: '',
        ctaText: '',
        ctaUrl: '',
        isAvailable: true,
        availabilityBadgeText: '',
    });

    const [heroImageFile, setHeroImageFile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                title: profile.title || '',
                headline: profile.heroSection?.headline || '',
                description: profile.heroSection?.description || '',
                heroImageUrl: profile.heroSection?.heroImageUrl || '',
                resumeUrl: profile.heroSection?.resumeUrl || '',
                ctaText: profile.heroSection?.ctaText || '',
                ctaUrl: profile.heroSection?.ctaUrl || '',
                isAvailable: profile.heroSection?.availability?.isAvailable ?? true,
                availabilityBadgeText: profile.heroSection?.availability?.badgeText || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            if (name === 'heroImageFile') setHeroImageFile(files[0]);
            if (name === 'resumeFile') setResumeFile(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let finalHeroImageUrl = formData.heroImageUrl;
            let finalResumeUrl = formData.resumeUrl;

            // Step 1: Upload Hero Image if a new one is selected
            if (heroImageFile) {
                const uploadRes = await uploadAPI.uploadFile(heroImageFile);
                if (uploadRes.success) {
                    finalHeroImageUrl = uploadRes.data.url;
                } else {
                    throw new Error('Hero image upload failed.');
                }
            }

            // Step 2: Upload Resume PDF if a new one is selected
            if (resumeFile) {
                const uploadRes = await uploadAPI.uploadFile(resumeFile);
                if (uploadRes.success) {
                    finalResumeUrl = uploadRes.data.url;
                } else {
                    throw new Error('Resume PDF upload failed.');
                }
            }

            // Step 3: Construct the final payload
            const payload = {
                name: formData.name,
                title: formData.title,
                heroSection: {
                    headline: formData.headline,
                    description: formData.description,
                    heroImageUrl: finalHeroImageUrl,
                    resumeUrl: finalResumeUrl,
                    ctaText: formData.ctaText,
                    ctaUrl: formData.ctaUrl,
                    availability: {
                        isAvailable: formData.isAvailable,
                        badgeText: formData.availabilityBadgeText,
                    }
                }
            };

            // Step 4: Send data to the backend
            await profileAPI.updateProfile(payload);
            showToast('Hero Section updated successfully!', 'success');
            if (refetchProfile) refetchProfile();

        } catch (error) {
            console.error("Failed to update Hero Section:", error);
            showToast(error.message || 'An error occurred while updating.', 'error');
        } finally {
            setIsLoading(false);
            setHeroImageFile(null);
            setResumeFile(null);
        }
    };

    const InputField = ({ icon, label, name, value, onChange, placeholder, type = 'text' }) => (
        <div>
            <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">{icon}</div>
                <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full pl-10 p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-bold mb-6 text-white">Edit Hero Section</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField icon={<FiUser />} label="Your Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., John Doe" />
                    <InputField icon={<FiBriefcase />} label="Your Profession/Title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Full-Stack Developer" />
                </div>

                {/* Section 2: Content */}
                <div className="space-y-4">
                    <InputField icon={<FiEdit2 />} label="Headline" name="headline" value={formData.headline} onChange={handleInputChange} placeholder="e.g., Building Digital Experiences" />
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5">Short Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="A brief introduction about you..." rows="3" className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"></textarea>
                    </div>
                </div>

                {/* Section 3: Assets (Image & Resume) */}
                <div className="p-4 border border-dashed border-neutral-700 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <InputField icon={<FiLink />} label="Hero Image URL" name="heroImageUrl" value={formData.heroImageUrl} onChange={handleInputChange} placeholder="Paste image URL" />
                            <div className="text-center my-2 text-xs text-neutral-500 font-bold">OR</div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5">Upload Hero Image</label>
                            <input type="file" name="heroImageFile" onChange={handleFileChange} accept="image/*" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />
                            {(heroImageFile || formData.heroImageUrl) && (
                                <div className="mt-4">
                                    <img src={heroImageFile ? URL.createObjectURL(heroImageFile) : formData.heroImageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-neutral-700" />
                                </div>
                            )}
                        </div>
                        <div>
                            <InputField icon={<FiLink />} label="Resume URL" name="resumeUrl" value={formData.resumeUrl} onChange={handleInputChange} placeholder="Paste resume URL (.pdf)" />
                            <div className="text-center my-2 text-xs text-neutral-500 font-bold">OR</div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5">Upload Resume PDF</label>
                            <input type="file" name="resumeFile" onChange={handleFileChange} accept=".pdf" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />
                            <div className="mt-3">
                                {resumeFile && <p className="text-xs text-neutral-400">New file selected: {resumeFile.name}</p>}
                                {formData.resumeUrl && !resumeFile && (
                                    <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-accent-purple hover:underline">
                                        <FiFileText /> View Current Resume
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Call to Action & Availability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField icon={<FiType />} label="CTA Button Text" name="ctaText" value={formData.ctaText} onChange={handleInputChange} placeholder="e.g., Download Resume" />
                    <InputField icon={<FiLink />} label="CTA Button URL" name="ctaUrl" value={formData.ctaUrl} onChange={handleInputChange} placeholder="e.g., /resume.pdf or external link" />
                </div>

                <div className="p-4 bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-white">Availability Status</label>
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${formData.isAvailable ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </div>
                    {formData.isAvailable && (
                        <div className="mt-4">
                            <InputField icon={<FiMessageSquare />} label="Availability Badge Text" name="availabilityBadgeText" value={formData.availabilityBadgeText} onChange={handleInputChange} placeholder="e.g., Available for new projects" />
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}