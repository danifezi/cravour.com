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

/**
 * Saves a new email to the waitlist collection.
 * Uses the email as the document ID to prevent duplicates.
 * @param {string} email The email to save.
 */
const saveToWaitlist = async (email) => {
    const db = ensureDb();
    const waitlistRef = db.collection('waitlist').doc(email);
    
    await waitlistRef.set({
        email: email,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { message: 'Successfully joined the waitlist.' };
};


module.exports = {
    initializeFirebaseAdmin,
    saveToWaitlist
};
