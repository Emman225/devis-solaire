import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import { useSettings } from '../../contexts/SettingsContext';
import { contactService } from '../../services/contact';
import { ContactMessagePayload } from '../../types';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();

  const [formData, setFormData] = useState<ContactMessagePayload>({
    name: '',
    email: '',
    subject: 'Renseignement général',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactService.sendMessage(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Renseignement général', message: '' }); // Reset form
    } catch (error: any) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Impossible d\'envoyer le message. Veuillez réessayer.',
        confirmButtonColor: settings?.primaryColor || '#009933'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold font-heading mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-400">Une question ? Un projet ? Nos experts sont là pour vous répondre.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info Side */}
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900 mb-6">Nos Coordonnées</h2>
              <p className="text-gray-600 mb-8">
                Retrouvez-nous à notre siège ou contactez-nous directement via les canaux suivants.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Adresse</h3>
                    <p className="text-gray-600">Cocody Riviera 3, Abidjan, Côte d'Ivoire</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Téléphone</h3>
                    <p className="text-gray-600">{settings?.contactPhone || '+225 01 00 00 00'}</p>
                    <p className="text-gray-500 text-sm">Du Lundi au Vendredi, 8h-18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600">{settings?.contactEmail || 'contact@lynays.com'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-neutral-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock size={20} className="text-secondary" /> Horaires d'ouverture
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex justify-between"><span>Lundi - Vendredi</span> <span>08:00 - 18:00</span></li>
                  <li className="flex justify-between"><span>Samedi</span> <span>09:00 - 13:00</span></li>
                  <li className="flex justify-between"><span>Dimanche</span> <span>Fermé</span></li>
                </ul>
              </div>
            </div>

            {/* Form Side */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-primary mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Envoyé !</h3>
                  <p className="text-gray-600">Merci de nous avoir contactés. Nous reviendrons vers vous dans les plus brefs délais.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-6 text-primary font-bold hover:underline">Envoyer un autre message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold font-heading text-gray-900 mb-6">Envoyez-nous un message</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none bg-white"
                    >
                      <option>Renseignement général</option>
                      <option>Demande de devis</option>
                      <option>Support technique</option>
                      <option>Partenariat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none h-32 resize-none"
                      placeholder="Comment pouvons-nous vous aider ?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                    {loading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};