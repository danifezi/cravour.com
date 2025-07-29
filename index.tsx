
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

interface OnboardingState {
    step: number;
    userName: string;
    goalName: string;
    goalAmount: string;
}

type Budgets = { [category: string]: number };
type DashboardPeriod = 7 | 30 | 90;
type DashboardTab = 'transactions' | 'goals' | 'budgets' | 'recurring';


const transactionCategories = {
    expense: ['Food & Drinks', 'Shopping', 'Transport', 'Utilities', 'Entertainment', 'Housing', 'Health', 'Education', 'Savings', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
};

const state: {
    transactions: Transaction[],
    recurringTransactions: RecurringTransaction[],
    currentView: 'landing' | 'dashboard' | 'co-pilot' | 'settings',
    chatHistory: ChatMessage[],
    isCoPilotLoading: boolean,
    theme: 'light' | 'dark' | 'system',
    hasOnboarded: boolean;
    onboardingState: OnboardingState | null,
    financialHealth: FinancialHealth | null,
    budgets: Budgets,
    goals: Goal[],
    priorities: Priority[],
    isPrioritiesLoading: boolean,
    aiQuickInsights: string[],
    isQuickInsightsLoading: boolean,
    transactionFilters: TransactionFilters,
    showTransactionFilters: boolean,
    userName: string,
    dashboardPeriod: DashboardPeriod,
    dashboardTab: DashboardTab,
    isSidebarOpen: boolean,
    aiBudgetSuggestions: {
        isLoading: boolean;
        suggestions: AIBudgetSuggestion[] | null;
        error: string | null;
    },
    isAppLoading: boolean,
} = {
    transactions: [],
    recurringTransactions: [],
    currentView: 'landing',
    chatHistory: [],
    isCoPilotLoading: false,
    theme: 'system',
    hasOnboarded: false,
    onboardingState: null,
    financialHealth: null,
    budgets: {},
    goals: [],
    priorities: [],
    isPrioritiesLoading: false,
    aiQuickInsights: [],
    isQuickInsightsLoading: false,
    transactionFilters: {
        text: '',
        type: 'all',
        category: 'all',
    },
    showTransactionFilters: false,
    userName: 'Guest',
    dashboardPeriod: 30,
    dashboardTab: 'transactions',
    isSidebarOpen: true, // Start open on desktop by default
    aiBudgetSuggestions: {
        isLoading: false,
        suggestions: null,
        error: null,
    },
    isAppLoading: false,
};

// --- ICONS & UTILITIES ---

const icons = {
    logo: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 14.1363 19.2234 16.0853 17.9535 17.5501L15.3262 14.9228C15.7503 14.1118 16 13.1114 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1114 16 14.1118 15.7503 14.9228 15.3262L17.5501 17.9535C16.0853 19.2234 14.1363 20 12 20Z" clip-rule="evenodd"/></svg>`,
    add: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5z" /></svg>`,
    upArrow: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up-circle" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>`,
    downArrow: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down-circle" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg>`,
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 .89-1.335A11.954 11.954 0 0 1 12 6.118a11.954 11.954 0 0 1 8.86 4.547L21.75 12M2.25 12a8.955 8.955 0 0 0 3.324 5.992 8.955 8.955 0 0 0 12.852 0A8.955 8.955 0 0 0 21.75 12M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" /></svg>`,
    coPilot: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>`,
    spinner: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.3"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438 1.001s.145.761.438 1.001l1.003.827c.424.35.534.954.26 1.431l-1.296-2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.127c-.331.183-.581.495-.644.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-1.001s-.145-.761-.438-1.001l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37.49l1.217.456c.355.133.75.072 1.076.124.072-.044.146-.087.22-.127.332-.183.582-.495.644-.87l.213-1.281ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.437c.84.263 1.68.444 2.535.537V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6.198c.855-.093 1.695-.274 2.535-.537a.75.75 0 1 0 .53-1.437c-.785-.248-1.57-.391-2.365-.468V3.75A2.75 2.75 0 0 0 11.25 1h-2.5zM10 4c.84 0 1.5.66 1.5 1.5v1.5h-3V5.5C8.5 4.66 9.16 4 10 4zM8.5 8.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5zm3 0a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5z" clip-rule="evenodd" /></svg>`,
    alertWarning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
    alertSuccess: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z" /></svg>`,
    alertInfo: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>`,
    sidebarToggle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" /></svg>`,
    recurring: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" /></svg>`,
    goal: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21v-18a.75.75 0 0 1 .75-.75h12.59a.75.75 0 0 1 .507.173l4.803 4.116a.75.75 0 0 1 0 1.156l-4.803 4.116a.75.75 0 0 1-.507.173H4.5a.75.75 0 0 0-.75.75Z" /></svg>`,
    budget: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25-2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" /></svg>`,
    editPencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`,
    camera: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008v-.008z" /></svg>`,
    transactions: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>`,
    dataClear: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25m2.25-2.25-2.25-2.25m2.25 2.25 2.25-2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621 .504 1.125 1.125 1.125Z" /></svg>`,
    hamburger: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-3.75 5.25h-9.75" /></svg>`,
    priorities: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5-3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.75.25 9.063a.75.75 0 0 0 .938 1.188L9.25 11.5v5.75a.75.75 0 0 0 1.5 0V11.5l8.063-1.25a.75.75 0 0 0 .937-1.188L10 3.75Z" /></svg>`,
    checkmark: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`
};

let dashboardChart: Chart | null = null;
let trendChart: Chart | null = null;
let lastFocusedElement: HTMLElement | null = null;
let lastRecurringCheckTimestamp: number | null = null;
let cameraStream: MediaStream | null = null;

// Safely get API key from environment, checking for `process` existence
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
    // Default options for consistency
    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    // Use UTC timezone to prevent off-by-one day errors from local timezone adjustments.
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

const animateValue = (element: HTMLElement, start: number, end: number, duration: number) => {
    if (!element) return;
    if (start === end) {
        element.textContent = formatCurrency(end);
        return;
    }
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));

    const timer = setInterval(() => {
        current += increment * Math.max(1, Math.floor(Math.abs(range) / (duration / 16)));
        if ((increment === 1 && current >= end) || (increment === -1 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = formatCurrency(current);
    }, 16);
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
        // Don't show a toast, just let it be empty
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
        const { priorities } = JSON.parse(jsonStr);

        state.priorities = priorities.map((text: string) => ({
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
        // Don't re-render here, let the calling function do it.
    }
}


const getFinancialHealthScore = async () => {
    if (!ai || state.transactions.length === 0) {
        state.financialHealth = null;
        return;
    }

    state.financialHealth = { score: 0, summary: '', isLoading: true };
    renderApp(); // To show the skeleton loader immediately

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
    // Don't re-render here, let the calling function do it.
};

const analyzeReceipt = async (base64ImageData: string): Promise<Partial<Transaction> | null> => {
    if (!ai) {
        showToast("AI features are not available.", "error");
        return null;
    }

    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64ImageData.split(',')[1],
            },
        };

        const systemInstruction = `You are an intelligent receipt scanning assistant for a Nigerian finance app. Analyze the user-uploaded receipt image and extract the following information: vendor/store name (as 'description'), the final total amount (as 'amount'), the transaction date (as 'date' in YYYY-MM-DD format), and a relevant spending category. The currency is Nigerian Naira (NGN). For the 'category', choose the most fitting option from this list: ${JSON.stringify(transactionCategories.expense)}. If no date is found on the receipt, use today's date: ${new Date().toISOString().split('T')[0]}. You must respond in the specified JSON format.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING, description: 'The vendor or store name.' },
                        amount: { type: Type.NUMBER, description: 'The total amount of the transaction.' },
                        date: { type: Type.STRING, description: 'The transaction date in YYYY-MM-DD format.' },
                        category: { type: Type.STRING, description: `The suggested spending category from the provided list.` }
                    },
                    required: ['description', 'amount', 'date', 'category']
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        // Basic validation
        if (!parsedData.description || typeof parsedData.amount !== 'number') {
            throw new Error("AI response was missing required fields.");
        }
        
        return {
            description: parsedData.description,
            amount: parsedData.amount,
            date: parsedData.date || new Date().toISOString().split('T')[0],
            category: parsedData.category,
            type: 'expense',
        };

    } catch (error) {
        console.error("Error analyzing receipt:", error);
        showToast("Sorry, I couldn't read the details from that receipt. Please try again or enter manually.", "error");
        return null;
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
    
    // Create a placeholder for the model's response
    const modelMsg = { id: generateId('msg-model'), role: 'model' as const, text: '', isStreaming: true };
    state.chatHistory.push(modelMsg);

    // Initial render to show user message and thinking indicator
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
        renderApp(); // Final render to sync state and show full message
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
        const { insights } = JSON.parse(jsonStr);
        state.aiQuickInsights = insights;

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
        const { suggestions } = JSON.parse(jsonStr);

        const validCategories = new Set(transactionCategories.expense);
        state.aiBudgetSuggestions.suggestions = suggestions.filter((s: AIBudgetSuggestion) => validCategories.has(s.category));
        
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

    if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else { // Tab
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
};

const stopCamera = () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
};

const closeModal = (modalId?: string) => {
    const modal = modalId ? getEl(modalId) : document.querySelector('.modal-overlay');
    if (!modal) return;

    if (modal.id === 'scan-receipt-modal') {
        stopCamera();
    }
    if (modal.id === 'onboarding-modal') {
        state.onboardingState = null;
    }
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
    
    const actionsNode = tempDiv.querySelector('.form-actions, .onboarding-footer, .modal-actions-container');
    const actionsContent = actionsNode ? actionsNode.innerHTML : '';
    if (actionsNode) actionsNode.remove();
    const bodyContent = tempDiv.innerHTML;

    const modalElement = document.createElement('div');
    modalElement.id = modalId;
    modalElement.className = 'modal-overlay';
    modalElement.setAttribute('data-action', 'close-modal');

    const uniqueTitleId = `modal-title-${modalId}`;
    modalElement.innerHTML = `
        <div class="modal-content ${wide ? 'wide' : ''} ${customClasses}" role="dialog" aria-modal="true" aria-labelledby="${uniqueTitleId}">
            <h2 id="${uniqueTitleId}" class="modal-title">${DOMPurify.sanitize(title)}</h2>
            <button class="modal-close-btn" aria-label="Close" data-action="close-modal">&times;</button>
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
    if (!state.onboardingState) return;

    const { step, userName, goalName, goalAmount } = state.onboardingState;
    const totalSteps = 4;
    let title = '';
    let content = '';

    const progressHtml = `
        <div class="onboarding-progress">
            <div class="onboarding-progress-bar" style="width: ${((step -1) / (totalSteps -1)) * 100}%"></div>
        </div>
    `;

    switch (step) {
        case 1:
            title = 'Welcome to Cravour!';
            content = `
                <div class="onboarding-step active">
                    <div class="onboarding-content">
                        <h3>Your journey to financial clarity starts now.</h3>
                        <p>In the next few steps, we'll personalize your experience to help you take control of your money.</p>
                    </div>
                    <div class="onboarding-footer">
                        <button class="btn btn-primary" data-action="onboarding-next" autofocus>Let's Go</button>
                    </div>
                </div>
            `;
            break;
        case 2:
            title = 'What should we call you?';
            content = `
                <div class="onboarding-step active">
                    <div class="onboarding-content">
                        <p>Personalizing your dashboard helps you feel right at home.</p>
                        <div class="form-group">
                            <label for="onboarding-name" class="visually-hidden">Your Name</label>
                            <input type="text" id="onboarding-name" class="input-field large-text" placeholder="e.g., Alex" value="${DOMPurify.sanitize(userName)}" required autofocus>
                        </div>
                    </div>
                    <div class="onboarding-footer">
                        <button class="btn btn-secondary-outline" data-action="onboarding-prev">Back</button>
                        <button class="btn btn-primary" data-action="onboarding-next">Next</button>
                    </div>
                </div>
            `;
            break;
        case 3:
            title = `What's your first financial goal?`;
            content = `
                <div class="onboarding-step active">
                    <div class="onboarding-content">
                        <p>Setting a goal is a great way to start. What are you saving for?</p>
                        <div class="form-group">
                            <label for="onboarding-goal-name" class="visually-hidden">Goal Name</label>
                            <input type="text" id="onboarding-goal-name" class="input-field" placeholder="e.g., New Laptop" value="${DOMPurify.sanitize(goalName)}" required autofocus>
                        </div>
                        <div class="form-group">
                            <label for="onboarding-goal-amount" class="visually-hidden">Target Amount</label>
                            <input type="number" id="onboarding-goal-amount" class="input-field" placeholder="Target Amount (e.g., 500000)" value="${DOMPurify.sanitize(goalAmount)}" required>
                        </div>
                    </div>
                    <div class="onboarding-footer">
                        <button class="btn btn-secondary-outline" data-action="onboarding-prev">Back</button>
                        <button class="btn btn-primary" data-action="onboarding-next">Set Goal</button>
                    </div>
                </div>
            `;
            break;
        case 4:
            title = `You're all set, ${DOMPurify.sanitize(userName)}!`;
            content = `
                <div class="onboarding-step active">
                    <div class="onboarding-content">
                        <div class="onboarding-complete-icon">${icons.alertSuccess}</div>
                        <h3>Ready to take control?</h3>
                        <p>Your dashboard is ready. Let's start tracking your finances and reaching your goals together.</p>
                    </div>
                    <div class="onboarding-footer">
                         <button class="btn btn-primary btn-lg" data-action="complete-onboarding" autofocus>Go to Dashboard</button>
                    </div>
                </div>
            `;
            break;
    }

    createModalShell('onboarding-modal', title, progressHtml + content, false, 'onboarding-modal-content');
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
                <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save ${isEditing ? 'Changes' : 'Transaction'}</button>
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
                <input type="number" id="goal-target" name="targetAmount" class="input-field" value="${g.targetAmount}" placeholder="500000" required>
            </div>
            ${isEditing ? `
                <div class="form-group">
                    <label>Amount Saved</label>
                    <div class="form-static-text">${formatCurrency(g.savedAmount)}</div>
                </div>
            ` : `
                <div class="form-group">
                    <label for="goal-saved">Amount Already Saved (NGN)</label>
                    <input type="number" id="goal-saved" name="savedAmount" class="input-field" value="0" disabled>
                    <small class="form-text text-muted">You can add contributions after creating the goal.</small>
                </div>
            `}
            <div class="form-actions">
                <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Goal</button>
            </div>
        </form>
    `;
    createModalShell('goal-modal', title, content);
};

const renderContributeToGoalModal = (goalId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return showToast("Goal not found.", "error");

    const title = `Contribute to "${goal.name}"`;
    const content = `
        <form id="contribute-form" data-id="${goal.id}" data-action="save-goal-contribution">
            <p>Your current progress is <strong>${formatCurrency(goal.savedAmount)}</strong> out of ${formatCurrency(goal.targetAmount)}.</p>
            <div class="form-group">
                <label for="contribution-amount">Contribution Amount (NGN)</label>
                <input type="number" id="contribution-amount" name="amount" class="input-field" placeholder="0.00" required autofocus>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Contribution</button>
            </div>
        </form>
    `;
    createModalShell('contribute-modal', title, content);
};


const renderBudgetModal = (budget: { category: string, amount: number } | null = null) => {
    const isEditing = !!budget;
    const title = isEditing ? `Edit Budget for ${budget.category}` : 'Set New Budget';
    const b = {
        category: budget?.category || '',
        amount: budget?.amount || ''
    };

    const unusedCategories = transactionCategories.expense.filter(cat => !state.budgets[cat] || (isEditing && budget!.category === cat));

    const content = `
        <form id="budget-form" data-category="${b.category}" data-action="save-budget">
            <div class="form-group">
                <label for="budget-category">Category</label>
                <select id="budget-category" name="category" class="input-field" required ${isEditing ? 'disabled' : ''}>
                    ${isEditing ? `<option value="${b.category}" selected>${b.category}</option>` : ''}
                    ${!isEditing ? '<option value="">Select a category</option>' + unusedCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('') : ''}
                </select>
                ${isEditing ? `<input type="hidden" name="category" value="${b.category}" />` : ''}
            </div>
            <div class="form-group">
                <label for="budget-amount">Monthly Budget Amount (NGN)</label>
                <input type="number" id="budget-amount" name="amount" class="input-field" value="${b.amount}" placeholder="e.g., 50000" required autofocus>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Budget</button>
            </div>
        </form>
    `;
    createModalShell('budget-modal', title, content);
};

const renderAIBudgetModal = () => {
    const title = 'AI Budget Suggestions';
    const { isLoading, suggestions, error } = state.aiBudgetSuggestions;
    let bodyContent = '';

    if (isLoading) {
        bodyContent = `
            <div class="ai-suggestions-loader">
                <div class="spinner-container"><div class="spinner">${icons.spinner}</div></div>
                <p>Analyzing your spending and preparing suggestions...</p>
            </div>
        `;
    } else if (error) {
        bodyContent = `
            <div class="alert alert-error">
                ${icons.alertWarning}
                <p>${DOMPurify.sanitize(error)}</p>
            </div>
            <div class="modal-actions-container">
                <button class="btn btn-secondary-outline" data-action="close-modal">Close</button>
                <button class="btn btn-primary" data-action="get-ai-budget-suggestions">Try Again</button>
            </div>
        `;
    } else if (suggestions && suggestions.length > 0) {
        bodyContent = `
            <p>Here are some budget suggestions based on your spending habits. You can apply them or adjust as needed.</p>
            <form id="ai-budget-form" data-action="apply-ai-suggestions">
                <ul class="ai-suggestion-list">
                    ${suggestions.map(s => `
                        <li class="ai-suggestion-item">
                            <div class="suggestion-info">
                                <strong class="suggestion-category">${DOMPurify.sanitize(s.category)}</strong>
                                <small class="suggestion-justification">${DOMPurify.sanitize(s.justification)}</small>
                            </div>
                            <div class="suggestion-amount">
                                <label for="suggestion-${s.category}" class="visually-hidden">Budget for ${s.category}</label>
                                <input type="number" id="suggestion-${s.category}" class="input-field" name="${s.category}" value="${s.suggestedAmount}">
                            </div>
                        </li>
                    `).join('')}
                </ul>
                <div class="form-actions">
                     <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                     <button type="submit" class="btn btn-primary">Apply Budgets</button>
                </div>
            </form>
        `;
    } else {
        bodyContent = `<p>No suggestions available at this time. This can happen if you don't have enough transaction history.</p>
            <div class="modal-actions-container">
                <button class="btn btn-secondary-outline" data-action="close-modal">Close</button>
            </div>
        `;
    }
    
    createModalShell('ai-budget-modal', title, bodyContent, true);
};


const renderScanReceiptModal = () => {
    const content = `
        <div id="scan-receipt-content">
            <div id="camera-container" class="camera-container">
                <video id="camera-feed" class="camera-feed" autoplay playsinline></video>
                <div id="camera-loader" class="camera-loader" style="display: none;">
                     <div class="spinner-container"><div class="spinner">${icons.spinner}</div></div>
                    <p>Processing receipt...</p>
                </div>
                <div id="camera-error" class="camera-error" style="display: none;">
                    ${icons.alertWarning}
                    <p>Could not access the camera. Please check permissions.</p>
                </div>
            </div>
            <div class="modal-actions-container">
                <button id="capture-btn" class="btn btn-primary btn-lg" data-action="capture-receipt">
                    ${icons.camera} Capture Receipt
                </button>
            </div>
        </div>
    `;
    createModalShell('scan-receipt-modal', 'Scan Receipt', content);

    const video = getEl('camera-feed') as HTMLVideoElement;
    const captureBtn = getEl('capture-btn');
    const cameraError = getEl('camera-error');
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                cameraStream = stream;
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.error("Error accessing camera:", err);
                if(cameraError) cameraError.style.display = 'flex';
                if(captureBtn) (captureBtn as HTMLButtonElement).disabled = true;
            });
    } else {
         if(cameraError) cameraError.style.display = 'flex';
         if(captureBtn) (captureBtn as HTMLButtonElement).disabled = true;
    }
};

const renderRecurringTransactionModal = (tx: Partial<RecurringTransaction> | null = null) => {
    const isEditing = tx && tx.id;
    const title = isEditing ? 'Edit Recurring Transaction' : 'Add Recurring Transaction';
    const t = {
        id: tx?.id || generateId('rtxn'),
        type: tx?.type || 'expense',
        description: tx?.description || '',
        amount: tx?.amount || '',
        category: tx?.category || '',
        frequency: tx?.frequency || 'monthly',
        nextDueDate: tx?.nextDueDate ? tx.nextDueDate.split('T')[0] : new Date().toISOString().split('T')[0],
    };
    const categories = transactionCategories[t.type];
    
    const content = `
        <form id="recurring-transaction-form" data-id="${t.id}" data-action="save-recurring-transaction">
            <div class="form-group">
                <label>Type</label>
                <div class="form-radio-group">
                    <input type="radio" id="rt-type-expense" name="type" value="expense" ${t.type === 'expense' ? 'checked' : ''} data-action="change-recurring-transaction-type">
                    <label for="rt-type-expense">Expense</label>
                    <input type="radio" id="rt-type-income" name="type" value="income" ${t.type === 'income' ? 'checked' : ''} data-action="change-recurring-transaction-type">
                    <label for="rt-type-income">Income</label>
                </div>
            </div>
            <div class="form-group">
                <label for="rt-description">Description</label>
                <input type="text" id="rt-description" name="description" class="input-field" value="${DOMPurify.sanitize(t.description)}" required autofocus>
            </div>
            <div class="form-group">
                <label for="rt-amount">Amount (NGN)</label>
                <input type="number" id="rt-amount" name="amount" class="input-field" value="${t.amount}" placeholder="0.00" required>
            </div>
            <div class="form-group">
                <label for="rt-category">Category</label>
                <select id="rt-category" name="category" class="input-field" required>
                    <option value="">Select a category</option>
                    ${categories.map(cat => `<option value="${cat}" ${t.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="rt-frequency">Frequency</label>
                <select id="rt-frequency" name="frequency" class="input-field" required>
                    <option value="daily" ${t.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${t.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${t.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="yearly" ${t.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
                </select>
            </div>
            <div class="form-group">
                <label for="rt-next-due-date">Next Due Date</label>
                <input type="date" id="rt-next-due-date" name="nextDueDate" class="input-field" value="${t.nextDueDate}" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save ${isEditing ? 'Changes' : 'Transaction'}</button>
            </div>
        </form>
    `;

    createModalShell('recurring-transaction-modal', title, content);
};

const renderDeleteConfirmationModal = (itemId: string, itemType: string, itemName: string) => {
    const title = `Delete ${itemType}`;
    const content = `
        <p>Are you sure you want to delete this ${itemType.toLowerCase()}?</p>
        <p><strong>${DOMPurify.sanitize(itemName)}</strong></p>
        <div class="modal-actions-container">
            <button class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
            <button class="btn btn-danger" data-item-id="${itemId}" data-item-type="${itemType}" data-action="confirm-delete" autofocus>Delete</button>
        </div>
    `;
    createModalShell('delete-confirmation-modal', title, content);
};


// --- UI RENDERING (VIEWS) ---

const renderLandingView = () => {
    return `
    <div class="landing-page-v2">
        <header class="landing-header">
            <a href="#" class="logo" data-action="navigate" data-view="landing">
                ${icons.logo}
                <span>Cravour</span>
            </a>
        </header>
        <main class="landing-main">
            <section class="hero-section">
                <div class="hero-grid">
                    <div class="hero-content">
                        <h1 class="hero-title">Your Personal Finance <span class="highlight">Co-Pilot</span></h1>
                        <p class="hero-subtitle">Cravour uses AI to help you track spending, manage budgets, and achieve your financial goals in Nigeria. Take control of your money today.</p>
                        <button class="btn btn-primary btn-lg" data-action="start-onboarding">Get Started for Free</button>
                        <p class="hero-disclaimer">No credit card required. Start in seconds.</p>
                    </div>
                    <div class="hero-mockup-container">
                        <div class="hero-mockup">
                            <div class="mockup-notch"></div>
                            <div class="mockup-screen">
                                <div class="mockup-header">Welcome back, Alex!</div>
                                <div class="mockup-balance-label">Net Balance (30D)</div>
                                <div class="mockup-balance">${formatCurrency(45800)}</div>
                                <div class="mockup-card">
                                    <div class="mockup-card-icon">${icons.coPilot}</div>
                                    <div class="mockup-card-text">
                                        <strong>AI Health Score: 78</strong>
                                        <span>Your spending is healthy. Good job!</span>
                                    </div>
                                </div>
                                <div class="mockup-bar-chart">
                                    <div class="mockup-bar" style="height: 60%; animation: bar-up 1s ease-out;"></div>
                                    <div class="mockup-bar" style="height: 40%; animation: bar-up 1.2s ease-out;"></div>
                                    <div class="mockup-bar" style="height: 75%; animation: bar-up 1.4s ease-out;"></div>
                                    <div class="mockup-bar" style="height: 30%; animation: bar-up 1.6s ease-out;"></div>
                                    <div class="mockup-bar" style="height: 55%; animation: bar-up 1.8s ease-out;"></div>
                                </div>
                                 <div class="mockup-card">
                                    <div class="mockup-card-icon" style="color: var(--color-error)">${icons.downArrow}</div>
                                    <div class="mockup-card-text">
                                        <strong>Jumia Food</strong>
                                        <span>Today - ${formatCurrency(4500)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="features-section" id="features">
                <div class="section-header">
                    <h2 class="section-title">Everything you need to succeed</h2>
                    <p class="section-subtitle">Cravour isn't just another expense tracker. It's a smart assistant designed to guide you towards financial freedom.</p>
                </div>
                <div class="feature-row">
                    <div class="feature-content">
                        <div class="feature-icon">${icons.coPilot}</div>
                        <h3 class="feature-title">AI-Powered Insights</h3>
                        <p>Go beyond simple tracking. Our AI Co-Pilot analyzes your habits to give you personalized advice, spending analysis, and a clear financial health score.</p>
                        <ul class="feature-benefits">
                            <li><span class="checkmark">${icons.checkmark}</span>Ask questions in plain English</li>
                            <li><span class="checkmark">${icons.checkmark}</span>Get automatic weekly priorities</li>
                            <li><span class="checkmark">${icons.checkmark}</span>Understand your financial health score</li>
                        </ul>
                    </div>
                    <div class="feature-visual">
                        <div class="visual-mockup copilot-mockup">
                            <div class="mockup-chat-bubble model">Where did most of my money go last month?</div>
                            <div class="mockup-chat-bubble user">Your highest spending was on <strong>Shopping</strong> at <strong>${formatCurrency(52000)}</strong>.</div>
                        </div>
                    </div>
                </div>

                <div class="feature-row">
                    <div class="feature-content">
                        <div class="feature-icon">${icons.budget}</div>
                        <h3 class="feature-title">Smart, Simple Budgeting</h3>
                        <p>Set realistic budgets that work for you. Get AI-powered suggestions based on your spending history and stay on track with intelligent alerts.</p>
                         <ul class="feature-benefits">
                            <li><span class="checkmark">${icons.checkmark}</span>Create budgets in seconds</li>
                            <li><span class="checkmark">${icons.checkmark}</span>Get AI suggestions for budget amounts</li>
                            <li><span class="checkmark">${icons.checkmark}</span>See your progress with visual trackers</li>
                        </ul>
                    </div>
                    <div class="feature-visual">
                         <div class="visual-mockup budget-mockup">
                            <div class="mockup-budget-item">
                                <span>Food & Drinks</span>
                                <div class="mockup-progress-bar"><div style="width: 75%"></div></div>
                            </div>
                             <div class="mockup-budget-item">
                                <span>Transport</span>
                                <div class="mockup-progress-bar"><div style="width: 40%"></div></div>
                            </div>
                             <div class="mockup-budget-item">
                                <span>Shopping</span>
                                <div class="mockup-progress-bar"><div style="width: 95%; background-color: var(--color-error)"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="feature-row">
                    <div class="feature-content">
                        <div class="feature-icon">${icons.goal}</div>
                        <h3 class="feature-title">Achieve Your Goals Faster</h3>
                        <p>From a new phone to a down payment on a house, Cravour helps you set, track, and reach your savings goals more effectively.</p>
                         <ul class="feature-benefits">
                            <li><span class="checkmark">${icons.checkmark}</span>Set multiple savings goals</li>
                            <li><span class="checkmark">${icons.checkmark}</span>Visualize your progress</li>
                            <li><span class="checkmark">${icons.checkmark}</span>Stay motivated and on track</li>
                        </ul>
                    </div>
                    <div class="feature-visual">
                         <div class="visual-mockup goal-mockup">
                            <div class="mockup-goal-title">New Laptop</div>
                            <div class="mockup-goal-progress">72%</div>
                            <div class="mockup-goal-text">${formatCurrency(360000)} / ${formatCurrency(500000)}</div>
                         </div>
                    </div>
                </div>
            </section>

            <section class="testimonial-section">
                <div class="testimonial-card">
                    <p class="testimonial-text">"For the first time, I actually feel in control of my money. The AI Co-Pilot is a game-changer for understanding where my salary goes."</p>
                    <cite class="testimonial-author">&mdash; Tunde A., Lagos</cite>
                </div>
            </section>

            <section class="cta-section">
                <h2 class="section-title">Ready to take control?</h2>
                <p class="section-subtitle">Your journey to financial clarity is just one click away. Join thousands of Nigerians building a brighter financial future.</p>
                <button class="btn btn-primary btn-lg" data-action="start-onboarding">Start for Free</button>
            </section>
        </main>
        <footer class="landing-footer">
            &copy; ${new Date().getFullYear()} Cravour. All rights reserved.
        </footer>
    </div>
    `;
};


const renderHeader = () => {
    if (state.currentView === 'landing') return '';
    const viewTitles: {[key: string]: string} = {
        dashboard: `Welcome back, ${state.userName}!`,
        'co-pilot': 'AI Co-Pilot',
        settings: 'Settings'
    }
    
    return `
        <header class="main-header">
            <div class="header-left">
                <button class="sidebar-toggle-btn" data-action="toggle-sidebar" aria-label="Toggle sidebar">
                   ${icons.hamburger}
                </button>
                <h1 class="header-title">${viewTitles[state.currentView]}</h1>
            </div>
            <div class="header-right">
                <button class="btn btn-primary add-transaction-btn" data-action="add-transaction">
                    <span class="btn-icon">${icons.add}</span>
                    <span class="btn-text">Add Transaction</span>
                </button>
                 <button class="btn btn-secondary" data-action="scan-receipt" aria-label="Scan a receipt">
                    <span class="btn-icon">${icons.camera}</span>
                </button>
            </div>
        </header>
    `;
};

const renderSidebar = () => {
    if (state.currentView === 'landing') return '';
    const currentView = state.currentView;
    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="#" class="logo" data-action="navigate" data-view="dashboard">
                    ${icons.logo}
                    <span class="logo-text">Cravour</span>
                </a>
                 <button class="sidebar-close-btn" data-action="toggle-sidebar" aria-label="Close sidebar">&times;</button>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-action="navigate" data-view="dashboard">
                    ${icons.dashboard}
                    <span class="link-text">Dashboard</span>
                </a>
                <a href="#" class="nav-item ${currentView === 'co-pilot' ? 'active' : ''}" data-action="navigate" data-view="co-pilot">
                    ${icons.coPilot}
                    <span class="link-text">AI Co-Pilot</span>
                </a>
                <a href="#" class="nav-item ${currentView === 'settings' ? 'active' : ''}" data-action="navigate" data-view="settings">
                    ${icons.settings}
                    <span class="link-text">Settings</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="user-avatar">${state.userName.charAt(0).toUpperCase()}</div>
                    <div class="user-info">
                        <div class="user-name">${DOMPurify.sanitize(state.userName)}</div>
                    </div>
                </div>
            </div>
        </aside>
    `;
};

const renderDashboardSummary = () => {
    const { totalIncome, totalExpenses, netBalance } = calculateSummary(state.dashboardPeriod);
    
    return `
        <div class="dashboard-summary">
            <div class="summary-period-selector">
                <button class="period-btn ${state.dashboardPeriod === 7 ? 'active' : ''}" data-action="set-dashboard-period" data-period="7">7D</button>
                <button class="period-btn ${state.dashboardPeriod === 30 ? 'active' : ''}" data-action="set-dashboard-period" data-period="30">30D</button>
                <button class="period-btn ${state.dashboardPeriod === 90 ? 'active' : ''}" data-action="set-dashboard-period" data-period="90">90D</button>
            </div>
            <div class="summary-cards">
                <div class="card summary-card">
                    <div class="card-header">
                        <h3 class="card-title">Total Income</h3>
                        <span class="card-icon income">${icons.upArrow}</span>
                    </div>
                    <p class="summary-value income" id="total-income-val">${formatCurrency(totalIncome)}</p>
                </div>
                <div class="card summary-card">
                    <div class="card-header">
                        <h3 class="card-title">Total Expenses</h3>
                        <span class="card-icon expense">${icons.downArrow}</span>
                    </div>
                    <p class="summary-value expense" id="total-expense-val">${formatCurrency(totalExpenses)}</p>
                </div>
                 <div class="card summary-card">
                    <div class="card-header">
                        <h3 class="card-title">Net Balance</h3>
                    </div>
                    <p class="summary-value ${netBalance >= 0 ? 'income' : 'expense'}" id="net-balance-val">${formatCurrency(netBalance)}</p>
                </div>
            </div>
        </div>
    `;
};


const renderFinancialHealthCard = () => {
    const { score, summary, isLoading } = state.financialHealth || { score: 0, summary: '', isLoading: true };

    const scoreToStatus = (s: number) => {
        if (s > 79) return 'excellent';
        if (s > 59) return 'good';
        if (s > 39) return 'fair';
        return 'poor';
    }
    const status = scoreToStatus(score);
    const circumference = 2 * Math.PI * 52; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;

    return `
        <div class="card health-card">
            <div class="card-header">
                <h3 class="card-title">Financial Health</h3>
            </div>
            <div class="card-content">
            ${isLoading ? `
                <div class="skeleton-loader health-skeleton">
                    <div class="health-score-gauge-skeleton skeleton"></div>
                    <div style="flex-grow: 1;">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-text"></div>
                    </div>
                </div>
            `: `
                <div class="health-score-container">
                    <div class="health-gauge-wrapper">
                        <svg class="health-gauge-svg" viewBox="0 0 120 120">
                            <circle class="gauge-track" cx="60" cy="60" r="52" />
                            <circle class="gauge-value ${status}" cx="60" cy="60" r="52"
                                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};"
                            />
                        </svg>
                        <div class="health-score-text">
                            <span class="health-score-value">${score}</span>
                            <span class="health-score-label">/ 100</span>
                        </div>
                    </div>
                    <div class="health-summary">
                        <p class="health-summary-text">${DOMPurify.sanitize(summary)}</p>
                    </div>
                </div>
            `}
            </div>
        </div>
    `;
}

const renderPriorities = () => {
    const cardContent = () => {
        if (state.isPrioritiesLoading) {
            return `
                <div class="card-content priorities-loading">
                    <div class="skeleton skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton skeleton-text" style="width: 95%;"></div>
                    <div class="skeleton skeleton-text" style="width: 60%;"></div>
                </div>
            `;
        }

        if (!state.priorities || state.priorities.length === 0) {
            return `
                <div class="card-content">
                    <div class="empty-state small">
                        <div class="empty-state-icon">${icons.coPilot}</div>
                        <h4>No priorities yet</h4>
                        <p>Track more transactions or click "Generate" to get your AI-powered weekly checklist.</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card-content">
                <ul class="priorities-list">
                    ${state.priorities.map(p => `
                        <li class="priority-item ${p.completed ? 'completed' : ''}" data-id="${p.id}">
                            <label class="priority-checkbox-label">
                                <input type="checkbox" data-action="toggle-priority" data-id="${p.id}" ${p.completed ? 'checked' : ''}>
                                <span class="custom-checkbox"></span>
                            </label>
                            <div class="priority-text">${marked.parse(DOMPurify.sanitize(p.text, { USE_PROFILES: { html: true } }))}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    };

    return `
        <div class="card priorities-card">
            <div class="card-header">
                <h3 class="card-title">This Week's Priorities</h3>
                 <button class="btn btn-primary-outline btn-sm" data-action="get-ai-priorities">
                    ${icons.coPilot} ${state.priorities.length > 0 ? 'Regenerate' : 'Generate'}
                </button>
            </div>
            ${cardContent()}
        </div>
    `;
};


const renderDashboardTabs = () => {
    const periodStart = new Date(new Date().setDate(new Date().getDate() - state.dashboardPeriod)).toISOString();
    const filteredTransactions = state.transactions.filter(t => t.date >= periodStart);

    const tabs = {
        transactions: renderTransactionsTab,
        goals: renderGoalsTab,
        budgets: renderBudgetsTab,
        recurring: renderRecurringTab,
    };
    
    return `
        <div class="card management-hub">
            <nav class="hub-nav">
                <a href="#" class="hub-nav-item ${state.dashboardTab === 'transactions' ? 'active' : ''}" data-action="set-dashboard-tab" data-tab="transactions">Transactions</a>
                <a href="#" class="hub-nav-item ${state.dashboardTab === 'budgets' ? 'active' : ''}" data-action="set-dashboard-tab" data-tab="budgets">Budgets</a>
                <a href="#" class="hub-nav-item ${state.dashboardTab === 'goals' ? 'active' : ''}" data-action="set-dashboard-tab" data-tab="goals">Goals</a>
                <a href="#" class="hub-nav-item ${state.dashboardTab === 'recurring' ? 'active' : ''}" data-action="set-dashboard-tab" data-tab="recurring">Recurring</a>
            </nav>
            <div class="hub-content">
                ${tabs[state.dashboardTab](filteredTransactions)}
            </div>
        </div>
    `;
};

const renderTransactionsTab = (transactionsToRender: Transaction[]) => {
    const { text, type, category } = state.transactionFilters;
    let filtered = transactionsToRender;

    if (text) {
        const lowerText = text.toLowerCase();
        filtered = filtered.filter(t => t.description.toLowerCase().includes(lowerText));
    }
    if (type !== 'all') {
        filtered = filtered.filter(t => t.type === type);
    }
    if (category !== 'all') {
        filtered = filtered.filter(t => t.category === category);
    }

    const allCategories = [...new Set(transactionsToRender.map(t => t.category).filter(Boolean))] as string[];

    const listContent = filtered.length > 0 ? `
        <ul class="entity-list">
            ${filtered.map(t => `
                <li class="entity-item">
                    <div class="entity-icon ${t.type}-icon">${t.type === 'income' ? icons.upArrow : icons.downArrow}</div>
                    <div class="entity-details">
                        <div class="entity-name">${DOMPurify.sanitize(t.description)}</div>
                        <div class="entity-info">
                            <span>${formatDate(t.date, { month: 'short', day: 'numeric' })}</span>
                            ${t.category ? `&bull; <span class="entity-category">${DOMPurify.sanitize(t.category)}</span>` : ''}
                        </div>
                    </div>
                    <div class="entity-amount-actions">
                        <span class="entity-amount ${t.type}">${formatCurrency(t.amount)}</span>
                        <div class="entity-actions">
                            <button class="icon-btn" data-action="edit-transaction" data-id="${t.id}" aria-label="Edit transaction">${icons.editPencil}</button>
                            <button class="icon-btn delete-btn" data-action="delete-item" data-id="${t.id}" data-type="transaction" data-name="${DOMPurify.sanitize(t.description)}" aria-label="Delete transaction">${icons.trash}</button>
                        </div>
                    </div>
                </li>
            `).join('')}
        </ul>
    ` : `
        <div class="empty-state small">
            <div class="empty-state-icon">${icons.transactions}</div>
            <h4>No transactions found</h4>
            <p>No transactions match your current filters. Try adjusting them or add a new transaction.</p>
        </div>
    `;

    return `
        <div class="hub-tab-header">
            <h4>Recent Transactions</h4>
            <div class="card-actions">
                <button class="btn btn-secondary-outline btn-sm btn-filter" data-action="toggle-transaction-filters">
                    Filters ${state.showTransactionFilters ? '▼' : '►'}
                </button>
            </div>
        </div>
        <div id="transaction-filter-bar" class="${state.showTransactionFilters ? 'visible' : ''}">
            <input type="text" class="input-field" placeholder="Search description..." value="${DOMPurify.sanitize(text)}" data-action="filter-transactions" name="text">
            <select class="input-field" data-action="filter-transactions" name="type">
                <option value="all" ${type === 'all' ? 'selected' : ''}>All Types</option>
                <option value="income" ${type === 'income' ? 'selected' : ''}>Income</option>
                <option value="expense" ${type === 'expense' ? 'selected' : ''}>Expense</option>
            </select>
            <select class="input-field" data-action="filter-transactions" name="category">
                <option value="all" ${category === 'all' ? 'selected' : ''}>All Categories</option>
                ${allCategories.map(c => `<option value="${c}" ${category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
        </div>
        ${listContent}
    `;
};


const renderGoalsTab = () => {
    if (state.goals.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icons.goal}</div>
                <h3>Set Your First Goal</h3>
                <p>What are you saving for? A new gadget, a vacation, or a down payment? Set a goal to start your journey.</p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary" data-action="add-goal">Create Goal</button>
                </div>
            </div>
        `;
    }

    return `
        <div class="hub-tab-header">
            <h4>Your Goals</h4>
            <button class="btn btn-primary-outline btn-sm" data-action="add-goal">
                ${icons.add} Add Goal
            </button>
        </div>
        <div class="goal-list">
            ${state.goals.map(g => {
                const progress = g.targetAmount > 0 ? (g.savedAmount / g.targetAmount) * 100 : 0;
                return `
                    <div class="goal-item">
                        <div class="goal-item-header">
                            <span class="goal-name">${DOMPurify.sanitize(g.name)}</span>
                            <div class="goal-actions">
                                <button class="btn btn-primary-outline btn-sm" data-action="contribute-goal" data-id="${g.id}">Contribute</button>
                                <button class="icon-btn" data-action="edit-goal" data-id="${g.id}" aria-label="Edit goal">${icons.editPencil}</button>
                                <button class="icon-btn delete-btn" data-action="delete-item" data-id="${g.id}" data-type="goal" data-name="${DOMPurify.sanitize(g.name)}" aria-label="Delete goal">${icons.trash}</button>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar-fill safe" style="width: ${Math.min(100, progress)}%;"></div>
                        </div>
                        <div class="goal-item-footer">
                            <span>${formatCurrency(g.savedAmount)} / ${formatCurrency(g.targetAmount)}</span>
                            <span>${Math.round(progress)}% Complete</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

const renderBudgetsTab = () => {
    const budgetEntries = Object.entries(state.budgets);
    const summary = calculateSummary(30);

    if (budgetEntries.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icons.budget}</div>
                <h3>Create a Budget</h3>
                <p>Budgets help you stay on top of your spending. Set limits for your spending categories.</p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary" data-action="add-budget">Set a Budget</button>
                    <button class="btn btn-secondary-outline" data-action="get-ai-budget-suggestions">${icons.coPilot} Use AI</button>
                </div>
            </div>
        `;
    }

    return `
        <div class="hub-tab-header">
            <h4>Monthly Budgets</h4>
            <div class="card-actions">
                <button class="btn btn-secondary-outline btn-sm" data-action="get-ai-budget-suggestions">${icons.coPilot} AI Suggest</button>
                <button class="btn btn-primary-outline btn-sm" data-action="add-budget">${icons.add} Add Budget</button>
            </div>
        </div>
        <div class="budget-list">
            ${budgetEntries.map(([category, amount]) => {
                const spent = summary.expenseByCategory[category] || 0;
                const progress = amount > 0 ? (spent / amount) * 100 : 0;
                let progressClass = 'safe';
                if (progress > 90) progressClass = 'danger';
                else if (progress > 75) progressClass = 'warning';

                return `
                    <div class="budget-item">
                        <div class="budget-item-header">
                            <span class="budget-category">${DOMPurify.sanitize(category)}</span>
                            <div class="budget-actions">
                                <span class="budget-amount">${formatCurrency(spent)} of ${formatCurrency(amount)}</span>
                                <button class="icon-btn" data-action="edit-budget" data-category="${DOMPurify.sanitize(category)}" aria-label="Edit budget">${icons.editPencil}</button>
                                <button class="icon-btn delete-btn" data-action="delete-item" data-id="${DOMPurify.sanitize(category)}" data-type="budget" data-name="${DOMPurify.sanitize(category)}" aria-label="Delete budget">${icons.trash}</button>
                            </div>
                        </div>
                        <div class="progress-bar">
                             <div class="progress-bar-fill ${progressClass}" style="width: ${Math.min(100, progress)}%;"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

const renderRecurringTab = () => {
    if (state.recurringTransactions.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icons.recurring}</div>
                <h3>Track Recurring Payments</h3>
                <p>Add subscriptions, bills, or regular income to stay ahead of your finances and never miss a due date.</p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary" data-action="add-recurring-transaction">Add Recurring Bill</button>
                </div>
            </div>
        `;
    }
    
    // Sort by next due date
    const sortedRecurring = [...state.recurringTransactions].sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

    return `
        <div class="hub-tab-header">
            <h4>Recurring Payments</h4>
            <button class="btn btn-primary-outline btn-sm" data-action="add-recurring-transaction">
                ${icons.add} Add New
            </button>
        </div>
        <ul class="entity-list">
            ${sortedRecurring.map(t => `
                <li class="entity-item">
                    <div class="entity-icon ${t.type}-icon">${icons.recurring}</div>
                    <div class="entity-details">
                        <div class="entity-name">${DOMPurify.sanitize(t.description)}</div>
                        <div class="entity-info">
                            <span>Next due: ${formatDate(t.nextDueDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                             &bull; <span class="entity-category">${t.frequency.charAt(0).toUpperCase() + t.frequency.slice(1)}</span>
                        </div>
                    </div>
                    <div class="entity-amount-actions">
                        <span class="entity-amount ${t.type}">${formatCurrency(t.amount)}</span>
                        <div class="entity-actions">
                            <button class="icon-btn" data-action="edit-recurring-transaction" data-id="${t.id}" aria-label="Edit recurring transaction">${icons.editPencil}</button>
                            <button class="icon-btn delete-btn" data-action="delete-item" data-id="${t.id}" data-type="recurringTransaction" data-name="${DOMPurify.sanitize(t.description)}" aria-label="Delete recurring transaction">${icons.trash}</button>
                        </div>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
};


const renderDashboardView = () => {
    return `
        <div class="dashboard-layout">
            <div class="dashboard-main">
                ${renderDashboardSummary()}
                <div class="card chart-card">
                    <div class="card-header"><h3 class="card-title">Income vs. Expense Trend</h3></div>
                    <div class="chart-body" id="trend-chart-container">
                        <canvas id="trend-chart"></canvas>
                    </div>
                </div>
                ${renderDashboardTabs()}
            </div>
            <div class="dashboard-sidebar">
                ${renderFinancialHealthCard()}
                ${renderPriorities()}
                <div class="card chart-card">
                    <div class="card-header"><h3 class="card-title">Spending by Category</h3></div>
                    <div class="chart-body" id="dashboard-chart-container">
                        <canvas id="dashboard-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
};


const renderCoPilotView = () => {
    const welcomeOrHistory = state.chatHistory.length === 0 ?
        `<div class="copilot-welcome">
            <div class="copilot-logo-icon">${icons.coPilot}</div>
            <h2>Ask me anything about your finances</h2>
            <p>I can help you understand your spending, check budgets, and find insights. Try one of these prompts to get started:</p>
            <div class="suggestion-chips" id="copilot-suggestions">
                ${state.isQuickInsightsLoading ? `
                    <div class="skeleton skeleton-chip"></div>
                    <div class="skeleton skeleton-chip"></div>
                    <div class="skeleton skeleton-chip"></div>
                ` :
                state.aiQuickInsights.map(q => `<button class="chip" data-action="quick-insight" data-prompt="${DOMPurify.sanitize(q)}">${DOMPurify.sanitize(q)}</button>`).join('')}
            </div>
        </div>`
        :
        state.chatHistory.map(msg => `
            <div class="message-bubble-wrapper role-${msg.role}">
                <div class="message-bubble">
                    <div class="message-content">
                        ${msg.isStreaming ? `
                            <div class="thinking-indicator">
                                <span class="spinner-sm">${icons.spinner}</span>
                                <span>Thinking...</span>
                            </div>` :
                            marked.parse(DOMPurify.sanitize(msg.text))
                        }
                    </div>
                </div>
            </div>
        `).join('');

    return `
        <div class="copilot-container">
            <div class="chat-interface">
                <div class="chat-messages" id="chat-messages">
                    ${welcomeOrHistory}
                </div>
                <div class="chat-input-area">
                    <div class="chat-input-wrapper">
                        <textarea id="chat-input" placeholder="Ask about your spending, budgets, goals..." rows="1" data-action="resize-textarea"></textarea>
                        <button id="chat-submit-btn" class="btn btn-primary btn-icon" data-action="copilot-submit" aria-label="Send message" ${state.isCoPilotLoading ? 'disabled' : ''}>
                           ${state.isCoPilotLoading ? `<span class="spinner-sm">${icons.spinner}</span>` : icons.send }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const renderSettingsView = () => {
    return `
        <div class="settings-grid">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Preferences</h3>
                </div>
                <div class="card-content">
                    <div class="settings-action-item">
                        <div>
                            <strong>Your Name</strong>
                            <p>This is used to personalize your experience across the app.</p>
                        </div>
                        <div class="item-actions">
                            <input type="text" id="settings-username" class="input-field" value="${DOMPurify.sanitize(state.userName)}">
                            <button class="btn btn-primary-outline btn-sm" data-action="save-username">Save</button>
                        </div>
                    </div>
                    <div class="settings-action-item">
                        <div>
                            <strong>Theme</strong>
                            <p>Choose how Cravour looks. System will match your device's setting.</p>
                            <div class="theme-picker">
                               ${['Light', 'Dark', 'System'].map(theme => {
                                    const themeId = theme.toLowerCase();
                                    return `
                                        <label for="theme-${themeId}" class="theme-option">
                                            <input type="radio" id="theme-${themeId}" name="theme" value="${themeId}" ${state.theme === themeId ? 'checked' : ''} data-action="set-theme">
                                            <div class="theme-preview theme-${themeId}">
                                                ${state.theme === themeId ? `<span class="theme-check">✓</span>` : ''}
                                            </div>
                                            <span>${theme}</span>
                                        </label>
                                    `
                               }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Data Management</h3>
                </div>
                <div class="card-content">
                    <div class="settings-action-item">
                        <div>
                            <strong>Export Data</strong>
                            <p>Download all your transactions and goals as a JSON file.</p>
                        </div>
                        <button class="btn btn-primary-outline" data-action="export-data">${icons.download} Export</button>
                    </div>
                    <div class="danger-zone-item settings-action-item">
                         <div>
                            <strong>Clear All Data</strong>
                            <p>This will permanently delete all your transactions, goals, and settings. This cannot be undone.</p>
                        </div>
                        <button class="btn btn-danger-outline" data-action="clear-data">${icons.dataClear} Clear Data</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};


const renderApp = () => {
    if (state.isAppLoading) return;
    const appShell = getEl('app-shell');
    if (!appShell) return;

    if (!state.hasOnboarded) {
        appShell.innerHTML = renderLandingView();
        return;
    }
    
    appShell.className = ` ${state.isSidebarOpen ? 'sidebar-open' : ''}`;
    
    const views = {
        'dashboard': renderDashboardView,
        'co-pilot': renderCoPilotView,
        'settings': renderSettingsView,
        'landing': renderLandingView
    };

    const mainContent = `
        ${renderSidebar()}
        <div id="sidebar-overlay" data-action="toggle-sidebar"></div>
        <div class="main-content-wrapper">
            ${renderHeader()}
            <main class="main-view">
                ${views[state.currentView]()}
            </main>
        </div>
    `;

    appShell.innerHTML = mainContent;

    if (state.currentView === 'dashboard') {
        updateCharts();
    }
    
    // Auto-resize text areas
    document.querySelectorAll<HTMLElement>('[data-action="resize-textarea"]').forEach(el => {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    });

};

// --- CHARTS ---

const updateCharts = () => {
    const summary = calculateSummary(state.dashboardPeriod);
    renderDashboardPieChart(summary.expenseByCategory);
    renderTrendLineChart(state.dashboardPeriod);
};

const renderDashboardPieChart = (expenseByCategory: { [key: string]: number }) => {
    const chartContainer = getEl('dashboard-chart-container');
    const chartEl = getEl('dashboard-chart') as HTMLCanvasElement;
    if (!chartEl || !chartContainer) return;

    if (Object.keys(expenseByCategory).length === 0) {
        chartContainer.innerHTML = `<div class="empty-state small">
            <div class="empty-state-icon">${icons.budget}</div>
            <h4>No spending data yet</h4>
            <p>Add some expense transactions for this period to see your spending breakdown.</p>
        </div>`;
        return;
    }
    
    const chartData = Object.entries(expenseByCategory).sort(([, a], [, b]) => b - a);
    const labels = chartData.map(([category]) => category);
    const data = chartData.map(([, amount]) => amount);
    
    const chartColors = ['#D4AF37', '#4682B4', '#FFA726', '#D32F2F', '#64B5F6', '#663399', '#8FBC8F', '#20B2AA'];

    if (dashboardChart) {
        dashboardChart.destroy();
    }
    dashboardChart = new Chart(chartEl, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Spending',
                data: data,
                backgroundColor: chartColors,
                borderColor: getComputedStyle(document.body).getPropertyValue('--color-bg-surface'),
                borderWidth: 4,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--color-text-secondary'),
                        padding: 15,
                        boxWidth: 12,
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatCurrency(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
};

const renderTrendLineChart = (periodDays: number) => {
    const chartContainer = getEl('trend-chart-container');
    const chartEl = getEl('trend-chart') as HTMLCanvasElement;
    if (!chartEl || !chartContainer) return;

    const allDates = new Set<string>();
    const incomeByDate: { [key: string]: number } = {};
    const expenseByDate: { [key: string]: number } = {};

    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(new Date().setDate(now.getDate() - (periodDays)));
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        allDates.add(dateStr);
        incomeByDate[dateStr] = 0;
        expenseByDate[dateStr] = 0;
    }
    
    const relevantTransactions = state.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
    });
    
    if (relevantTransactions.length === 0) {
        chartContainer.innerHTML = `<div class="empty-state small">
            <div class="empty-state-icon">${icons.transactions}</div>
            <h4>No transaction data</h4>
            <p>Track some income and expenses to see your financial trends over time.</p>
        </div>`;
        if (trendChart) trendChart.destroy();
        return;
    }

    relevantTransactions.forEach(t => {
        const dateStr = t.date.split('T')[0];
        if (t.type === 'income') {
            incomeByDate[dateStr] = (incomeByDate[dateStr] || 0) + t.amount;
        } else {
            expenseByDate[dateStr] = (expenseByDate[dateStr] || 0) + t.amount;
        }
    });

    const sortedDates = Array.from(allDates).sort();

    const chartLabels = sortedDates.map(dateStr => formatDate(dateStr, { month: 'short', day: 'numeric'}));
    const incomeData = sortedDates.map(date => incomeByDate[date]);
    const expenseData = sortedDates.map(date => expenseByDate[date]);

    if (trendChart) {
        trendChart.destroy();
    }
    trendChart = new Chart(chartEl, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: 'rgba(var(--color-success-rgb), 1)',
                    backgroundColor: 'rgba(var(--color-success-rgb), 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    borderColor: 'rgba(var(--color-error-rgb), 1)',
                    backgroundColor: 'rgba(var(--color-error-rgb), 0.1)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--color-text-secondary'),
                        callback: (value) => typeof value === 'number' ? formatCurrency(value) : value
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--color-border')
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--color-text-secondary')
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                     labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--color-text-secondary'),
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                    }
                }
            }
        }
    });
};

// --- STATE & EVENT HANDLING ---

const saveState = () => {
    try {
        const stateToSave = { ...state };
        delete (stateToSave as any).financialHealth; // Don't persist this
        localStorage.setItem('cravourAppState', JSON.stringify(stateToSave));
    } catch (e) {
        console.error("Could not save state to localStorage", e);
    }
};

const loadState = () => {
    try {
        const savedState = localStorage.getItem('cravourAppState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            Object.assign(state, parsedState);
            // Re-initialize non-persistent state
            state.financialHealth = null;
            state.isAppLoading = true;
            state.isCoPilotLoading = false;
        }
    } catch (e) {
        console.error("Could not load state from localStorage", e);
        // If loading fails, reset to a default state to avoid being stuck
        state.hasOnboarded = false;
    }
};

const handleEvent = async (e: Event) => {
    const target = e.target as HTMLElement;
    const actionTarget = target.closest('[data-action]');
    if (!actionTarget) return;

    const action = actionTarget.getAttribute('data-action');
    const id = actionTarget.getAttribute('data-id');
    const view = actionTarget.getAttribute('data-view');
    const tab = actionTarget.getAttribute('data-tab');

    switch (action) {
        case 'navigate':
            e.preventDefault();
            if (view) {
                state.currentView = view as any;
                if(state.isSidebarOpen && window.innerWidth < 992) {
                    state.isSidebarOpen = false;
                }
                if (view === 'dashboard' && !state.financialHealth) {
                    await Promise.all([getFinancialHealthScore(), getAIPriorities()]);
                } else if (view === 'co-pilot' && state.aiQuickInsights.length <= 3) {
                    await getAIQuickInsights();
                }
                renderApp();
            }
            break;
        case 'toggle-sidebar':
            state.isSidebarOpen = !state.isSidebarOpen;
            // Directly toggle the class on the shell for a huge performance boost.
            // This avoids re-rendering the entire DOM for a simple sidebar toggle.
            getEl('app-shell')?.classList.toggle('sidebar-open', state.isSidebarOpen);
            break;
        case 'start-onboarding':
            e.preventDefault();
            // Bypass the modal-based onboarding for a smoother user experience.
            state.hasOnboarded = true;
            state.currentView = 'dashboard';
            
            // Render the dashboard view immediately
            renderApp();
        
            // After rendering, show a welcome message and fetch initial data
            showToast(`Welcome! Let's add your first transaction to get started.`, 'ai', 5000);
            await Promise.all([getFinancialHealthScore(), getAIPriorities()]);
            renderApp(); // Re-render with fetched data
            
            // Save the fact that the user is now onboarded
            saveState();
            break;
        case 'onboarding-next':
        case 'onboarding-prev':
            if (state.onboardingState) {
                const { step } = state.onboardingState;
                if (step === 2) {
                    const nameInput = getEl('onboarding-name') as HTMLInputElement;
                    state.onboardingState.userName = nameInput.value.trim();
                    if (action === 'onboarding-next' && !state.onboardingState.userName) {
                        return showToast("Please enter your name.", "error");
                    }
                }
                if (step === 3) {
                     const goalNameInput = getEl('onboarding-goal-name') as HTMLInputElement;
                     const goalAmountInput = getEl('onboarding-goal-amount') as HTMLInputElement;
                     state.onboardingState.goalName = goalNameInput.value.trim();
                     state.onboardingState.goalAmount = goalAmountInput.value;
                     if (action === 'onboarding-next' && (!state.onboardingState.goalName || !state.onboardingState.goalAmount)) {
                        return showToast("Please fill out your goal details.", "error");
                    }
                }
                state.onboardingState.step += (action === 'onboarding-next' ? 1 : -1);
                renderOnboardingModal();
            }
            break;
        case 'complete-onboarding':
            if (state.onboardingState) {
                state.userName = state.onboardingState.userName;
                const goalAmountNum = parseFloat(state.onboardingState.goalAmount);
                if (state.onboardingState.goalName && !isNaN(goalAmountNum) && goalAmountNum > 0) {
                    state.goals.push({
                        id: generateId('goal'),
                        name: state.onboardingState.goalName,
                        targetAmount: goalAmountNum,
                        savedAmount: 0
                    });
                }
                state.hasOnboarded = true;
                state.currentView = 'dashboard';
                state.onboardingState = null;
                closeModal('onboarding-modal');
                await Promise.all([getFinancialHealthScore(), getAIPriorities()]);
                renderApp();
            }
            break;
        case 'add-transaction': renderTransactionModal(); break;
        case 'scan-receipt': renderScanReceiptModal(); break;
        case 'add-goal': renderGoalModal(); break;
        case 'add-budget': renderBudgetModal(); break;
        case 'add-recurring-transaction': renderRecurringTransactionModal(); break;
        
        case 'close-modal':
            closeModal();
            break;
            
        case 'save-transaction': {
            e.preventDefault();
            const form = target.closest('form') as HTMLFormElement;
            const formData = new FormData(form);
            const transactionId = form.dataset.id!;
            const transaction: Transaction = {
                id: transactionId,
                type: formData.get('type') as 'income' | 'expense',
                description: formData.get('description') as string,
                amount: parseFloat(formData.get('amount') as string),
                category: formData.get('category') as string,
                date: new Date(formData.get('date') as string).toISOString()
            };

            const existingIndex = state.transactions.findIndex(t => t.id === transactionId);
            if (existingIndex > -1) {
                state.transactions[existingIndex] = transaction;
            } else {
                state.transactions.push(transaction);
            }
            sortTransactions();
            closeModal();
            showToast("Transaction saved!", 'success');
            await getFinancialHealthScore(); // Refresh score after transaction
            renderApp();
            break;
        }

        case 'change-transaction-type':
        case 'change-recurring-transaction-type': {
            const form = target.closest('form');
            if (!form) return;
            const type = (target as HTMLInputElement).value;
            const categorySelect = form.querySelector('select[name="category"]') as HTMLSelectElement;
            const categories = transactionCategories[type as 'income' | 'expense'];
            categorySelect.innerHTML = `<option value="">Select a category</option>${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}`;
            break;
        }

        case 'edit-transaction': {
            const transaction = state.transactions.find(t => t.id === id);
            if (transaction) renderTransactionModal(transaction);
            break;
        }
        case 'edit-goal': {
            const goal = state.goals.find(g => g.id === id);
            if(goal) renderGoalModal(goal);
            break;
        }
        case 'edit-budget': {
            const category = actionTarget.getAttribute('data-category');
            if(category && state.budgets[category]) {
                renderBudgetModal({ category, amount: state.budgets[category] });
            }
            break;
        }
        case 'edit-recurring-transaction': {
            const tx = state.recurringTransactions.find(t => t.id === id);
            if(tx) renderRecurringTransactionModal(tx);
            break;
        }

        case 'delete-item': {
            const itemId = actionTarget.getAttribute('data-id')!;
            const itemType = actionTarget.getAttribute('data-type')!;
            const itemName = actionTarget.getAttribute('data-name')!;
            renderDeleteConfirmationModal(itemId, itemType, itemName);
            break;
        }
        
        case 'confirm-delete': {
            const itemId = actionTarget.getAttribute('data-item-id')!;
            const itemType = actionTarget.getAttribute('data-item-type')!;
            
            let itemName = '';
            let itemWasDeleted = false;
            
            if (itemType === 'transaction') {
                const index = state.transactions.findIndex(t => t.id === itemId);
                if (index > -1) {
                    itemName = state.transactions[index].description;
                    state.transactions.splice(index, 1);
                    itemWasDeleted = true;
                }
            } else if (itemType === 'goal') {
                const index = state.goals.findIndex(g => g.id === itemId);
                if (index > -1) {
                    itemName = state.goals[index].name;
                    state.goals.splice(index, 1);
                    itemWasDeleted = true;
                }
            } else if (itemType === 'budget') {
                if (state.budgets[itemId]) {
                    itemName = `budget for ${itemId}`;
                    delete state.budgets[itemId];
                    itemWasDeleted = true;
                }
            } else if (itemType === 'recurringTransaction') {
                const index = state.recurringTransactions.findIndex(t => t.id === itemId);
                 if (index > -1) {
                    itemName = state.recurringTransactions[index].description;
                    state.recurringTransactions.splice(index, 1);
                    itemWasDeleted = true;
                }
            } else if (itemType === 'All Data') {
                // Reset state to default
                Object.assign(state, {
                    transactions: [],
                    recurringTransactions: [],
                    currentView: 'landing',
                    chatHistory: [],
                    isCoPilotLoading: false,
                    hasOnboarded: false,
                    onboardingState: null,
                    financialHealth: null,
                    budgets: {},
                    goals: [],
                    priorities: [],
                    userName: 'Guest',
                });
                itemWasDeleted = true;
                itemName = 'All application data';
            }
            
            if (itemWasDeleted) {
                closeModal('delete-confirmation-modal');
                renderApp();
                showToast(`Deleted "${itemName}"`, 'success');
            } else {
                 showToast('Item not found for deletion.', 'error');
            }
            break;
        }

        case 'save-goal': {
            e.preventDefault();
            const form = target.closest('form') as HTMLFormElement;
            const formData = new FormData(form);
            const goalId = form.dataset.id!;
            const goal: Goal = {
                id: goalId,
                name: formData.get('name') as string,
                targetAmount: parseFloat(formData.get('targetAmount') as string),
                savedAmount: 0
            };
            const existingIndex = state.goals.findIndex(g => g.id === goalId);
            if (existingIndex > -1) {
                goal.savedAmount = state.goals[existingIndex].savedAmount; // Preserve saved amount
                state.goals[existingIndex] = goal;
            } else {
                goal.savedAmount = parseFloat(formData.get('savedAmount') as string) || 0;
                state.goals.push(goal);
            }
            closeModal();
            renderApp();
            showToast("Goal saved!", 'success');
            break;
        }
        case 'contribute-goal': {
            const goal = state.goals.find(g => g.id === id);
            if(goal) renderContributeToGoalModal(id!);
            break;
        }
        case 'save-goal-contribution': {
             e.preventDefault();
            const form = target.closest('form') as HTMLFormElement;
            const goalId = form.dataset.id!;
            const amount = parseFloat((form.querySelector('input[name="amount"]') as HTMLInputElement).value);
            const goal = state.goals.find(g => g.id === goalId);
            if (goal && !isNaN(amount) && amount > 0) {
                goal.savedAmount += amount;
                closeModal();
                renderApp();
                showToast(`Added ${formatCurrency(amount)} to your goal!`, 'success');
            } else {
                showToast("Invalid contribution amount.", "error");
            }
            break;
        }
        
        case 'save-budget': {
            e.preventDefault();
            const form = target.closest('form') as HTMLFormElement;
            const formData = new FormData(form);
            const category = formData.get('category') as string;
            const amount = parseFloat(formData.get('amount') as string);
            if (category && !isNaN(amount)) {
                state.budgets[category] = amount;
                closeModal();
                renderApp();
                showToast(`Budget for ${category} saved!`, 'success');
            } else {
                showToast("Please provide a valid category and amount.", "error");
            }
            break;
        }
        case 'get-ai-budget-suggestions':
            renderAIBudgetModal(); // open modal first to show loading state
            getAIBudgetSuggestions();
            break;
        case 'apply-ai-suggestions': {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            let appliedCount = 0;
            for(const [category, amountStr] of formData.entries()) {
                const amount = parseFloat(amountStr as string);
                if (!isNaN(amount)) {
                    state.budgets[category] = amount;
                    appliedCount++;
                }
            }
            closeModal();
            renderApp();
            showToast(`Applied ${appliedCount} budget suggestions!`, 'success');
            break;
        }
        case 'save-recurring-transaction': {
            e.preventDefault();
            const form = target.closest('form') as HTMLFormElement;
            const formData = new FormData(form);
            const rtxnId = form.dataset.id!;
            const rtxn: RecurringTransaction = {
                id: rtxnId,
                type: formData.get('type') as 'income' | 'expense',
                description: formData.get('description') as string,
                amount: parseFloat(formData.get('amount') as string),
                category: formData.get('category') as string,
                frequency: formData.get('frequency') as Frequency,
                nextDueDate: new Date(formData.get('nextDueDate') as string).toISOString()
            };

            const existingIndex = state.recurringTransactions.findIndex(t => t.id === rtxnId);
            if (existingIndex > -1) {
                state.recurringTransactions[existingIndex] = rtxn;
            } else {
                state.recurringTransactions.push(rtxn);
            }
            closeModal();
            renderApp();
            showToast("Recurring transaction saved!", 'success');
            break;
        }

        case 'capture-receipt': {
            const video = getEl('camera-feed') as HTMLVideoElement;
            const loader = getEl('camera-loader');
            if (loader) loader.style.display = 'flex';

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');
            
            stopCamera();
            const transactionData = await analyzeReceipt(imageData);
            if (loader) loader.style.display = 'none';
            closeModal('scan-receipt-modal');

            if(transactionData) {
                renderTransactionModal(transactionData);
            }
            break;
        }

        case 'copilot-submit': {
            handleCoPilotSubmit();
            break;
        }
        
        case 'quick-insight': {
            const prompt = actionTarget.getAttribute('data-prompt');
            if (prompt) handleCoPilotSubmit(prompt);
            break;
        }

        case 'get-ai-priorities':
            await getAIPriorities();
            renderApp();
            break;
        
        case 'toggle-priority': {
            const priority = state.priorities.find(p => p.id === id);
            if (priority) {
                priority.completed = !priority.completed;
                renderApp();
            }
            break;
        }

        case 'set-dashboard-period':
            const period = parseInt(actionTarget.getAttribute('data-period')!, 10);
            if (period && state.dashboardPeriod !== period) {
                state.dashboardPeriod = period as DashboardPeriod;
                await getFinancialHealthScore();
                renderApp();
            }
            break;
            
        case 'set-dashboard-tab':
            e.preventDefault();
            if (tab && state.dashboardTab !== tab) {
                state.dashboardTab = tab as DashboardTab;
                renderApp();
            }
            break;

        case 'toggle-transaction-filters':
            state.showTransactionFilters = !state.showTransactionFilters;
            renderApp();
            break;

        case 'filter-transactions': {
            const name = (target as HTMLInputElement).name;
            const value = (target as HTMLInputElement).value;
            if (name in state.transactionFilters) {
                (state.transactionFilters as any)[name] = value;
                renderApp();
            }
            break;
        }

        case 'save-username': {
            const input = getEl('settings-username') as HTMLInputElement;
            const newName = input.value.trim();
            if (newName) {
                state.userName = newName;
                renderApp();
                showToast("Username updated!", 'success');
            } else {
                showToast("Username cannot be empty.", "error");
            }
            break;
        }
        
        case 'set-theme': {
            const newTheme = (target as HTMLInputElement).value;
            state.theme = newTheme as any;
            applyTheme();
            renderApp(); // To re-render checkmarks etc.
            break;
        }

        case 'export-data': {
            const dataStr = JSON.stringify({
                transactions: state.transactions,
                goals: state.goals,
                budgets: state.budgets,
                recurringTransactions: state.recurringTransactions
            }, null, 2);
            const dataBlob = new Blob([dataStr], {type: "application/json"});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cravour-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            showToast("Data exported.", 'success');
            break;
        }
        
        case 'clear-data':
            renderDeleteConfirmationModal('all-data', 'All Data', 'This will wipe everything.');
            break;

        case 'resize-textarea': {
            const textarea = e.target as HTMLTextAreaElement;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
            break;
        }
        case 'close-toast': {
            (e.target as HTMLElement).closest('.toast')?.remove();
            break;
        }
    }
    
    // Don't save state on every single event, but on meaningful ones.
    const actionsThatSaveState = [
        'save-transaction', 'confirm-delete', 'save-goal', 'save-budget', 'save-goal-contribution',
        'complete-onboarding', 'apply-ai-suggestions', 'save-recurring-transaction', 'toggle-priority', 'set-theme', 'save-username'
    ];
    if (actionsThatSaveState.includes(action!)) {
        saveState();
    }
};

const applyTheme = () => {
    let themeToApply = state.theme;
    if (themeToApply === 'system') {
        themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.body.dataset.theme = themeToApply;
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeToApply === 'dark' ? '#121212' : '#FDFDFD');
    }
};

const checkRecurringTransactions = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let transactionsAdded = 0;

    state.recurringTransactions.forEach(rtxn => {
        const dueDate = new Date(rtxn.nextDueDate);
        if (dueDate.toISOString().split('T')[0] <= todayStr) {
            // Add as a new transaction
            state.transactions.push({
                id: generateId('txn-recurring'),
                description: `(Recurring) ${rtxn.description}`,
                amount: rtxn.amount,
                date: rtxn.nextDueDate,
                type: rtxn.type,
                category: rtxn.category,
            });
            transactionsAdded++;

            // Calculate next due date
            const newDueDate = new Date(rtxn.nextDueDate);
            switch (rtxn.frequency) {
                case 'daily': newDueDate.setDate(newDueDate.getDate() + 1); break;
                case 'weekly': newDueDate.setDate(newDueDate.getDate() + 7); break;
                case 'monthly': newDueDate.setMonth(newDueDate.getMonth() + 1); break;
                case 'yearly': newDueDate.setFullYear(newDueDate.getFullYear() + 1); break;
            }
            rtxn.nextDueDate = newDueDate.toISOString();
        }
    });

    if (transactionsAdded > 0) {
        sortTransactions();
        showToast(`Added ${transactionsAdded} recurring transaction(s) to your history.`, 'info');
        renderApp();
        saveState();
    }
    lastRecurringCheckTimestamp = now.getTime();
};

const setupEventListeners = () => {
    document.body.addEventListener('click', handleEvent);
    document.body.addEventListener('submit', handleEvent);
    document.body.addEventListener('change', handleEvent);
    document.body.addEventListener('input', e => {
        const target = e.target as HTMLElement;
        const action = target.getAttribute('data-action');
        if (action === 'filter-transactions' || action === 'resize-textarea') {
            handleEvent(e);
        }
    });
    
    // Handle Enter key for chat
    document.body.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey && (e.target as HTMLElement).id === 'chat-input') {
            e.preventDefault();
            handleCoPilotSubmit();
        }
    });
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if(state.theme === 'system') {
            applyTheme();
        }
    });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // We re-query these on each renderApp, but event listeners need to be attached once
    // A better approach would be to have a stable root element for landing page content
    setTimeout(() => {
        document.querySelectorAll('.feature-row, .testimonial-card, .cta-section').forEach(el => {
           if(el) observer.observe(el);
        });
    }, 500);

};

const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        const onPageLoad = () => {
            const swUrl = new URL('/sw.js', location.origin).toString();
            navigator.serviceWorker
                .register(swUrl)
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        };
        
        if (document.readyState === 'complete') {
            onPageLoad();
        } else {
            window.addEventListener('load', onPageLoad);
        }
    }
};

const initApp = async () => {
    loadState();
    applyTheme();
    initAI();

    if (!API_KEY) {
        getEl('config-banner')?.classList.remove('hidden');
    }
    
    registerServiceWorker();
    setupEventListeners();

    checkRecurringTransactions();
    
    if (state.hasOnboarded) {
        state.isAppLoading = true;
        renderApp(); // Initial render with loaders
        await Promise.all([
            getFinancialHealthScore(),
            getAIPriorities(),
        ]);
    }
    
    state.isAppLoading = false;
    renderApp();
    
    const loader = getEl('app-loader');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 500);
    }
};

initApp();
