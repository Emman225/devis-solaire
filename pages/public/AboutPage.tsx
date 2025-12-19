import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Shield, Wrench, BarChart3, ArrowRight, CheckCircle, Leaf } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col animate-fade-in">
      {/* Header Banner */}
      <section className="relative bg-gray-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-primary-dark/50 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/600?grayscale')] bg-cover bg-center opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-3xl">
             <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
               L'Expertise Solaire <span className="text-secondary">LYNAYS BHCI</span>
             </h1>
             <p className="text-xl text-gray-300 leading-relaxed">
               Nous démocratisons l'accès à l'énergie solaire en Côte d'Ivoire grâce à des solutions innovantes, fiables et sur mesure.
             </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
             <div>
                <div className="inline-block bg-primary/10 text-primary font-bold px-4 py-1 rounded-full text-sm mb-4">
                  Notre Mission
                </div>
                <h2 className="text-3xl font-bold font-heading text-gray-900 mb-6">
                  Une énergie propre pour tous, sans compromis.
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Chez LYNAYS BHCI, nous croyons que l'indépendance énergétique ne doit pas être un luxe. Notre mission est d'accompagner les ménages et les entreprises dans leur transition énergétique.
                  </p>
                  <p>
                    Face à la hausse des coûts de l'électricité et aux enjeux climatiques, nous proposons une alternative durable qui allie performance technologique et rentabilité économique.
                  </p>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="flex items-start gap-3">
                      <Leaf className="text-primary mt-1" size={20} />
                      <div>
                        <h4 className="font-bold text-gray-900">100% Vert</h4>
                        <p className="text-sm text-gray-500">Réduction empreinte CO2</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <Shield className="text-primary mt-1" size={20} />
                      <div>
                        <h4 className="font-bold text-gray-900">Garantie 20 ans</h4>
                        <p className="text-sm text-gray-500">Performance assurée</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="relative">
                <img src="https://picsum.photos/600/400" alt="Installation Solaire" className="rounded-3xl shadow-2xl relative z-10" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-secondary rounded-2xl z-0"></div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full z-0"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4">Comment ça marche ?</h2>
              <p className="text-gray-600">Un processus simplifié en 4 étapes pour passer au solaire sans stress.</p>
           </div>

           <div className="grid md:grid-cols-4 gap-8">
              {[
                { 
                  icon: <BarChart3 size={32} />, 
                  title: "1. Simulation", 
                  desc: "Estimez vos besoins en ligne grâce à notre outil intelligent." 
                },
                { 
                  icon: <Sun size={32} />, 
                  title: "2. Étude", 
                  desc: "Nos ingénieurs valident votre dossier et conçoivent votre système." 
                },
                { 
                  icon: <Wrench size={32} />, 
                  title: "3. Installation", 
                  desc: "Pose complète par nos techniciens certifiés en moins de 48h." 
                },
                { 
                  icon: <CheckCircle size={32} />, 
                  title: "4. Suivi", 
                  desc: "Maintenance et monitoring de votre production via application." 
                }
              ].map((step, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative">
                   <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center mb-4">
                     {step.icon}
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                   <p className="text-gray-500 text-sm">{step.desc}</p>
                   {idx < 3 && (
                     <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-300 z-10">
                       <ArrowRight size={24} />
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary-dark to-primary p-12 rounded-3xl text-white text-center shadow-xl shadow-primary/30 relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Prêt à réduire vos factures ?</h2>
                 <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                   Rejoignez les centaines de foyers qui font déjà confiance à LYNAYS BHCI pour leur énergie quotidienne.
                 </p>
                 <Link 
                   to="/simulation" 
                   className="inline-flex items-center px-8 py-4 bg-white text-primary-dark font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg"
                 >
                   Obtenir mon étude gratuite
                   <ArrowRight className="ml-2" size={20} />
                 </Link>
               </div>
               
               {/* Decorative circles */}
               <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
         </div>
      </section>
    </div>
  );
};