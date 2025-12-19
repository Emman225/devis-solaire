import React, { useEffect, useState } from 'react';
import { Mail, Search, Trash2, Eye, Calendar, User } from 'lucide-react';
import { contactService } from '../../services/contact';
import { ContactMessage } from '../../types';
import Swal from 'sweetalert2';

export const MessageList: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await contactService.getMessages();
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de charger les messages.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await contactService.deleteMessage(id);
                setMessages(messages.filter(msg => msg.id !== id));
                if (selectedMessage?.id === id) setSelectedMessage(null);
                Swal.fire(
                    'Supprimé !',
                    'Le message a été supprimé.',
                    'success'
                );
            } catch (error) {
                Swal.fire(
                    'Erreur',
                    'Une erreur est survenue lors de la suppression.',
                    'error'
                );
            }
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-gray-900">Messages</h1>
                    <p className="text-gray-500">Gérez les demandes de contact reçues.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Messages List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 font-semibold text-gray-700 bg-gray-50">
                        Liste des messages ({filteredMessages.length})
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Chargement...</div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Aucun message trouvé</div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-4 rounded-xl cursor-pointer transition-colors border relative ${selectedMessage?.id === msg.id ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                                >
                                    {msg.status === 'UNREAD' && (
                                        <div className="absolute top-4 right-4 h-2 w-2 bg-red-500 rounded-full"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-1 pr-4">
                                        <h3 className={`font-semibold text-sm ${selectedMessage?.id === msg.id ? 'text-primary' : 'text-gray-900'} ${msg.status === 'UNREAD' ? 'font-bold' : ''}`}>{msg.name}</h3>
                                        <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 truncate">{msg.subject}</p>
                                    <p className="text-xs text-gray-500 truncate mt-1">{msg.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Details */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    {selectedMessage ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-2"><User size={16} /> {selectedMessage.name}</span>
                                        <span className="flex items-center gap-2"><Mail size={16} /> {selectedMessage.email}</span>
                                        <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto flex-1 bg-white">
                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                            <Mail size={64} className="mb-4 text-gray-200" />
                            <p>Sélectionnez un message pour le lire</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
