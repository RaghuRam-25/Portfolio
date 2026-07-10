import React, { useState, useEffect } from 'react';
import { profileAPI, uploadAPI, SOCKET_URL } from '../../utils/api';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import { FiPlayCircle, FiPlus, FiEdit, FiTrash2, FiSave, FiUpload } from 'react-icons/fi';
import { toEmbeddableVideoUrl } from '../../utils/videoUrls';

const emptyVideo = {
    title: '',
    description: '',
    videoUrl: '',
    videoType: 'embed',
    thumbnailUrl: '',
    posterImageUrl: '',
    tag: '',
    autoplay: false,
    loop: false,
    muted: true,
    controls: true,
    order: 0,
};

const resolveMediaUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${SOCKET_URL}/${url.replace(/\\/g, '/')}`;
};

const VideoEditor = ({ profile, refetchProfile }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [posterFile, setPosterFile] = useState(null);

    useEffect(() => {
        const orderedVideos = [...(profile?.videos || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setVideos(orderedVideos);
    }, [profile]);

    const handleOpenModal = (video, index) => {
        setCurrentVideo(video ? { ...emptyVideo, ...video } : { ...emptyVideo, order: videos.length });
        setCurrentIndex(index);
        setVideoFile(null);
        setThumbnailFile(null);
        setPosterFile(null);
        setIsModalOpen(true);
    };

    const uploadIfSelected = async (file, fallbackUrl) => {
        if (!file) return fallbackUrl;
        const uploadRes = await uploadAPI.uploadFile(file);
        if (!uploadRes.success) throw new Error(`${file.name} upload failed.`);
        return uploadRes.data.url;
    };

    const handleSaveVideo = async () => {
        try {
            setLoading(true);
            const nextVideo = {
                ...currentVideo,
                videoUrl: await uploadIfSelected(videoFile, currentVideo.videoUrl),
                thumbnailUrl: await uploadIfSelected(thumbnailFile, currentVideo.thumbnailUrl),
                posterImageUrl: await uploadIfSelected(posterFile, currentVideo.posterImageUrl),
            };
            if (nextVideo.videoType === 'embed') {
                nextVideo.videoUrl = toEmbeddableVideoUrl(nextVideo.videoUrl);
            }

            const newVideos = [...videos];
            if (currentIndex !== null) {
                newVideos[currentIndex] = nextVideo;
            } else {
                newVideos.push(nextVideo);
            }
            setVideos(newVideos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
            setIsModalOpen(false);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Video upload failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVideo = (index) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            setVideos(videos.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const res = await profileAPI.updateProfile({ videos: videos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) });
        setLoading(false);

        if (res.success) {
            setMessage({ type: 'success', text: 'Videos section updated successfully!' });
            if (refetchProfile) refetchProfile();
        } else {
            setMessage({ type: 'error', text: res.message || 'Failed to update.' });
        }
    };

    const updateCurrentVideo = (field, value) => {
        setCurrentVideo(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <h3 className="text-lg font-bold flex items-center gap-2"><FiPlayCircle /> Edit Videos Section</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                <div>
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Video List</label>
                        <button type="button" onClick={() => handleOpenModal(null, null)} className="px-3 py-1.5 bg-accent-blue text-white rounded-lg text-sm flex items-center gap-2">
                            <FiPlus /> Add Video
                        </button>
                    </div>
                    <div className="mt-2 space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                        {videos.map((video, index) => (
                            <div key={`${video.title}-${index}`} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                <div className="flex items-center gap-3 min-w-0">
                                    {video.thumbnailUrl && <img src={resolveMediaUrl(video.thumbnailUrl)} alt="" className="w-14 h-10 rounded object-cover" />}
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{video.title || 'Untitled video'}</p>
                                        <p className="text-xs text-neutral-500">Order: {video.order ?? 0} | {video.videoType || 'embed'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => handleOpenModal(video, index)} className="text-neutral-500 hover:text-accent-blue"><FiEdit /></button>
                                    <button type="button" onClick={() => handleDeleteVideo(index)} className="text-neutral-500 hover:text-red-500"><FiTrash2 /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2 disabled:bg-neutral-500">{loading ? <Spinner /> : <FiSave />} Save Video Changes</button>
                {message.text && <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{message.text}</p>}
            </form>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentIndex !== null ? 'Edit Video' : 'Add New Video'}>
                {currentVideo && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Video Title" value={currentVideo.title} onChange={(e) => updateCurrentVideo('title', e.target.value)} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                            <input type="text" placeholder="Tag (e.g., Hackathon)" value={currentVideo.tag} onChange={(e) => updateCurrentVideo('tag', e.target.value)} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                        </div>
                        <textarea placeholder="Description" rows="3" value={currentVideo.description} onChange={(e) => updateCurrentVideo('description', e.target.value)} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700"></textarea>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={currentVideo.videoType} onChange={(e) => updateCurrentVideo('videoType', e.target.value)} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700">
                                <option value="embed">Embed URL</option>
                                <option value="upload">Uploaded Video</option>
                            </select>
                            <input type="number" placeholder="Order" value={currentVideo.order} onChange={(e) => updateCurrentVideo('order', Number(e.target.value))} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                        </div>

                        <input type="text" placeholder="YouTube link or uploaded file URL" value={currentVideo.videoUrl} onChange={(e) => updateCurrentVideo('videoUrl', e.target.value)} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                        <label className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                            <FiUpload /> Upload/replace video
                            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="block w-full text-xs" />
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Thumbnail URL" value={currentVideo.thumbnailUrl} onChange={(e) => updateCurrentVideo('thumbnailUrl', e.target.value)} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                            <input type="text" placeholder="Poster Image URL" value={currentVideo.posterImageUrl} onChange={(e) => updateCurrentVideo('posterImageUrl', e.target.value)} className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700" />
                            <label className="text-xs font-bold text-neutral-500">Upload thumbnail<input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="block w-full text-xs mt-1" /></label>
                            <label className="text-xs font-bold text-neutral-500">Upload poster image<input type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files?.[0] || null)} className="block w-full text-xs mt-1" /></label>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                ['autoplay', 'Auto Play'],
                                ['loop', 'Loop'],
                                ['muted', 'Mute'],
                                ['controls', 'Controls'],
                            ].map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={Boolean(currentVideo[key])} onChange={(e) => updateCurrentVideo(key, e.target.checked)} />
                                    {label}
                                </label>
                            ))}
                        </div>

                        <button type="button" onClick={handleSaveVideo} disabled={loading} className="px-4 py-2 bg-accent-blue text-white rounded-lg flex items-center gap-2 disabled:bg-neutral-500">
                            {loading ? <Spinner /> : <FiSave />} {currentIndex !== null ? 'Update Video' : 'Add Video'}
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VideoEditor;
