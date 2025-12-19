import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Sun,
  ChevronDown,
  Users,
  MessageSquare,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../../App';
import { contactService } from '../../services/contact';
import { useSettings } from '../../contexts/SettingsContext';
import { useNotification } from '../../contexts/NotificationContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { unreadCount, refreshUnreadCount } = useNotification();

  React.useEffect(() => {
    refreshUnreadCount();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Liste Collectes', path: '/admin/collections', icon: ClipboardList },
    { name: 'Projets', path: '/admin/projects', icon: FolderKanban },
    { name: 'Utilisateurs', path: '/admin/users', icon: Users },
    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { name: 'Obtenir mon devis', path: '/simulation', icon: Lightbulb },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 font-sans">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1A1A] border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <Sun className="text-primary" size={24} />
            <span className="text-xl font-bold font-heading text-white">{settings?.appName || 'LYNAYS'}</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                target={(item as any).external ? '_blank' : undefined}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={20} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu size={24} />
          </button>

          <div className="flex items-center ml-auto gap-6">
            <Link to="/admin/notifications" className="relative text-gray-400 hover:text-primary transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative pl-6 border-l border-gray-100">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors outline-none"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Utilisateur'}</p>
                </div>
                <img
                  src={user?.avatarUrl || "https://picsum.photos/200"}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
                    <Link
                      to="/admin/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="mr-2" />
                      Mon Profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={16} className="mr-2" />
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-neutral-50">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};