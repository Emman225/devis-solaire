import { collectionService } from './collections';
import { userService } from './users';

export interface DashboardStats {
    totalCollections: number;
    processedCollections: number;
    conversionRate: number;
    totalUsers: number;
    recentCollections: any[];
    activityData: { name: string; collections: number }[];
    profileData: { name: string; value: number }[];
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        try {
            // Fetch all collections and users in parallel
            const [collections, users] = await Promise.all([
                collectionService.getAll(),
                userService.getAll()
            ]);

            const totalCollections = collections.length;
            const processedCollections = collections.filter(c => c.status === 'PROCESSED').length;
            const conversionRate = totalCollections > 0
                ? Math.round((processedCollections / totalCollections) * 100)
                : 0;

            // Get recent 5 collections
            const recentCollections = collections
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 5);

            // Activity data - group by date (last 7 days)
            const activityData = generateActivityData(collections);

            // Profile data - count by consumption profile type
            const invoiceCount = collections.filter(c => c.consumptionProfile === 'INVOICE').length;
            const equipmentCount = collections.filter(c => c.consumptionProfile === 'EQUIPMENT').length;

            const profileData = [
                { name: 'Factures', value: invoiceCount },
                { name: 'Équipements', value: equipmentCount }
            ];

            return {
                totalCollections,
                processedCollections,
                conversionRate,
                totalUsers: users.length,
                recentCollections,
                activityData,
                profileData
            };
        } catch (error) {
            console.error('Dashboard stats error:', error);
            throw error;
        }
    }
};

function generateActivityData(collections: any[]) {
    // Get last 7 days
    const days = 7;
    const today = new Date();
    const activityMap: { [key: string]: number } = {};

    // Initialize last 7 days
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        activityMap[key] = 0;
    }

    // Count collections per day
    collections.forEach(collection => {
        const date = new Date(collection.submittedAt);
        const key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        if (activityMap.hasOwnProperty(key)) {
            activityMap[key]++;
        }
    });

    return Object.entries(activityMap).map(([name, collections]) => ({
        name,
        collections
    }));
}
