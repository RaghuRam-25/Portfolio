import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiDroplet, FiMoon, FiSun, FiType } from 'react-icons/fi';
import { profileAPI } from '../../utils/api';

export default function ThemeSettingsEditor({ profile, refetchProfile, showToast }) {
    const [formData, setFormData] = useState({
        primaryColor: '',
        secondaryColor: '',
        accentColor: '',
        darkModeEnabled: false,
        fontFamily: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (profile?.themeSettings) {
            const settings = profile.themeSettings;
            setFormData({
                primaryColor: settings.primaryColor || '#06b6d4',
                secondaryColor: settings.secondaryColor || '#3b82f6',
                accentColor: settings.accentColor || '#8b5cf6',
                darkModeEnabled: settings.darkModeEnabled ?? false,
                fontFamily: settings.fontFamily || 'Inter, sans-serif',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                themeSettings: {
                    primaryColor: formData.primaryColor,
                    secondaryColor: formData.secondaryColor,
                    accentColor: formData.accentColor,
                    darkModeEnabled: formData.darkModeEnabled,
                    fontFamily: formData.fontFamily,
                }
            };

            const res = await profileAPI.updateProfile(payload);
            if (res.success) {
                showToast('Theme settings updated successfully!', 'success');
                if (refetchProfile) refetchProfile();
            } else {
                throw new Error(res.message || 'Failed to update theme settings.');
            }
        } catch (error) {
            console.error('Failed to update theme settings:', error);
            showToast(error.message || 'An error occurred while updating.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const ColorInput = ({ label, name, value, onChange }) => (
        <div>
            <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}</label>
            <div className="flex items-center gap-2">
                <input type="color" name={name} value={value} onChange={onChange} className="w-10 h-10 rounded-lg border-none cursor-pointer" />
                <input type="text" name={name} value={value} onChange={onChange} className="flex-grow p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
            </div>
        </div>
    );

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
                <FiDroplet /> Theme Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Color Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ColorInput label="Primary Color" name="primaryColor" value={formData.primaryColor} onChange={handleInputChange} />
                    <ColorInput label="Secondary Color" name="secondaryColor" value={formData.secondaryColor} onChange={handleInputChange} />
                    <ColorInput label="Accent Color" name="accentColor" value={formData.accentColor} onChange={handleInputChange} />
                </div>

                {/* Dark Mode Toggle */}
                <div className="p-4 bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {formData.darkModeEnabled ? <FiMoon className="text-blue-400 text-xl" /> : <FiSun className="text-yellow-400 text-xl" />}
                            <div>
                                <label className="text-sm font-bold text-white">Dark Mode</label>
                                <p className="text-xs text-neutral-300/70">Toggle dark mode preference for the website.</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, darkModeEnabled: !prev.darkModeEnabled }))}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${formData.darkModeEnabled ? 'bg-blue-500' : 'bg-neutral-700'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${formData.darkModeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </div>
                </div>

                {/* Font Family */}
                <InputField icon={<FiType />} label="Font Family" name="fontFamily" value={formData.fontFamily} onChange={handleInputChange} placeholder="e.g., 'Inter', sans-serif" />

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
                                Save Theme Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
