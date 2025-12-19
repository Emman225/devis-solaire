import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../App';
import { Camera, Mail, Phone, User, Lock, Loader, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { userService } from '../../services/users';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  // Password form state
  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    let successMessage = 'Profil mis à jour avec succès.';

    // Validate Password if showPassword is true
    if (showPassword) {
      if (!passData.current || !passData.new || !passData.confirm) {
        Swal.fire({
          icon: 'warning',
          title: 'Attention',
          text: 'Veuillez remplir tous les champs de mot de passe (Actuel, Nouveau, Confirmation).',
          confirmButtonColor: '#FFA500'
        });
        setIsSaving(false);
        return;
      }
      if (passData.new !== passData.confirm) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Les nouveaux mots de passe ne correspondent pas.',
          confirmButtonColor: '#d33'
        });
        setIsSaving(false);
        return;
      }
    }

    try {
      // 1. Update Profile Info
      await userService.update(user.id, {
        name: formData.name,
        phone: formData.phone,
        role: user.role,
        email: user.email
      }, selectedFile);

      // 2. Change Password if requested
      if (showPassword && passData.new) {
        await userService.changePassword(user.id, {
          current_password: passData.current,
          new_password: passData.new,
          new_password_confirmation: passData.confirm
        });
        successMessage += ' Mot de passe modifié.';
      }

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: successMessage,
        confirmButtonColor: '#009933'
      });

      // Reset password fields
      setPassData({ current: '', new: '', confirm: '' });
      setShowPassword(false);
    } catch (error: any) {
      console.error('Update profile error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || 'Une erreur est survenue lors de la mise à jour.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">Mon Profil</h1>
      <p className="text-gray-500 mb-8">Gérez vos informations personnelles et votre sécurité.</p>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary to-primary-dark"></div>

        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <img
                src={previewUrl || user?.avatarUrl || "https://picsum.photos/200"}
                alt="Profile"
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-white transition-opacity group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-4 border-transparent">
                <Camera className="text-white" size={24} />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors transform translate-x-1/4 translate-y-1/4 z-10"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
              {user?.role}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" value={user?.email || ''} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" disabled />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Sécurité</h3>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-primary font-medium hover:underline text-sm flex items-center"
                >
                  {showPassword ? 'Annuler la modification' : 'Modifier le mot de passe'}
                </button>
              </div>

              {showPassword && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                        value={passData.current}
                        onChange={(e) => setPassData({ ...passData, current: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                          value={passData.new}
                          onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                          value={passData.confirm}
                          onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark shadow-lg shadow-primary/20 transition-colors flex items-center disabled:opacity-50"
              >
                {isSaving ? <Loader className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};