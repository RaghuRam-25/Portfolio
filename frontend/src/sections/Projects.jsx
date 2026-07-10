import React, { useState, useEffect } from 'react';
import { FiGithub, FiExternalLink, FiLoader, FiInfo, FiLayers } from 'react-icons/fi';
import { projectsAPI, SOCKET_URL } from '../utils/api';

export default function Projects({ profile }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionCopy = profile?.projectSection || {};

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await projectsAPI.getAll();
        if (response.success) {
          setProjects(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch projects.');
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching projects:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <section id="projects" className="py-24 text-center">
        <FiLoader className="animate-spin text-accent-purple text-4xl mx-auto" />
        <p className="text-sm text-neutral-400 mt-2">Loading Projects...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-24 text-center text-red-400">
        <FiInfo className="text-5xl mx-auto mb-4" />
        <p>Error loading projects: {error}</p>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white inline-flex items-center gap-2">
            <FiLayers className="text-accent-purple" /> {sectionCopy.title || 'My Creative Portfolio'}
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl mx-auto">
            {sectionCopy.subtitle || 'Here is a collection of my works that showcases my skills in turning ideas into reality. Each project is a unique piece of development.'}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center p-8 text-neutral-500 animate-fade-in-up">
            <FiInfo className="text-5xl mx-auto mb-4" />
            <p>{sectionCopy.emptyState || 'No projects have been added yet. Please check back later!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project._id}
                className="group bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-accent-purple/10 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.thumbnail ? `${SOCKET_URL}/${project.thumbnail.replace(/\\/g, '/')}` : 'https://via.placeholder.com/400x250/1a1a1a/4a4a4a?text=No+Image'}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-xs font-bold bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full border border-accent-purple/30">{project.category}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 truncate">{project.title}</h3>
                  <p className="text-xs text-neutral-400 mb-4 h-12 overflow-hidden text-ellipsis">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4 h-12 overflow-y-auto">
                    {project.techStack.map((tech, i) => (<span key={i} className="text-[10px] font-bold bg-neutral-800 text-neutral-300 px-2 py-1 rounded-full">{tech}</span>))}
                  </div>
                  <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-neutral-800">
                    {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors" title="GitHub Repository"><FiGithub size={20} /></a>}
                    {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors" title="Live Demo"><FiExternalLink size={20} /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
