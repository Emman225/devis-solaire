import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { contactService } from '../services/contact';
import { useAuth } from '../App';

interface NotificationContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    decrementUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    unreadCount: 0,
    refreshUnreadCount: async () => { },
    decrementUnreadCount: () => { },
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    const refreshUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const msgs = await contactService.getMessages('UNREAD');
            setUnreadCount(msgs.length);
        } catch (error) {
            console.error('Failed to update unread count', error);
        }
    }, [user]);

    const decrementUnreadCount = useCallback(() => {
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    // Initial load
    useEffect(() => {
        refreshUnreadCount();
        // Optional: Polling every minute?
        // const interval = setInterval(refreshUnreadCount, 60000);
        // return () => clearInterval(interval);
    }, [refreshUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, decrementUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
