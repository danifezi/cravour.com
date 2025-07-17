
const admin = require('firebase-admin');

let db;

function initializeFirebaseAdmin() {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            db = admin.firestore();
            console.log("Firebase Admin SDK initialized successfully.");
        } else {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not found in .env");
        }
    } catch (error) {
        console.warn(`Firebase Admin SDK failed to initialize. Server will not have database persistence. Error: ${error.message}`);
        db = null;
    }
}

function ensureDb() {
    if (!db) {
        throw new Error("Database service is not available.");
    }
    return db;
}

const createUserProfile = async (uid, email, profileData) => {
    const db = ensureDb();
    const newUser = {
        id: uid,
        email,
        walletBalance: 0,
        profile: profileData || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(uid).set(newUser);
    return newUser;
};

const savePlan = async (userId, description, planData) => {
    const db = ensureDb();
    const planRef = db.collection('users').doc(userId).collection('plans').doc();
    const newPlan = { 
        id: planRef.id, 
        userId, 
        description, 
        status: 'active', 
        createdAt: admin.firestore.FieldValue.serverTimestamp(), 
        spent: 0, 
        ...planData 
    };
    await planRef.set(newPlan);
    return newPlan;
};

const getPlansForUser = async (userId) => {
    const db = ensureDb();
    const plansSnapshot = await db.collection('users').doc(userId).collection('plans').orderBy('createdAt', 'desc').get();
    return plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const updatePlanStatus = async (userId, planId, status) => {
    const db = ensureDb();
    const planRef = db.collection('users').doc(userId).collection('plans').doc(planId);
    await planRef.update({ status });
    return { id: planId, status };
};

const deletePlan = async (userId, planId) => {
    const db = ensureDb();
    const planRef = db.collection('users').doc(userId).collection('plans').doc(planId);
    await planRef.delete();
};

const addTransaction = async (userId, transactionData) => {
    const db = ensureDb();
    const { planId, amount, ...rest } = transactionData;
    const transactionRef = db.collection('users').doc(userId).collection('transactions').doc();
    const newTransaction = {
        id: transactionRef.id,
        userId,
        amount: Number(amount),
        ...rest,
        date: admin.firestore.FieldValue.serverTimestamp(),
        type: 'out'
    };

    await db.runTransaction(async (t) => {
        t.set(transactionRef, newTransaction);
        if (planId) {
            const planRef = db.collection('users').doc(userId).collection('plans').doc(planId);
            t.update(planRef, { spent: admin.firestore.FieldValue.increment(newTransaction.amount) });
        }
    });
    return { message: 'Transaction added successfully!' };
};

const getTransactionsForUser = async (userId, limit = 20) => {
    const db = ensureDb();
    const snapshot = await db.collection('users').doc(userId).collection('transactions').orderBy('date', 'desc').limit(limit).get();
    return snapshot.docs.map(doc => doc.data());
};

const addFundsToWallet = async (userId, amount, reference) => {
    const db = ensureDb();
    await db.runTransaction(async (t) => {
        const userRef = db.collection('users').doc(userId);
        const transactionRef = db.collection('users').doc(userId).collection('transactions').doc();
        
        t.update(userRef, { walletBalance: admin.firestore.FieldValue.increment(amount) });
        t.set(transactionRef, { 
            id: transactionRef.id,
            userId,
            amount,
            description: `Wallet funding via Paystack`,
            category: 'Income',
            type: 'in',
            reference,
            date: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
};

module.exports = {
    initializeFirebaseAdmin,
    createUserProfile,
    savePlan,
    getPlansForUser,
    updatePlanStatus,
    deletePlan,
    addTransaction,
    getTransactionsForUser,
    addFundsToWallet
};
