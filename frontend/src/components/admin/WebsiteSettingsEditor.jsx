import React, { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiGlobe, FiFileText, FiEye, FiTool, FiLoader, FiShield } from 'react-icons/fi';
import { profileAPI, uploadAPI } from '../../utils/api';

export default function WebsiteSettingsEditor({ profile, refetchProfile, showToast }) {
    const [formData, setFormData] = useState({
        siteName: '',
        metaTitle: '',
        metaDescription: '',
        logoUrl: '',
        faviconUrl: '',
        copyrightText: '',
        maintenanceMode: false,
    });

    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profile?.websiteSettings) {
            const settings = profile.websiteSettings;
            setFormData({
                siteName: settings.siteName || '',
                metaTitle: settings.seo?.metaTitle || '',
                metaDescription: settings.seo?.metaDescription || '',
                logoUrl: settings.logoUrl || '',
                faviconUrl: settings.faviconUrl || '',
                copyrightText: settings.footer?.copyright || '',
                maintenanceMode: settings.maintenanceMode?.enabled || false,
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
            if (name === 'logoFile') setLogoFile(files[0]);
            if (name === 'faviconFile') setFaviconFile(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let finalLogoUrl = formData.logoUrl;
            let finalFaviconUrl = formData.faviconUrl;

            if (logoFile) {
                const uploadRes = await uploadAPI.uploadFile(logoFile);
                if (uploadRes.success) finalLogoUrl = uploadRes.data.url;
                else throw new Error('Logo upload failed.');
            }

            if (faviconFile) {
                const uploadRes = await uploadAPI.uploadFile(faviconFile);
                if (uploadRes.success) finalFaviconUrl = uploadRes.data.url;
                else throw new Error('Favicon upload failed.');
            }

            const payload = {
                websiteSettings: {
                    siteName: formData.siteName,
                    seo: {
                        metaTitle: formData.metaTitle,
                        metaDescription: formData.metaDescription,
                    },
                    logoUrl: finalLogoUrl,
                    faviconUrl: finalFaviconUrl,
                    footer: {
                        copyright: formData.copyrightText,
                    },
                    maintenanceMode: {
                        enabled: formData.maintenanceMode,
                    }
                }
            };

            const res = await profileAPI.updateProfile(payload);
            if (res.success) {
                showToast('Website settings updated successfully!', 'success');
                if (refetchProfile) refetchProfile();
            } else {
                throw new Error(res.message || 'Failed to update website settings.');
            }
        } catch (error) {
            console.error('Failed to update website settings:', error);
            showToast(error.message || 'An error occurred while updating.', 'error');
        } finally {
            setIsLoading(false);
            setLogoFile(null);
            setFaviconFile(null);
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
                <FiSettings /> Website Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General & SEO Section */}
                <div className="space-y-6">
                    <InputField icon={<FiGlobe />} label="Website Name" name="siteName" value={formData.siteName} onChange={handleInputChange} placeholder="Your Portfolio Name" />
                    <InputField icon={<FiEye />} label="Meta Title (for SEO)" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} placeholder="e.g., John Doe - Full-Stack Developer" />
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5">Meta Description (for SEO)</label>
                        <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} placeholder="A short, compelling description for search engines." rows="3" className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"></textarea>
                    </div>
                    <InputField icon={<FiFileText />} label="Footer Copyright Text" name="copyrightText" value={formData.copyrightText} onChange={handleInputChange} placeholder="e.g., © 2024 John Doe. All Rights Reserved." />
                </div>

                {/* Assets Section */}
                <div className="p-4 border border-dashed border-neutral-700 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5">Logo</label>
                            <input type="file" name="logoFile" onChange={handleFileChange} accept="image/png, image/jpeg, image/svg+xml" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />
                            {(logoFile || formData.logoUrl) && (
                                <div className="mt-3 p-2 bg-neutral-800 rounded-lg inline-block">
                                    <img src={logoFile ? URL.createObjectURL(logoFile) : formData.logoUrl} alt="Logo Preview" className="h-10" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5">Favicon (.ico, .png, .svg)</label>
                            <input type="file" name="faviconFile" onChange={handleFileChange} accept=".ico, image/png, image/svg+xml" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />
                            {(faviconFile || formData.faviconUrl) && (
                                <div className="mt-3 p-2 bg-neutral-800 rounded-lg inline-block">
                                    <img src={faviconFile ? URL.createObjectURL(faviconFile) : formData.faviconUrl} alt="Favicon Preview" className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Maintenance Mode Section */}
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FiTool className="text-red-400 text-xl" />
                            <div>
                                <label className="text-sm font-bold text-white">Maintenance Mode</label>
                                <p className="text-xs text-red-300/70">If enabled, visitors will see a maintenance page.</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${formData.maintenanceMode ? 'bg-red-500' : 'bg-neutral-700'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${formData.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </div>
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
                                Saving Settings...
                            </>
                        ) : (
                            <>
                                <FiSave />
                                Save Website Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
