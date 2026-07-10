import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiInfo, FiFileText, FiSave, FiX, FiTag, FiEye } from 'react-icons/fi';
import { blogAPI } from '../../utils/api';
import Modal from '../ui/Modal';

// ─── Blog Form ───────────────────────────────────────────────────────────────
function BlogForm({ blog, onClose, showToast, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImageUrl: '',
        tags: [],
        status: 'draft',
    });
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (blog) {
            setFormData({
                title: blog.title || '',
                slug: blog.slug || '',
                excerpt: blog.excerpt || '',
                content: blog.content || '',
                coverImageUrl: blog.coverImageUrl || '',
                tags: blog.tags || [],
                status: blog.status || 'draft',
            });
        }
    }, [blog]);

    const generateSlug = (title) =>
        title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({ ...prev, title, slug: blog ? prev.slug : generateSlug(title) }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !formData.tags.includes(t)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }));
            setTagInput('');
        }
    };

    const removeTag = (tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = blog?._id
                ? await blogAPI.update(blog._id, formData)
                : await blogAPI.create(formData);

            if (response.success) {
                showToast(response.message || 'Saved!', 'success');
                onSaveSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to save blog post.');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <FiFileText /> {blog ? 'Edit Blog Post' : 'New Blog Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Title <span className="text-red-500">*</span></label>
                    <input name="title" value={formData.title} onChange={handleTitleChange} required placeholder="My Awesome Blog Post"
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                </div>
                {/* Slug */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Slug <span className="text-red-500">*</span></label>
                    <input name="slug" value={formData.slug} onChange={handleChange} required placeholder="my-awesome-blog-post"
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple font-mono" />
                </div>
                {/* Excerpt */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Excerpt</label>
                    <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows="2" placeholder="Short summary..."
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                </div>
                {/* Content */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Content <span className="text-red-500">*</span></label>
                    <textarea name="content" value={formData.content} onChange={handleChange} required rows="8" placeholder="Write your blog content here..."
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple font-mono" />
                </div>
                {/* Cover Image URL */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Cover Image URL</label>
                    <input name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg"
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                </div>
                {/* Tags */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Tags</label>
                    <div className="flex gap-2">
                        <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            placeholder="Add a tag and press Enter" className="flex-1 p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple" />
                        <button type="button" onClick={addTag} className="px-3 py-2 bg-accent-purple/20 text-accent-purple rounded-lg hover:bg-accent-purple/30"><FiTag /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map(t => (
                            <span key={t} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-neutral-700 text-neutral-200 rounded-full">
                                {t} <button type="button" onClick={() => removeTag(t)} className="text-neutral-400 hover:text-red-400"><FiX size={10} /></button>
                            </span>
                        ))}
                    </div>
                </div>
                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1.5">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}
                        className="w-full p-2.5 text-sm rounded-lg bg-neutral-700/50 border border-neutral-700 focus:ring-1 focus:ring-accent-purple focus:border-accent-purple">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
                {/* Submit */}
                <div className="pt-4 border-t border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600">
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Blog Post</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Manage Blogs ─────────────────────────────────────────────────────────────
export default function ManageBlogs({ showToast }) {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const res = await blogAPI.getAll();
            if (res.success) {
                setBlogs(res.data);
            } else {
                showToast(res.message || 'Failed to fetch blog posts.', 'error');
            }
        } catch {
            showToast('An error occurred while fetching blog posts.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchBlogs(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this blog post?')) return;
        try {
            const res = await blogAPI.delete(id);
            if (res.success) {
                showToast(res.message, 'success');
                fetchBlogs();
            } else {
                showToast(res.message, 'error');
            }
        } catch {
            showToast('Delete failed.', 'error');
        }
    };

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FiFileText /> Manage Blog Posts</h2>
                <button onClick={() => { setEditingBlog(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-lg text-sm font-bold hover:bg-accent-purple/90">
                    <FiPlus /> New Post
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-accent-purple text-4xl" /></div>
            ) : blogs.length === 0 ? (
                <div className="text-center p-8 text-neutral-400"><FiInfo className="text-5xl mx-auto mb-4" /><p>No blog posts yet. Create your first post!</p></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-800">
                        <thead>
                            <tr className="text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Tags</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {blogs.map(b => (
                                <tr key={b._id} className="hover:bg-neutral-800/50">
                                    <td className="px-4 py-4 text-sm font-medium text-white">{b.title}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {b.status === 'published' ? <><FiEye className="inline mr-1" />Published</> : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-neutral-400">{b.tags?.join(', ') || '—'}</td>
                                    <td className="px-4 py-4 text-right text-sm font-medium">
                                        <button onClick={() => { setEditingBlog(b); setIsModalOpen(true); }} className="text-accent-purple hover:text-accent-purple/80 mr-3"><FiEdit /></button>
                                        <button onClick={() => handleDelete(b._id)} className="text-red-500 hover:text-red-400"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBlog ? 'Edit Blog Post' : 'New Blog Post'}>
                <BlogForm blog={editingBlog} onClose={() => setIsModalOpen(false)} showToast={showToast} onSaveSuccess={fetchBlogs} />
            </Modal>
        </div>
    );
}
