import React, { useState } from 'react';
import { MapPin, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Project } from '../../types';
import { projectService } from '../../services/projects';

export const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = useState('Tous');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (error) {
        console.error('Failed to load projects', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const categories = ['Tous', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = filter === 'Tous'
    ? projects
    : projects.filter(p => p.category === filter);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Header */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold font-heading mb-4">Nos Réalisations</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Découvrez comment nous transformons le quotidien de nos clients grâce à l'énergie solaire.
          </p>
        </div>
      </section>

      {/* Filter & Grid */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter === cat
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map(project => (
              <div key={project.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100 flex flex-col h-full">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-900 uppercase tracking-wide">
                    {project.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">{project.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex-1">{project.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-secondary" />
                      <span>{project.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{project.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Confidence */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-4">
              <div className="text-4xl font-bold text-primary mb-2">150+</div>
              <div className="text-gray-500 font-medium">Projets réalisés</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-primary mb-2">2.5 MW</div>
              <div className="text-gray-500 font-medium">Puissance installée</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-gray-500 font-medium">Clients satisfaits</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-heading mb-6">Vous avez un projet similaire ?</h2>
          <Link
            to="/simulation"
            className="inline-flex items-center bg-white text-primary-dark font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
          >
            Demander une étude gratuite
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};