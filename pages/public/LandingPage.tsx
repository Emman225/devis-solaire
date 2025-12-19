import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Leaf, DollarSign } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="md:w-2/3 lg:w-1/2">
            <div className="inline-block bg-secondary text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
              Innovation Durable
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-heading leading-tight mb-6">
              Devenez votre propre fournisseur d'électricité.
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Réduisez vos factures et adoptez une énergie propre avec nos solutions solaires sur mesure pour particuliers et entreprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/simulation" 
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-gray-900 bg-secondary hover:bg-secondary-light transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Commencer la simulation
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-base font-bold rounded-xl text-white hover:bg-white/10 transition-all"
              >
                En savoir plus
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/70">
              * Devis gratuit sous 48h sans engagement.
            </p>
          </div>
        </div>
        
        {/* Decorative Wave */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
           <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-neutral-50"></path>
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4">Pourquoi choisir LYNAYS BHCI ?</h2>
            <p className="text-gray-600">Nous combinons expertise technique et matériel de haute qualité pour garantir la performance de votre installation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-primary mb-6">
                <Leaf size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading">Écologique</h3>
              <p className="text-gray-600">Produisez une énergie verte et réduisez votre empreinte carbone dès le premier jour d'installation.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 mb-6">
                <DollarSign size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading">Économique</h3>
              <p className="text-gray-600">Réduisez jusqu'à 70% votre facture d'électricité et rentabilisez votre investissement rapidement.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading">Fiable</h3>
              <p className="text-gray-600">Matériel garanti, maintenance incluse et suivi de production en temps réel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-2">Prêt à passer au solaire ?</h2>
            <p className="text-gray-400">Obtenez une estimation précise de vos besoins en moins de 5 minutes.</p>
          </div>
          <Link 
            to="/simulation" 
            className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/30"
          >
            Lancer mon étude gratuite
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};