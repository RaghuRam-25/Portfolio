import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiSearch, FiEye, FiShare2, FiLink } from 'react-icons/fi';
import { profileAPI, uploadAPI } from '../../utils/api';

export default function SEOSettingsEditor({ profile, refetchProfile, showToast }) {
    const [formData, setFormData] = useState({
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        ogImageUrl: '',
    });
    const [ogImageFile, setOgImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profile?.seoSettings) {
            const settings = profile.seoSettings;
            setFormData({
                metaTitle: settings.metaTitle || '',
                metaDescription: settings.metaDescription || '',
                keywords: Array.isArray(settings.keywords) ? settings.keywords.join(', ') : (settings.keywords || ''),
                ogImageUrl: settings.ogImageUrl || '',
            });
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setOgImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let finalOgImageUrl = formData.ogImageUrl;

            if (ogImageFile) {
                const uploadRes = await uploadAPI.uploadFile(ogImageFile);
                if (uploadRes.success) {
                    finalOgImageUrl = uploadRes.data.url;
                } else {
                    throw new Error('Open Graph image upload failed.');
                }
            }

            const payload = {
                seoSettings: {
                    metaTitle: formData.metaTitle,
                    metaDescription: formData.metaDescription,
                    keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
                    ogImageUrl: finalOgImageUrl,
                }
            };

            await profileAPI.updateProfile(payload);
            showToast('SEO settings updated successfully!', 'success');
            if (refetchProfile) refetchProfile();

        } catch (error) {
            console.error("Failed to update SEO settings:", error);
            showToast(error.message || 'An error occurred.', 'error');
        } finally {
            setIsLoading(false);
            setOgImageFile(null);
        }
    };

    const InputField = ({ icon, label, name, value, onChange, placeholder }) => (
        <div>
            <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">{icon}</div>
                <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full pl-10 p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <FiSearch /> SEO Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField icon={<FiEye />} label="Meta Title" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} placeholder="Title for search engine results" />

                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Meta Description</label>
                    <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} placeholder="A brief description for search snippets" rows="3" className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"></textarea>
                </div>

                <InputField icon={<FiSearch />} label="Keywords" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="Comma-separated keywords (e.g., react, node, mern)" />

                <div className="p-4 border border-dashed border-neutral-700 rounded-lg">
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5 flex items-center gap-1"><FiShare2 size={12} /> Open Graph Image</label>
                    <p className="text-xs text-neutral-500 mb-3">Recommended size: 1200x630 pixels. This image appears when you share the link on social media.</p>

                    <InputField icon={<FiLink />} label="Image URL" name="ogImageUrl" value={formData.ogImageUrl} onChange={handleInputChange} placeholder="Paste direct image URL" />

                    <div className="text-center my-2 text-xs text-neutral-500 font-bold">OR</div>

                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Upload from Computer</label>
                    <input type="file" name="ogImageFile" onChange={handleFileChange} accept="image/png, image/jpeg" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />

                    {(ogImageFile || formData.ogImageUrl) && (
                        <div className="mt-4 p-2 bg-neutral-800 rounded-lg inline-block">
                            <img src={ogImageFile ? URL.createObjectURL(ogImageFile) : formData.ogImageUrl} alt="OG Image Preview" className="max-h-32 rounded" />
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-neutral-800">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving SEO Settings...</> : <><FiSave /> Save SEO Settings</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
