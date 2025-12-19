import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Search, Filter, X, Plus, Save, Mail, FileCheck, Send, Check, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { CollectionRequest } from '../../types';

import { collectionService } from '../../services/collections';

export const CollectionList: React.FC = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<CollectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await collectionService.getAll();
        setCollections(data);
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de charger les demandes.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // Modal States
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Data States
  const [selectedCollection, setSelectedCollection] = useState<CollectionRequest | null>(null);
  const [formData, setFormData] = useState<Partial<CollectionRequest>>({});

  const filtered = collections.filter(c =>
    c.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Handlers ---

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await collectionService.deleteCollectionRequest(id);
          setCollections(prev => prev.filter(c => c.id !== id));
          if (selectedCollection?.id === id) setSelectedCollection(null);
          Swal.fire(
            'Supprimé !',
            'La collecte a été supprimée.',
            'success'
          );
        } catch (error) {
          console.error(error);
          Swal.fire(
            'Erreur',
            'Impossible de supprimer la demande.',
            'error'
          );
        }
      }
    });
  };

  const handleOpenCreate = () => {
    navigate('/simulation', { state: { step: 1, installationType: null } });
  };

  const handleOpenEdit = (item: CollectionRequest) => {
    // Reset step to 1 for editing so user starts at the beginning
    navigate('/simulation', { state: { ...item, step: 1 } });
  };

  const handleOpenView = (item: CollectionRequest) => {
    setSelectedCollection(item);
    setViewModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    const newCollection = formData as CollectionRequest;

    setCollections(prev => {
      const exists = prev.find(c => c.id === newCollection.id);
      if (exists) {
        return prev.map(c => c.id === newCollection.id ? newCollection : c);
      } else {
        return [newCollection, ...prev];
      }
    });

    setFormModalOpen(false);
    // If we were editing from view modal, update selectedCollection too
    if (selectedCollection && selectedCollection.id === newCollection.id) {
      setSelectedCollection(newCollection);
    }

    Swal.fire({
      icon: 'success',
      title: 'Enregistré',
      text: 'La collecte a été sauvegardée avec succès.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCollection) {
      try {
        const updated = { ...selectedCollection, status: 'PROCESSED' as const };

        // Persist to backend
        await collectionService.save({
          id: updated.id,
          status: 'PROCESSED'
        });

        // Update local state
        setCollections(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelectedCollection(updated);

        setQuoteModalOpen(false);
        Swal.fire({
          icon: 'success',
          title: 'Devis généré',
          text: 'Le statut a été mis à jour et le devis considéré comme traité.',
          confirmButtonColor: '#009933'
        });
      } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire('Erreur', 'Impossible de mettre à jour le statut.', 'error');
      }
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactModalOpen(false);
    Swal.fire({
      icon: 'success',
      title: 'Message envoyé',
      text: 'Votre message a été transmis au client.',
      confirmButtonColor: '#009933'
    });
  };

  // --- Render Helpers ---

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status === 'PENDING' ? 'En attente' : status === 'PROCESSED' ? 'Traité' : 'Rejeté'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Liste des Collectes</h1>
          <p className="text-gray-500">Gérez les demandes de simulation reçues.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-primary/30 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nouvelle demande
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <Filter size={20} className="mr-2" />
          Filtres
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Profil</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-600">{item.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.personalInfo.name} {item.personalInfo.firstName}</div>
                      <div className="text-xs text-gray-500">{item.location}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.personalInfo.phone}</td>
                    <td className="px-6 py-4">
                      {item.consumptionProfile === 'INVOICE' ? '📄 Factures' : '🔌 Équipements'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.submittedAt}</td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">Aucune donnée trouvée</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 
          MODALS SECTION 
      */}

      {/* 1. VIEW DETAILS MODAL */}
      {viewModalOpen && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-heading">Détails Collecte</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">{selectedCollection.id}</span>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Header Info */}
              <div className="flex justify-between items-start bg-gray-50 p-6 rounded-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCollection.personalInfo.name} {selectedCollection.personalInfo.firstName}</h3>
                  <div className="flex flex-col mt-2 text-gray-600 gap-1">
                    <div className="flex items-center gap-2"><Mail size={16} /> {selectedCollection.personalInfo.email}</div>
                    <div className="flex items-center gap-2"><span className="font-semibold">Tel:</span> {selectedCollection.personalInfo.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={selectedCollection.status} />
                  <p className="text-xs text-gray-500 mt-2">Soumis le: {selectedCollection.submittedAt}</p>
                </div>
              </div>

              {/* Technical Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-100 p-5 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileCheck className="text-primary" size={20} /> Profil Consommation
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">Type: <span className="font-medium text-gray-900">{selectedCollection.consumptionProfile === 'INVOICE' ? 'Factures CIE' : 'Liste Équipements'}</span></p>
                  {selectedCollection.consumptionProfile === 'INVOICE' ? (
                    <div className="space-y-2 mt-2">
                      {selectedCollection.invoices && selectedCollection.invoices.length > 0 ? (
                        (selectedCollection.invoices as string[]).map((invoice, idx) => (
                          <a
                            key={idx}
                            href={invoice}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors text-sm text-blue-600 hover:underline"
                          >
                            <FileText size={16} className="text-gray-400" />
                            <span>Voir la facture {idx + 1}</span>
                          </a>
                        ))
                      ) : (
                        <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-500 text-center">
                          Aucun fichier joint
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      {selectedCollection.equipmentList.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {selectedCollection.equipmentList.map((eq, idx) => (
                            <li key={idx}>
                              {eq.quantity}x {eq.type} {eq.name ? `(${eq.name})` : ''} ({eq.powerWatts}W)
                            </li>
                          ))}
                        </ul>
                      ) : "Aucun équipement listé"}
                    </div>
                  )}
                </div>

                <div className="border border-gray-100 p-5 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Send className="text-secondary" size={20} /> Installation
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">Ville: <span className="font-medium text-gray-900">{selectedCollection.location}</span></p>
                    {selectedCollection.installationType === 'ROOF' ? (
                      <>
                        <p className="text-gray-600">Type: <span className="font-medium text-gray-900">Toiture</span></p>
                        {selectedCollection.roofType && (
                          <p className="text-gray-600">Toiture: <span className="font-medium text-gray-900">
                            {{
                              'SHEET': 'Tôle ondulée',
                              'SLAB': 'Dalle',
                              'SLATE': 'Ardoise',
                              'STEEL_TRAY': 'Bac acier',
                              'TILES': 'Tuiles'
                            }[selectedCollection.roofType] || selectedCollection.roofType}
                          </span></p>
                        )}
                      </>
                    ) : selectedCollection.installationType === 'GROUND' ? (
                      <p className="text-gray-600">Type: <span className="font-medium text-gray-900">Installation au Sol</span></p>
                    ) : (
                      <p className="text-gray-600">Type: <span className="font-medium text-gray-900">Non spécifié</span></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Autres informations utiles</h4>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-gray-700 text-sm italic">
                  "{selectedCollection.additionalInfo || "Aucune note particulière."}"
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => { setViewModalOpen(false); setQuoteModalOpen(true); }}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors flex justify-center items-center gap-2"
              >
                <FileCheck size={20} />
                Générer Devis
              </button>
              <button
                onClick={() => { setViewModalOpen(false); setContactModalOpen(true); }}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"
              >
                <Mail size={20} />
                Contacter Client
              </button>
              <button
                onClick={() => { setViewModalOpen(false); handleOpenEdit(selectedCollection); }}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"
              >
                <Edit size={20} />
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FORM MODAL (CREATE / EDIT) - Superseded by Navigation to /simulation */}
      {/* {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           ... modal content ...
        </div>
      )} */}

      {/* 3. QUOTE GENERATION MODAL */}
      {quoteModalOpen && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold font-heading">Générer Devis #{selectedCollection.id}</h3>
              <button onClick={() => setQuoteModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleQuoteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant Estimé (FCFA)</label>
                <input type="number" className="w-full p-3 border border-gray-200 rounded-xl" placeholder="ex: 1 500 000" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Détails techniques (PDF)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                  <p className="text-sm text-gray-500">Glisser le devis PDF ici</p>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-lg">
                  Valider et Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CONTACT MODAL */}
      {contactModalOpen && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold font-heading">Contacter {selectedCollection.personalInfo.name}</h3>
              <button onClick={() => setContactModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input type="text" className="w-full p-3 border border-gray-200 rounded-xl" defaultValue={`Votre demande de devis #${selectedCollection.id}`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea className="w-full p-3 border border-gray-200 rounded-xl h-32 resize-none" placeholder="Bonjour..." required></textarea>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg flex justify-center items-center gap-2">
                  <Send size={18} /> Envoyer Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};