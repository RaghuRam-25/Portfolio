import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiInfo, FiLink, FiSave, FiGlobe } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaWhatsapp, FaInstagram, FaDiscord, FaTelegram, FaFacebook } from 'react-icons/fa';
import { socialLinkAPI } from '../../utils/api';
import Modal from '../ui/Modal';

const PLATFORM_OPTIONS = [
    { value: 'github', label: 'GitHub', icon: <FaGithub /> },
    { value: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin /> },
    { value: 'twitter', label: 'Twitter/X', icon: <FaTwitter /> },
    { value: 'youtube', label: 'YouTube', icon: <FaYoutube /> },
    { value: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
    { value: 'instagram', label: 'Instagram', icon: <FaInstagram /> },
    { value: 'discord', label: 'Discord', icon: <FaDiscord /> },
    { value: 'telegram', label: 'Telegram', icon: <FaTelegram /> },
    { value: 'facebook', label: 'Facebook', icon: <FaFacebook /> },
    { value: 'email', label: 'Email', icon: <FiLink /> },
];

// ─── Social Link Form ─────────────────────────────────────────────────────────
function SocialLinkForm({ link, onClose, showToast, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        platform: 'github',
        url: '',
        icon: '',
        order: 0,
        isActive: true,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (link) {
            setFormData({
                platform: link.platform || 'github',
                url: link.url || '',
                icon: link.icon || '',
                order: link.order || 0,
                isActive: link.isActive ?? true,
            });
        }
    }, [link]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (name === 'order' ? Number(value) : value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = link?._id
                ? await socialLinkAPI.update(link._id, formData)
                : await socialLinkAPI.create(formData);

            if (response.success) {
                showToast(response.message || 'Saved!', 'success');
                onSaveSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to save social link.');
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
                <FiLink /> {link ? 'Edit Social Link' : 'Add Social Link'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Platform <span className="text-red-500">*</span></label>
                    <select name="platform" value={formData.platform} onChange={handleChange}
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple">
                        {PLATFORM_OPTIONS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">URL / Handle <span className="text-red-500">*</span></label>
                    <input name="url" value={formData.url} onChange={handleChange} required placeholder="https://github.com/yourname or mailto:email@example.com"
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5">Custom Icon (optional)</label>
                        <input name="icon" value={formData.icon} onChange={handleChange} placeholder="Icon class or leave blank"
                            className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1.5">Display Order</label>
                        <input name="order" type="number" value={formData.order} onChange={handleChange} min="0"
                            className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 accent-accent-purple" />
                    <label htmlFor="isActive" className="text-sm text-white font-medium cursor-pointer">Active (visible on website)</label>
                </div>
                <div className="pt-4 border-t border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600">
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Social Link</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Manage Social Links ──────────────────────────────────────────────────────
export default function ManageSocialLinks({ showToast }) {
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);

    const fetchLinks = async () => {
        setIsLoading(true);
        try {
            // Admin route দিয়ে সব links (active + inactive) আনা হচ্ছে
            const data = await socialLinkAPI.getAdminAll();
            if (data.success) {
                setLinks(data.data);
            } else {
                showToast(data.message || 'Failed to fetch social links.', 'error');
            }
        } catch {
            showToast('An error occurred while fetching social links.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchLinks(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this social link?')) return;
        try {
            const res = await socialLinkAPI.delete(id);
            if (res.success) {
                showToast(res.message, 'success');
                fetchLinks();
            } else {
                showToast(res.message, 'error');
            }
        } catch {
            showToast('Delete failed.', 'error');
        }
    };

    const getPlatformIcon = (platform) => {
        const p = PLATFORM_OPTIONS.find(o => o.value === platform);
        return p ? p.icon : <FiGlobe />;
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiLink /> Social Links</h2>
                <button onClick={() => { setEditingLink(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-bold hover:bg-accent-purple/90">
                    <FiPlus /> Add Link
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-accent-purple text-4xl" /></div>
            ) : links.length === 0 ? (
                <div className="text-center p-8 text-neutral-400"><FiInfo className="text-5xl mx-auto mb-4" /><p>No social links yet.</p></div>
            ) : (
                <div className="space-y-2">
                    {[...links].sort((a, b) => a.order - b.order).map(l => (
                        <div key={l._id} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors">
                            <span className="text-lg text-accent-purple">{getPlatformIcon(l.platform)}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white capitalize">{l.platform}</p>
                                <p className="text-xs text-neutral-400 truncate">{l.url}</p>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0 ${l.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-700 text-neutral-500'}`}>
                                {l.isActive ? 'Active' : 'Hidden'}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => { setEditingLink(l); setIsModalOpen(true); }} className="text-accent-purple hover:text-accent-purple/80"><FiEdit size={15} /></button>
                                <button onClick={() => handleDelete(l._id)} className="text-red-500 hover:text-red-400"><FiTrash2 size={15} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLink ? 'Edit Social Link' : 'Add Social Link'}>
                <SocialLinkForm link={editingLink} onClose={() => setIsModalOpen(false)} showToast={showToast} onSaveSuccess={fetchLinks} />
            </Modal>
        </div>
    );
}
