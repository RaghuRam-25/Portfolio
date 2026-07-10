import React, { useState, useEffect } from 'react';
import { FiBookOpen, FiClock, FiCalendar, FiArrowRight, FiInfo, FiLoader, FiTag, FiX } from 'react-icons/fi';
import { blogAPI, SOCKET_URL } from '../utils/api';

export default function Blogs({ profile }) {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionCopy = profile?.blogSection || {
    title: 'Insights & Tutorials',
    subtitle: 'Read articles about web engineering, software design, and modern technologies.',
    emptyState: 'No blog posts have been published yet.'
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await blogAPI.getAll();
        if (response.success) {
          setBlogs(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch blogs.');
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching blogs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <section id="blogs" className="py-24 text-center">
        <FiLoader className="animate-spin text-accent-purple text-4xl mx-auto" />
        <p className="text-sm text-neutral-400 mt-2">Loading Articles...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="blogs" className="py-24 text-center text-red-400">
        <FiInfo className="text-5xl mx-auto mb-4" />
        <p>Error loading articles: {error}</p>
      </section>
    );
  }

  return (
    <section id="blogs" className="py-24 border-t border-neutral-900 bg-black/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white inline-flex items-center gap-2">
            <FiBookOpen className="text-accent-purple" /> {sectionCopy.title}
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl mx-auto">
            {sectionCopy.subtitle}
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center p-8 text-neutral-500 animate-fade-in-up">
            <FiInfo className="text-5xl mx-auto mb-4" />
            <p>{sectionCopy.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <div
                key={blog._id}
                onClick={() => setSelectedBlog(blog)}
                className="group cursor-pointer bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-accent-purple/10 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.coverImageUrl ? (blog.coverImageUrl.startsWith('http') ? blog.coverImageUrl : `${SOCKET_URL}/${blog.coverImageUrl.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60'}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap">
                    {blog.tags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold bg-black/60 text-accent-purple border border-accent-purple/30 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-[11px] text-neutral-500 mb-3">
                    <span className="flex items-center gap-1"><FiCalendar /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><FiClock /> 5 min read</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-accent-purple transition-colors">{blog.title}</h3>
                  <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{blog.excerpt || 'Read the full article to gain insights into this topic.'}</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent-purple group-hover:translate-x-1.5 transition-transform duration-300">
                    Read Article <FiArrowRight />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blog Details Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl custom-scrollbar animate-dropdown-pop">
            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-black/40 rounded-full transition-colors z-10"
            >
              <FiX size={18} />
            </button>
            <div className="h-64 md:h-80 w-full overflow-hidden relative">
              <img
                src={selectedBlog.coverImageUrl ? (selectedBlog.coverImageUrl.startsWith('http') ? selectedBlog.coverImageUrl : `${SOCKET_URL}/${selectedBlog.coverImageUrl.replace(/\\/g, '/')}`) : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60'}
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                <span className="flex items-center gap-1"><FiCalendar /> {new Date(selectedBlog.publishedAt || selectedBlog.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><FiClock /> 5 min read</span>
                {selectedBlog.author && <span className="text-neutral-400">By {selectedBlog.author.name || 'Author'}</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-6">{selectedBlog.title}</h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedBlog.tags?.map((tag, i) => (
                  <span key={i} className="text-xs font-bold bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full flex items-center gap-1">
                    <FiTag size={10} /> {tag}
                  </span>
                ))}
              </div>
              <div className="prose prose-invert max-w-none text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {selectedBlog.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
