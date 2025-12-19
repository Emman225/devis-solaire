import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Plus, User as UserIcon, X, Save, Shield, ShieldCheck, Phone, Mail, Lock, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import { User, UserRole, UserFormData } from '../../types';
import { userService } from '../../services/users';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserFormData & { id?: string }>({
    name: '',
    email: '',
    phone: '',
    role: UserRole.AGENT,
    password: '',
    password_confirmation: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      Swal.fire('Erreur', 'Impossible de charger les utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Supprimer cet utilisateur ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userService.delete(id);
          setUsers(prev => prev.filter(u => u.id !== id));
          Swal.fire('Supprimé !', 'L\'utilisateur a été supprimé.', 'success');
        } catch (error: any) {
          Swal.fire('Erreur', error.message || 'Impossible de supprimer l\'utilisateur', 'error');
        }
      }
    });
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: UserRole.AGENT,
      password: '',
      password_confirmation: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditing && formData.id) {
        // Update
        const { password, password_confirmation, ...updateData } = formData;
        const updatedUser = await userService.update(formData.id, updateData);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        Swal.fire({
          icon: 'success',
          title: 'Mis à jour',
          text: 'L\'utilisateur a été modifié avec succès.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Create
        if (!formData.password || !formData.password_confirmation) {
          throw new Error('Le mot de passe est obligatoire');
        }
        if (formData.password !== formData.password_confirmation) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        const newUser = await userService.create(formData);
        setUsers(prev => [...prev, newUser]);
        Swal.fire({
          icon: 'success',
          title: 'Créé',
          text: 'Nouvel utilisateur ajouté.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      Swal.fire('Erreur', error.message || 'Une erreur est survenue', 'error');
    } finally {
      setIsSaving(false);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Gestion Utilisateurs</h1>
          <p className="text-gray-500">Gérez les comptes administrateurs et agents.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-primary/30 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-sm"
              />
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${user.role === UserRole.ADMIN
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
                }`}>
                {user.role === UserRole.ADMIN ? <ShieldCheck size={12} /> : <UserIcon size={12} />}
                {user.role === UserRole.ADMIN ? 'ADMIN' : 'AGENT'}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{user.name}</h3>
            <div className="space-y-2 mb-6 flex-grow">
              <div className="flex items-center text-sm text-gray-500 gap-2">
                <Mail size={14} className="text-gray-400" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-gray-500 gap-2">
                <Phone size={14} className="text-gray-400" />
                {user.phone || 'Non renseigné'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">Ajouté le {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
          Aucun utilisateur trouvé.
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold font-heading">
                {isEditing ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        required={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        required={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.password_confirmation}
                        onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.role === UserRole.ADMIN
                      ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="role"
                      className="hidden"
                      checked={formData.role === UserRole.ADMIN}
                      onChange={() => setFormData({ ...formData, role: UserRole.ADMIN })}
                    />
                    <ShieldCheck size={24} />
                    <span className="font-bold">Admin</span>
                  </label>

                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.role === UserRole.AGENT
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="role"
                      className="hidden"
                      checked={formData.role === UserRole.AGENT}
                      onChange={() => setFormData({ ...formData, role: UserRole.AGENT })}
                    />
                    <UserIcon size={24} />
                    <span className="font-bold">Agent</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 flex items-center disabled:opacity-50"
                >
                  {isSaving ? <Loader className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};