import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Plus, X, Save, FolderKanban, Calendar, MapPin, Zap, Tag, Image as ImageIcon, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import { Project } from '../../types';
import { projectService } from '../../services/projects';

export const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Project>>({
        title: '',
        category: '',
        capacity: '',
        location: '',
        date: '',
        description: '',
        image: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await projectService.getAll();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
            Swal.fire('Erreur', 'Impossible de charger les projets', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Supprimer ce projet ?',
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
                    await projectService.delete(id);
                    setProjects(prev => prev.filter(p => p.id !== id));
                    Swal.fire('Supprimé !', 'Le projet a été supprimé.', 'success');
                } catch (error: any) {
                    Swal.fire('Erreur', 'Impossible de supprimer le projet', 'error');
                }
            }
        });
    };

    const handleOpenCreate = () => {
        setFormData({
            title: '',
            category: '',
            capacity: '',
            location: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            image: ''
        });
        setSelectedFile(undefined);
        setPreviewUrl(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (project: Project) => {
        setFormData({
            ...project
        });
        setSelectedFile(undefined);
        setPreviewUrl(null);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (isEditing && formData.id) {
                const updated = await projectService.update(formData.id, formData, selectedFile);
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
                Swal.fire({
                    icon: 'success',
                    title: 'Mis à jour',
                    text: 'Projet modifié avec succès.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                const newProject = await projectService.create(formData, selectedFile);
                setProjects(prev => [newProject, ...prev]);
                Swal.fire({
                    icon: 'success',
                    title: 'Créé',
                    text: 'Nouveau projet ajouté.',
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

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-gray-900">Gestion des Projets</h1>
                    <p className="text-gray-500">Gérez votre portfolio de réalisations.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-primary/30 flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Nouveau Projet
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un projet..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                    <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300">
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={project.image || "https://placehold.co/600x400?text=Projet"}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                {project.category}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{project.description}</p>

                            <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-1"><MapPin size={14} className="text-primary" /> {project.location}</div>
                                <div className="flex items-center gap-1"><Zap size={14} className="text-yellow-500" /> {project.capacity}</div>
                                <div className="flex items-center gap-1 col-span-2"><Calendar size={14} className="text-gray-400" /> {project.date}</div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button onClick={() => handleOpenEdit(project)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold font-heading">{isEditing ? 'Modifier Projet' : 'Nouveau Projet'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                    <input type="text" required className="w-full p-3 border border-gray-200 rounded-xl" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required placeholder="ex: Résidentiel" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                                    <div className="relative">
                                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required placeholder="ex: 5kW" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" required className="w-full p-3 border border-gray-200 rounded-xl" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image du projet</label>
                                    <div className="space-y-2">
                                        {(previewUrl || (isEditing && formData.image)) && (
                                            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                                                <img
                                                    src={previewUrl || formData.image}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full p-3 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                                        />
                                        <p className="text-xs text-gray-500">Format: JPG, PNG. Max 2MB</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows={4} required className="w-full p-3 border border-gray-200 rounded-xl resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">Annuler</button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 flex items-center disabled:opacity-50">
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
