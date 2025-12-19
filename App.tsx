import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ContactPage } from './pages/public/ContactPage';
import { MultiStepForm } from './pages/public/MultiStepForm';
import { LoginPage } from './pages/admin/LoginPage';
import { Dashboard } from './pages/admin/Dashboard';
import { CollectionList } from './pages/admin/CollectionList';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ProfilePage } from './pages/admin/ProfilePage';
import { UserList } from './pages/admin/UserList';
import { MessageList } from './pages/admin/MessageList';
import { ProjectList } from './pages/admin/ProjectList';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { User, UserRole } from './types';
import { authService } from './services/auth';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Mock Auth Context
const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}>({
  user: null,
  loading: true,
  login: () => { },
  logout: () => { },
});

export const useAuth = () => React.useContext(AuthContext);

// Protected Route Component
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout><Outlet /></AdminLayout>;
};

const App: React.FC = () => {
  // Mock User State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = React.useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check local storage and validate/refresh session
    const initSession = async () => {
      const storedToken = localStorage.getItem('lynays_token');
      if (storedToken) {
        try {
          // Attempt to refresh token to validate session
          const response = await authService.refresh();
          if (response.success) {
            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('lynays_user', JSON.stringify(userData));
            localStorage.setItem('lynays_token', response.data.access_token);
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          logout();
        }
      }
      setLoading(false);
    };
    initSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('lynays_user', JSON.stringify(userData));
        localStorage.setItem('lynays_token', response.data.access_token);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setUser(null);
      localStorage.removeItem('lynays_user');
      localStorage.removeItem('lynays_token');
    }
  };

  return (
    <SettingsProvider>
      <AuthContext.Provider value={{ user, loading, login, logout }}>
        <NotificationProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/projects" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
              <Route path="/simulation" element={<PublicLayout><MultiStepForm /></PublicLayout>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={user ? <Navigate to="/admin/dashboard" /> : <LoginPage />} />

              <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/collections" element={<CollectionList />} />
                <Route path="/admin/projects" element={<ProjectList />} />
                <Route path="/admin/users" element={<UserList />} />
                <Route path="/admin/messages" element={<MessageList />} />
                <Route path="/admin/notifications" element={<NotificationsPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
              </Route>

              {/* Default Redirect - Catch all unknown routes and send to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </NotificationProvider>
      </AuthContext.Provider>
    </SettingsProvider>
  );
};

export default App;