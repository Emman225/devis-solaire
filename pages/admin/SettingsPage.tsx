import React, { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import { settingsService } from '../../services/settings';
import { SystemSettings } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

export const SettingsPage: React.FC = () => {
  const { settings, loading, refreshSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SystemSettings>>({
    appName: '',
    primaryColor: '#009933',
    secondaryColor: '#FFCC00',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateSettings(formData);
      await refreshSettings(); // Update global context which will re-apply styles

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Paramètres mis à jour avec succès',
        confirmButtonColor: '#009933'
      });
    } catch (error: any) {
      console.error('Update settings error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Une erreur est survenue lors de la mise à jour.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">Paramètres</h1>
      <p className="text-gray-500 mb-8">Configuration générale de la plateforme.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">

        {/* General Identity */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Identité Visuelle</h2>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'application</label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur Primaire</label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: formData.primaryColor }}></div>
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur Secondaire</label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: formData.secondaryColor }}></div>
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Coordonnées</h2>
          <div className="grid gap-4">
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Email de contact"
            />
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Téléphone"
            />
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader className="mr-2 animate-spin" size={20} /> : <Save className="mr-2" size={20} />}
            Enregistrer les modifications
          </button>
        </div>

      </div>
    </div>
  );
};