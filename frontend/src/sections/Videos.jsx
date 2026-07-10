import React from 'react';
import { FiPlayCircle } from 'react-icons/fi';
import { SOCKET_URL } from '../utils/api';
import { isDirectVideoUrl, toEmbeddableVideoUrl } from '../utils/videoUrls';

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${SOCKET_URL}/${url.replace(/\\/g, '/')}`;
};

export default function Videos({ profile }) {
  const videoList = (Array.isArray(profile?.videos) ? profile.videos : [])
    .filter((video) => video && typeof video === 'object')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const sectionCopy = profile?.videoSection || {};

  return (
    <section className="py-6 px-6 max-w-7xl mx-auto">
      <div className="mb-12 animate-fade-in-up">
        <span className="text-xs font-bold tracking-widest uppercase text-accent-blue bg-accent-blue/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
          <FiPlayCircle /> {sectionCopy.eyebrow || 'Project Showcases'}
        </span>
        <h2 className="text-4xl md:text-5xl font-black mt-4">{sectionCopy.title || 'Video Reviews'}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videoList.length === 0 ? (
          <div className="md:col-span-2 text-center py-20 rounded-2xl border border-dashed border-light-border dark:border-neutral-800 animate-fade-in-up">
            <p className="text-light-textSecondary dark:text-dark-textSecondary font-medium">
              {sectionCopy.emptyState || 'No videos have been added yet.'}
            </p>
          </div>
        ) : (
          videoList.map((video, index) => {
            const embedUrl = toEmbeddableVideoUrl(video.videoUrl);
            const shouldUseVideoPlayer = video.videoType === 'upload' || isDirectVideoUrl(video.videoUrl);

            return (
            <div
              key={`${video.title}-${index}`}
              className="rounded-2xl border border-light-border dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl hover:shadow-accent-purple/5 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-neutral-950">
                {shouldUseVideoPlayer ? (
                  <video
                    className="w-full h-full object-cover"
                    src={resolveMediaUrl(video.videoUrl)}
                    poster={resolveMediaUrl(video.posterImageUrl || video.thumbnailUrl)}
                    autoPlay={video.autoplay}
                    loop={video.loop}
                    muted={video.muted}
                    controls={video.controls}
                    playsInline
                  />
                ) : embedUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title={video.title || 'Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-neutral-400">
                    Video URL missing
                  </div>
                )}
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-bold text-accent-blue uppercase tracking-wider">{video.tag}</span>
                <h3 className="text-lg font-bold mt-1 text-light-textPrimary dark:text-white">{video.title}</h3>
                <p className="text-sm text-neutral-500 mt-2">{video.description}</p>
              </div>
            </div>
            );
          })
        )}
      </div>
    </section>
  );
}
