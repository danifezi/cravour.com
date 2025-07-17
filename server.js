const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/genai');
const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- INITIALIZATIONS ---

// Firebase Admin SDK
let db;
try {
  const serviceAccount = require('./serviceAccountKey.json'); 
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.warn("Firebase Admin SDK not found or failed to initialize. Server will use in-memory data persistence.");
}

// Gemini AI & Secrets
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");
const JWT_SECRET = process.env.JWT_SECRET || 'cravour-super-secret-key-for-dev-and-testing';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// --- MOCK IN-MEMORY DATABASE (Fallback) ---
const mockDb = {
    users: new Map(),
    plans: new Map(),
    transactions: new Map()
};
// Add a default user for easy testing
mockDb.users.set('user_1', { id: 'user_1', email: 'test@example.com', password: 'password123', walletBalance: 150000 });

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

// --- AUTHENTICATION ROUTES ---
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    if (Array.from(mockDb.users.values()).find(u => u.email === email)) {
        return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const userId = `user_${Date.now()}`;
    const newUser = { id: userId, email, password, walletBalance: 0, ...req.body };
    
    mockDb.users.set(userId, newUser);
    if (db) await db.collection('users').doc(userId).set(newUser);
    
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({ token, user: { id: userId, email } });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = Array.from(mockDb.users.values()).find(u => u.email === email);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, email: user.email } });
});

// --- FINANCIAL PLAN CRUD ROUTES ---
app.post('/api/plans', authenticateToken, async (req, res) => {
    const { description } = req.body;
    const userId = req.user.id;
    try {
        const prompt = `Generate a detailed financial shopping plan for a user in Nigeria based on this request: "${description}". Assume a default budget of 75000 NGN if not specified. Your response must be a strict JSON object with fields: "budgetAnalysis" (with userBudget, estimatedCost, difference, summary), "budgetItems" (with itemName, quantity, estimatedPrice), and "recommendedMerchants" (with name, address, deals, verified).`;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        let planText = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
        const planData = JSON.parse(planText);

        const newPlan = {
            id: `plan_${Date.now()}`,
            userId,
            description,
            status: 'active',
            createdAt: new Date(),
            ...planData,
        };

        mockDb.plans.set(newPlan.id, newPlan);
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate AI plan." });
    }
});

app.get('/api/plans', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const userPlans = Array.from(mockDb.plans.values()).filter(p => p.userId === userId);
    res.json(userPlans);
});

app.patch('/api/plans/:planId', authenticateToken, (req, res) => {
    const { planId } = req.params;
    const { status } = req.body;
    const plan = mockDb.plans.get(planId);

    if (plan && plan.userId === req.user.id) {
        plan.status = status;
        res.json(plan);
    } else {
        res.status(404).json({ error: "Plan not found or unauthorized" });
    }
});

app.delete('/api/plans/:planId', authenticateToken, (req, res) => {
    const { planId } = req.params;
    const plan = mockDb.plans.get(planId);
    if (plan && plan.userId === req.user.id) {
        mockDb.plans.delete(planId);
        res.status(204).send();
    } else {
        res.status(404).json({ error: "Plan not found or unauthorized" });
    }
});


// --- OTHER AI & DATA ROUTES ---
app.post('/api/generateDashboard', authenticateToken, (req, res) => {
    res.json({
        totalSpent: 74350,
        avgDailySpend: 2478,
        topCategory: 'Groceries',
        financialHealthScore: 7.8,
        healthRecommendations: ["Your spending is well-managed. Consider allocating 5% more to a savings plan this month."],
        spendingByCategory: [
            { category: 'Groceries', amount: 35000 },
            { category: 'Transport', amount: 18500 },
            { category: 'Utilities', amount: 12000 },
            { category: 'Flex', amount: 8850 }
        ],
        transactions: [
             { date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Wallet Top-up', category: 'Income', amount: 100000, type: 'in' },
             { date: new Date(Date.now() - 86400000).toISOString(), description: 'Rice & Oil from Shoprite', category: 'Groceries', amount: 15000, type: 'out' },
             { date: new Date().toISOString(), description: 'Uber to VI', category: 'Transport', amount: 4500, type: 'out' },
        ]
    });
});

app.post('/api/addTransaction', authenticateToken, (req, res) => {
    const newTransaction = { id: `txn_${Date.now()}`, userId: req.user.id, ...req.body };
    mockDb.transactions.set(newTransaction.id, newTransaction);
    res.status(201).json({ message: 'Transaction added successfully!' });
});

app.post('/api/categorizeTransaction', authenticateToken, (req, res) => {
    const { description } = req.body;
    const categories = ['Groceries', 'Transport', 'Utilities', 'Food & Dining', 'Health'];
    // Simple mock logic
    if (description.toLowerCase().includes('rice')) {
        res.json({ category: 'Groceries' });
    } else if (description.toLowerCase().includes('uber')) {
        res.json({ category: 'Transport' });
    } else {
        res.json({ category: 'Miscellaneous' });
    }
});

app.post('/api/verifyPayment', authenticateToken, (req, res) => {
    const { reference } = req.body;
    if(!reference) return res.status(400).json({ error: 'Reference is required.'});
    
    const user = mockDb.users.get(req.user.id);
    if(user) {
        user.walletBalance += 10000; // Mock adding 10k
    }
    
    res.json({ status: 'success', message: 'Payment of ₦10,000 Verified!' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cravour backend server running on http://localhost:${PORT}`));
