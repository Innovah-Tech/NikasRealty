import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    Timestamp,
    orderBy,
    limit,
    serverTimestamp,
    getDoc,
    doc,
    setDoc,
    increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const VISITS_COLLECTION = 'analytics_visits';
const STATS_COLLECTION = 'analytics_stats';

export interface Visit {
    id?: string;
    path: string;
    timestamp: any;
    sessionId: string;
}

export const analyticsService = {
    // Log a new visit
    async logVisit(path: string, sessionId: string) {
        try {
            // 1. Log the individual visit
            await addDoc(collection(db, VISITS_COLLECTION), {
                path,
                sessionId,
                timestamp: serverTimestamp(),
            });

            // 2. Update the aggregate stats for this path
            const statsRef = doc(db, STATS_COLLECTION, 'page_views');
            await setDoc(statsRef, {
                [path.replace(/\//g, '_') || 'home']: increment(1),
                total: increment(1),
                lastUpdated: serverTimestamp()
            }, { merge: true });

            // 3. Track unique visitors (simple check for today)
            const today = new Date().toISOString().split('T')[0];
            const visitorRef = doc(db, STATS_COLLECTION, `visitors_${today}`);
            await setDoc(visitorRef, {
                [sessionId]: true,
                count: increment(1),
                lastUpdated: serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error('Error logging visit:', error);
        }
    },

    // Get real-time stats
    async getRealTimeStats() {
        try {
            // Total stats
            const statsSnap = await getDoc(doc(db, STATS_COLLECTION, 'page_views'));
            const stats = statsSnap.data() || {};

            // Active users (last 5 minutes)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const activeQuery = query(
                collection(db, VISITS_COLLECTION),
                where('timestamp', '>=', Timestamp.fromDate(fiveMinutesAgo))
            );
            const activeSnap = await getDocs(activeQuery);

            // Count unique sessions in the last 5 minutes
            const uniqueSessions = new Set();
            activeSnap.docs.forEach(doc => uniqueSessions.add(doc.data().sessionId));

            return {
                pageViews: stats,
                activeNow: uniqueSessions.size
            };
        } catch (error) {
            console.error('Error fetching real-time stats:', error);
            return null;
        }
    },

    // Get historical traffic data
    async getHistoricalTraffic(days: number = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const q = query(
                collection(db, VISITS_COLLECTION),
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                orderBy('timestamp', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const visits = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));

            // Use Sets to track unique sessions per day and per hour
            const dailySessions: { [key: string]: Set<string> } = {};
            const hourlySessions: { [key: string]: { visitors: Set<string>, pageViews: number } } = {};

            const now = new Date();
            const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            visits.forEach((visit: any) => {
                const date = visit.timestamp;
                const sessionId = visit.sessionId || 'anonymous';
                if (!date) return;

                // Daily grouping
                const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!dailySessions[dayKey]) dailySessions[dayKey] = new Set();
                dailySessions[dayKey].add(sessionId);

                // Hourly grouping (if within last 24h)
                if (date >= last24h) {
                    const hourKey = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    if (!hourlySessions[hourKey]) {
                        hourlySessions[hourKey] = { visitors: new Set(), pageViews: 0 };
                    }
                    hourlySessions[hourKey].pageViews += 1;
                    hourlySessions[hourKey].visitors.add(sessionId);
                }
            });

            return {
                daily: Object.entries(dailySessions).map(([day, sessions]) => ({
                    day,
                    visitors: sessions.size
                })),
                hourly: Object.entries(hourlySessions).map(([time, data]) => ({
                    time,
                    visitors: data.visitors.size,
                    pageViews: data.pageViews
                }))
            };
        } catch (error) {
            console.error('Error fetching historical traffic:', error);
            return { daily: [], hourly: [] };
        }
    },

    // Get recent visits
    async getRecentVisits(limitCount: number = 5) {
        try {
            const q = query(
                collection(db, VISITS_COLLECTION),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
        } catch (error) {
            console.error('Error fetching recent visits:', error);
            return [];
        }
    }
};
