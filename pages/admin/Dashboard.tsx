import React from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, FileCheck, TrendingUp, Activity, Loader } from 'lucide-react';
import { dashboardService, DashboardStats } from '../../services/dashboard';

const COLORS = ['#009933', '#FFCC00'];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: string; gradient: string }> = ({ title, value, icon, trend, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 ${gradient}`}>
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
          <div className="text-white">
            {icon}
          </div>
        </div>
        {trend && (
          <span className="text-xs font-semibold bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
    {/* Decorative gradient overlay */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-500">Impossible de charger les statistiques</div>;
  }
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500">Vue d'ensemble des activités solaires.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Collectes"
          value={stats.totalCollections.toString()}
          icon={<FileCheck size={24} />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Devis Générés"
          value={stats.processedCollections.toString()}
          icon={<Activity size={24} />}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Taux Conversion"
          value={`${stats.conversionRate}%`}
          icon={<TrendingUp size={24} />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers.toString()}
          icon={<Users size={24} />}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Évolution des demandes</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.activityData}>
                <defs>
                  <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009933" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#009933" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="collections" stroke="#009933" strokeWidth={3} fillOpacity={1} fill="url(#colorCol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Type de Profil</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.profileData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.profileData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute bottom-0 w-full flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Factures</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span>Équipements</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Collections Table Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Demandes récentes</h3>
          <Link to="/admin/collections" className="text-sm text-primary font-medium hover:underline">Voir tout</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {stats.recentCollections.map((collection) => (
                <tr key={collection.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {collection.personalInfo.name} {collection.personalInfo.firstName}
                  </td>
                  <td className="px-6 py-4">
                    {collection.consumptionProfile === 'INVOICE' ? 'Factures' : 'Équipements'}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(collection.submittedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${collection.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      collection.status === 'PROCESSED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {collection.status === 'PENDING' ? 'En attente' :
                        collection.status === 'PROCESSED' ? 'Traité' : 'Rejeté'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};