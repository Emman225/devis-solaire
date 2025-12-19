import React, { useState } from 'react';
import { Phone, Mail, Globe, Sun, ArrowUp, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useSettings } from '../../contexts/SettingsContext';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 z-50 relative" onClick={() => setMobileMenuOpen(false)}>
              <div className="bg-primary text-white p-2 rounded-lg">
                <Sun size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight font-heading">
                {settings?.appName || 'LYNAYS'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/about"
                className={`font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                A propos
              </Link>
              <Link
                to="/projects"
                className={`font-medium transition-colors ${isActive('/projects') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                Nos Réalisations
              </Link>
              <Link
                to="/contact"
                className={`font-medium transition-colors ${isActive('/contact') ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/admin/login"
                className="text-gray-900 font-bold hover:text-primary transition-colors text-sm px-4 py-2"
              >
                Connexion
              </Link>
              <Link
                to="/simulation"
                className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 text-sm"
              >
                Devis Gratuit
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden z-50 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 bg-white z-40 pt-24 px-6 md:hidden animate-fade-in flex flex-col">
                <div className="flex flex-col gap-6 text-lg font-medium">
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-100 flex justify-between items-center">
                    A propos
                  </Link>
                  <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-100 flex justify-between items-center">
                    Nos Réalisations
                  </Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-100 flex justify-between items-center">
                    Contact
                  </Link>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 border border-gray-200 rounded-xl font-bold text-gray-900">
                    Connexion
                  </Link>
                  <Link to="/simulation" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 bg-primary text-white rounded-xl font-bold shadow-lg">
                    Obtenir mon devis
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <span className="text-2xl font-bold tracking-tight font-heading">
              {settings?.appName || 'LYNAYS'}
            </span>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Leader dans les solutions d'énergie solaire durables. Devenez indépendant énergétiquement dès aujourd'hui.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary">Liens Rapides</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">A propos</Link></li>
              <li><Link to="/simulation" className="hover:text-white transition-colors">Simulateur Solaire</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">Nos Réalisations</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Espace Admin</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Phone size={16} /> {settings?.contactPhone || '+225 01 00 00 00'}</li>
              <li className="flex items-center gap-2"><Mail size={16} /> {settings?.contactEmail || 'contact@lynays.com'}</li>
              <li className="flex items-center gap-2"><Globe size={16} /> www.lynays.com</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 text-center md:text-left">
            &copy; 2025 LYNAYS BHCI – Tous droits réservés.
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-full group"
          >
            Retour en haut
            <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </footer>
    </div>
  );
};