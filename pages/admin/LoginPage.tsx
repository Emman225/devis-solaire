import React, { useState } from 'react';
import { useAuth } from '../../App';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Lock, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@lynays.com');
  const [password, setPassword] = useState('Admin123*');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      // Login successful, redirect handled by route protection or explicit navigate
      // But typically we navigate here just to be sure
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-primary p-8 text-center">
          <Link to="/" className="inline-block p-3 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer" title="Retour à l'accueil">
            <Sun className="text-secondary" size={40} />
          </Link>
          <h1 className="text-2xl font-bold text-white font-heading">LYNAYS Admin</h1>
          <p className="text-primary-light text-sm mt-2">Connectez-vous pour gérer la plateforme</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="admin@lynays.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Se connecter"}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Admin Access Only
          </p>
        </form>
      </div>
    </div>
  );
};