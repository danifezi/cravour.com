import * as admin from 'firebase-admin';
import { ApiError } from '../middleware/errorMiddleware';

// Moved from types/index.d.ts
type Timestamp = admin.firestore.Timestamp;

// Firestore document structures
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  walletBalance: number;
  createdAt: Timestamp;
}

export interface Transaction {
  id: string;
  date: Timestamp;
  description: string;
  category: string;
  amount: number;
  type: 'in' | 'out';
  planId?: string;
  reference?: string; // For payment gateway transactions
  createdAt: Timestamp;
}

export interface FinancialPlan {
  id: string;
  description: string;
  status: 'active' | 'paused';
  spent: number;
  createdAt: Timestamp;
  budgetAnalysis: {
    userBudget: number;
    estimatedCost: number;
    difference: number;
    summary: string;
    optimizationTips: string[];
  };
  budgetItems: {
    itemName: string;
    quantity: string;
    estimatedPrice: number;
  }[];
  priceAnalysis: {
    itemName: string;
    priceStability: string;
    savingTip: string;
  }[];
  recommendedMerchants: {
    name: string;
    address: string;
    deals: string;
    verified: boolean;
  }[];
}


let db: admin.firestore.Firestore;

export function initializeFirebaseAdmin() {
    try {
        if (admin.apps.length === 0) {
            if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("Firebase Admin SDK initialized using Service Account Key.");
            } else {
                admin.initializeApp();
                console.log("Firebase Admin SDK initialized using Default Credentials.");
            }
        }
        db = admin.firestore();
    } catch (error) {
        console.error(`CRITICAL: Firebase Admin SDK failed to initialize. Error: ${(error as Error).message}`);
    }
}

function ensureDb(): admin.firestore.Firestore {
    if (!db) throw new ApiError("Database service is not available.", 503);
    return db;
}

export const firebaseService = {
    createUserProfile: async (uid: string, email: string, name: string): Promise<UserProfile> => {
        const db = ensureDb();
        const userRef = db.collection('users').doc(uid);
        const profile: UserProfile = {
            uid,
            email,
            name,
            walletBalance: 0,
            createdAt: admin.firestore.Timestamp.now(),
        };
        await userRef.set(profile);
        return profile;
    },

    getUserProfile: async (uid: string): Promise<admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>> => {
        const db = ensureDb();
        return db.collection('users').doc(uid).get();
    },
    
    savePlan: async (userId: string, planData: any): Promise<FinancialPlan> => {
        const db = ensureDb();
        const planRef = db.collection('users').doc(userId).collection('plans').doc();
        const planWithDefaults: FinancialPlan = {
            ...planData,
            id: planRef.id,
            spent: 0,
            status: 'active',
            createdAt: admin.firestore.Timestamp.now(),
        };
        await planRef.set(planWithDefaults);
        return planWithDefaults;
    },
    
    getPlans: async (userId: string): Promise<FinancialPlan[]> => {
        const db = ensureDb();
        const plansSnapshot = await db.collection('users').doc(userId).collection('plans').orderBy('createdAt', 'desc').get();
        return plansSnapshot.docs.map(doc => doc.data() as FinancialPlan);
    },
    
    updatePlan: async (userId: string, planId: string, updateData: { status: 'active' | 'paused' }): Promise<void> => {
        const db = ensureDb();
        await db.collection('users').doc(userId).collection('plans').doc(planId).update(updateData);
    },
    
    deletePlan: async (userId: string, planId: string): Promise<void> => {
        const db = ensureDb();
        await db.collection('users').doc(userId).collection('plans').doc(planId).delete();
    },

    addTransaction: async (userId: string, transaction: any): Promise<{ id: string } & any> => {
        const db = ensureDb();
        const userRef = db.collection('users').doc(userId);
        const transactionRef = userRef.collection('transactions').doc();
        const planRef = transaction.planId ? userRef.collection('plans').doc(transaction.planId) : null;
        
        const batch = db.batch();
        const amount = Number(transaction.amount);

        const newTransaction = {
            ...transaction,
            id: transactionRef.id,
            amount: amount,
            date: admin.firestore.Timestamp.fromDate(new Date(transaction.date)),
            createdAt: admin.firestore.Timestamp.now()
        };
        batch.set(transactionRef, newTransaction);

        const balanceIncrement = transaction.type === 'in' ? amount : -amount;
        batch.update(userRef, { walletBalance: admin.firestore.FieldValue.increment(balanceIncrement) });
        
        if (transaction.type === 'out' && planRef) {
            batch.update(planRef, { spent: admin.firestore.FieldValue.increment(amount) });
        }
    
        await batch.commit();
        return { ...newTransaction, message: "Transaction added successfully" };
    },
    
    getTransactionsForUser: async (userId: string, limitVal: number = 50): Promise<Transaction[]> => {
        const db = ensureDb();
        const snapshot = await db.collection('users').doc(userId).collection('transactions').orderBy('date', 'desc').limit(limitVal).get();
        return snapshot.docs.map(doc => doc.data() as Transaction);
    },
    
    findTransactionByReference: async (userId: string, reference: string): Promise<Transaction[]> => {
        const db = ensureDb();
        const snapshot = await db.collection('users').doc(userId).collection('transactions')
            .where('reference', '==', reference)
            .limit(1)
            .get();
        return snapshot.docs.map(doc => doc.data() as Transaction);
    },
    
    saveToWaitlist: async (email: string): Promise<{ message: string }> => {
        const db = ensureDb();
        const waitlistRef = db.collection('waitlist').doc(email);
        const doc = await waitlistRef.get();
    
        if (doc.exists) {
            throw new ApiError("You are already on the waitlist!", 409);
        }
        
        await waitlistRef.set({
            email: email,
            joinedAt: admin.firestore.Timestamp.now(),
        });
        return { message: 'Successfully joined the waitlist.' };
    },
};