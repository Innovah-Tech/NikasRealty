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
    }
};
