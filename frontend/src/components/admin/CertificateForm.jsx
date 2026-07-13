import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiAward, FiLink } from 'react-icons/fi';
import { certificateAPI } from '../../utils/api';

export default function CertificateForm({ certificate, onClose, showToast, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        organization: '',
        issueDate: '',
        credentialLink: '',
        order: 0,
        certificateImageUrl: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (certificate) {
            setFormData({
                name: certificate.name || '',
                organization: certificate.organization || '',
                issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : '',
                credentialLink: certificate.credentialLink || '',
                order: certificate.order || 0,
                certificateImageUrl: certificate.certificateImage || '',
            });
        }
    }, [certificate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (imageFile) {
                data.append('certificateImage', imageFile);
            } else {
                data.append('certificateImageUrl', formData.certificateImageUrl);
            }

            const response = certificate?._id
                ? await certificateAPI.update(certificate._id, data)
                : await certificateAPI.create(data);

            if (response.success) {
                showToast(response.message, 'success');
                onSaveSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to save certificate.');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <FiAward /> {certificate ? 'Edit Certificate' : 'Add New Certificate'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField label="Certificate Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., MERN Stack Development" required />
                <InputField label="Issuing Organization" name="organization" value={formData.organization} onChange={handleInputChange} placeholder="e.g., Programming Hero" required />
                <InputField label="Issue Date" name="issueDate" type="date" value={formData.issueDate} onChange={handleInputChange} required />
                <InputField label="Credential Link (Optional)" name="credentialLink" type="url" value={formData.credentialLink} onChange={handleInputChange} placeholder="https://example.com/credential/123" />

                <div className="p-4 border border-dashed border-neutral-700 rounded-lg">
                    <InputField icon={<FiLink />} label="Certificate Image URL" name="certificateImageUrl" value={formData.certificateImageUrl} onChange={handleInputChange} placeholder="Paste direct image URL" />
                    <div className="text-center my-2 text-xs text-neutral-500 font-bold">OR</div>

                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Upload Certificate Image</label>
                    <input type="file" name="certificateImage" onChange={handleFileChange} accept="image/*" className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-purple/20 file:text-accent-purple hover:file:bg-accent-purple/30" />

                    {(imageFile || formData.certificateImageUrl) && (
                        <div className="mt-4">
                            <img src={imageFile ? URL.createObjectURL(imageFile) : formData.certificateImageUrl} alt="Preview" className="w-48 object-cover rounded-lg border border-neutral-700" />
                        </div>
                    )}
                </div>

                <InputField label="Display Order" name="order" type="number" value={formData.order} onChange={handleInputChange} />

                <div className="pt-4 border-t border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600">
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Certificate</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

const InputField = ({ icon, label, name, value, onChange, placeholder, type = 'text', required = false }) => (
    <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">{icon}</div>}
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} className={`w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple ${icon ? 'pl-10' : ''}`} />
        </div>
    </div>
);
