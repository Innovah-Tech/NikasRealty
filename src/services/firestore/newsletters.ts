import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'newsletter_subscribers';

export interface Subscriber {
    id?: string;
    email: string;
    subscribedAt: Date;
    isActive: boolean;
}

export const newsletterService = {
    // Subscribe a new email
    async subscribe(email: string) {
        try {
            // Check if email already exists
            const q = query(collection(db, COLLECTION_NAME), where('email', '==', email.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                throw new Error('This email is already subscribed to our newsletter.');
            }

            const subscriberData = {
                email: email.toLowerCase().trim(),
                subscribedAt: Timestamp.now(),
                isActive: true,
            };

            const docRef = await addDoc(collection(db, COLLECTION_NAME), subscriberData);

            if (import.meta.env.DEV) {
                console.log('Newsletter subscriber added:', email);
            }

            return { id: docRef.id, ...subscriberData };
        } catch (error: any) {
            console.error('Error subscribing to newsletter:', error);

            if (error.message.includes('already subscribed')) {
                throw error;
            } else if (error.code === 'permission-denied') {
                throw new Error('Unable to subscribe. Please try again later.');
            }

            throw new Error('Failed to subscribe. Please try again.');
        }
    },

    // Get all subscribers (admin only)
    async getAll(): Promise<Subscriber[]> {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                subscribedAt: doc.data().subscribedAt?.toDate(),
            })) as Subscriber[];
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            throw error;
        }
    },

    // Unsubscribe
    async unsubscribe(id: string) {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error unsubscribing:', error);
            throw error;
        }
    },

    // Get active subscriber count
    async getCount(): Promise<number> {
        try {
            const subscribers = await this.getAll();
            return subscribers.filter(s => s.isActive).length;
        } catch (error) {
            console.error('Error getting subscriber count:', error);
            return 0;
        }
    },
};
