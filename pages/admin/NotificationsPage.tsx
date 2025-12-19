import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, Trash2, User, Calendar, Bell } from 'lucide-react';
import { contactService } from '../../services/contact';
import { ContactMessage } from '../../types';
import Swal from 'sweetalert2';
import { useNotification } from '../../contexts/NotificationContext';

export const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const { decrementUnreadCount, refreshUnreadCount } = useNotification();

    useEffect(() => {
        loadNotifications();
        refreshUnreadCount();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await contactService.getMessages('UNREAD');
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await contactService.markAsRead(id);
            // Remove from list as it is no longer unread
            setNotifications(notifications.filter(msg => msg.id !== id));
            decrementUnreadCount();
            if (selectedMessage?.id === id) setSelectedMessage(null);

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            Toast.fire({
                icon: 'success',
                title: 'Message marqué comme lu'
            });
        } catch (error) {
            console.error('Error marking as read:', error);
            Swal.fire('Erreur', 'Impossible de marquer comme lu.', 'error');
        }
    };

    const handleSelectMessage = (msg: ContactMessage) => {
        setSelectedMessage(msg);
        // Optional: automatically mark as read when selecting? 
        // User request says "cliquer sur message pour lire et mettre le status a 'mark-as-read'"
        // So we can trigger markAsRead here or add a specific button. 
        // Let's verify requirement: "cliquer sur message pour lire et mettre le status a 'mark-as-read'" implies action.
    };

    const handleReadAndDismiss = (msg: ContactMessage) => {
        handleMarkAsRead(msg.id);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                    <Bell size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-heading text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Vous avez {notifications.length} message(s) non lu(s).</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">
                        Non Lus ({notifications.length})
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Chargement...</div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <CheckCircle size={48} className="mb-2 text-green-500" />
                                <p>Tout est lu !</p>
                            </div>
                        ) : (
                            notifications.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-4 rounded-xl cursor-pointer transition-colors border relative ${selectedMessage?.id === msg.id ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                                >
                                    <div className="absolute top-4 right-4 h-2 w-2 bg-red-500 rounded-full"></div>
                                    <div className="flex justify-between items-start mb-1 pr-4">
                                        <h3 className={`font-semibold text-sm ${selectedMessage?.id === msg.id ? 'text-primary' : 'text-gray-900'}`}>{msg.name}</h3>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm font-medium text-gray-700 truncate">{msg.subject}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Content */}
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
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 bg-white">
                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={() => handleReadAndDismiss(selectedMessage)}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Marquer comme lu
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                            <Bell size={64} className="mb-4 text-gray-200" />
                            <p>Sélectionnez un message pour le lire</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
