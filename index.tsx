

import DOMPurify from 'https://esm.sh/dompurify';
import { marked } from "https://esm.sh/marked@12.0.2";
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Chart } from "chart.js/auto";

// --- STATE & TYPES ---

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string; // ISO String
    type: 'income' | 'expense';
    category?: string;
}

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RecurringTransaction {
    id:string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    frequency: Frequency;
    nextDueDate: string; // ISO String for the date part only (YYYY-MM-DD)
}

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isStreaming?: boolean;
}

interface FinancialHealth {
    score: number;
    summary: string;
    isLoading: boolean;
}

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
}

interface Priority {
    id: string;
    text: string;
    completed: boolean;
}

interface TransactionFilters {
    text: string;
    type: 'all' | 'income' | 'expense';
    category: string;
}

interface AIBudgetSuggestion {
    category: string;
    suggestedAmount: number;
    justification: string;
}

type Budgets = { [category: string]: number };
type DashboardPeriod = 7 | 30 | 90;
type DashboardTab = 'transactions' | 'goals' | 'budgets' | 'recurring';

const getInitialState = () => ({
    transactions: [],
    recurringTransactions: [],
    currentView: 'landing' as 'landing' | 'dashboard' | 'co-pilot' | 'settings',
    chatHistory: [],
    isCoPilotLoading: false,
    hasOnboarded: false,
    financialHealth: null as FinancialHealth | null,
    budgets: {} as Budgets,
    goals: [] as Goal[],
    priorities: [] as Priority[],
    isPrioritiesLoading: false,
    aiQuickInsights: [] as string[],
    isQuickInsightsLoading: false,
    transactionFilters: {
        text: '',
        type: 'all' as 'all' | 'income' | 'expense',
        category: 'all',
    },
    showTransactionFilters: false,
    userName: 'Guest',
    dashboardPeriod: 30 as DashboardPeriod,
    dashboardTab: 'transactions' as DashboardTab,
    isSidebarOpen: true, // Start open on desktop by default
    aiBudgetSuggestions: {
        isLoading: false,
        suggestions: null as AIBudgetSuggestion[] | null,
        error: null as string | null,
    },
    isAppLoading: false,
});

const transactionCategories: { expense: string[]; income: string[] } = {
    expense: ['Food & Drinks', 'Shopping', 'Transport', 'Utilities', 'Entertainment', 'Housing', 'Health', 'Education', 'Savings', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
};

let state = getInitialState();

// --- ICONS & UTILITIES ---

const icons = {
    logo: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 14.1363 19.2234 16.0853 17.9535 17.5501L15.3262 14.9228C15.7503 14.1118 16 13.1114 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1114 16 14.1118 15.7503 14.9228 15.3262L17.5501 17.9535C16.0853 19.2234 14.1363 20 12 20Z" clip-rule="evenodd"/></svg>`,
    add: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5z" /></svg>`,
    upArrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.99 9.17a.75.75 0 01-1.06-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 01-1.06 1.06L10.75 5.612V16.25A.75.75 0 0110 17z" clip-rule="evenodd"></path></svg>`,
    downArrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.26-3.568a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.94 11.88a.75.75 0 111.06-1.06l3.25 3.57V3.75A.75.75 0 0110 3z" clip-rule="evenodd"></path></svg>`,
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12 .89-1.335A11.954 11.954 0 0 1 12 6.118a11.954 11.954 0 0 1 8.86 4.547L21.75 12M2.25 12a8.955 8.955 0 0 0 3.324 5.992 8.955 8.955 0 0 0 12.852 0A8.955 8.955 0 0 0 21.75 12M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" /></svg>`,
    coPilot: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>`,
    spinner: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.3"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438 1.001s.145.761.438 1.001l1.003.827c.424.35.534.954.26 1.431l-1.296-2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.127c-.331.183-.581.495-.644.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-1.001s-.145-.761-.438-1.001l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37.49l1.217.456c.355.133.75.072 1.076.124.072-.044.146-.087.22-.127.332-.183.582-.495.644-.87l.213-1.281ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`,
    editPencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.437c.84.263 1.68.444 2.535.537V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6.198c.855-.093 1.695-.274 2.535-.537a.75.75 0 1 0 .53-1.437c-.785-.248-1.57-.391-2.365-.468V3.75A2.75 2.75 0 0 0 11.25 1h-2.5zM10 4c.84 0 1.5.66 1.5 1.5v1.5h-3V5.5C8.5 4.66 9.16 4 10 4zM8.5 8.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5zm3 0a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5z" clip-rule="evenodd" /></svg>`,
    alertWarning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`,
    transactions: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>`,
    dataClear: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25m2.25-2.25-2.25-2.25m2.25 2.25 2.25-2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621 .504 1.125 1.125 1.125Z" /></svg>`,
    hamburger: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-3.75 5.25h-9.75" /></svg>`,
    recurring: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-14.844-3.182L2.985 6.356v4.992m0 0h4.992m-4.993 0l3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" /></svg>`,
    goal: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.5l6.75-6.75m0 0l6.75 6.75M9.75 6.75v10.5" /></svg>`,
    budget: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25-2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" /></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12Zm0 0h7.5" /></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>`
};

let dashboardChart: Chart | null = null;
let trendChart: Chart | null = null;
let lastFocusedElement: HTMLElement | null = null;
let lastRecurringCheckTimestamp: number | null = null;

const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : null;

const getEl = (id: string): HTMLElement | null => document.getElementById(id);

const generateId = (prefix: string = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const formatCurrency = (amount: number, currency = 'NGN'): string => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

const sortTransactions = () => {
    state.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const calculateSummary = (periodDays: number) => {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const relevantTransactions = state.transactions.filter(t => new Date(t.date) >= periodStart);

    let totalIncome = 0;
    let totalExpenses = 0;
    const expenseByCategory: { [key: string]: number } = {};

    for (const t of relevantTransactions) {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
            const category = t.category || 'Uncategorized';
            expenseByCategory[category] = (expenseByCategory[category] || 0) + t.amount;
        }
    }

    const netBalance = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, netBalance, expenseByCategory, periodDays };
};

const showToast = (message: string, type: 'success' | 'error' | 'info' | 'ai' = 'info', duration = 3000) => {
    const container = getEl('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const iconHtml = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.53a.75.75 0 00-1.06 1.06L9.44 9H7.25a.75.75 0 000 1.5h2.94l-1.06 1.06a.75.75 0 101.06 1.06L12.47 10l-2.53-2.53a.75.75 0 00-1 0z" clip-rule="evenodd" /></svg>`,
        ai: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM6.25 7.5a2 2 0 104 0 2 2 0 00-4 0zM13.75 7.5a2 2 0 104 0 2 2 0 00-4 0zM10 13.75a2 2 0 100-4 2 2 0 000 4zM4.341 12.355a2 2 0 112.828-2.828 2 2 0 01-2.828 2.828zM15.659 12.355a2 2 0 112.828-2.828 2 2 0 01-2.828 2.828z" /></svg>`,
    };

    toast.innerHTML = `
        <div class="toast-icon">${iconHtml[type]}</div>
        <p>${DOMPurify.sanitize(message)}</p>
        <button class="toast-close" data-action="close-toast" aria-label="Close">&times;</button>
    `;
    container.appendChild(toast);

    const timer = setTimeout(() => { toast.remove(); }, duration);
    toast.querySelector('[data-action="close-toast"]')?.addEventListener('click', () => {
        clearTimeout(timer);
        toast.remove();
    });
};


// --- AI & API ---

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const initAI = () => {
    try {
        if (API_KEY) {
            ai = new GoogleGenAI({ apiKey: API_KEY });
        } else {
            console.warn("API_KEY environment variable not set. AI features will be disabled.");
        }
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
    }
}

const getAIPriorities = async () => {
    if (!ai) {
        showToast("AI features are not available.", "error");
        return;
    }
    if (state.transactions.length < 3) {
        return;
    }
    state.isPrioritiesLoading = true;
    renderApp();

    try {
        const summary = calculateSummary(30);
        const systemInstruction = `You are Cravour, an expert financial assistant for users in Nigeria. Your goal is to provide a short, actionable weekly checklist (2-3 items) to help the user stay on top of their finances.
        Analyze the user's financial data: recent spending, upcoming recurring bills, budget performance, and goal progress.
        Generate a list of the 2-3 most important priorities for them to focus on this week. Each priority should be a single, concise sentence.
        Use Markdown for emphasis where appropriate (e.g., **High spending**).
        The currency is Nigerian Naira (NGN).
        You MUST respond ONLY with a JSON object containing a "priorities" key, which is an array of strings. Do not add any other text.
        Example response: {"priorities": ["**Budget Alert:** You've used 85% of your 'Shopping' budget with 2 weeks left.", "Your 'Netflix' subscription payment of N5,500 is due in 3 days.", "You're close to your 'New Phone' goal! Try to save an extra N10,000 this week."]}
        `;

        const prompt = `User's financial context:
        - Username: ${state.userName}
        - Today's Date: ${new Date().toISOString().split('T')[0]}
        - Last 30 Days Summary: Total Income ${summary.totalIncome}, Total Expenses ${summary.totalExpenses}.
        - Budgets: ${JSON.stringify(state.budgets)}
        - Expenses by Category (last 30 days): ${JSON.stringify(summary.expenseByCategory)}
        - Goals: ${JSON.stringify(state.goals)}
        - Upcoming Recurring Transactions: ${JSON.stringify(state.recurringTransactions)}

        Generate the weekly priority checklist based on this data.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priorities: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['priorities']
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const { priorities } = JSON.parse(jsonStr) as { priorities: string[] };

        state.priorities = (priorities || []).map((text: string) => ({
            id: generateId('prio'),
            text,
            completed: false,
        }));

    } catch (error) {
        console.error("Error fetching AI priorities:", error);
        showToast("Sorry, I couldn't generate your weekly priorities right now.", "error");
        state.priorities = [];
    } finally {
        state.isPrioritiesLoading = false;
        // Let the calling function re-render
    }
}


const getFinancialHealthScore = async () => {
    if (!ai || state.transactions.length === 0) {
        state.financialHealth = null;
        return;
    }

    state.financialHealth = { score: 0, summary: '', isLoading: true };
    renderApp();

    try {
        const summary = calculateSummary(state.dashboardPeriod);
        const systemInstruction = `You are a financial health analyzer for a user in Nigeria. Based on the user's financial summary, provide a score from 1 to 100 and a concise, one-sentence summary explaining the score. The currency is Nigerian Naira (NGN).
        - A score of 80-100 is excellent (positive income-to-expense ratio, healthy savings).
        - A score of 60-79 is good (positive ratio, but room for improvement).
        - A score of 40-59 is fair (expenses are close to or slightly exceed income).
        - A score below 40 is poor (expenses significantly exceed income).
        You must respond in the specified JSON format.`;

        const prompt = `Here is my financial summary for the last ${summary.periodDays} days:
        Total Income: ${summary.totalIncome} NGN
        Total Expenses: ${summary.totalExpenses} NGN
        Net Balance: ${summary.netBalance} NGN
        Expense Breakdown by Category: ${JSON.stringify(summary.expenseByCategory)}

        Please analyze this and return my financial health score.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: 'The financial health score from 1 to 100.' },
                        summary: { type: Type.STRING, description: 'A one-sentence summary explaining the score.' }
                    },
                    required: ['score', 'summary']
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const healthData = JSON.parse(jsonStr);
        
        state.financialHealth = { ...healthData, isLoading: false };

    } catch (error) {
        console.error("Error fetching financial health score:", error);
        state.financialHealth = {
            score: 0,
            summary: "Could not calculate score at this time.",
            isLoading: false
        };
        showToast("AI couldn't analyze your financial health score.", "error");
    }
};

const handleCoPilotSubmit = async (promptText?: string) => {
    if (!ai) {
        showToast("AI features are not available. Please configure your API key.", 'error');
        return;
    }
    if (state.isCoPilotLoading) {
        showToast("AI is already thinking. Please wait.", 'info');
        return;
    }

    const input = getEl('chat-input') as HTMLInputElement;
    const userMessage = promptText || input?.value.trim();
    if (!userMessage) return;

    if (input) {
        input.value = '';
        input.style.height = 'auto';
    }

    state.isCoPilotLoading = true;
    const userMsg = { id: generateId('msg-user'), role: 'user' as const, text: userMessage };
    state.chatHistory.push(userMsg);
    
    const modelMsg = { id: generateId('msg-model'), role: 'model' as const, text: '', isStreaming: true };
    state.chatHistory.push(modelMsg);

    renderApp();
    const messagesContainer = getEl('chat-messages');
    messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });

    let finalResponseText = '';

    try {
        if (!chat) {
            chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are Cravour, an expert financial assistant for users in Nigeria. You are friendly, insightful, and provide advice tailored to the Nigerian context. The user will provide their financial data in JSON format. Use this data to answer questions accurately. If data is empty, state that. Keep answers concise. Use Markdown. Currency is Nigerian Naira (NGN).`,
                }
            });
        }
        const transactionContext = state.transactions.length > 0
            ? `Here is my recent transaction history (last 30 transactions):\n${JSON.stringify(state.transactions.slice(0, 30))}`
            : "I don't have any transaction data yet.";
        const budgetContext = Object.keys(state.budgets).length > 0 ? `\n\nHere are my monthly budgets:\n${JSON.stringify(state.budgets)}` : "";
        const goalContext = state.goals.length > 0 ? `\n\nHere are my financial goals:\n${JSON.stringify(state.goals)}` : "";
        const finalPrompt = transactionContext + budgetContext + goalContext + `\n\nMy question is: ${userMessage}`;
        
        const result = await chat.sendMessageStream({ message: finalPrompt });

        for await (const chunk of result) {
            finalResponseText += chunk.text;
        }

    } catch (error) {
        console.error("AI chat error:", error);
        finalResponseText = 'Sorry, I encountered an error. Please try again.';
        showToast('Sorry, I encountered an error.', 'error');
    } finally {
        state.isCoPilotLoading = false;
        const currentModelMessage = state.chatHistory.find(m => m.id === modelMsg.id);
        if (currentModelMessage) {
            currentModelMessage.text = finalResponseText;
            currentModelMessage.isStreaming = false;
        }
        renderApp();
        saveState();
        messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
    }
};

const getAIQuickInsights = async () => {
    if (!ai || state.transactions.length < 3) {
        state.aiQuickInsights = ["Give me a detailed breakdown of my spending this month.", "How am I doing against my budgets?", "Find 2 opportunities for me to save money."];
        return;
    }
    if (state.isQuickInsightsLoading || state.aiQuickInsights.length > 3) return;

    state.isQuickInsightsLoading = true;
    renderApp();

    try {
        const summary = calculateSummary(30);
        const systemInstruction = `You are a financial analyst. Based on the user's financial data, generate 3-4 concise, one-sentence questions or prompts that the user might want to ask. These should be insightful and encourage exploration of their finances. For example: 'Where did most of my money go last month?', 'Am I on track with my savings goals?', 'Compare my spending in Food this month vs. last month.' Respond only with a JSON object containing an "insights" key, which is an array of strings. Do not add any other text.`;
        
        const prompt = `User's financial context:
        - Last 30 Days Summary: Total Income ${summary.totalIncome}, Total Expenses ${summary.totalExpenses}.
        - Budgets: ${JSON.stringify(state.budgets)}
        - Expenses by Category (last 30 days): ${JSON.stringify(summary.expenseByCategory)}
        - Goals: ${JSON.stringify(state.goals)}
        
        Generate suggested prompts based on this data.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        insights: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['insights']
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const { insights } = JSON.parse(jsonStr) as { insights: string[] };
        state.aiQuickInsights = insights || [];

    } catch (error) {
        console.error("Error getting AI quick insights:", error);
        state.aiQuickInsights = ["Give me a detailed breakdown of my spending this month.", "How am I doing against my budgets?", "Find 2 opportunities for me to save money."]; // Fallback
    } finally {
        state.isQuickInsightsLoading = false;
        renderApp();
    }
};

const getAIBudgetSuggestions = async () => {
    if (!ai) {
        state.aiBudgetSuggestions.error = "AI features are not available.";
        renderAIBudgetModal();
        return;
    }
    
    state.aiBudgetSuggestions = { isLoading: true, suggestions: null, error: null };
    renderAIBudgetModal();

    try {
        const now = new Date();
        const periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const expenseTransactions = state.transactions.filter(t => t.type === 'expense' && new Date(t.date) >= periodStart);
        
        if (expenseTransactions.length < 5) {
            throw new Error("Not enough spending data to generate a budget. Please track more expenses first.");
        }

        const spendingByCategory: { [key: string]: number } = {};
        expenseTransactions.forEach(t => {
            const category = t.category || 'Other';
            spendingByCategory[category] = (spendingByCategory[category] || 0) + t.amount;
        });

        const monthlyAverageSpending: { [key: string]: number } = {};
        for(const category in spendingByCategory) {
            monthlyAverageSpending[category] = Math.round(spendingByCategory[category] / 3);
        }

        const systemInstruction = `You are a pragmatic financial advisor in Nigeria. Your task is to suggest a sensible monthly budget for a user based on their average monthly spending over the last 90 days.
        - Analyze the provided spending data.
        - For each category, suggest a monthly budget amount. The suggestion should be a realistic, slightly challenging target based on their average spend.
        - Round your suggested amounts to the nearest sensible number (e.g., 500 or 1000 NGN).
        - Provide a brief, one-sentence justification for each suggestion.
        - The currency is Nigerian Naira (NGN).
        - You MUST respond ONLY in the specified JSON format.`;
        
        const prompt = `Here is my average monthly spending by category for the last 90 days:\n${JSON.stringify(monthlyAverageSpending)}\n\nPlease provide budget suggestions.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            description: "An array of budget suggestions.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING, description: "The spending category." },
                                    suggestedAmount: { type: Type.NUMBER, description: "The suggested monthly budget amount." },
                                    justification: { type: Type.STRING, description: "A brief reason for the suggestion." }
                                },
                                required: ["category", "suggestedAmount", "justification"]
                            }
                        }
                    },
                    required: ["suggestions"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const { suggestions } = JSON.parse(jsonStr) as { suggestions: AIBudgetSuggestion[] };

        const validCategories = new Set(transactionCategories.expense);
        state.aiBudgetSuggestions.suggestions = (suggestions || []).filter((s: AIBudgetSuggestion) => validCategories.has(s.category));
        
    } catch (error: any) {
        console.error("Error getting AI budget suggestions:", error);
        state.aiBudgetSuggestions.error = error.message || "Sorry, I couldn't generate budget suggestions. Please try again later.";
    } finally {
        state.aiBudgetSuggestions.isLoading = false;
        renderAIBudgetModal();
    }
};

// --- UI RENDERING (MODALS) ---

const handleModalFocus = (e: KeyboardEvent) => {
    const modal = document.querySelector('.modal-overlay');
    if (!modal || e.key !== 'Tab') return;

    const focusableElements = Array.from(
        modal.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
        )
    ).filter(
        (el: any) => el.offsetParent !== null
    ) as HTMLElement[];

    if (focusableElements.length === 0) {
        e.preventDefault();
        return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { 
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else { 
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
};

const closeModal = (modalId?: string) => {
    const modal = modalId ? getEl(modalId) : document.querySelector('.modal-overlay');
    if (!modal) return;

    modal.remove();
    if (!document.querySelector('.modal-overlay')) {
        document.body.classList.remove('modal-open');
    }
    lastFocusedElement?.focus();
    lastFocusedElement = null;
};

const createModalShell = (modalId: string, title: string, content: string, wide = false, customClasses = '') => {
    const app = getEl('app-shell');
    if (!app) return;

    lastFocusedElement = document.activeElement as HTMLElement;

    getEl(modalId)?.remove();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const actionsNode = tempDiv.querySelector('.form-actions, .modal-actions-container');
    const actionsContent = actionsNode ? actionsNode.innerHTML : '';
    if (actionsNode) actionsNode.remove();
    const bodyContent = tempDiv.innerHTML;

    const modalElement = document.createElement('div');
    modalElement.id = modalId;
    modalElement.className = 'modal-overlay';
    
    if (modalId !== 'onboarding-modal') {
        modalElement.setAttribute('data-action', 'close-modal');
    }


    const uniqueTitleId = `modal-title-${modalId}`;
    modalElement.innerHTML = `
        <div class="modal-content ${wide ? 'wide' : ''} ${customClasses}" role="dialog" aria-modal="true" aria-labelledby="${uniqueTitleId}">
            <h2 id="${uniqueTitleId}" class="modal-title">${DOMPurify.sanitize(title)}</h2>
            ${modalId !== 'onboarding-modal' ? `<button class="modal-close-btn" aria-label="Close" data-action="close-modal">&times;</button>`: ''}
            <div class="modal-body">${bodyContent}</div>
            ${actionsContent ? `<div class="modal-actions">${actionsContent}</div>` : ''}
        </div>
    `;
    
    modalElement.querySelector('.modal-content')?.addEventListener('click', e => e.stopPropagation());
    document.body.classList.add('modal-open');
    app.appendChild(modalElement);
    
    modalElement.addEventListener('keydown', handleModalFocus);

    const elementToFocus = modalElement.querySelector<HTMLElement>('[autofocus]') || modalElement.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    setTimeout(() => elementToFocus?.focus(), 50);
};

const renderOnboardingModal = () => {
    const title = 'Welcome to Cravour!';
    const content = `
        <p>Let's get you set up. What should we call you?</p>
        <form id="onboarding-form" data-action="complete-onboarding">
            <div class="form-group">
                <label for="onboarding-name" class="visually-hidden">Your Name</label>
                <input type="text" id="onboarding-name" name="name" class="input-field large-text" placeholder="Enter your name" required autofocus>
            </div>
            <div class="modal-actions-container">
                <button type="submit" class="btn btn-primary btn-lg">Let's Go!</button>
            </div>
        </form>
    `;
    createModalShell('onboarding-modal', title, content, false, 'onboarding-modal-custom');
};


const renderTransactionModal = (transaction: Partial<Transaction> | null = null) => {
    const isEditing = transaction && transaction.id;
    const title = isEditing ? 'Edit Transaction' : 'Add Transaction';
    const t = {
        id: transaction?.id || generateId('txn'),
        type: transaction?.type || 'expense',
        description: transaction?.description || '',
        amount: transaction?.amount || '',
        date: transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
        category: transaction?.category || '',
    };
    const categories = transactionCategories[t.type];
    
    const content = `
        <form id="transaction-form" data-id="${t.id}" data-action="save-transaction">
            <div class="form-group">
                <label>Type</label>
                <div class="form-radio-group">
                    <input type="radio" id="type-expense" name="type" value="expense" ${t.type === 'expense' ? 'checked' : ''} data-action="change-transaction-type">
                    <label for="type-expense">Expense</label>
                    <input type="radio" id="type-income" name="type" value="income" ${t.type === 'income' ? 'checked' : ''} data-action="change-transaction-type">
                    <label for="type-income">Income</label>
                </div>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <input type="text" id="description" name="description" class="input-field" value="${DOMPurify.sanitize(t.description)}" required autofocus>
            </div>
            <div class="form-group">
                <label for="amount">Amount (NGN)</label>
                <input type="number" id="amount" name="amount" class="input-field" value="${t.amount}" placeholder="0.00" required step="0.01">
            </div>
            <div class="form-group">
                <label for="category">Category</label>
                <select id="category" name="category" class="input-field">
                    <option value="">Select a category</option>
                    ${categories.map(cat => `<option value="${cat}" ${t.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" name="date" class="input-field" value="${t.date}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Save Transaction'}</button>
            </div>
        </form>
    `;

    createModalShell('transaction-modal', title, content);
};

const renderGoalModal = (goal: Goal | null = null) => {
    const isEditing = goal && goal.id;
    const title = isEditing ? 'Edit Goal' : 'Add New Goal';
    const g = {
        id: goal?.id || generateId('goal'),
        name: goal?.name || '',
        targetAmount: goal?.targetAmount || '',
        savedAmount: goal?.savedAmount || 0
    };

    const content = `
        <form id="goal-form" data-id="${g.id}" data-action="save-goal">
            <div class="form-group">
                <label for="goal-name">Goal Name</label>
                <input type="text" id="goal-name" name="name" class="input-field" value="${DOMPurify.sanitize(g.name)}" placeholder="e.g., Vacation Fund" required autofocus>
            </div>
            <div class="form-group">
                <label for="goal-target">Target Amount (NGN)</label>
                <input type="number" id="goal-target" name="targetAmount" class="input-field" value="${g.targetAmount}" placeholder="50000" required>
            </div>
            <div class="form-group">
                <label for="goal-saved">Already Saved (NGN)</label>
                <input type="number" id="goal-saved" name="savedAmount" class="input-field" value="${g.savedAmount}" placeholder="0">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Add Goal'}</button>
            </div>
        </form>
    `;
    createModalShell('goal-modal', title, content);
};

const renderRecurringTransactionModal = (recurring: Partial<RecurringTransaction> | null = null) => {
    const isEditing = recurring && recurring.id;
    const title = isEditing ? 'Edit Recurring' : 'Add Recurring';
    
    const r = {
        id: recurring?.id || generateId('rec'),
        description: recurring?.description || '',
        amount: recurring?.amount || '',
        type: recurring?.type || 'expense',
        category: recurring?.category || '',
        frequency: recurring?.frequency || 'monthly',
        nextDueDate: recurring?.nextDueDate || new Date().toISOString().split('T')[0],
    };

    const categories = transactionCategories[r.type];
    const frequencies: Frequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

    const content = `
        <form id="recurring-form" data-id="${r.id}" data-action="save-recurring">
            <div class="form-group">
                <label>Type</label>
                <div class="form-radio-group">
                    <input type="radio" id="recurring-type-expense" name="type" value="expense" ${r.type === 'expense' ? 'checked' : ''} data-action="change-recurring-type">
                    <label for="recurring-type-expense">Expense</label>
                    <input type="radio" id="recurring-type-income" name="type" value="income" ${r.type === 'income' ? 'checked' : ''} data-action="change-recurring-type">
                    <label for="recurring-type-income">Income</label>
                </div>
            </div>
            <div class="form-group">
                <label for="recurring-description">Description</label>
                <input type="text" id="recurring-description" name="description" class="input-field" value="${DOMPurify.sanitize(r.description)}" required autofocus>
            </div>
            <div class="form-group">
                <label for="recurring-amount">Amount (NGN)</label>
                <input type="number" id="recurring-amount" name="amount" class="input-field" value="${r.amount}" required>
            </div>
            <div class="form-group">
                <label for="recurring-category">Category</label>
                <select id="recurring-category" name="category" class="input-field" required>
                    <option value="">Select a category</option>
                    ${categories.map(cat => `<option value="${cat}" ${r.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="recurring-frequency">Frequency</label>
                <select id="recurring-frequency" name="frequency" class="input-field" required>
                    ${frequencies.map(f => `<option value="${f}" ${r.frequency === f ? 'selected' : ''}>${f.charAt(0).toUpperCase() + f.slice(1)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="recurring-next-due-date">Next Due Date</label>
                <input type="date" id="recurring-next-due-date" name="nextDueDate" class="input-field" value="${r.nextDueDate}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Add Recurring'}</button>
            </div>
        </form>
    `;

    createModalShell('recurring-modal', title, content);
};

const renderBudgetModal = () => {
    const title = 'Manage Budgets';
    const expenseCategories = transactionCategories.expense;

    const budgetInputs = expenseCategories.map(cat => {
        const budgetAmount = state.budgets[cat] || '';
        return `
            <div class="form-group budget-input-group">
                <label for="budget-${cat}">${cat}</label>
                <input type="number" id="budget-${cat}" name="${cat}" class="input-field" value="${budgetAmount}" placeholder="e.g., 20000">
            </div>
        `;
    }).join('');

    const content = `
        <p>Set monthly spending limits for your categories. Leave blank for no budget.</p>
        <div class="ai-budget-suggestion-container">
            <button class="btn btn-primary-outline btn-sm" data-action="open-ai-budget-modal">
                <span class="btn-icon">${icons.coPilot}</span>
                <span class="btn-text">Generate with AI</span>
            </button>
        </div>
        <form id="budget-form" data-action="save-budgets">
            <div class="budget-form-grid">
                ${budgetInputs}
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Budgets</button>
            </div>
        </form>
        <style>
            .ai-budget-suggestion-container { text-align: center; margin-bottom: 1.5rem; }
            .budget-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
            .budget-input-group { margin-bottom: 0; }
        </style>
    `;

    createModalShell('budget-modal', title, content, true);
};

const renderAIBudgetModal = () => {
    const { isLoading, suggestions, error } = state.aiBudgetSuggestions;

    let modalContent;
    if (isLoading) {
        modalContent = `
            <div class="empty-state">
                <div class="spinner">${icons.spinner}</div>
                <h3 class="modal-title">Analyzing Your Spending...</h3>
                <p>Cravour is looking at your past expenses to create a smart budget just for you. This might take a moment.</p>
            </div>
        `;
    } else if (error) {
        modalContent = `
            <div class="empty-state">
                <div class="empty-state-icon" style="color: var(--color-error)">${icons.alertWarning}</div>
                <h3 class="modal-title">Oops! Something went wrong.</h3>
                <p>${DOMPurify.sanitize(error)}</p>
                <div class="modal-actions-container">
                     <button class="btn btn-secondary" data-action="close-ai-budget-modal">Close</button>
                     <button class="btn btn-primary" data-action="retry-ai-budget">Try Again</button>
                </div>
            </div>
        `;
    } else if (suggestions) {
         modalContent = `
            <p>Here's a starting budget based on your spending. You can adjust these values before applying them.</p>
            <form id="ai-budget-form" data-action="apply-ai-budget">
                <div class="ai-suggestion-list">
                ${suggestions.map(s => `
                    <div class="ai-suggestion-item">
                        <div class="suggestion-info">
                            <label for="ai-budget-${s.category}" class="suggestion-category">${s.category}</label>
                            <span class="suggestion-justification">${s.justification}</span>
                        </div>
                        <input type="number" id="ai-budget-${s.category}" name="${s.category}" class="input-field suggestion-amount" value="${s.suggestedAmount}" required>
                    </div>
                `).join('')}
                </div>
                <div class="modal-actions-container">
                    <button type="button" class="btn btn-secondary" data-action="close-ai-budget-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Apply Suggestions</button>
                </div>
            </form>
        `;
    } else {
        // Should not happen, but a fallback.
        modalContent = `<p>Click "Generate" to get started.</p>`;
    }

    const title = 'AI Budget Suggestions';
    const content = `<div id="ai-budget-modal-content">${modalContent}</div>`;
    
    createModalShell('ai-budget-modal', title, content, false, 'ai-budget-suggestion-modal');
};


const renderConfirmDeleteModal = (itemId: string, itemType: string, itemName: string) => {
    const title = `Delete ${itemType}?`;
    const content = `
        <p>Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone.</p>
        <p><strong>${DOMPurify.sanitize(itemName)}</strong></p>
        <div class="form-actions">
            <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
            <button class="btn btn-danger" data-action="confirm-delete" data-id="${itemId}" data-type="${itemType}" autofocus>Delete</button>
        </div>
    `;
    createModalShell('confirm-delete-modal', title, content);
};

const renderConfirmClearDataModal = () => {
    const title = 'Clear All App Data?';
    const content = `
        <p>Are you sure you want to permanently delete all your data, including transactions, goals, and settings? <strong>This action cannot be undone.</strong></p>
        <div class="form-actions">
            <button class="btn btn-secondary" data-action="close-modal">Cancel</button>
            <button class="btn btn-danger" data-action="confirm-clear-data" autofocus>Yes, Delete Everything</button>
        </div>
    `;
    createModalShell('confirm-clear-data-modal', title, content);
};


// --- UI RENDERING (COMPONENTS) ---

const renderSidebar = () => {
    const isDashboard = state.currentView === 'dashboard';
    const isCoPilot = state.currentView === 'co-pilot';
    const isSettings = state.currentView === 'settings';

    return `
        <div id="sidebar-overlay" data-action="toggle-sidebar"></div>
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <a href="#" class="logo" data-action="set-view" data-view="dashboard">
                    ${icons.logo}
                    <span class="logo-text">Cravour</span>
                </a>
                <button class="sidebar-close-btn icon-btn" data-action="toggle-sidebar" aria-label="Close menu">
                    &times;
                </button>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item ${isDashboard ? 'active' : ''}" data-action="set-view" data-view="dashboard">
                    ${icons.dashboard} <span class="link-text">Dashboard</span>
                </a>
                <a href="#" class="nav-item ${isCoPilot ? 'active' : ''}" data-action="set-view" data-view="co-pilot">
                    ${icons.coPilot} <span class="link-text">Co-Pilot</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <a href="#" class="nav-item ${isSettings ? 'active' : ''}" data-action="set-view" data-view="settings">
                    ${icons.settings} <span class="link-text">Settings</span>
                </a>
                <div class="user-profile">
                    <div class="user-avatar" aria-hidden="true">${state.userName.charAt(0).toUpperCase()}</div>
                    <div class="user-info">
                        <div class="user-name">${DOMPurify.sanitize(state.userName)}</div>
                    </div>
                </div>
            </div>
        </aside>
    `;
};


const renderHeader = () => {
    const titles = {
        'dashboard': 'Dashboard',
        'co-pilot': 'AI Co-Pilot',
        'settings': 'Settings'
    };
    const title = titles[state.currentView as keyof typeof titles] || 'Cravour';

    const getActions = () => {
        if (state.currentView === 'dashboard') {
            return `<button class="btn btn-primary" data-action="add-transaction">
                        ${icons.add} <span class="btn-text">Add Transaction</span>
                    </button>`;
        }
        return '';
    };

    return `
        <header class="main-header">
            <div class="header-left">
                <button class="sidebar-toggle-btn icon-btn" data-action="toggle-sidebar" aria-label="Toggle menu">
                    ${icons.hamburger}
                </button>
                <h1 class="header-title">${title}</h1>
            </div>
            <div class="header-right">
                ${getActions()}
            </div>
        </header>
    `;
};

const renderHealthCard = () => {
    if (state.transactions.length === 0) {
        return `
         <div class="card health-card">
            <div class="card-header"><h3>Financial Health</h3></div>
            <div class="card-content">
                <div class="empty-state small">
                     <div class="empty-state-icon">${icons.transactions}</div>
                     <h4>No Transactions Yet</h4>
                     <p>Add some income or expenses to see your financial health analysis.</p>
                </div>
            </div>
         </div>
        `;
    }

    if (!state.financialHealth || state.financialHealth.isLoading) {
        return `
            <div class="card health-card">
                <div class="card-header"><h3>Financial Health</h3></div>
                <div class="card-content">
                     <div class="health-skeleton">
                        <div class="skeleton health-score-gauge-skeleton"></div>
                        <div style="flex-grow:1;">
                            <div class="skeleton skeleton-title"></div>
                            <div class="skeleton skeleton-text" style="width: 90%"></div>
                            <div class="skeleton skeleton-text" style="width: 70%; margin-top: 0.5rem"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const { score, summary } = state.financialHealth;
    const scoreColorClass = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';
    const circumference = 2 * Math.PI * 44; // r = 44
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return `
        <div class="card health-card">
            <div class="card-header"><h3>Financial Health</h3></div>
            <div class="card-content">
                 <div class="health-score-container">
                    <div class="health-gauge-wrapper">
                         <svg class="health-gauge-svg" viewBox="0 0 100 100">
                             <circle class="gauge-track" cx="50" cy="50" r="44"></circle>
                             <circle class="gauge-value ${scoreColorClass}"
                                 cx="50" cy="50" r="44"
                                 stroke-dasharray="${circumference}"
                                 stroke-dashoffset="${strokeDashoffset}"
                             ></circle>
                         </svg>
                         <div class="health-score-text">
                             <span class="health-score-value">${score}</span>
                         </div>
                    </div>
                    <div class="health-summary">
                        <p class="health-summary-text">${DOMPurify.sanitize(summary)}</p>
                    </div>
                 </div>
            </div>
        </div>
    `;
};


const renderPrioritiesCard = () => {
    let content;

    if (state.isPrioritiesLoading) {
        content = `
            <div class="card-content">
                ${Array(3).fill(0).map(() => `
                    <div style="display: flex; gap: 1rem; align-items: center; padding: 0.75rem 0;">
                        <div class="skeleton" style="width: 20px; height: 20px; border-radius: 50%;"></div>
                        <div class="skeleton skeleton-text" style="flex-grow: 1;"></div>
                    </div>
                `).join('')}
            </div>`;
    } else if (state.priorities.length > 0) {
        content = `
            <ul class="priorities-list card-content">
                ${state.priorities.map(p => `
                    <li class="priority-item ${p.completed ? 'completed' : ''}" data-id="${p.id}">
                        <label class="priority-checkbox-label">
                            <input type="checkbox" data-action="toggle-priority" ${p.completed ? 'checked' : ''} aria-labelledby="priority-text-${p.id}">
                            <span class="custom-checkbox"></span>
                        </label>
                        <div class="priority-text" id="priority-text-${p.id}">${marked.parse(p.text, { breaks: true, gfm: true })}</div>
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        content = `
            <div class="card-content">
                <div class="empty-state small">
                    <div class="empty-state-icon">${icons.coPilot}</div>
                    <h4>Your AI priorities will appear here.</h4>
                    <p>Add a few transactions and your weekly checklist will show up to help you stay on track.</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="card">
            <div class="card-header">
                <h3>This Week's Priorities</h3>
                <button class="icon-btn" data-action="refresh-priorities" aria-label="Refresh priorities">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:20px;height:20px"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201-4.42 5.5 5.5 0 0 1 10.893 2.13.75.75 0 0 1-1.48.243A4 4 0 0 0 6.64 6.623a4 4 0 0 0 6.667 5.23.75.75 0 1 1 .506-1.428ZM9.25 4.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Zm3.593 2.343a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg>
                </button>
            </div>
            ${content}
        </div>
    `;
};


const renderSummaryCards = () => {
    const summary = calculateSummary(state.dashboardPeriod);
    
    return `
        <div class="dashboard-summary">
            <div class="summary-period-selector">
                <button class="period-btn ${state.dashboardPeriod === 7 ? 'active' : ''}" data-period="7">7D</button>
                <button class="period-btn ${state.dashboardPeriod === 30 ? 'active' : ''}" data-period="30">30D</button>
                <button class="period-btn ${state.dashboardPeriod === 90 ? 'active' : ''}" data-period="90">90D</button>
            </div>
            <div class="summary-cards">
                <div class="card summary-card">
                    <div class="card-header">
                        <h4 class="card-title">Total Income</h4>
                        <div class="card-icon income">${icons.upArrow}</div>
                    </div>
                    <p class="summary-value income">${formatCurrency(summary.totalIncome)}</p>
                </div>
                <div class="card summary-card">
                     <div class="card-header">
                        <h4 class="card-title">Total Expenses</h4>
                        <div class="card-icon expense">${icons.downArrow}</div>
                    </div>
                    <p class="summary-value expense">${formatCurrency(summary.totalExpenses)}</p>
                </div>
                <div class="card summary-card">
                    <div class="card-header">
                        <h4 class="card-title">Net Balance</h4>
                    </div>
                    <p class="summary-value">${formatCurrency(summary.netBalance)}</p>
                </div>
            </div>
        </div>
    `;
};


const renderTransactionList = () => {
    const { text, type, category } = state.transactionFilters;
    const filteredTransactions = state.transactions.filter(t => {
        const textMatch = !text || t.description.toLowerCase().includes(text.toLowerCase());
        const typeMatch = type === 'all' || t.type === type;
        const categoryMatch = category === 'all' || t.category === category;
        return textMatch && typeMatch && categoryMatch;
    });

    if (state.transactions.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icons.transactions}</div>
                <h3>Start Your Financial Journey</h3>
                <p>Track your first transaction to see your finances come to life.</p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary" data-action="add-transaction">
                        ${icons.add} Add Transaction
                    </button>
                </div>
            </div>
        `;
    }

    if (filteredTransactions.length === 0) {
        return `<div class="empty-state small"><h4>No matching transactions found.</h4><p>Try adjusting your filters.</p></div>`;
    }

    const groupedByDate = filteredTransactions.reduce((acc, t) => {
        const dateKey = new Date(t.date).toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(t);
        return acc;
    }, {} as Record<string, Transaction[]>);

    return Object.entries(groupedByDate).map(([dateStr, transactions]) => `
        <h4 class="transaction-group-date">${formatDate(dateStr, { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
        <div class="entity-list">
            ${transactions.map(t => renderEntityItem(t)).join('')}
        </div>
    `).join('');
};


const renderGoalList = () => {
    if (state.goals.length === 0) {
        return `
            <div class="empty-state">
                 <div class="empty-state-icon">${icons.goal}</div>
                <h3>Set a Goal, Reach a Dream</h3>
                <p>Saving for a new gadget, a vacation, or a down payment? Set your goals here.</p>
                <div class="empty-state-actions">
                     <button class="btn btn-primary" data-action="add-goal">
                        ${icons.add} Add Goal
                    </button>
                </div>
            </div>
        `;
    }
    const goalItems = state.goals.map(goal => {
        const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
        return `
            <div class="goal-item">
                <div class="goal-item-header">
                    <span class="goal-name">${DOMPurify.sanitize(goal.name)}</span>
                    <div class="goal-actions">
                        <button class="icon-btn" data-action="edit-goal" data-id="${goal.id}" aria-label="Edit Goal">${icons.editPencil}</button>
                        <button class="icon-btn delete-btn" data-action="delete-item" data-id="${goal.id}" data-type="Goal" data-name="${goal.name}" aria-label="Delete Goal">${icons.trash}</button>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill safe" style="width: ${progress}%" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="goal-item-footer">
                    <span>${formatCurrency(goal.savedAmount)} of ${formatCurrency(goal.targetAmount)}</span>
                    <span>${Math.round(progress)}%</span>
                </div>
            </div>
        `;
    }).join('');
    return `<div class="goal-list">${goalItems}</div>`;
};

const renderBudgetList = () => {
    const activeBudgets = Object.entries(state.budgets).filter(([, amount]) => amount > 0);

    if (activeBudgets.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icons.budget}</div>
                <h3>Take Control with Budgets</h3>
                <p>Set spending limits for categories to manage your money more effectively.</p>
                 <div class="empty-state-actions">
                     <button class="btn btn-primary" data-action="manage-budgets">
                        ${icons.add} Set Budgets
                    </button>
                </div>
            </div>
        `;
    }
    
    const summary = calculateSummary(30);

    const budgetItems = activeBudgets.map(([category, budgetAmount]) => {
        const spentAmount = summary.expenseByCategory[category] || 0;
        const progress = Math.min((spentAmount / budgetAmount) * 100, 100);
        let progressClass = 'safe';
        if (progress > 90) progressClass = 'danger';
        else if (progress > 70) progressClass = 'warning';

        return `
            <div class="budget-item">
                <div class="budget-item-header">
                    <span class="budget-category">${category}</span>
                    <span class="budget-amount">${formatCurrency(spentAmount)} / ${formatCurrency(budgetAmount)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill ${progressClass}" style="width: ${progress}%" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        `;
    }).join('');

    return `<div class="budget-list">${budgetItems}</div>`;
};

const renderRecurringList = () => {
     if (state.recurringTransactions.length === 0) {
        return `
            <div class="empty-state">
                 <div class="empty-state-icon">${icons.recurring}</div>
                <h3>Automate Your Finances</h3>
                <p>Add recurring bills or income like salaries, subscriptions, or rent to track them easily.</p>
                <div class="empty-state-actions">
                     <button class="btn btn-primary" data-action="add-recurring">
                        ${icons.add} Add Recurring
                    </button>
                </div>
            </div>
        `;
    }
    return `<div class="entity-list">${state.recurringTransactions.map(t => renderEntityItem(t, true)).join('')}</div>`;
}

const renderEntityItem = (item: Transaction | RecurringTransaction, isRecurring = false) => {
    const isIncome = item.type === 'income';
    
    let infoLine = `<span class="entity-date">${formatDate(isRecurring ? (item as RecurringTransaction).nextDueDate : (item as Transaction).date)}</span>`;
    if (item.category) {
        infoLine += ` • <span class="entity-category">${DOMPurify.sanitize(item.category)}</span>`;
    }
     if (isRecurring) {
        infoLine += ` • <span class="entity-frequency">${(item as RecurringTransaction).frequency}</span>`;
    }

    return `
        <div class="entity-item">
            <div class="entity-icon ${isIncome ? 'income-icon' : 'expense-icon'}">
                ${isIncome ? icons.upArrow : icons.downArrow}
            </div>
            <div class="entity-details">
                <div class="entity-name">${DOMPurify.sanitize(item.description)}</div>
                <div class="entity-info">${infoLine}</div>
            </div>
            <div class="entity-amount-actions">
                 <span class="entity-amount ${isIncome ? 'income' : 'expense'}">${formatCurrency(item.amount)}</span>
                <div class="entity-actions">
                    <button class="icon-btn" data-action="${isRecurring ? 'edit-recurring' : 'edit-transaction'}" data-id="${item.id}" aria-label="Edit item">${icons.editPencil}</button>
                    <button class="icon-btn delete-btn" data-action="delete-item" data-id="${item.id}" data-type="${isRecurring ? 'Recurring' : 'Transaction'}" data-name="${item.description}" aria-label="Delete item">${icons.trash}</button>
                </div>
            </div>
        </div>
    `;
};


// --- UI RENDERING (VIEWS) ---

const renderLandingPage = () => {
    const appShell = getEl('app-shell');
    if (!appShell) return;

    appShell.innerHTML = `
        <div class="landing-page">
            <header class="landing-header">
                <div class="logo">
                     ${icons.logo} Cravour
                </div>
                <button class="btn btn-primary" data-action="launch-app">Launch App</button>
            </header>

            <main>
                <section class="hero">
                    <div class="hero-content">
                        <h1 class="hero-title">Your Smart Budget Assistant for Nigeria.</h1>
                        <p class="hero-subtitle">Make every Naira count. Cravour helps you track spending, set goals, and get AI-powered advice to master your finances.</p>
                        <button class="btn btn-primary btn-lg" data-action="launch-app">Get Started for Free</button>
                    </div>
                    <div class="hero-image">
                        <div class="mockup-app-window">
                            <div class="mockup-header-bar">
                                <div class="mockup-dot"></div><div class="mockup-dot"></div><div class="mockup-dot"></div>
                            </div>
                            <div class="mockup-content-area">
                                <div class="mockup-sidebar-col">
                                    <div class="mockup-logo-placeholder"></div>
                                    <div class="mockup-nav-item-placeholder active"></div>
                                    <div class="mockup-nav-item-placeholder"></div>
                                </div>
                                <div class="mockup-main-col">
                                    <div class="mockup-title-bar"></div>
                                    <div class="mockup-stat-cards">
                                        <div class="mockup-stat"></div>
                                        <div class="mockup-stat"></div>
                                        <div class="mockup-stat"></div>
                                    </div>
                                    <div class="mockup-main-chart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="features">
                    <h2 class="section-title">Features Built for You</h2>
                    <p class="section-subtitle">Everything you need to take control of your money, designed with the Nigerian context in mind.</p>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">${icons.transactions}</div>
                            <h3 class="feature-title">Effortless Tracking</h3>
                            <p class="feature-description">Log income and expenses in seconds. Categorize your spending to see where your money really goes.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">${icons.coPilot}</div>
                            <h3 class="feature-title">AI Co-Pilot</h3>
                            <p class="feature-description">Your personal financial genius. Ask questions, get insights, and receive personalized advice on your spending.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">${icons.budget}</div>
                            <h3 class="feature-title">Smart Budgeting</h3>
                            <p class="feature-description">Set monthly budgets and track your progress. Get AI suggestions based on your actual spending habits.</p>
                        </div>
                    </div>
                </section>
                
                <section class="testimonials">
                    <div class="testimonial-card">
                        <blockquote class="testimonial-text">"Finally, a budget app that understands Nigeria! The AI Co-Pilot is a game-changer for my personal finance."</blockquote>
                        <cite class="testimonial-author">&mdash; Tunde, Lagos</cite>
                    </div>
                </section>

                <section class="cta">
                     <h2 class="section-title">Ready to Own Your Finances?</h2>
                    <p class="section-subtitle">Stop guessing, start planning. Cravour is 100% free to use. Launch the app and take the first step towards financial freedom today.</p>
                    <button class="btn btn-primary btn-lg" data-action="launch-app">Launch Cravour Now</button>
                </section>
            </main>
            <footer class="landing-footer">
                <p>&copy; ${new Date().getFullYear()} Cravour. All rights reserved.</p>
            </footer>
        </div>
    `;
};


const renderDashboardView = () => `
    <div class="dashboard-layout">
        <main class="dashboard-main">
            ${renderSummaryCards()}
            <div class="card chart-card">
                <div class="card-header">
                    <h3>Spending Trend</h3>
                </div>
                <div class="chart-body">
                    <div id="trend-chart-container"><canvas id="trend-chart"></canvas></div>
                </div>
            </div>
             <div class="card management-hub">
                <nav class="hub-nav">
                    <button class="hub-nav-item ${state.dashboardTab === 'transactions' ? 'active' : ''}" data-tab="transactions">Transactions</button>
                    <button class="hub-nav-item ${state.dashboardTab === 'recurring' ? 'active' : ''}" data-tab="recurring">Recurring</button>
                    <button class="hub-nav-item ${state.dashboardTab === 'budgets' ? 'active' : ''}" data-tab="budgets">Budgets</button>
                    <button class="hub-nav-item ${state.dashboardTab === 'goals' ? 'active' : ''}" data-tab="goals">Goals</button>
                </nav>
                <div class="hub-content" id="hub-content-area">
                    <!-- Tab content will be rendered here by renderDashboardTabs -->
                </div>
            </div>
        </main>
        <aside class="dashboard-sidebar">
            ${renderHealthCard()}
            ${renderPrioritiesCard()}
        </aside>
    </div>
`;


const renderDashboardTabs = () => {
    const container = getEl('hub-content-area');
    if (!container) return;

    let content = '';
    let headerActions = '';
    const tab = state.dashboardTab;
    
    // Header actions
    if (tab === 'transactions') {
        const categories = transactionCategories.expense.concat(transactionCategories.income);
        headerActions = `
            <button class="btn btn-secondary btn-sm" data-action="toggle-filters">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="btn-icon"><path fill-rule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.59L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" clip-rule="evenodd" /></svg>
                <span class="btn-text">Filter</span>
            </button>
             <div id="transaction-filter-bar" class="${state.showTransactionFilters ? 'visible' : ''}">
                <input type="text" id="filter-text" class="input-field" placeholder="Search..." value="${state.transactionFilters.text}">
                <select id="filter-type" class="input-field">
                    <option value="all">All Types</option>
                    <option value="income" ${state.transactionFilters.type === 'income' ? 'selected' : ''}>Income</option>
                    <option value="expense" ${state.transactionFilters.type === 'expense' ? 'selected' : ''}>Expense</option>
                </select>
                <select id="filter-category" class="input-field">
                    <option value="all">All Categories</option>
                    ${categories.map(c => `<option value="${c}" ${state.transactionFilters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (tab === 'recurring') {
        headerActions = `<button class="btn btn-secondary btn-sm" data-action="add-recurring">${icons.add} Add Recurring</button>`;
    } else if (tab === 'goals') {
        headerActions = `<button class="btn btn-secondary btn-sm" data-action="add-goal">${icons.add} Add Goal</button>`;
    } else if (tab === 'budgets') {
        headerActions = `<button class="btn btn-secondary btn-sm" data-action="manage-budgets">${icons.editPencil} Manage Budgets</button>`;
    }

    // Tab content
    if (tab === 'transactions') {
        content = renderTransactionList();
    } else if (tab === 'recurring') {
        content = renderRecurringList();
    } else if (tab === 'goals') {
        content = renderGoalList();
    } else if (tab === 'budgets') {
        content = renderBudgetList();
    }
    
    container.innerHTML = `
        <div class="hub-tab-header">${headerActions}</div>
        <div id="hub-tab-content">${content}</div>
    `;

    // Add listeners for filters
    if (tab === 'transactions') {
        getEl('filter-text')?.addEventListener('input', (e) => handleFilterChange(e, 'text'));
        getEl('filter-type')?.addEventListener('change', (e) => handleFilterChange(e, 'type'));
        getEl('filter-category')?.addEventListener('change', (e) => handleFilterChange(e, 'category'));
    }
};


const renderCoPilotView = () => {
    let messageContent;

    if (state.chatHistory.length === 0) {
        messageContent = `
            <div class="copilot-welcome">
                <div class="copilot-logo-icon">${icons.coPilot}</div>
                <h2>Hello, ${state.userName}!</h2>
                <p>I'm Cravour, your personal finance Co-Pilot. I can help you understand your spending, find savings, and reach your goals.
                <br>What's on your mind?</p>
                <div class="suggestion-chips">
                    ${(state.isQuickInsightsLoading ? Array(3).fill(0).map(() => `<div class="skeleton skeleton-chip"></div>`) : state.aiQuickInsights.map(q => `<button class="chip" data-action="use-suggestion" data-prompt="${DOMPurify.sanitize(q)}">${DOMPurify.sanitize(q)}</button>`)).join('')}
                </div>
            </div>
        `;
    } else {
        messageContent = state.chatHistory.map(msg => {
            const isModelStreaming = msg.role === 'model' && msg.isStreaming;
            const sanitizedHtml = isModelStreaming ? '' : marked.parse(msg.text);

            return `
                <div class="message-bubble-wrapper role-${msg.role}">
                    <div class="message-bubble">
                        ${isModelStreaming 
                            ? `<div class="thinking-indicator"><div class="spinner">${icons.spinner}</div> Thinking...</div>` 
                            : `<div class="message-content">${sanitizedHtml}</div>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    return `
    <div class="copilot-container">
        <div class="chat-interface">
            <div class="chat-messages" id="chat-messages">
                ${messageContent}
            </div>
            <div class="chat-input-area">
                <div class="chat-input-wrapper">
                    <textarea id="chat-input" placeholder="Ask about your finances..." rows="1"></textarea>
                    <button id="chat-submit-btn" class="btn btn-primary" data-action="submit-chat">
                        ${state.isCoPilotLoading ? `<div class="spinner-sm">${icons.spinner}</div>` : icons.send}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
};


const renderSettingsView = () => `
    <div class="settings-grid">
        <div class="card">
            <div class="card-header">
                <h3>Data Management</h3>
            </div>
            <div class="card-content">
                <div class="settings-action-item">
                    <div>
                        <h4>Export Data</h4>
                        <p>Download all your transaction data as a CSV file for your records.</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-secondary" data-action="export-data">
                            ${icons.download} <span class="btn-text">Export</span>
                        </button>
                    </div>
                </div>
                <div class="settings-action-item">
                    <div>
                        <h4>Clear All Data</h4>
                        <p>Permanently delete all transactions, goals, and settings from the app. <strong>This cannot be undone.</strong></p>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-danger" data-action="clear-data">
                             ${icons.dataClear} <span class="btn-text">Clear Data</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
             <div class="card-header"><h3>About</h3></div>
             <div class="card-content">
                <p><strong>Cravour: AI Budget Assistant</strong></p>
                <p>Version 1.0.0</p>
                <p>Designed to help you manage your finances with the power of AI.</p>
             </div>
        </div>
    </div>
`;

const renderOfflineIndicator = (isOffline: boolean) => {
    const container = getEl('offline-indicator-container');
    if (!container) return;
    if (isOffline) {
        container.innerHTML = `<div class="offline-banner" role="status">You are currently offline. Some features may be limited.</div>`;
    } else {
        container.innerHTML = '';
    }
}

// --- MAIN RENDER & APP LOGIC ---

const renderApp = () => {
    const appShell = getEl('app-shell');
    if (!appShell) return;

    if (state.currentView === 'landing') {
        renderLandingPage();
        return;
    }

    const views: { [key: string]: () => string } = {
        'dashboard': renderDashboardView,
        'co-pilot': renderCoPilotView,
        'settings': renderSettingsView
    };

    const currentViewContent = views[state.currentView]?.() || '<div>View not found</div>';
    
    appShell.className = state.isSidebarOpen ? 'sidebar-open' : '';
    appShell.innerHTML = `
        ${renderSidebar()}
        <div class="main-content-wrapper" id="main-content-wrapper">
            ${renderHeader()}
            <main class="main-view" id="main-view">
                ${currentViewContent}
            </main>
        </div>
    `;

    // Post-render updates for dynamic content
    if (state.currentView === 'dashboard') {
        renderDashboardTabs();
        updateCharts();
    } else if (state.currentView === 'co-pilot') {
        const chatInput = getEl('chat-input') as HTMLTextAreaElement;
        if(chatInput) {
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = `${chatInput.scrollHeight}px`;
            });
            chatInput.addEventListener('keydown', (e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    getEl('chat-submit-btn')?.click();
                }
            });
        }
    }
};


// --- CHART LOGIC ---
const updateCharts = () => {
    const period = state.dashboardPeriod;
    const expenseData = calculateExpenseTrend(period);

    if (trendChart) trendChart.destroy();
    const trendCtx = (getEl('trend-chart') as HTMLCanvasElement)?.getContext('2d');
    if (trendCtx) {
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: expenseData.labels,
                datasets: [{
                    label: `Expenses - Last ${period} Days`,
                    data: expenseData.data,
                    borderColor: 'rgba(var(--color-primary-rgb), 1)',
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: 'var(--color-text-muted)' }, grid: { color: 'var(--color-border)' } },
                    y: { ticks: { color: 'var(--color-text-muted)' }, grid: { color: 'var(--color-border)' } }
                }
            }
        });
    }
};

const calculateExpenseTrend = (periodDays: number) => {
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();
    
    // Group transactions by day
    const dailyExpenses: { [key: string]: number } = {};
    for (const t of state.transactions) {
        if (t.type === 'expense') {
            const date = new Date(t.date);
            const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
            if (diffDays <= periodDays) {
                const dayKey = date.toISOString().split('T')[0];
                dailyExpenses[dayKey] = (dailyExpenses[dayKey] || 0) + t.amount;
            }
        }
    }

    // Create labels and data for the last `periodDays`
    for (let i = periodDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayKey = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(dailyExpenses[dayKey] || 0);
    }
    
    return { labels, data };
};


// --- STATE MANAGEMENT & PERSISTENCE ---
const saveState = () => {
    try {
        const appState = {
            transactions: state.transactions,
            recurringTransactions: state.recurringTransactions,
            hasOnboarded: state.hasOnboarded,
            budgets: state.budgets,
            goals: state.goals,
            priorities: state.priorities.map(p => ({...p, completed: false })), // Don't save completed state
            userName: state.userName,
            lastRecurringCheckTimestamp: lastRecurringCheckTimestamp
        };
        localStorage.setItem('cravourAppState', JSON.stringify(appState));
    } catch (e) {
        console.error("Could not save state to localStorage", e);
    }
};

const loadState = () => {
    state.isAppLoading = true;
    renderApp();
    
    try {
        const savedStateJSON = localStorage.getItem('cravourAppState');
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            state.transactions = savedState.transactions || [];
            state.recurringTransactions = savedState.recurringTransactions || [];
            state.hasOnboarded = savedState.hasOnboarded || false;
            state.budgets = savedState.budgets || {};
            state.goals = savedState.goals || [];
            state.priorities = savedState.priorities || [];
            state.userName = savedState.userName || 'Guest';
            lastRecurringCheckTimestamp = savedState.lastRecurringCheckTimestamp || null;
            sortTransactions();
        }
    } catch (e) {
        console.error("Could not load state from localStorage", e);
        // If state is corrupted, clear it.
        localStorage.removeItem('cravourAppState');
    } finally {
        state.isAppLoading = false;
        if (!state.hasOnboarded) {
            state.currentView = 'landing';
            renderApp();
        } else {
            state.currentView = 'dashboard';
            processRecurringTransactions(); // check on load
            renderApp();
            // Fetch AI data after rendering main app
            getFinancialHealthScore();
            getAIPriorities().then(renderApp);
            getAIQuickInsights();
        }

        // Fade out loader
        const loader = getEl('app-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 500);
        }
    }
};

const clearAllData = () => {
    localStorage.removeItem('cravourAppState');
    state = getInitialState();
    // After clearing, take user back to onboarding
    state.currentView = 'landing';
    if(chat) chat = null; // Reset chat history
    renderApp();
    showToast('All data has been cleared.', 'success');
};


// --- ACTION HANDLERS ---
const handleAction = (e: Event) => {
    const target = e.target as HTMLElement;
    const actionTarget = target.closest('[data-action]');
    if (!actionTarget) return;

    e.preventDefault();
    const action = actionTarget.getAttribute('data-action');
    const id = actionTarget.getAttribute('data-id');
    
    switch (action) {
        case 'launch-app':
            state.hasOnboarded = true; // For demo, we skip onboarding if they launch
            state.userName = 'Demo User';
            saveState();
            state.currentView = 'dashboard';
            renderApp();
            getFinancialHealthScore();
            getAIPriorities().then(renderApp);
            getAIQuickInsights();
            break;
        case 'complete-onboarding':
            const nameInput = getEl('onboarding-name') as HTMLInputElement;
            const name = nameInput?.value.trim();
            if (name) {
                state.userName = name;
                state.hasOnboarded = true;
                saveState();
                state.currentView = 'dashboard';
                renderApp();
                getFinancialHealthScore();
                getAIPriorities().then(renderApp);
                getAIQuickInsights();
                closeModal();
            }
            break;
        case 'set-view':
            state.currentView = actionTarget.getAttribute('data-view') as any;
            if (window.innerWidth < 992) {
                state.isSidebarOpen = false;
            }
            renderApp();
             if(state.currentView === 'dashboard') {
                getFinancialHealthScore();
                getAIPriorities().then(renderApp);
            }
            if (state.currentView === 'co-pilot' && state.chatHistory.length === 0) {
                getAIQuickInsights();
            }
            break;
        case 'toggle-sidebar':
            state.isSidebarOpen = !state.isSidebarOpen;
            renderApp();
            break;
        case 'change-dashboard-period':
            state.dashboardPeriod = parseInt(actionTarget.getAttribute('data-period') || '30', 10) as DashboardPeriod;
            renderApp();
            getFinancialHealthScore();
            break;
        case 'change-dashboard-tab':
            state.dashboardTab = actionTarget.getAttribute('data-tab') as DashboardTab;
            renderDashboardTabs();
            // Re-style active tab
            document.querySelectorAll('.hub-nav-item').forEach(el => el.classList.remove('active'));
            actionTarget.classList.add('active');
            break;
        case 'add-transaction':
            renderTransactionModal();
            break;
        case 'edit-transaction':
            const t = state.transactions.find(t => t.id === id);
            if (t) renderTransactionModal(t);
            break;
        case 'save-transaction':
            handleSaveTransaction(e);
            break;
        case 'change-transaction-type':
            // Re-render modal with correct categories
            const form = (e.target as HTMLElement).closest('form');
            if(form) {
                 const type = (e.target as HTMLInputElement).value as 'income' | 'expense';
                 const description = (form.querySelector('#description') as HTMLInputElement)?.value || '';
                 const amount = (form.querySelector('#amount') as HTMLInputElement)?.value || '';
                 const date = (form.querySelector('#date') as HTMLInputElement)?.value || '';
                 renderTransactionModal({type, description, amount: parseFloat(amount), date});
            }
            break;
        case 'delete-item':
            const itemType = actionTarget.getAttribute('data-type') || '';
            const itemName = actionTarget.getAttribute('data-name') || '';
            if (id) renderConfirmDeleteModal(id, itemType, itemName);
            break;
        case 'confirm-delete':
            handleDeleteItem(id, actionTarget.getAttribute('data-type') || '');
            break;
        case 'toggle-priority':
            const prio = state.priorities.find(p => p.id === (actionTarget.closest('li') as HTMLLIElement).dataset.id);
            if (prio) {
                prio.completed = !prio.completed;
                saveState();
                renderApp();
            }
            break;
        case 'refresh-priorities':
            getAIPriorities().then(renderApp);
            break;
        case 'submit-chat':
            handleCoPilotSubmit();
            break;
        case 'use-suggestion':
            const prompt = actionTarget.getAttribute('data-prompt');
            if (prompt) handleCoPilotSubmit(prompt);
            break;
        case 'add-goal': renderGoalModal(); break;
        case 'edit-goal':
            const g = state.goals.find(g => g.id === id);
            if(g) renderGoalModal(g);
            break;
        case 'save-goal': handleSaveGoal(e); break;
        case 'manage-budgets': renderBudgetModal(); break;
        case 'save-budgets': handleSaveBudgets(e); break;
        case 'add-recurring': renderRecurringTransactionModal(); break;
        case 'edit-recurring':
            const r = state.recurringTransactions.find(r => r.id === id);
            if (r) renderRecurringTransactionModal(r);
            break;
        case 'save-recurring': handleSaveRecurring(e); break;
        case 'change-recurring-type':
             const rForm = (e.target as HTMLElement).closest('form');
            if(rForm) {
                 const type = (e.target as HTMLInputElement).value as 'income' | 'expense';
                 const description = (rForm.querySelector('#recurring-description') as HTMLInputElement)?.value || '';
                 const amount = (rForm.querySelector('#recurring-amount') as HTMLInputElement)?.value || '';
                 const nextDueDate = (rForm.querySelector('#recurring-next-due-date') as HTMLInputElement)?.value || '';
                 const frequency = (rForm.querySelector('#recurring-frequency') as HTMLSelectElement)?.value as Frequency || 'monthly';
                 renderRecurringTransactionModal({type, description, amount: parseFloat(amount), nextDueDate, frequency});
            }
            break;
        case 'open-ai-budget-modal':
            renderAIBudgetModal();
            getAIBudgetSuggestions();
            break;
        case 'close-ai-budget-modal': closeModal('ai-budget-modal'); break;
        case 'retry-ai-budget': getAIBudgetSuggestions(); break;
        case 'apply-ai-budget': handleApplyAIBudget(e); break;

        case 'export-data': exportDataToCSV(); break;
        case 'clear-data': renderConfirmClearDataModal(); break;
        case 'confirm-clear-data': clearAllData(); closeModal(); break;
        case 'toggle-filters':
            state.showTransactionFilters = !state.showTransactionFilters;
            getEl('transaction-filter-bar')?.classList.toggle('visible');
            break;
        case 'close-modal':
        case 'close-toast':
            const parent = actionTarget.parentElement;
            if (parent?.classList.contains('toast')) {
                parent.remove();
            } else {
                closeModal();
            }
            break;
    }
};

const handleSaveTransaction = (e: Event) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const id = form.dataset.id;
    const transaction: Transaction = {
        id: id || generateId('txn'),
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        date: new Date(formData.get('date') as string).toISOString(),
        type: formData.get('type') as 'income' | 'expense',
        category: formData.get('category') as string,
    };
    
    const index = state.transactions.findIndex(t => t.id === id);
    if (index > -1) {
        state.transactions[index] = transaction;
    } else {
        state.transactions.push(transaction);
    }
    
    sortTransactions();
    saveState();
    closeModal();
    renderApp();
    getFinancialHealthScore();
    showToast('Transaction saved!', 'success');
};

const handleSaveGoal = (e: Event) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const id = form.dataset.id;
    const goal: Goal = {
        id: id || generateId('goal'),
        name: formData.get('name') as string,
        targetAmount: parseFloat(formData.get('targetAmount') as string),
        savedAmount: parseFloat(formData.get('savedAmount') as string) || 0,
    };

    const index = state.goals.findIndex(g => g.id === id);
    if (index > -1) {
        state.goals[index] = goal;
    } else {
        state.goals.push(goal);
    }

    saveState();
    closeModal();
    renderDashboardTabs();
    showToast('Goal saved!', 'success');
};

const handleSaveBudgets = (e: Event) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newBudgets: Budgets = {};
    for (const [category, value] of formData.entries()) {
        const amount = parseFloat(value as string);
        if (amount > 0) {
            newBudgets[category] = amount;
        }
    }
    state.budgets = newBudgets;
    saveState();
    closeModal();
    renderDashboardTabs();
    showToast('Budgets updated!', 'success');
};

const handleSaveRecurring = (e: Event) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const id = form.dataset.id;
    const recurring: RecurringTransaction = {
        id: id || generateId('rec'),
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type') as 'income' | 'expense',
        category: formData.get('category') as string,
        frequency: formData.get('frequency') as Frequency,
        nextDueDate: formData.get('nextDueDate') as string,
    };

    const index = state.recurringTransactions.findIndex(r => r.id === id);
    if (index > -1) {
        state.recurringTransactions[index] = recurring;
    } else {
        state.recurringTransactions.push(recurring);
    }

    state.recurringTransactions.sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    saveState();
    closeModal();
    renderDashboardTabs();
    showToast('Recurring transaction saved!', 'success');
}


const handleDeleteItem = (id: string | null, type: string) => {
    if (!id) return;
    let success = false;
    if (type === 'Transaction') {
        state.transactions = state.transactions.filter(t => t.id !== id);
        success = true;
    } else if (type === 'Goal') {
        state.goals = state.goals.filter(g => g.id !== id);
        success = true;
    } else if (type === 'Recurring') {
        state.recurringTransactions = state.recurringTransactions.filter(r => r.id !== id);
        success = true;
    }

    if (success) {
        saveState();
        closeModal();
        if(state.currentView === 'dashboard') {
            renderDashboardTabs();
            getFinancialHealthScore();
        } else {
            renderApp();
        }
        showToast(`${type} deleted.`, 'success');
    }
};

const handleFilterChange = (e: Event, filterKey: keyof TransactionFilters) => {
    const value = (e.target as HTMLInputElement | HTMLSelectElement).value;
    if (filterKey === 'type') {
        state.transactionFilters.type = value as 'all' | 'income' | 'expense';
    } else {
        state.transactionFilters[filterKey] = value;
    }
    renderDashboardTabs();
};

const handleApplyAIBudget = (e: Event) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    for (const [category, value] of formData.entries()) {
        const amount = parseFloat(value as string);
        if (amount >= 0) { // Allow 0 to clear a budget
            state.budgets[category] = amount;
        }
    }
    saveState();
    closeModal('ai-budget-modal');
    renderDashboardTabs();
    renderBudgetModal();
    showToast('AI budget suggestions applied!', 'ai');
};

const processRecurringTransactions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const todayTimestamp = today.getTime();

    if (lastRecurringCheckTimestamp && lastRecurringCheckTimestamp === todayTimestamp) {
        return; // Already checked today
    }

    let transactionsAdded = 0;
    state.recurringTransactions.forEach(r => {
        let nextDueDate = new Date(r.nextDueDate + 'T00:00:00'); // Assume local time
        
        while (nextDueDate.getTime() <= todayTimestamp) {
            // Add a new transaction
            state.transactions.push({
                id: generateId('txn-rec'),
                description: r.description,
                amount: r.amount,
                date: nextDueDate.toISOString(),
                type: r.type,
                category: r.category
            });
            transactionsAdded++;
            
            // Calculate the next due date based on frequency
            switch(r.frequency) {
                case 'daily': nextDueDate.setDate(nextDueDate.getDate() + 1); break;
                case 'weekly': nextDueDate.setDate(nextDueDate.getDate() + 7); break;
                case 'monthly': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
                case 'yearly': nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); break;
            }
        }
        r.nextDueDate = nextDueDate.toISOString().split('T')[0];
    });

    if (transactionsAdded > 0) {
        sortTransactions();
        state.recurringTransactions.sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
        showToast(`${transactionsAdded} recurring transaction(s) were automatically added.`, 'info');
    }
    
    lastRecurringCheckTimestamp = todayTimestamp;
    saveState();
};

const exportDataToCSV = () => {
    if (state.transactions.length === 0) {
        showToast("No transaction data to export.", "info");
        return;
    }
    const headers = ["ID", "Description", "Amount", "Type", "Category", "Date"];
    const rows = state.transactions.map(t =>
        [t.id, `"${t.description.replace(/"/g, '""')}"`, t.amount, t.type, t.category, t.date].join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cravour_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data exported successfully!", "success");
};


// --- INITIALIZATION ---
const init = () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Use an absolute URL constructed from the origin to avoid cross-origin issues in sandboxed environments
            const swPath = `${window.location.origin}/sw.js`;
            navigator.serviceWorker.register(swPath)
                .then(registration => {
                    console.log('Service Worker registration successful with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }

    // Show API key warning if needed
    if (!API_KEY) {
        getEl('config-banner')?.classList.remove('hidden');
    }

    // Listen for online/offline events
    window.addEventListener('online', () => renderOfflineIndicator(false));
    window.addEventListener('offline', () => renderOfflineIndicator(true));
    renderOfflineIndicator(!navigator.onLine);

    // Setup global event listener
    document.body.addEventListener('click', handleAction);
    document.body.addEventListener('submit', handleAction);

    initAI();
    loadState();
};

init();