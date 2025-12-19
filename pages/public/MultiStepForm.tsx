import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Cpu,
  Home,
  MapPin,
  Send
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { CollectionRequest, Equipment } from '../../types';
import { collectionService } from '../../services/collections';

const INITIAL_DATA: Partial<CollectionRequest> = {
  step: 1,
  personalInfo: { name: '', firstName: '', email: '', phone: '' },
  consumptionProfile: null,
  invoices: [],
  equipmentList: [],
  installationType: null,
  location: '',
  additionalInfo: ''
};

export const MultiStepForm: React.FC = () => {
  const location = useLocation();
  const [formData, setFormData] = useState<Partial<CollectionRequest>>(location.state || INITIAL_DATA);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentStep = formData.step || 1;

  // Prevent accidental double-clicks from previous step triggering submit immediately
  useEffect(() => {
    if (currentStep === 5) {
      setCanSubmit(false);
      const timer = setTimeout(() => setCanSubmit(true), 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const nextStep = () => setFormData(prev => ({ ...prev, step: (prev.step || 1) + 1 }));
  const prevStep = () => setFormData(prev => ({ ...prev, step: (prev.step || 1) - 1 }));

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.personalInfo?.name || !formData.personalInfo?.firstName || !formData.personalInfo?.email || !formData.personalInfo?.phone) {
          Swal.fire({
            icon: 'warning',
            title: 'Champs manquants',
            text: 'Veuillez remplir tous les champs obligatoires (Nom, Prénoms, Email, Téléphone).'
          });
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.personalInfo.email)) {
          Swal.fire({
            icon: 'warning',
            title: 'Email invalide',
            text: 'Veuillez entrer une adresse email valide.'
          });
          return false;
        }
        return true;

      case 2:
        if (!formData.consumptionProfile) {
          Swal.fire({
            icon: 'warning',
            title: 'Sélection requise',
            text: 'Veuillez sélectionner un profil de consommation.'
          });
          return false;
        }
        if (formData.consumptionProfile === 'INVOICE' && (!formData.invoices || formData.invoices.length === 0)) {
          Swal.fire({
            icon: 'warning',
            title: 'Fichiers manquants',
            text: 'Veuillez joindre au moins une facture pour continuer.'
          });
          return false;
        }
        return true;

      case 3:
        if (formData.consumptionProfile === 'EQUIPMENT') {
          if (!formData.equipmentList || formData.equipmentList.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Liste vide',
              text: 'Veuillez ajouter au moins un équipement.'
            });
            return false;
          }
          const invalidItems = formData.equipmentList.filter(item => item.quantity <= 0 || item.powerWatts < 0);
          if (invalidItems.length > 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Valeurs incorrectes',
              text: 'Veuillez vérifier les quantités et puissances de vos équipements.'
            });
            return false;
          }
        }
        return true;

      case 4:
        if (!formData.installationType) {
          Swal.fire({
            icon: 'warning',
            title: 'Sélection requise',
            text: 'Veuillez sélectionner un type d\'installation.'
          });
          return false;
        }
        if (formData.installationType === 'ROOF' && !formData.roofType) {
          Swal.fire({
            icon: 'warning',
            title: 'Sélection manquante',
            text: 'Veuillez préciser le type de toiture.'
          });
          return false;
        }
        return true;

      case 5:
        const locationVal = typeof formData.location === 'string' ? formData.location : formData.location?.city;
        if (!locationVal || locationVal.trim() === '') {
          Swal.fire({
            icon: 'warning',
            title: 'Information manquante',
            text: 'Veuillez entrer votre ville ou commune.'
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 5) return;
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      await collectionService.save(formData);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'envoi de votre demande.';

      if (error.errors) {
        // Format validation errors
        // const details = Object.values(error.errors).flat().join('\n');
        // errorMessage = `Erreur de validation:\n${details}`;
        errorMessage = `Erreur de validation:\n${JSON.stringify(error.errors, null, 2)}`;
      }

      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white max-w-lg w-full p-8 md:p-12 rounded-3xl shadow-xl text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4">Demande Envoyée !</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Merci <span className="font-semibold">{formData.personalInfo?.firstName}</span> ! Vos informations ont bien été transmises à nos experts.
            Vous recevrez votre devis personnalisé par email d'ici <span className="font-semibold text-primary">48 heures</span>.
          </p>
          <div className="flex justify-center">
            <img src="https://picsum.photos/400/200" alt="Maison Solaire" className="rounded-xl shadow-sm mb-8 object-cover h-32 w-full" />
          </div>
          <Link to="/" className="inline-block w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-500">Étape {currentStep} sur 5</span>
          <span className="text-sm font-bold text-primary">{Math.round((currentStep / 5) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-12">

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold font-heading text-gray-900">Informations Personnelles</h2>
              <p className="text-gray-500 mb-6">Commençons par faire connaissance.</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={formData.personalInfo?.name}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo!, name: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénoms</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={formData.personalInfo?.firstName}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo!, firstName: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={formData.personalInfo?.email}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo!, email: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+225..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={formData.personalInfo?.phone}
                    onChange={e => setFormData({ ...formData, personalInfo: { ...formData.personalInfo!, phone: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Profile Selection */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold font-heading text-gray-900">Profil de Consommation</h2>
              <p className="text-gray-500">Comment souhaitez-vous estimer vos besoins ?</p>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, consumptionProfile: 'INVOICE' })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.consumptionProfile === 'INVOICE'
                    ? 'border-primary bg-green-50 ring-1 ring-primary'
                    : 'border-gray-100 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${formData.consumptionProfile === 'INVOICE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <FileText size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Joindre mes factures</h3>
                  <p className="text-sm text-gray-500 mt-2">Plus précis. Téléversez vos 3 à 6 dernières factures CIE.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, consumptionProfile: 'EQUIPMENT' })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.consumptionProfile === 'EQUIPMENT'
                    ? 'border-primary bg-green-50 ring-1 ring-primary'
                    : 'border-gray-100 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${formData.consumptionProfile === 'EQUIPMENT' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Cpu size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">Lister mes équipements</h3>
                  <p className="text-sm text-gray-500 mt-2">Détaillez vos appareils pour une estimation manuelle.</p>
                </button>
              </div>

              {formData.consumptionProfile === 'INVOICE' && (
                <div className="mt-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="file-upload"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          const currentFiles = (formData.invoices as File[]) || [];
                          setFormData({ ...formData, invoices: [...currentFiles, ...newFiles] });
                        }
                      }}
                    />
                    <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-900 font-medium">Glissez vos factures ici ou cliquez pour parcourir</p>
                    <p className="text-xs text-gray-500 mt-2">PDF, JPG, PNG acceptés (Max 5Mo)</p>
                  </div>

                  {/* File List */}
                  {formData.invoices && formData.invoices.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700">Fichiers sélectionnés ({formData.invoices.length})</h4>
                      <div className="grid gap-3">
                        {(formData.invoices as (File | string)[]).map((file, index) => {
                          const isFile = file instanceof File;
                          const fileName = isFile ? file.name : `Facture ${index + 1}`;
                          const fileSize = isFile ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Lien externe';
                          const fileUrl = isFile ? URL.createObjectURL(file) : file;

                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                  <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                                  <p className="text-xs text-gray-500">{fileSize}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Voir / Télécharger"
                                >
                                  <Upload size={18} className="rotate-180" /> {/* Using Upload icon rotated as Download */}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newInvoices = [...(formData.invoices || [])];
                                    newInvoices.splice(index, 1);
                                    setFormData({ ...formData, invoices: newInvoices });
                                  }}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Equipment List (Only if Equipment profile selected) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold font-heading text-gray-900">Vos Équipements</h2>

              <EquipmentManager
                items={formData.equipmentList || []}
                onChange={(items) => setFormData({ ...formData, equipmentList: items })}
              />
            </div>
          )}

          {/* Step 4: Installation */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold font-heading text-gray-900">Type d'Installation</h2>

              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="installation"
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
                    checked={formData.installationType === 'ROOF'}
                    onChange={() => setFormData({ ...formData, installationType: 'ROOF' })}
                  />
                  <div className="ml-4 flex items-center">
                    <Home className="mr-3 text-gray-500" />
                    <span className="font-medium text-gray-900">Installation sur Toiture</span>
                  </div>
                </label>

                {formData.installationType === 'ROOF' && (
                  <div className="ml-8 grid grid-cols-2 gap-3 mt-2 animate-fade-in">
                    {[
                      { label: 'Tôle ondulée', value: 'SHEET' },
                      { label: 'Dalle', value: 'SLAB' },
                      { label: 'Ardoise', value: 'SLATE' },
                      { label: 'Bac acier', value: 'STEEL_TRAY' },
                      { label: 'Tuiles', value: 'TILES' }
                    ].map((item) => (
                      <label key={item.value} className="flex items-center p-3 bg-gray-50 rounded-lg text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="roofType"
                          className="text-primary focus:ring-primary"
                          checked={formData.roofType === item.value as any}
                          onChange={() => setFormData({ ...formData, roofType: item.value as any })}
                        />
                        <span className="ml-2 text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="installation"
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
                    checked={formData.installationType === 'GROUND'}
                    onChange={() => setFormData({ ...formData, installationType: 'GROUND' })}
                  />
                  <div className="ml-4 flex items-center">
                    <MapPin className="mr-3 text-gray-500" />
                    <span className="font-medium text-gray-900">Installation au Sol</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Location & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold font-heading text-gray-900">Derniers détails</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville / Commune <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Abidjan, Cocody"
                  value={typeof formData.location === 'string' ? formData.location : formData.location?.city}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Autres informations utiles</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none h-32 resize-none"
                  placeholder="Contraintes d'accès, besoins spécifiques..."
                  value={formData.additionalInfo || ''}
                  onChange={e => setFormData({ ...formData, additionalInfo: e.target.value })}
                ></textarea>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ChevronLeft className="mr-2" size={20} />
                Retour
              </button>
            )}

            <div className="ml-auto">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!validateStep(currentStep)) return;

                    // Navigation logic
                    if (currentStep === 2 && formData.consumptionProfile === 'INVOICE') {
                      setFormData(prev => ({ ...prev, step: 4 }));
                      return;
                    }
                    nextStep();
                  }}
                  className="flex items-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/30"
                >
                  Suivant
                  <ChevronRight className="ml-2" size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className={`flex items-center px-8 py-3 bg-secondary text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-secondary/30 ${(!canSubmit || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary-light'}`}
                >
                  {isSubmitting ? 'Envoi...' : 'Envoyer ma demande'}
                  {!isSubmitting && <Send className="ml-2" size={20} />}
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

// Sub-component for Equipment List Management
const EquipmentManager: React.FC<{ items: Equipment[], onChange: (items: Equipment[]) => void }> = ({ items, onChange }) => {
  const [newType, setNewType] = useState('');

  const commonEquipment = [
    'Lampes', 'Climatiseur', 'Réfrigérateur', 'Congélateur',
    'Chauffe-eau', 'Micro-ondes', 'Lave-linge', 'Télévision'
  ];

  const addEquipment = () => {
    if (!newType) return;
    const newItem: Equipment = {
      id: Date.now().toString(),
      type: newType,
      quantity: 1,
      powerWatts: 0,
      hoursPerDay: 0
    };
    onChange([...items, newItem]);
    setNewType('');
  };

  const updateItem = (id: string, field: keyof Equipment, value: any) => {
    onChange(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary bg-white"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
        >
          <option value="">Sélectionner un équipement...</option>
          {commonEquipment.map(eq => <option key={eq} value={eq}>{eq}</option>)}
          <option value="Autre">Autre</option>
        </select>
        <button
          type="button"
          onClick={addEquipment}
          disabled={!newType}
          className="bg-primary text-white px-4 rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          <Plus />
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Aucun équipement ajouté
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-wrap md:flex-nowrap items-center gap-4 animate-fade-in">
            <div className="w-full md:w-1/4 font-semibold text-gray-800">{item.type}</div>

            <div className="flex-1 grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Qté</label>
                <input type="number" min="1" className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                  value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Watts</label>
                <input type="number" min="0" className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                  value={item.powerWatts} onChange={e => updateItem(item.id, 'powerWatts', parseInt(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Heures/j</label>
                <input type="number" min="0" max="24" className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                  value={item.hoursPerDay} onChange={e => updateItem(item.id, 'hoursPerDay', parseInt(e.target.value))} />
              </div>
            </div>

            <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};