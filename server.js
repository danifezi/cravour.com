
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { GoogleGenAI, Type } = require('@google/genai');
const admin = require('firebase-admin');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// --- INITIALIZATIONS ---

// Firebase Admin SDK
let db;
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
  console.warn(`Firebase Admin SDK failed to initialize. Server will use in-memory data persistence. Error: ${error.message}`);
  db = null; // Set db to null on failure
}

// Gemini AI & Secrets
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || 'cravour-super-secret-key-for-dev-and-testing';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// --- MOCK IN-MEMORY DATABASE (Fallback if Firebase fails) ---
const mockDb = {
    users: new Map(),
    plans: new Map(),
    transactions: new Map()
};
const defaultUserId = `user_mock_1`;
// NOTE: Password is not hashed. This is for demonstration only.
mockDb.users.set(defaultUserId, { id: defaultUserId, email: 'test@example.com', password: 'password123', walletBalance: 150000 });

// --- MIDDLEWARE ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// --- API SCHEMAS ---
const { shoppingPlanSchema, adCopySchema, dashboardReportSchema, transactionCategorySchema } = require('./src/config/constants');

// --- AUTHENTICATION ROUTES ---
app.post('/api/register', async (req, res) => {
    const { email, password, ...profileData } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    // In a real app, hash the password here before saving
    const userId = `user_${Date.now()}`;
    const newUser = { id: userId, email, password, walletBalance: 0, createdAt: new Date(), ...profileData };
    
    if (db) {
        // Do not store plaintext password in Firestore
        const { password: _, ...userToStore } = newUser;
        await db.collection('users').doc(userId).set({ ...userToStore, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        // For the purpose of this project, we still need the mock user for password check
        mockDb.users.set(userId, newUser);
    } else {
        mockDb.users.set(userId, newUser);
    }
    
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({ token, user: { id: userId, email } });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    let user = null;
    let userId = null;

    if (db) {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            // In a real app, you'd retrieve a password hash to compare.
            // For this project, we check the mockDb for the unhashed password.
            // THIS IS NOT SECURE and is for demonstration only.
            const mockUser = Array.from(mockDb.users.values()).find(u => u.email === email);
            if(mockUser && mockUser.password === password) {
                 user = { ...doc.data(), id: doc.id };
                 userId = doc.id;
            }
        }
    } else {
        user = Array.from(mockDb.users.values()).find(u => u.email === email && u.password === password);
        if (user) userId = user.id;
    }

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: userId, email: user.email } });
});

// --- AI & DATA ROUTES ---

app.post('/api/plans/demo', async (req, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'A description is required.' });
    try {
        const prompt = `You are an expert Nigerian financial planner. A user wants a shopping plan for: "${description}".
        Analyze the request to identify items, budget, and location.
        Generate a detailed financial plan using current, realistic Nigerian market prices (in NGN).
        Your response MUST be a single, valid JSON object that strictly adheres to the provided schema.
        - budgetAnalysis: Compare user's budget to your estimated cost. Provide a sharp, one-sentence summary and 2-3 actionable optimization tips.
        - priceAnalysis: For each item, comment on price stability and provide a specific saving tip.
        - recommendedMerchants: Suggest 3 real-sounding local merchants in the user's area.`;

        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: shoppingPlanSchema } });
        res.status(200).json(JSON.parse(response.text));
    } catch (error) {
        console.error("AI Demo Plan Error:", error);
        res.status(500).json({ error: "Failed to generate AI plan." });
    }
});

app.post('/api/plans', authenticateToken, async (req, res) => {
    const { description } = req.body;
    const { id: userId } = req.user;
    try {
        const prompt = `You are an expert Nigerian financial planner. A user wants a shopping plan for: "${description}".
        Analyze the request to identify items, budget, and location.
        Generate a detailed financial plan using current, realistic Nigerian market prices (in NGN).
        Your response MUST be a single, valid JSON object that strictly adheres to the provided schema.
        - budgetAnalysis: Compare user's budget to your estimated cost. Provide a sharp, one-sentence summary and 2-3 actionable optimization tips.
        - priceAnalysis: For each item, comment on price stability and provide a specific saving tip.
        - recommendedMerchants: Suggest 3 real-sounding local merchants in the user's area.`;
        
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: shoppingPlanSchema } });
        const planData = JSON.parse(response.text);

        const planId = `plan_${Date.now()}`;
        const newPlan = { id: planId, userId, description, status: 'active', createdAt: new Date(), spent: 0, ...planData };

        if (db) {
            await db.collection('users').doc(userId).collection('plans').doc(planId).set({ ...newPlan, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        } else {
            mockDb.plans.set(planId, newPlan);
        }
        res.status(201).json(newPlan);
    } catch (error) {
        console.error("AI Plan Generation Error:", error);
        res.status(500).json({ error: "Failed to generate AI plan." });
    }
});

app.get('/api/plans', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    let userPlans = [];
    if (db) {
        const plansSnapshot = await db.collection('users').doc(userId).collection('plans').orderBy('createdAt', 'desc').get();
        plansSnapshot.forEach(doc => userPlans.push({ id: doc.id, ...doc.data() }));
    } else {
        userPlans = Array.from(mockDb.plans.values()).filter(p => p.userId === userId);
    }
    res.json(userPlans);
});

app.patch('/api/plans/:planId', authenticateToken, async (req, res) => {
    const { planId } = req.params;
    const { status } = req.body;
    const { id: userId } = req.user;

    if (db) {
        const planRef = db.collection('users').doc(userId).collection('plans').doc(planId);
        const doc = await planRef.get();
        if (!doc.exists) return res.status(404).json({ error: "Plan not found" });
        await planRef.update({ status });
        res.json({ id: planId, status });
    } else {
        const plan = mockDb.plans.get(planId);
        if (plan && plan.userId === userId) {
            plan.status = status;
            res.json(plan);
        } else {
            res.status(404).json({ error: "Plan not found or unauthorized" });
        }
    }
});

app.delete('/api/plans/:planId', authenticateToken, async (req, res) => {
    const { planId } = req.params;
    const { id: userId } = req.user;

    if (db) {
        const planRef = db.collection('users').doc(userId).collection('plans').doc(planId);
        const doc = await planRef.get();
        if (!doc.exists) return res.status(404).json({ error: "Plan not found" });
        await planRef.delete();
        res.status(204).send();
    } else {
        const plan = mockDb.plans.get(planId);
        if (plan && plan.userId === userId) {
            mockDb.plans.delete(planId);
            res.status(204).send();
        } else {
            res.status(404).json({ error: "Plan not found or unauthorized" });
        }
    }
});

app.post('/api/addTransaction', authenticateToken, async (req, res) => {
    const { planId, amount, ...restOfBody } = req.body;
    const { id: userId } = req.user;
    const transactionId = `txn_${Date.now()}`;
    const newTransaction = { id: transactionId, userId, amount: Number(amount), ...restOfBody, date: new Date().toISOString(), type: 'out' };

    if (db) {
        try {
            await db.runTransaction(async (t) => {
                const transactionRef = db.collection('users').doc(userId).collection('transactions').doc(transactionId);
                t.set(transactionRef, { ...newTransaction, date: admin.firestore.FieldValue.serverTimestamp() });
                if (planId) {
                    const planRef = db.collection('users').doc(userId).collection('plans').doc(planId);
                    t.update(planRef, { spent: admin.firestore.FieldValue.increment(newTransaction.amount) });
                }
            });
            res.status(201).json({ message: 'Transaction added successfully!' });
        } catch (error) {
            console.error("Add Transaction Failed:", error);
            res.status(500).json({ error: "Failed to add transaction due to a server error." });
        }
    } else {
        mockDb.transactions.set(newTransaction.id, newTransaction);
        if (planId) {
            const plan = mockDb.plans.get(planId);
            if (plan && plan.userId === userId) {
                plan.spent = (plan.spent || 0) + newTransaction.amount;
            }
        }
        res.status(201).json({ message: 'Transaction added successfully! (Mock)' });
    }
});

app.post('/api/generateDashboard', authenticateToken, async (req, res) => {
    const { id: userId } = req.user;
    let userTransactionsString = "No transactions found for this user yet.";

    if (db) {
        const transactionsSnapshot = await db.collection('users').doc(userId).collection('transactions').orderBy('date', 'desc').limit(20).get();
        if (!transactionsSnapshot.empty) {
            userTransactionsString = transactionsSnapshot.docs.map(doc => {
                const t = doc.data();
                const type = t.type === 'in' ? 'Incoming' : 'Outgoing';
                return `- ${type}: ₦${t.amount} for '${t.description}' (${t.category}) on ${new Date(t.date.toDate()).toDateString()}`;
            }).join('\n');
        }
    } else {
        userTransactionsString = `- Outgoing: ₦5000 for 'Uber to VI' (Transport) on Mon Jun 24 2024\n- Incoming: ₦50000 for 'Wallet funding' (Income) on Sun Jun 23 2024`;
    }

    try {
        const prompt = `You are a financial analyst AI. Generate a dashboard report in Nigerian Naira (NGN) for a user with these recent transactions:
        ${userTransactionsString}.
        Your response MUST be a valid JSON object.
        1.  Calculate 'totalSpent' (sum of outgoing transactions only).
        2.  Calculate 'avgDailySpend' (assume a 30-day month).
        3.  Identify the 'topCategory' by spending.
        4.  For 'financialHealth', provide a 'score' (0-100), a one-sentence 'summary', and 1-2 concise, actionable 'recommendations'.
        5.  The 'transactions' array in your response should only include the 5 most recent transactions from the provided data.
        Adhere strictly to the response schema.`;

        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: dashboardReportSchema } });
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error("AI Dashboard Error:", error);
        res.status(500).json({ error: "Failed to generate AI dashboard." });
    }
});

app.post('/api/categorizeTransaction', authenticateToken, async (req, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    try {
        const prompt = `From the transaction description "${description}", pick the single best category from this list: Groceries, Transport, Utilities, Food & Dining, Health, Education, Rent, Bills, Airtime & Data, Savings, Miscellaneous. Your response must be a JSON object with a single key "category".`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: transactionCategorySchema } });
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error("AI Categorization Error:", error);
        res.status(500).json({ error: "Failed to categorize transaction." });
    }
});

app.post('/api/generateAdCopy', authenticateToken, async (req, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Ad description is required.' });

    try {
        const prompt = `You are a professional marketing copywriter for the Nigerian market. Use this description: "${description}" to generate exciting and professional ad copy. Return a JSON object with a 'headline', 'body', 'callToAction', and an array of 5-7 relevant 'hashtags'.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: adCopySchema } });
        res.json(JSON.parse(response.text));
    } catch (error) {
        console.error("AI Ad Copy Error:", error);
        res.status(500).json({ error: "Failed to generate ad copy." });
    }
});

app.post('/api/verifyPayment', authenticateToken, async (req, res) => {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ error: 'Reference is required.'});
    if (!PAYSTACK_SECRET_KEY) return res.status(500).json({ error: "Payment verification service is not configured." });
    
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        });

        const { status, data } = response.data;
        if (status && data.status === 'success') {
            const amount = data.amount / 100;
            const userId = req.user.id;
            const transactionId = `txn_${Date.now()}`;
            
            const transactionData = {
                id: transactionId, userId, amount,
                description: `Wallet funding via Paystack`,
                category: 'Income', type: 'in', reference: data.reference,
                date: new Date().toISOString(),
            };

            if (db) {
                await db.runTransaction(async (t) => {
                    const userRef = db.collection('users').doc(userId);
                    const transactionRef = db.collection('users').doc(userId).collection('transactions').doc(transactionId);
                    t.update(userRef, { walletBalance: admin.firestore.FieldValue.increment(amount) });
                    t.set(transactionRef, { ...transactionData, date: admin.firestore.FieldValue.serverTimestamp() });
                });
            } else {
                const user = mockDb.users.get(userId);
                if (user) user.walletBalance = (user.walletBalance || 0) + amount;
                mockDb.transactions.set(transactionId, transactionData);
            }
            
            res.json({ status: 'success', message: `Payment of ₦${amount.toLocaleString()} was successful!` });
        } else {
            res.status(400).json({ status: 'error', message: data.message || "Payment verification failed." });
        }
    } catch (error) {
        console.error("Paystack verification error:", error.response?.data || error.message);
        res.status(500).json({ error: "An error occurred during payment verification." });
    }
});

// Serve the main index.html for any other routes to support client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cravour backend server running on http://localhost:${PORT}`));
