import { GoogleGenAI, Chat, Type } from "@google/genai";

// --- SVG Icons ---
const icons = {
    logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 7L12 12L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    coPilot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Zm-2.39.264a.75.75 0 0 0 1.06 1.06l2.122-2.12a.75.75 0 0 0-1.061-1.061L5.11 12.264Zm13.84-.001a.75.75 0 0 0-1.06-1.06l-2.123 2.12a.75.75 0 0 0 1.061 1.061l2.122-2.12ZM12 7.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V8.25A.75.75 0 0 1 12 7.5ZM5.11 7.236a.75.75 0 0 0-1.06 1.06l2.122 2.122a.75.75 0 1 0 1.06-1.06L5.11 7.236Zm13.84-.001a.75.75 0 1 0-1.06-1.06l-2.122 2.122a.75.75 0 0 0 1.06 1.06l2.122-2.122ZM12 16.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z"/></svg>`,
    budgets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.925 5.512a2.25 2.25 0 0 0-2.175-1.762H5.25a2.25 2.25 0 0 0-2.175 1.762l-1.313 7.875A2.25 2.25 0 0 0 3.938 16h16.125a2.25 2.25 0 0 0 2.175-2.613l-1.313-7.875ZM5.25 5.25h13.5c.31 0 .59.167.737.438l1.313 7.875a.75.75 0 0 1-.725.887H3.938a.75.75 0 0 1-.725-.887l1.313-7.875A.75.75 0 0 1 5.25 5.25Z"/><path d="M10 10.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z M18 8.625a.75.75 0 0 0-1.5 0V11a.75.75 0 0 0 1.5 0V8.625Z"/><path d="M4.5 17.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"/></svg>`,
    marketplace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.762.724-1.858 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.858-2.071l-1.263-12A1.875 1.875 0 0 0 18.487 6.75H16.5V6a4.5 4.5 0 1 0-9 0ZM15 6V5.25A2.25 2.25 0 0 0 12.75 3 2.25 2.25 0 0 0 10.5 5.25V6h4.5Z" clip-rule="evenodd" /></svg>`,
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 4.5a3 3 0 0 0-3 3v.75a.75.75 0 0 1-1.5 0v-.75a4.5 4.5 0 0 1 4.5-4.5h3a4.5 4.5 0 0 1 4.5 4.5v3a4.5 4.5 0 0 1-4.5 4.5h-.75a.75.75 0 0 1 0-1.5h.75a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3h-3Z"/><path d="M4.5 13.5a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 0 1-4.5 4.5h-3a4.5 4.5 0 0 1-4.5-4.5v-3a4.5 4.5 0 0 1 4.5-4.5h.75a.75.75 0 0 1 0 1.5H4.5Z"/></svg>`,
    transactions: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 4.533A9.718 9.718 0 0 0 3.25 12a9.718 9.718 0 0 0 7.999 7.467 9.712 9.712 0 0 1 0-14.934ZM12.75 4.533V19.467a9.712 9.712 0 0 1 0-14.934Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>`,
    profile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-1.498.07 6.75 6.75 0 0 0-13.5 0 .75.75 0 0 1-1.498-.07Z" clip-rule="evenodd" /></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.999 1.75a1 1 0 0 1 1 1v1.116a1 1 0 0 0 1.445.894l1.096-.55a1 1 0 0 1 1.213.527l1.25 2.165a1 1 0 0 1-.22 1.316l-.96.96a1 1 0 0 0 0 1.414l.96.96a1 1 0 0 1 .22 1.316l-1.25 2.165a1 1 0 0 1-1.213.527l-1.096-.55a1 1 0 0 0-1.445.894V21.25a1 1 0 0 1-2 0v-1.116a1 1 0 0 0-1.445-.894l-1.096.55a1 1 0 0 1-1.213-.527L4.25 17a1 1 0 0 1 .22-1.316l.96-.96a1 1 0 0 0 0-1.414l-.96-.96a1 1 0 0 1-.22-1.316l1.25-2.165a1 1 0 0 1 1.213.527l1.096.55a1 1 0 0 0 1.445.894V2.75a1 1 0 0 1 1-1ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 .75.75v18.5a.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1 0-1.5h6.75V3.5h-6.75a.75.75 0 0 1-.75-.75Z"/><path d="M9.22 7.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L12.94 12 9.22 8.28a.75.75 0 0 1 0-1.06Z"/><path d="M13.25 12a.75.75 0 0 1-.75-.75V11a.75.75 0 0 1-1.5 0v.25A2.25 2.25 0 0 0 13.25 12Z"/><path d="M2.75 12a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8a.75.75 0 0 1-.75-.75Z"/></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/><path d="M12 2.75a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V3.5a.75.75 0 0 1 .75-.75ZM18.25 6.5a.75.75 0 0 1 .75.75l-.001.001 2.121 2.121a.75.75 0 0 1-1.06 1.06l-2.122-2.12a.75.75 0 0 1 .312-1.812ZM21.25 12a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1a.75.75 0 0 1 .75.75ZM18.664 18.664a.75.75 0 1 1-1.06-1.06l2.12-2.122a.75.75 0 0 1 1.06 1.06l-2.12 2.122ZM12 21.25a.75.75 0 0 1-.75-.75v-1a.75.75 0 0 1 1.5 0v1a.75.75 0 0 1-.75-.75ZM5.336 18.664a.75.75 0 1 1 1.06-1.06l-2.12-2.122a.75.75 0 0 1-1.06 1.06l2.12 2.122ZM2.75 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75ZM5.336 5.336a.75.75 0 1 1-1.06 1.06L2.154 4.274a.75.75 0 0 1 1.06-1.06L5.336 5.336Z"/></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.75 16.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z"/><path fill-rule="evenodd" d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.25 10.25 0 0 0 12 1.75ZM3.25 12a8.75 8.75 0 0 1 5.966-8.395.75.75 0 1 0-.682-1.34A10.25 10.25 0 0 0 1.75 12a10.213 10.213 0 0 0 1.48 5.378.75.75 0 0 0 1.341-.682A8.75 8.75 0 0 1 3.25 12Zm11.859 6.845a.75.75 0 0 0 .682 1.341A10.25 10.25 0 0 0 20.75 12a8.75 8.75 0 0 0-13.916-6.845.75.75 0 1 0-1.341.682A10.25 10.25 0 0 0 15.11 18.845Z"/></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 28.12 28.12 0 0 0 15.283-7.243.75.75 0 0 0 0-1.114A28.12 28.12 0 0 0 3.478 2.404Z"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M16.5 4.75a.75.75 0 0 0-1.5 0V5h-6v-.25a.75.75 0 0 0-1.5 0V5h-1.75a.75.75 0 0 0 0 1.5H7v12.25A2.25 2.25 0 0 0 9.25 21h5.5A2.25 2.25 0 0 0 17 18.75V6.5h1.25a.75.75 0 0 0 0-1.5H16.5ZM9.25 19.5V6.5h5.5V19.5z"/></svg>`,
    insight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.75a.75.75 0 0 1 .75.75V8a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 .75-.75ZM9 11.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"/><path fill-rule="evenodd" d="M12 1.75C6.34 1.75 1.75 6.34 1.75 12s4.59 10.25 10.25 10.25 10.25-4.59 10.25-10.25S17.66 1.75 12 1.75ZM3.25 12a8.75 8.75 0 1 1 17.5 0 8.75 8.75 0 0 1-17.5 0Zm6.5-4.5a.75.75 0 0 0-1.5 0v.518a3.25 3.25 0 0 0-2.583 3.232c0 1.8 1.45 3.25 3.25 3.25h4.167a3.25 3.25 0 0 0 3.25-3.25 3.25 3.25 0 0 0-2.583-3.232V7.5a.75.75 0 0 0-1.5 0v.518A3.235 3.235 0 0 0 12 8.25a3.235 3.235 0 0 0-.917-.232V7.5Z"/></svg>`,
    hamburger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" /></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`,
    pay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a.75.75 0 0 1 .75.75v.001a.75.75 0 0 1-1.5 0V7.5a.75.75 0 0 1 .75-.75ZM12 6.75a.75.75 0 0 1 .75.75v.001a.75.75 0 0 1-1.5 0V7.5a.75.75 0 0 1 .75-.75Zm3.375 0a.75.75 0 0 1 .75.75v.001a.75.75 0 0 1-1.5 0V7.5a.75.75 0 0 1 .75-.75ZM6.75 15.75a.75.75 0 0 1 0-1.5h10.5a.75.75 0 0 1 0 1.5H6.75Z" /></svg>`,
    chevronDoubleLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.47 4.53a.75.75 0 0 0-1.06-1.06L11.94 9l5.47 5.47a.75.75 0 1 0 1.06-1.06L14.06 9l4.41-4.47ZM11.47 4.53a.75.75 0 0 0-1.06-1.06L4.94 9l5.47 5.47a.75.75 0 1 0 1.06-1.06L7.06 9l4.41-4.47Z"/></svg>`,
    chevronDoubleRight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.53 4.53a.75.75 0 0 1 1.06-1.06L12.06 9l-5.47 5.47a.75.75 0 1 1-1.06-1.06L9.94 9 5.53 3.47ZM12.53 4.53a.75.75 0 0 1 1.06-1.06L19.06 9l-5.47 5.47a.75.75 0 1 1-1.06-1.06L16.94 9l-4.41-4.47Z"/></svg>`,
    target: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 19.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" clip-rule="evenodd" /></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6v12A2.25 2.25 0 0 0 3.75 20.25h12.5A2.25 2.25 0 0 0 18.5 18V9.75A2.25 2.25 0 0 0 16.5 8.25Z" /><path d="M22.5 8.25a2.25 2.25 0 0 0-2.25-2.25H18.5V18a2.25 2.25 0 0 0 2.25 2.25H21A1.5 1.5 0 0 0 22.5 18.75V8.25Z" /></svg>`,
    plusCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" /></svg>`,
    history: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clip-rule="evenodd" /></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.109 3.108-1.5-1.5a.75.75 0 0 0-1.06 1.061l2.06 2.06a.75.75 0 0 0 1.06 0l3.609-3.608Z" clip-rule="evenodd" /></svg>`,
};

// --- Nigerian Market Data ---
const CATEGORY_MAP: Record<string, { type: 'needs' | 'wants' | 'goals', name: string }> = {
    // Needs (Essentials)
    "Groceries": { type: 'needs', name: "Groceries" },
    "Transportation": { type: 'needs', name: "Transportation" },
    "Bills & Utilities": { type: 'needs', name: "Bills & Utilities" },
    "Rent/Housing": { type: 'needs', name: "Rent/Housing" },
    "Data & Airtime": { type: 'needs', name: "Data & Airtime" },
    "Health": { type: 'needs', name: "Health" },
    // Wants (Lifestyle)
    "Entertainment": { type: 'wants', name: "Entertainment" },
    "Shopping": { type: 'wants', name: "Shopping" },
    "Other": { type: 'wants', name: "Other" },
    // Goals
    "Savings & Investments": { type: 'goals', name: "Savings & Investments" },
};
const CATEGORIES = Object.keys(CATEGORY_MAP);

const formatNaira = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const sampleExpenses = [
    { id: 1, name: "Bolt ride to VI", category: "Transportation", amount: 4500, date: "2024-07-15" },
    { id: 2, name: "DSTV Subscription", category: "Bills & Utilities", amount: 18500, date: "2024-07-14" },
    { id: 3, name: "Jumia food order", category: "Groceries", amount: 8200, date: "2024-07-12" },
    { id: 4, name: "Airtel Data", category: "Data & Airtime", amount: 5000, date: "2024-07-10" },
    { id: 5, name: "Market run at Balogun", category: "Shopping", amount: 25000, date: "2024-07-08" },
    { id: 6, name: "PiggyVest Savings", category: "Savings & Investments", amount: 35000, date: "2024-07-05" },
    { id: 7, name: "Monthly Rent", category: "Rent/Housing", amount: 150000, date: "2024-07-01" },
];

const sampleBudgets = [
    { category: "Groceries", amount: 75000 },
    { category: "Transportation", amount: 50000 },
    { category: "Entertainment", amount: 40000 },
    { category: "Shopping", amount: 60000 },
    { category: "Rent/Housing", amount: 150000 },
    { category: "Savings & Investments", amount: 50000 },
];

const sampleGoals = [
    { id: 1, name: "Vacation to Ghana", target: 500000, completed: false },
    { id: 2, name: "New MacBook", target: 1200000, completed: false },
];

const sampleDeals = [
    { id: 1, merchantId: 1, merchantName: "Shoprite", productName: "5kg Bag of Rice", price: 8900, category: "Groceries", imageUrl: "https://images.unsplash.com/photo-1586201375765-c124a27544e3?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
    { id: 2, merchantId: 2, merchantName: "Konga", productName: "Infinix Note 40", price: 285000, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
    { id: 3, merchantId: 3, merchantName: "Filmhouse Cinemas", productName: "Weekend Movie Ticket", price: 5000, category: "Entertainment", imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop", location: "Abuja" },
    { id: 4, merchantId: 4, merchantName: "Jumia", productName: "Samsung 32-inch TV", price: 180000, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f82e45?q=80&w=400&auto=format&fit=crop", location: "Port Harcourt" },
    { id: 5, merchantId: 5, merchantName: "Local Market", productName: "Weekly Veggie Box", price: 7500, category: "Groceries", imageUrl: "https://images.unsplash.com/photo-1597362925123-77861d3fbac8?q=80&w=400&auto=format&fit=crop", location: "Ibadan" },
    { id: 6, merchantId: 6, merchantName: "i-Fitness", productName: "Monthly Gym Plan", price: 22000, category: "Health", imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=400&auto=format&fit=crop", location: "Abuja" },
    { id: 7, merchantId: 2, merchantName: "Konga", productName: "Wireless Earbuds", price: 15500, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
];

type ActionModalContent = { type: 'prompt' | 'confirm', title: string, content: string, action: string };
type Notification = { type: 'warning' | 'success', message: string };

class CravourApp {
    private state: {
        theme: 'light' | 'dark';
        isLoggedIn: boolean;
        isMobileMenuOpen: boolean; // For landing page
        isAppMenuOpen: boolean; // For logged-in app
        isSidebarCollapsed: boolean; // For desktop app sidebar
        showAuthModal: boolean;
        authView: 'login' | 'signup';
        accountType: 'personal' | 'business' | null;
        userTypeSelection: 'personal' | 'business';

        // Personal user state
        currentView: string;
        coPilotChat: Chat | null;
        coPilotHistory: { role: 'user' | 'model', parts: { text: string }[], isStreaming?: boolean }[];
        isCoPilotLoading: boolean;
        
        // Budget Period State
        walletBalance: number;
        initialWalletBalance: number;
        periodStartDate: string;
        pastPeriods: any[];
        selectedReportIndex: number | null;

        expenses: any[];
        nextExpenseId: number;
        budgets: any[];
        deals: any[];
        userLocation: string;
        showPaymentModal: boolean;
        dealToPurchase: any | null;
        paymentStep: 'form' | 'processing' | 'success';
        
        cravourPayState: {
            step: 'form' | 'checking' | 'confirming' | 'success';
            message: string;
            canAfford: boolean;
            details: { amount: number; category: string; merchant: string } | null;
        };

        aiInsights: any[];
        isGeneratingInsights: boolean;
        notification: Notification | null;
        
        marketplaceRecommendations: number[];
        marketplaceSearchQuery: string;
        marketplaceFilterCategory: string;
        isGeneratingMarketplaceRecs: boolean;

        financialGoals: any[];
        nextGoalId: number;

        showActionModal: ActionModalContent | null;

        // Business user state
        enterpriseView: string;
        transactions: any[];
        nextTransactionId: number;
        
        // Demo state
        demoChatHistory: { role: 'user' | 'model', parts: { text: string }[], isStreaming?: boolean }[];
        isDemoLoading: boolean;

        ai: GoogleGenAI | null;
    } = {
        theme: 'dark',
        isLoggedIn: false,
        isMobileMenuOpen: false,
        isAppMenuOpen: false,
        isSidebarCollapsed: false,
        showAuthModal: false,
        authView: 'login',
        accountType: null,
        userTypeSelection: 'personal',

        currentView: 'insights',
        coPilotChat: null,
        coPilotHistory: [],
        isCoPilotLoading: false,

        walletBalance: 0,
        initialWalletBalance: 0,
        periodStartDate: '',
        pastPeriods: [],
        selectedReportIndex: null,

        expenses: [],
        nextExpenseId: 1,
        budgets: [],
        deals: [],
        userLocation: "Lagos",
        showPaymentModal: false,
        dealToPurchase: null,
        paymentStep: 'form',
        cravourPayState: {
            step: 'form',
            message: '',
            canAfford: false,
            details: null,
        },

        aiInsights: [],
        isGeneratingInsights: false,
        notification: null,
        
        marketplaceRecommendations: [],
        marketplaceSearchQuery: '',
        marketplaceFilterCategory: 'all',
        isGeneratingMarketplaceRecs: false,

        financialGoals: [],
        nextGoalId: 1,
        
        showActionModal: null,

        enterpriseView: 'dashboard',
        transactions: [],
        nextTransactionId: 1,
        
        demoChatHistory: [],
        isDemoLoading: false,

        ai: null,
    };

    constructor() {
        this.init();
    }

    private setState(newState: Partial<typeof this.state>) {
        Object.assign(this.state, newState);
        this.render();
    }

    private init() {
        if (!process.env.API_KEY) {
            document.getElementById('config-banner')?.classList.remove('hidden');
        } else {
            this.setState({ ai: new GoogleGenAI({ apiKey: process.env.API_KEY }) });
        }

        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) this.setState({ theme: savedTheme });
        
        this.setState({
            demoChatHistory: [
                { 
                    role: 'model', 
                    parts: [{ text: JSON.stringify({type: 'text', payload: { message: "Hello! I'm your AI Budget Assistant. I've analyzed some sample data. Ask me a question, like 'Find a good lunch spot in Lekki for ₦10k?', to see how I can help you spend smarter!" }}) }]
                },
            ]
        });

        document.addEventListener('click', this.handleDelegatedClick.bind(this));
        document.addEventListener('submit', this.handleDelegatedSubmit.bind(this));
        document.addEventListener('input', this.handleDelegatedInput.bind(this));
        document.addEventListener('change', this.handleDelegatedChange.bind(this));


        this.render();
    }

    private scrollToBottom(selector: string) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }

    // --- Event Handlers ---
    private handleDelegatedClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        const actionTarget = target.closest('[data-action]');
        if (!actionTarget) return;

        const action = actionTarget.getAttribute('data-action');
        const view = (actionTarget as HTMLElement).dataset.view;
        
        switch (action) {
            case 'toggle-theme': this.toggleTheme(); break;
            case 'toggle-mobile-menu': this.toggleMobileMenu(); break;
            case 'toggle-app-menu': this.toggleAppMenu(); break;
            case 'toggle-sidebar-collapse': this.toggleSidebarCollapse(); break;
            case 'show-login': this.showAuthModal('login'); break;
            case 'show-signup': this.showAuthModal('signup'); break;
            case 'close-modal': 
                if (this.state.showAuthModal) this.hideAuthModal();
                if (this.state.showPaymentModal) this.hidePaymentModal();
                if (this.state.showActionModal) this.hideActionModal();
                break;
            case 'dismiss-notification': this.setState({ notification: null }); break;
            case 'set-auth-view': this.setAuthView(view as 'login' | 'signup'); break;
            case 'set-account-type': this.setUserTypeSelection(view as 'personal' | 'business'); break;
            case 'logout': this.logout(); break;
            case 'navigate': this.navigate(view as string); break;
            case 'delete-expense': this.deleteExpense(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'delete-goal': this.deleteGoal(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'demo-smart-query': this.handleDemoQuery(null, actionTarget.getAttribute('data-query') || ''); break;
            case 'buy-now': this.handleBuyNow(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'confirm-payment': this.handleConfirmPayment(); break;
            case 'cravour-pay-confirm': this.handleCravourPayConfirm(); break;
            case 'cravour-pay-reset': this.resetCravourPay(); break;
            case 'focus-add-form': this.focusAddForm((actionTarget as HTMLElement).dataset.formId || '', (actionTarget as HTMLElement).dataset.inputId || ''); break;
            case 'show-new-budget-modal': this.showNewBudgetModal(); break;
            case 'show-start-fresh-modal': this.showStartFreshModal(); break;
        }
    }

    private handleDelegatedSubmit(e: SubmitEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        
        switch (form.id) {
            case 'auth-form': this.login(); break;
            case 'demo-chat-form': this.handleDemoQuery(form); break;
            case 'copilot-chat-form': this.handleCoPilotQuery(form); break;
            case 'add-expense-form': this.addExpense(form); break;
            case 'add-budget-form': this.addBudget(form); break;
            case 'add-goal-form': this.addGoal(form); break;
            case 'cravour-pay-form': this.handleCravourPayCheck(form); break;
            case 'action-modal-form': this.handleActionModalSubmit(form); break;
        }
    }
    
    private handleDelegatedInput(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.id === 'marketplace-search-input') {
            this.handleMarketplaceSearch(target.value);
        }
    }

    private handleActionModalSubmit(form: HTMLFormElement) {
        if (!this.state.showActionModal) return;

        switch(this.state.showActionModal.action) {
            case 'confirm-new-budget':
                this.confirmNewBudget(form);
                break;
            case 'confirm-start-fresh':
                this.confirmStartFresh();
                break;
        }
    }
    
    private handleDelegatedChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        if (target.id === 'location-selector' || target.id === 'marketplace-location-filter') {
            this.setState({ userLocation: target.value });
        }
        if (target.id === 'marketplace-category-filter') {
            this.handleMarketplaceFilter(target.value);
        }
    }
    
    // --- App Logic ---
    private toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        this.setState({ theme: newTheme });
    }

    private toggleMobileMenu() {
        this.setState({ isMobileMenuOpen: !this.state.isMobileMenuOpen });
    }

    private toggleAppMenu() {
        this.setState({ isAppMenuOpen: !this.state.isAppMenuOpen });
    }

    private toggleSidebarCollapse() {
        this.setState({ isSidebarCollapsed: !this.state.isSidebarCollapsed });
    }

    private showAuthModal(view: 'login' | 'signup') {
        if(this.state.isMobileMenuOpen) this.toggleMobileMenu();
        this.setState({ showAuthModal: true, authView: view, userTypeSelection: 'personal' });
    }

    private hideAuthModal() {
        this.setState({ showAuthModal: false });
    }

    private setAuthView(view: 'login' | 'signup') {
        if (view) this.setState({ authView: view });
    }

    private setUserTypeSelection(type: 'personal' | 'business') {
        this.setState({ userTypeSelection: type });
    }

    private login() {
        this.setState({
            isLoggedIn: true,
            accountType: this.state.userTypeSelection,
        });

        if (this.state.userTypeSelection === 'personal') {
            if (this.state.authView === 'signup') {
                this.setupNewPersonalAccount();
            } else {
                // For login, we reset to sample data as per current app behavior
                this.setupPersonalAccount();
            }
        } else {
            this.setupBusinessAccount();
        }
        this.hideAuthModal();
    }

    private async updateCoPilotContext() {
        if (!this.state.coPilotChat) return;

        const contextMessage = `SILENT_CONTEXT_UPDATE: Here is the user's latest financial data. Do not acknowledge this message directly in your response. Simply use this information to answer any subsequent questions from the user.
            Wallet Balance: ${formatNaira(this.state.walletBalance)}
            Category Definitions: ${JSON.stringify(CATEGORY_MAP)}
            Location: ${this.state.userLocation}
            Expenses: ${JSON.stringify(this.state.expenses)}
            Budgets: ${JSON.stringify(this.state.budgets)}
            Financial Goals: ${JSON.stringify(this.state.financialGoals)}
            Deals: ${JSON.stringify(this.state.deals)}
        `;
        
        // This silently updates the chat history for the model's context
        await this.state.coPilotChat.sendMessage({ message: contextMessage });
    }

    private setupPersonalAccount() {
        let coPilotChat: Chat | null = null;
        if (this.state.ai) {
            coPilotChat = this.state.ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are Cravour, an expert Nigerian Budget Assistant. Your personality is friendly, savvy, and encouraging.
- ALWAYS respond in a valid JSON format.
- If the user asks for purchasing advice, a deal, or product information, use the 'recommendation' type.
- For all other conversational questions, use the 'text' type.
- Your response MUST follow this schema: { "type": "text" | "recommendation", "payload": object }

- For type="recommendation", the payload schema is:
{
  "summary": "A short, encouraging sentence about the recommendation. Example: 'Yes, you can afford this! Here's a great deal.'",
  "isAffordable": boolean,
  "deal": {
    "productName": "string",
    "merchantName": "string",
    "price": "number",
    "imageUrl": "string"
  }
}
When creating a recommendation, find the best deal from the provided data based on the user's location and query. Check affordability against the user's wallet balance first.

- For type="text", the payload schema is:
{
  "message": "Your conversational answer as a string."
}

- All monetary values are in Nigerian Naira (NGN), use the symbol ₦.
- IMPORTANT: Never mention "SILENT_CONTEXT_UPDATE" or acknowledge receiving data. Just use the data to answer questions.`
                },
            });
        }
        
        const startingWallet = 425000;
        
        this.setState({ 
            currentView: 'insights',
            expenses: [...sampleExpenses],
            walletBalance: startingWallet,
            initialWalletBalance: startingWallet,
            periodStartDate: new Date().toISOString(),
            nextExpenseId: sampleExpenses.length + 1,
            budgets: [...sampleBudgets],
            deals: [...sampleDeals],
            financialGoals: sampleGoals.map(g => ({...g})),
            nextGoalId: sampleGoals.length + 1,
            coPilotChat: coPilotChat,
            coPilotHistory: [
                {
                    role: 'model',
                    parts: [{ text: JSON.stringify({ type: 'text', payload: { message: "Hello! I'm your Cravour AI Co-pilot. How can I help you manage your finances today? You can ask me things like 'How much did I spend on food this month?' or 'Can I afford to buy new shoes?'" }})}]
                }
            ],
            pastPeriods: [],
            selectedReportIndex: null,
            aiInsights: [],
        });
        
        setTimeout(() => {
            this.scrollToBottom('#copilot-chat-messages');
            this.updateCoPilotContext(); // Prime the AI with initial data
            this.generateAIInsights();
        }, 0);
    }

    private setupNewPersonalAccount() {
        let coPilotChat: Chat | null = null;
        if (this.state.ai) {
            coPilotChat = this.state.ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are Cravour, an expert Nigerian Budget Assistant. Your personality is friendly, savvy, and encouraging.
- ALWAYS respond in a valid JSON format.
- If the user asks for purchasing advice, a deal, or product information, use the 'recommendation' type.
- For all other conversational questions, use the 'text' type.
- Your response MUST follow this schema: { "type": "text" | "recommendation", "payload": object }

- For type="recommendation", the payload schema is:
{
  "summary": "A short, encouraging sentence about the recommendation. Example: 'Yes, you can afford this! Here's a great deal.'",
  "isAffordable": boolean,
  "deal": {
    "productName": "string",
    "merchantName": "string",
    "price": "number",
    "imageUrl": "string"
  }
}
When creating a recommendation, find the best deal from the provided data based on the user's location and query. Check affordability against the user's wallet balance first.

- For type="text", the payload schema is:
{
  "message": "Your conversational answer as a string."
}

- All monetary values are in Nigerian Naira (NGN), use the symbol ₦.
- IMPORTANT: Never mention "SILENT_CONTEXT_UPDATE" or acknowledge receiving data. Just use the data to answer questions.`
                },
            });
        }
        
        this.setState({ 
            currentView: 'insights',
            expenses: [],
            walletBalance: 0,
            initialWalletBalance: 0,
            periodStartDate: new Date().toISOString(),
            nextExpenseId: 1,
            budgets: [],
            deals: [...sampleDeals], // Keep deals for the marketplace
            financialGoals: [],
            nextGoalId: 1,
            coPilotChat: coPilotChat,
            coPilotHistory: [
                {
                    role: 'model',
                    parts: [{ text: JSON.stringify({ type: 'text', payload: { message: "Welcome to Cravour! I'm your AI co-pilot. To get started, please set your first monthly budget on the Snapshot page. Once you do, I'll be here to help you track spending and find deals!" }})}]
                }
            ],
            pastPeriods: [],
            selectedReportIndex: null,
            aiInsights: [],
            notification: null,
            marketplaceRecommendations: [],
        });
        
        setTimeout(() => {
            this.updateCoPilotContext(); // Prime the AI with initial empty data
        }, 0);
    }


    private setupBusinessAccount() {
        // For demo, we'll assign the business user to "Konga" (merchantId: 2)
        this.setState({
            enterpriseView: 'dashboard',
            transactions: [], // Start with no transactions
        });
    }
    
    private logout() {
        this.setState({
            isLoggedIn: false,
            accountType: null,
            currentView: 'insights',
            enterpriseView: 'dashboard',
            walletBalance: 0,
            initialWalletBalance: 0,
            expenses: [],
            coPilotHistory: [],
            coPilotChat: null,
            budgets: [],
            deals: [],
            financialGoals: [],
            transactions: [],
            aiInsights: [],
            pastPeriods: [],
            selectedReportIndex: null,
            notification: null,
        });
    }

    private navigate(view: string) {
        if(this.state.isMobileMenuOpen) this.toggleMobileMenu();
        if(this.state.isAppMenuOpen) this.toggleAppMenu();
        
        if (view.startsWith('#')) {
            document.querySelector(view)?.scrollIntoView({ behavior: 'smooth' });
        } else if (this.state.accountType === 'personal') {
            if (view.startsWith('report/')) {
                const reportIndex = parseInt(view.split('/')[1], 10);
                this.setState({ currentView: 'report', selectedReportIndex: reportIndex });
            } else {
                this.setState({ currentView: view, selectedReportIndex: null });
            }

            if (view === 'co-pilot') {
                setTimeout(() => this.scrollToBottom('#copilot-chat-messages'), 0);
            }
            if (view === 'deals') {
                this.generateMarketplaceRecommendations();
            }

        } else if (this.state.accountType === 'business') {
            this.setState({ enterpriseView: view });
        }
    }

    private focusAddForm(formId: string, inputId: string) {
        if (!formId || !inputId) return;
        const form = document.getElementById(formId);
        const input = document.getElementById(inputId);
        if (form && input) {
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => input.focus(), 300);
        }
    }

    // --- Personal Account Logic ---
    private addExpense(form: HTMLFormElement | {name: string, category: string, amount: number, date: string}) {
        let newExpenseData;
        if (form instanceof HTMLFormElement) {
            const formData = new FormData(form);
            newExpenseData = {
                name: formData.get('name') as string,
                category: formData.get('category') as string,
                amount: parseFloat(formData.get('amount') as string),
                date: formData.get('date') as string,
            };
            if (isNaN(newExpenseData.amount) || newExpenseData.amount <= 0) return;
            form.reset();
        } else {
            newExpenseData = form;
        }

        const newExpense = { id: this.state.nextExpenseId, ...newExpenseData };
        this.setState({
            expenses: [newExpense, ...this.state.expenses],
            nextExpenseId: this.state.nextExpenseId + 1,
            walletBalance: this.state.walletBalance - newExpense.amount,
        });
        
        this.generateAIInsights();
        this.updateCoPilotContext();
    }
    
    private deleteExpense(id: number) {
        const expenseToDelete = this.state.expenses.find(exp => exp.id === id);
        if (!expenseToDelete) return;
        
        this.setState({ 
            expenses: this.state.expenses.filter(exp => exp.id !== id),
            walletBalance: this.state.walletBalance + expenseToDelete.amount,
        });
        this.generateAIInsights();
        this.updateCoPilotContext();
    }

    private addBudget(form: HTMLFormElement) {
        const formData = new FormData(form);
        const newBudget = {
            category: formData.get('category') as string,
            amount: parseFloat(formData.get('amount') as string),
        };
        if (!newBudget.category || isNaN(newBudget.amount) || newBudget.amount < 0) return;
        if (this.state.budgets.some(b => b.category === newBudget.category)) return;
        this.setState({ budgets: [...this.state.budgets, newBudget] });
        form.reset();
        this.generateAIInsights();
        this.updateCoPilotContext();
    }
    
    private addGoal(form: HTMLFormElement) {
        const formData = new FormData(form);
        const newGoal = {
            id: this.state.nextGoalId,
            name: formData.get('name') as string,
            target: parseFloat(formData.get('target') as string),
            completed: false,
        };
        if (!newGoal.name || isNaN(newGoal.target) || newGoal.target <= 0) return;
        this.setState({
            financialGoals: [...this.state.financialGoals, newGoal],
            nextGoalId: this.state.nextGoalId + 1,
        });
        form.reset();
        this.generateAIInsights();
        this.updateCoPilotContext();
    }

    private deleteGoal(id: number) {
        this.setState({ financialGoals: this.state.financialGoals.filter(g => g.id !== id) });
        this.generateAIInsights();
        this.updateCoPilotContext();
    }

    private handleBuyNow(dealId: number) {
        const deal = this.state.deals.find(d => d.id === dealId);
        if(deal) {
            this.setState({ showPaymentModal: true, dealToPurchase: deal, paymentStep: 'form' });
        }
    }

    private hidePaymentModal() {
        this.setState({ showPaymentModal: false, dealToPurchase: null });
    }

    private handleConfirmPayment() {
        if (!this.state.dealToPurchase) return;

        this.setState({ paymentStep: 'processing' });
        
        setTimeout(() => {
            // Add to user's expenses (which also deducts from wallet)
            this.addExpense({
                name: this.state.dealToPurchase.productName,
                category: this.state.dealToPurchase.category,
                amount: this.state.dealToPurchase.price,
                date: new Date().toISOString().substring(0, 10),
            });

            // Add to merchant's transactions
            this.addTransaction({
                ...this.state.dealToPurchase,
                customerName: "Demo User", // Hardcoded for demo
                date: new Date().toISOString().substring(0, 10),
                status: 'Completed'
            });

            this.setState({ paymentStep: 'success' });
            setTimeout(() => this.hidePaymentModal(), 1500);
        }, 1000);
    }
    
    private resetCravourPay() {
        this.setState({
            cravourPayState: {
                step: 'form',
                message: '',
                canAfford: false,
                details: null
            }
        });
    }

    private handleCravourPayCheck(form: HTMLFormElement) {
        this.setState({ cravourPayState: { ...this.state.cravourPayState, step: 'checking' } });
        
        const formData = new FormData(form);
        const amount = parseFloat(formData.get('amount') as string);
        const category = formData.get('category') as string;
        const merchant = formData.get('merchant') as string;

        const paymentDetails = { amount, category, merchant };
        const totalWalletBalance = this.state.walletBalance;

        setTimeout(() => {
             if (totalWalletBalance < amount) {
                this.setState({
                    cravourPayState: {
                        step: 'confirming',
                        message: `This purchase of ${formatNaira(amount)} exceeds your available wallet balance of ${formatNaira(totalWalletBalance)}.`,
                        canAfford: false,
                        details: paymentDetails
                    }
                });
                return;
            }
            
            const budget = this.state.budgets.find(b => b.category === category);
            const spent = this.state.expenses
                .filter(e => e.category === category)
                .reduce((sum, e) => sum + e.amount, 0);
            
            let message;
            if (budget) {
                const remainingInCategory = budget.amount - spent;
                if (remainingInCategory >= amount) {
                    message = `You can afford this. It's within your ${category} spending guideline.`;
                } else {
                    message = `You can afford this from your wallet, but it's over your ${category} spending guideline by ${formatNaira(amount - remainingInCategory)}.`;
                }
            } else {
                message = `You can afford this from your wallet. You don't have a spending guideline for ${category}.`;
            }

            this.setState({ 
                cravourPayState: {
                    step: 'confirming',
                    message: message,
                    canAfford: true,
                    details: paymentDetails
                }
            });
        }, 1000);
    }

    private handleCravourPayConfirm() {
        if (!this.state.cravourPayState.details) return;

        const { amount, category, merchant } = this.state.cravourPayState.details;
        
        this.addExpense({
            name: `Payment to ${merchant}`,
            category: category,
            amount: amount,
            date: new Date().toISOString().substring(0, 10),
        });

        this.setState({
            cravourPayState: {
                ...this.state.cravourPayState,
                step: 'success',
            }
        });

        setTimeout(() => this.resetCravourPay(), 2000);
    }
    
    private handleMarketplaceSearch(query: string) {
        this.setState({ marketplaceSearchQuery: query.toLowerCase() });
    }

    private handleMarketplaceFilter(category: string) {
        this.setState({ marketplaceFilterCategory: category });
    }

    // --- Budget Lifecycle Logic ---
    private showNewBudgetModal() {
        const modalContent: ActionModalContent = {
            type: 'prompt',
            title: 'Start a New Budget Period',
            content: `
                <p>To start a fresh budget period, enter your new wallet balance below. Your current period's data will be saved as a report.</p>
                <div class="form-group">
                    <label for="new-budget-amount">New Wallet Balance (NGN)</label>
                    <input type="number" id="new-budget-amount" name="amount" class="input-field" required placeholder="e.g., 500000">
                </div>
            `,
            action: 'confirm-new-budget'
        };
        this.setState({ showActionModal: modalContent });
    }

    private confirmNewBudget(form: HTMLFormElement) {
        const formData = new FormData(form);
        const newBalance = parseFloat(formData.get('amount') as string);

        if (isNaN(newBalance) || newBalance <= 0) return;

        const periodReport = {
            expenses: [...this.state.expenses],
            budgets: [...this.state.budgets],
            financialGoals: [...this.state.financialGoals],
            startDate: this.state.periodStartDate,
            endDate: new Date().toISOString(),
            initialBalance: this.state.initialWalletBalance,
            finalBalance: this.state.walletBalance,
        };

        this.setState({
            pastPeriods: [periodReport, ...this.state.pastPeriods],
            walletBalance: newBalance,
            initialWalletBalance: newBalance,
            expenses: [],
            nextExpenseId: 1,
            periodStartDate: new Date().toISOString(),
            aiInsights: [],
            notification: null,
            marketplaceRecommendations: [], // Reset recommendations
        });
        
        this.hideActionModal();
        
        setTimeout(() => {
            this.generateAIInsights(true); // Generate welcome insights
            this.updateCoPilotContext();
        }, 0);
    }

    private showStartFreshModal() {
        const modalContent: ActionModalContent = {
            type: 'confirm',
            title: 'Are you sure?',
            content: `<p>This will permanently delete all your expenses, budgets, goals, and reports. This action cannot be undone.</p>`,
            action: 'confirm-start-fresh'
        };
        this.setState({ showActionModal: modalContent });
    }
    
    private confirmStartFresh() {
        // Reset to initial demo state
        this.setupNewPersonalAccount();
        this.setState({
            pastPeriods: [],
            selectedReportIndex: null,
        });
        this.hideActionModal();
    }
    
    private hideActionModal() {
        this.setState({ showActionModal: null });
    }
    

    // --- Business Account Logic ---
    private addTransaction(dealData: any) {
        const newTransaction = {
            id: this.state.nextTransactionId,
            ...dealData
        };
        this.setState({
            transactions: [newTransaction, ...this.state.transactions],
            nextTransactionId: this.state.nextTransactionId + 1,
        });
    }
    
    private calculateEnterpriseStats() {
        // For demo, filter transactions for the logged-in merchant ("Konga", merchantId: 2)
        const merchantTransactions = this.state.transactions.filter(t => t.merchantId === 2);
        const totalRevenue = merchantTransactions.reduce((sum, t) => sum + t.price, 0);
        const totalSales = merchantTransactions.length;
        return { totalRevenue, totalSales, transactions: merchantTransactions };
    }

    // --- AI Co-pilot & Insights Logic ---
    private async generateAIInsights(isNewPeriod = false) {
        if (!this.state.ai || this.state.isGeneratingInsights) return;

        this.setState({ isGeneratingInsights: true, notification: null });

        let insightPrompt;
        const financialData = `
            Wallet Balance: ${formatNaira(this.state.walletBalance)}
            Initial Wallet Balance: ${formatNaira(this.state.initialWalletBalance)}
            Category Types: ${JSON.stringify(CATEGORY_MAP)}
            Expenses: ${JSON.stringify(this.state.expenses)}
            Budgets (as spending guidelines): ${JSON.stringify(this.state.budgets)}
            Financial Goals: ${JSON.stringify(this.state.financialGoals)}
        `;

        if (isNewPeriod) {
            insightPrompt = `
                The user has just started a new budget period in Nigeria with a fresh wallet balance. Provide 2-3 short, encouraging, and actionable "welcome" insights to help them start strong.
                - Congratulate them on starting a new cycle.
                - Suggest setting a primary goal for this period.
                - Remind them to log expenses consistently.
                - Frame the insights as if you are a friendly, savvy Nigerian financial assistant. Use Naira (₦).
                Financial Data: New Wallet Balance: ${formatNaira(this.state.walletBalance)}
            `;
        } else {
            insightPrompt = `
                Analyze the following Nigerian user's financial data. Provide 2-3 short, actionable insights AND ONE optional proactive notification if a specific condition is met.
                
                For Insights:
                - Focus on spending velocity against their main wallet balance.
                - Distinguish between 'Essentials' and 'Lifestyle' spending.
                - Compare savings contributions towards financial goals.
                - Frame insights as a friendly, savvy Nigerian financial assistant. Use Naira (₦).

                For Proactive Notification (generate ONLY ONE, if applicable):
                1. Budget Warning: If spending in any category is over 80% of its guideline, create a 'warning' notification. Message should be like: "Heads up! You've used over 80% of your [Category Name] budget."
                2. Goal Achieved: If total savings contributions meet or exceed an uncompleted goal's target, create a 'success' notification. Message should be like: "Congratulations! You've reached your savings goal for '[Goal Name]'!"
                
                Financial Data: ${financialData}
            `;
        }

        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: insightPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            insights: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING, description: "A catchy, short title for the insight." },
                                        advice: { type: Type.STRING, description: "The core piece of advice, 1-2 sentences long." },
                                        type: { type: Type.STRING, description: "Choose from: 'warning', 'suggestion', 'info'."}
                                    },
                                },
                            },
                            notification: {
                                type: Type.OBJECT,
                                description: "An optional, single proactive notification if a specific event is triggered. Leave null if no event is triggered.",
                                nullable: true,
                                properties: {
                                    type: { type: Type.STRING, description: "The type of notification: 'warning' or 'success'." },
                                    message: { type: Type.STRING, description: "The notification message." },
                                    goalId: { type: Type.NUMBER, description: "The ID of the goal if the notification type is 'success'.", nullable: true }
                                }
                            }
                        },
                    },
                },
            });

            const responseText = result.text;
            const parsedResponse = JSON.parse(responseText);
            
            if(parsedResponse.notification) {
                this.setState({ notification: parsedResponse.notification });

                if (parsedResponse.notification.type === 'success' && parsedResponse.notification.goalId) {
                    const updatedGoals = this.state.financialGoals.map(goal => {
                        if(goal.id === parsedResponse.notification.goalId) {
                            return { ...goal, completed: true };
                        }
                        return goal;
                    });
                    this.setState({ financialGoals: updatedGoals });
                }
            }

            if(parsedResponse.insights) {
                this.setState({ aiInsights: parsedResponse.insights, isGeneratingInsights: false });
            } else {
                throw new Error("Invalid format from AI");
            }
        } catch (error) {
            // AI Insight Generation Error: Silently fail and clear insights
            this.setState({ isGeneratingInsights: false, aiInsights: [] }); // Clear insights on error
        }
    }
    
    private async generateMarketplaceRecommendations() {
        if (!this.state.ai || this.state.isGeneratingMarketplaceRecs) return;
        
        this.setState({ isGeneratingMarketplaceRecs: true, marketplaceRecommendations: [] });

        const spendingByCategory: Record<string, number> = {};
        this.state.expenses.forEach(exp => {
            spendingByCategory[exp.category] = (spendingByCategory[exp.category] || 0) + exp.amount;
        });

        const topCategories = Object.entries(spendingByCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

        const prompt = `
            You are an expert Personal Shopper for a Nigerian user. Your goal is to analyze the user's financial data and a list of available deals to find the most relevant and appealing offers for them RIGHT NOW.

            User's Financial Context:
            - Wallet Balance: ${formatNaira(this.state.walletBalance)}
            - Top 3 Spending Categories this month: ${JSON.stringify(topCategories)}
            
            Available Deals:
            ${JSON.stringify(this.state.deals)}

            Based on the context and the available deals, select up to 4 deals that would be most compelling for this user. Prioritize deals that:
            1. Align with their top spending categories.
            2. Are easily affordable given their current wallet balance.
            
            Return your response ONLY as a valid JSON object following this schema. Do not add any extra text or explanation.
        `;

        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            recommendedDealIds: {
                                type: Type.ARRAY,
                                description: "An array of numbers, corresponding to the 'id' of the recommended deals.",
                                items: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            });

            const response = JSON.parse(result.text);
            if (response.recommendedDealIds) {
                this.setState({
                    marketplaceRecommendations: response.recommendedDealIds,
                    isGeneratingMarketplaceRecs: false
                });
            } else {
                throw new Error("Invalid format for marketplace recs");
            }
        } catch (error) {
            // Silently fail, user will just see the full list of deals
            this.setState({ isGeneratingMarketplaceRecs: false, marketplaceRecommendations: [] });
        }
    }


    private async handleDemoQuery(form: HTMLFormElement | null, directQuery?: string) {
        if (this.state.isDemoLoading || !this.state.ai) return;

        let query = '';
        let input: HTMLInputElement | null = null;
        if (form) {
            input = form.querySelector('input') as HTMLInputElement;
            query = input.value.trim();
        } else if (directQuery) {
            query = directQuery;
        }

        if (!query) return;

        const newHistory = [...this.state.demoChatHistory, { role: 'user' as const, parts: [{ text: query }] }];
        this.setState({ demoChatHistory: newHistory, isDemoLoading: true });
        if(input) input.value = '';
        this.scrollToBottom('#demo-chat-messages');
        
        const systemInstruction = `You are demonstrating Cravour, an expert Nigerian Budget Assistant. Your goal is to provide clear, resourceful, and encouraging advice to help users manage their budget. All monetary values are in Nigerian Naira (NGN).
- ALWAYS respond in a valid JSON format.
- If the user asks for purchasing advice, a deal, or product information, use the 'recommendation' type.
- For all other conversational questions, use the 'text' type.
- Your response MUST follow this schema: { "type": "text" | "recommendation", "payload": object }

- For type="recommendation", find the best deal from the provided sample data based on the user's location and query. If no perfect match exists, be creative and create a plausible deal based on the user's request. The payload schema is:
{
  "summary": "A short, encouraging sentence about the recommendation.",
  "isAffordable": true,
  "deal": { "productName": "string", "merchantName": "string", "price": "number", "imageUrl": "string" }
}

- For type="text", the payload schema is: { "message": "Your conversational answer as a string." }

Sample Data:
Budgets: ${JSON.stringify(sampleBudgets)}
Local Deals: ${JSON.stringify(sampleDeals)}`;

        try {
            const stream = await this.state.ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: `Based on the provided data and your instructions, answer the user's question: "${query}"`,
                config: {
                    systemInstruction: systemInstruction,
                }
            });
            
            const streamingMessageIndex = newHistory.length;
            this.setState({
                demoChatHistory: [...newHistory, { role: 'model', parts: [{ text: '' }], isStreaming: true }],
            });
            this.scrollToBottom('#demo-chat-messages');

            let fullResponse = "";
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                const updatedHistory = [...this.state.demoChatHistory];
                updatedHistory[streamingMessageIndex].parts[0].text = fullResponse;
                this.setState({ demoChatHistory: updatedHistory });
                this.scrollToBottom('#demo-chat-messages');
            }

            const finalHistory = [...this.state.demoChatHistory];
            finalHistory[streamingMessageIndex].isStreaming = false;
            this.setState({ demoChatHistory: finalHistory, isDemoLoading: false });

        } catch (error) {
            const errorPayload = { type: 'text', payload: { message: "Sorry, I couldn't process that. The server might be busy." } };
            this.setState({
                demoChatHistory: [...newHistory, { role: 'model' as const, parts: [{ text: JSON.stringify(errorPayload) }] }],
                isDemoLoading: false
            });
            this.scrollToBottom('#demo-chat-messages');
        }
    }
    
    private async handleCoPilotQuery(form: HTMLFormElement) {
        if (this.state.isCoPilotLoading || !this.state.coPilotChat) return;

        const input = form.querySelector('input') as HTMLInputElement;
        const query = input.value.trim();
        if (!query) return;
        
        const historyWithUserMsg = [...this.state.coPilotHistory, { role: 'user' as const, parts: [{ text: query }] }];
        
        this.setState({ coPilotHistory: historyWithUserMsg, isCoPilotLoading: true });
        input.value = '';
        this.scrollToBottom('#copilot-chat-messages');

        try {
            const stream = await this.state.coPilotChat.sendMessageStream({ message: query });
            
            const streamingMessageIndex = historyWithUserMsg.length;
            this.setState({
                coPilotHistory: [...historyWithUserMsg, { role: 'model', parts: [{ text: "" }], isStreaming: true }],
            });
            this.scrollToBottom('#copilot-chat-messages');

            let fullResponse = "";
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                const updatedHistory = [...this.state.coPilotHistory];
                updatedHistory[streamingMessageIndex].parts[0].text = fullResponse;
                this.setState({ coPilotHistory: updatedHistory });
                this.scrollToBottom('#copilot-chat-messages');
            }
            
            const finalHistory = [...this.state.coPilotHistory];
            finalHistory[streamingMessageIndex].isStreaming = false;
            this.setState({ coPilotHistory: finalHistory, isCoPilotLoading: false });

        } catch(error) {
            const errorPayload = { type: 'text', payload: { message: "I encountered an error. Please try again." } };
            this.setState({
                coPilotHistory: [...historyWithUserMsg, { role: 'model' as const, parts: [{text: JSON.stringify(errorPayload) }] }],
                isCoPilotLoading: false
            });
            this.scrollToBottom('#copilot-chat-messages');
        }
    }


    // --- Render Methods ---
    private render() {
        document.body.dataset.theme = this.state.theme;
        document.body.dataset.authState = this.state.isLoggedIn ? 'logged-in' : 'logged-out';
        document.body.classList.toggle('mobile-menu-open', this.state.isMobileMenuOpen);
        document.body.dataset.menuOpen = this.state.isAppMenuOpen ? 'true' : 'false';

        this.renderBySelector('#header-placeholder', this.renderHeader());
        
        if (!this.state.isLoggedIn) {
            this.renderLandingPage();
        } else {
            this.renderAppDashboard();
        }
        
        this.renderAuthModal();
        this.renderPaymentModal();
        this.renderActionModal();
    }
    
    private renderHeader(): string {
        return `
            <header class="header">
                <div class="container header-container">
                    <a href="#" class="header-logo" data-action="navigate" data-view="co-pilot">
                        <span class="logo-svg">${icons.logo}</span>
                        Cravour
                    </a>
                    <nav class="header-nav">
                        <ul class="nav-list">
                            <li><button class="nav-button" data-action="navigate" data-view="#features">Features</button></li>
                            <li><button class="nav-button" data-action="navigate" data-view="#for-merchants">For Merchants</button></li>
                        </ul>
                    </nav>
                    <div class="header-actions">
                        <button class="theme-toggle-btn" data-action="toggle-theme" aria-label="Toggle theme">
                            ${this.state.theme === 'light' ? icons.moon : icons.sun}
                        </button>
                        <button class="btn btn-secondary-outline" data-action="show-login">Log In</button>
                        <button class="btn btn-primary" data-action="show-signup">Get Budget Assistant</button>
                    </div>
                    <button class="mobile-menu-toggle" data-action="toggle-mobile-menu" aria-label="Toggle menu">
                        ${icons.hamburger}
                    </button>
                </div>
            </header>
            ${this.renderMobileMenu()}
        `;
    }

    private renderMobileMenu(): string {
        return `
            <div class="mobile-nav-container ${this.state.isMobileMenuOpen ? 'open' : ''}">
                <div class="mobile-nav-header">
                     <a href="#" class="header-logo" data-action="navigate" data-view="co-pilot">
                        <span class="logo-svg">${icons.logo}</span>
                        Cravour
                    </a>
                    <button class="mobile-menu-close" data-action="toggle-mobile-menu" aria-label="Close menu">
                        ${icons.close}
                    </button>
                </div>
                <div class="mobile-nav-content">
                    <nav>
                        <ul class="mobile-nav-list">
                            <li><button class="nav-button" data-action="navigate" data-view="#features">Features</button></li>
                            <li><button class="nav-button" data-action="navigate" data-view="#for-merchants">For Merchants</button></li>
                        </ul>
                    </nav>
                    <div class="mobile-nav-actions">
                        <button class="btn btn-secondary-outline" data-action="show-login">Log In</button>
                        <button class="btn btn-primary" data-action="show-signup">Get Budget Assistant</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    private renderLandingPage() {
        this.renderBySelector('#hero-container', this.renderInteractiveHero());
        this.renderBySelector('.features-grid', this.renderFeatures());
        this.renderBySelector('#for-merchants-container', this.renderForMerchants());
        this.renderBySelector('.footer .container', this.renderFooter());
    }

    private renderInteractiveHero(): string {
        const smartQueries = ["Find me deals at Shoprite", "How's my 'Chop Money' budget?", "Any deals for a new phone?"];
        return `
            <div class="interactive-hero-grid">
                <div class="hero-content">
                    <h1 class="fade-in">Your AI Budget Assistant for Smarter Spending in Nigeria.</h1>
                    <p class="lead fade-in-delay1">Cravour helps you stay on track with your financial goals. Get personalized advice, track your spending, and make confident decisions with every purchase.</p>
                    <div class="hero-actions fade-in-delay2">
                        <button class="btn btn-primary btn-lg" data-action="show-signup">Get Your Budget Assistant</button>
                    </div>
                </div>
                <div class="chat-container fade-in-delay3">
                    <div class="chat-messages" id="demo-chat-messages">${this.renderChatHistory(this.state.demoChatHistory)}</div>
                    <div class="smart-queries">${smartQueries.map(q => `<button class="smart-query-btn" data-action="demo-smart-query" data-query="${q}">${q}</button>`).join('')}</div>
                    <form class="chat-form" id="demo-chat-form">
                        <input type="text" class="input-field" placeholder="Ask for deals, advice, and more..." required ${this.state.isDemoLoading ? 'disabled' : ''}>
                        <button type="submit" class="btn btn-primary" aria-label="Send message" ${this.state.isDemoLoading ? 'disabled' : ''}>
                            ${this.state.isDemoLoading ? `<div class="spinner"></div>` : `<span class="btn-icon">${icons.send}</span>`}
                        </button>
                    </form>
                </div>
            </div>`;
    }

    private renderRecommendationCard(payload: any): string {
        const { summary, isAffordable, deal } = payload;
        return `
            <div class="ai-message">
                ${summary ? `<p class="recommendation-summary">${summary}</p>` : ''}
                <div class="recommendation-card-container">
                    <div class="recommendation-card" style="--bg-image: url('${deal.imageUrl}')">
                        <div class="recommendation-card-content">
                            <div class="recommendation-card-header">
                                <h4 class="product-name">${deal.productName}</h4>
                                <p class="merchant-name">at ${deal.merchantName}</p>
                            </div>
                            <div class="recommendation-card-footer">
                                <span class="price">${formatNaira(deal.price)}</span>
                                <span class="affordability-tag ${isAffordable ? 'affordable' : 'expensive'}">
                                    ${isAffordable ? 'Affordable' : 'Stretch'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private renderChatHistory(history: { role: 'user' | 'model', parts: { text: string }[], isStreaming?: boolean }[]): string {
        let html = history.map((msg, index) => {
            const textContent = msg.parts[0]?.text || '';
            const isLastMessage = index === history.length - 1;

            if (msg.role === 'model') {
                // If the message is currently streaming, render as plain text.
                if (msg.isStreaming && isLastMessage) {
                    return `<div class="ai-message message">${textContent.replace(/\n/g, '<br>')}</div>`;
                }

                try {
                    // Once streaming is done, try to parse the complete JSON.
                    const parsed = JSON.parse(textContent);
                    if (parsed.type === 'recommendation' && parsed.payload?.deal) {
                        return this.renderRecommendationCard(parsed.payload);
                    }
                    if (parsed.type === 'text' && parsed.payload?.message) {
                        return `<div class="ai-message message">${parsed.payload.message.replace(/\n/g, '<br>')}</div>`;
                    }
                    // Fallback for other valid JSON that doesn't fit the schema, or plain text.
                    return `<div class="ai-message message">${textContent.replace(/\n/g, '<br>')}</div>`;
                } catch (e) {
                    // This catches malformed JSON or plain text after streaming has finished.
                    return `<div class="ai-message message">${textContent.replace(/\n/g, '<br>')}</div>`;
                }
            }
            
            // User message
            return `<div class="user-message message">${textContent.replace(/\n/g, '<br>')}</div>`;
        }).join('');
    
        const isLoading = this.state.isDemoLoading || this.state.isCoPilotLoading;
        if (isLoading && (history.length === 0 || history[history.length - 1]?.role === 'user')) {
             html += `<div class="ai-message message thinking-indicator"><div class="spinner"></div><span>Cravour is thinking...</span></div>`;
        }
        return html;
    }


    private renderFeatures(): string {
         const featuresData = [
            { icon: icons.budgets, title: 'Smart Budgeting', text: 'Create budgets that work for you. Track your spending in Naira and always know where your money is going.' },
            { icon: icons.marketplace, title: 'AI Marketplace', text: 'Discover exclusive offers from Nigerian shops, with personalized recommendations from your AI assistant.' },
            { icon: icons.coPilot, title: 'Proactive AI Insights', text: 'Get automatic, personalized advice to help you stick to your budget and make smarter spending decisions.' },
        ];
        return featuresData.map(f => `<div class="feature-card"><div class="feature-icon">${f.icon}</div><h3>${f.title}</h3><p>${f.text}</p></div>`).join('');
    }

    private renderForMerchants(): string {
       return `
            <div class="for-merchants-content">
                <h2 class="section-title">Partner with Cravour</h2>
                <p class="section-subtitle">Reach motivated Nigerian customers who are actively managing their budgets. Join our network of trusted merchants and grow your business.</p>
                <ul class="merchant-benefits"><li>Attract new, high-intent customers.</li><li>Showcase your products and deals directly to shoppers.</li><li>Receive payments instantly and track your sales.</li></ul>
                <button class="btn btn-primary btn-lg" data-action="show-signup">Partner With Us</button>
            </div>`;
    }
    
    private renderFooter(): string { return `<p>&copy; ${new Date().getFullYear()} Cravour Nigeria. All rights reserved.</p>`; }

    private renderAuthModal() {
        const modal = document.getElementById('auth-modal')!;
        if (this.state.showAuthModal) {
            modal.classList.remove('hidden');
            this.renderBySelector('#auth-form-container', `
                <button class="modal-close-btn" aria-label="Close authentication form" data-action="close-modal">&times;</button>
                <div class="auth-tabs">
                    <button class="auth-tab-btn ${this.state.authView === 'login' ? 'active' : ''}" data-action="set-auth-view" data-view="login">Log In</button>
                    <button class="auth-tab-btn ${this.state.authView === 'signup' ? 'active' : ''}" data-action="set-auth-view" data-view="signup">Sign Up</button>
                </div>
                ${this.state.authView === 'login' ? this.renderLoginForm() : this.renderSignupForm()}
            `);
        } else {
            modal.classList.add('hidden');
        }
    }
    
    private renderLoginForm(): string {
        return `<form id="auth-form" class="auth-form">${this.renderAuthFormFields()} ${this.renderAuthTypeToggle()} <button type="submit" class="btn btn-primary">Log In</button></form>`;
    }

    private renderSignupForm(): string {
        return `<form id="auth-form" class="auth-form"><div class="form-group"><label for="full-name">Full Name</label><input type="text" id="full-name" class="input-field" required></div>${this.renderAuthFormFields()} ${this.renderAuthTypeToggle()} <button type="submit" class="btn btn-primary">Create Account</button></form>`;
    }

    private renderAuthFormFields(): string {
        return `<div class="form-group"><label for="email">Email Address</label><input type="email" id="email" class="input-field" required></div><div class="form-group"><label for="password">Password</label><input type="password" id="password" class="input-field" required></div>`;
    }
    
    private renderAuthTypeToggle(): string {
        const isPersonal = this.state.userTypeSelection === 'personal';
        return `
            <div class="form-group">
                <label>Account Type</label>
                <div class="auth-type-toggle">
                    <button type="button" class="${isPersonal ? 'active' : ''}" data-action="set-account-type" data-view="personal">Personal</button>
                    <button type="button" class="${!isPersonal ? 'active' : ''}" data-action="set-account-type" data-view="business">Business</button>
                </div>
            </div>`;
    }
    
    private renderAppDashboard() {
        this.renderBySelector('#app-dashboard', `
            <div class="app-menu-overlay" data-action="toggle-app-menu"></div>
            ${this.renderSidebar()}
            <main class="main-content">
                ${this.renderAppHeader()}
                <div id="app-view-container">
                    ${this.renderCurrentView()}
                </div>
            </main>
        `);
    }

    private renderAppHeader() {
        const navItem = this.getActiveNavItem();
        return `
            <div class="app-header-mobile">
                 <button class="app-menu-toggle" data-action="toggle-app-menu" aria-label="Open menu">
                    <span class="btn-icon">${icons.hamburger}</span>
                </button>
                <h1 class="app-header-title">${navItem?.label || 'Dashboard'}</h1>
            </div>
        `;
    }

    private renderSidebar(): string {
        const className = `sidebar ${this.state.isSidebarCollapsed ? 'collapsed' : ''} ${this.state.isAppMenuOpen ? 'open' : ''}`;
        return this.renderSidebarBase(className, this.state.accountType === 'personal' ? 'personal' : 'business');
    }

    private renderSidebarBase(className: string, type: 'personal' | 'business'): string {
        const personalNav = [
            { view: 'co-pilot', label: 'AI Co-pilot', icon: 'coPilot' },
            { view: 'insights', label: 'Snapshot', icon: 'insight' },
            { view: 'expenses', label: 'Expenses', icon: 'transactions' },
            { view: 'budgets', label: 'Budgets', icon: 'budgets' },
            { view: 'goals', label: 'Goals', icon: 'target' },
            { view: 'deals', label: 'Marketplace', icon: 'marketplace' },
        ];
        if (this.state.pastPeriods.length > 0) {
            personalNav.push({ view: 'past-reports', label: 'Past Reports', icon: 'history' });
        }
        
        const enterpriseNav = [
            { view: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { view: 'transactions', label: 'Transactions', icon: 'transactions' },
        ];

        const navItems = (type === 'personal' ? personalNav : enterpriseNav).map(item => `
            <li>
                <a href="#" class="nav-link ${this.isActiveView(item.view) ? 'active' : ''}" data-action="navigate" data-view="${item.view}" title="${item.label}">
                    <span class="btn-icon">${icons[item.icon as keyof typeof icons]}</span>
                    <span class="nav-link-text">${item.label}</span>
                </a>
            </li>`).join('');

        return `
            <aside class="${className}">
                <div class="sidebar-header">
                    <a href="#" class="sidebar-logo" data-action="navigate" data-view="${type === 'personal' ? 'co-pilot' : 'dashboard'}">
                        <span class="logo-svg">${icons.logo}</span>
                        <span class="logo-text">Cravour</span>
                    </a>
                    <button class="sidebar-close-btn" data-action="toggle-app-menu" aria-label="Close menu">
                        ${icons.close}
                    </button>
                </div>
                <nav class="nav">
                    <ul class="nav-list">
                        ${navItems}
                    </ul>
                </nav>
                <div class="sidebar-footer">
                     <a href="#" class="nav-link ${this.isActiveView('profile') ? 'active' : ''}" data-action="navigate" data-view="profile" title="Profile">
                        <span class="btn-icon">${icons.profile}</span><span class="nav-link-text">Profile</span>
                     </a>
                     <a href="#" class="nav-link ${this.isActiveView('settings') ? 'active' : ''}" data-action="navigate" data-view="settings" title="Settings">
                        <span class="btn-icon">${icons.settings}</span><span class="nav-link-text">Settings</span>
                     </a>
                     <a href="#" class="nav-link" data-action="logout" title="Logout">
                        <span class="btn-icon">${icons.logout}</span><span class="nav-link-text">Logout</span>
                     </a>
                </div>
                 <div class="sidebar-collapse-toggle-wrapper">
                    <button class="sidebar-collapse-toggle" data-action="toggle-sidebar-collapse" aria-label="${this.state.isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
                        <span class="btn-icon">${this.state.isSidebarCollapsed ? icons.chevronDoubleRight : icons.chevronDoubleLeft}</span>
                    </button>
                </div>
            </aside>
        `;
    }

    private renderBySelector(selector: string, html: string) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = html;
        }
    }
    
    private getActiveNavItem() {
         const personalNav = [
            { view: 'co-pilot', label: 'AI Co-pilot', icon: 'coPilot' },
            { view: 'insights', label: 'Snapshot', icon: 'insight' },
            { view: 'expenses', label: 'Expenses', icon: 'transactions' },
            { view: 'budgets', label: 'Budgets', icon: 'budgets' },
            { view: 'goals', label: 'Goals', icon: 'target' },
            { view: 'deals', label: 'Marketplace', icon: 'marketplace' },
            { view: 'past-reports', label: 'Past Reports', icon: 'history' },
            { view: 'profile', label: 'Profile', icon: 'profile' },
            { view: 'settings', label: 'Settings', icon: 'settings' },
            { view: 'report', label: 'Expense Report', icon: 'history' },
        ];
        const enterpriseNav = [
            { view: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { view: 'transactions', label: 'Transactions', icon: 'transactions' },
            { view: 'profile', label: 'Profile', icon: 'profile' },
            { view: 'settings', label: 'Settings', icon: 'settings' },
        ];
        const navList = this.state.accountType === 'personal' ? personalNav : enterpriseNav;
        return navList.find(item => this.isActiveView(item.view));
    }

    private isActiveView(view: string): boolean {
        if (this.state.accountType === 'personal') {
            return this.state.currentView === view;
        }
        if (this.state.accountType === 'business') {
            return this.state.enterpriseView === view;
        }
        return false;
    }
    
    private renderCurrentView(): string {
        // Handle new user onboarding first
        if (this.state.accountType === 'personal' && this.state.initialWalletBalance === 0 && this.state.walletBalance === 0 && this.state.expenses.length === 0) {
            return this.renderWelcomeOnboardingView();
        }
        
        // Handle end of budget period
        if (this.state.accountType === 'personal' && this.state.walletBalance <= 0 && this.state.initialWalletBalance > 0) {
            return this.renderEndOfPeriodView();
        }

        if (this.state.accountType === 'personal') {
            switch (this.state.currentView) {
                case 'co-pilot': return this.renderCoPilotView();
                case 'insights': return this.renderInsightsView();
                case 'expenses': return this.renderExpensesView();
                case 'budgets': return this.renderBudgetsView();
                case 'goals': return this.renderGoalsView();
                case 'deals': return this.renderMarketplaceView();
                case 'profile': return this.renderProfileView();
                case 'settings': return this.renderSettingsView();
                case 'past-reports': return this.renderPastReportsView();
                case 'report': return this.renderReportView();
                default: return `<h2>Personal View: ${this.state.currentView}</h2>`;
            }
        }
        if (this.state.accountType === 'business') {
             switch (this.state.enterpriseView) {
                case 'dashboard': return this.renderEnterpriseDashboard();
                case 'transactions': return this.renderEnterpriseTransactions();
                case 'profile': return this.renderProfileView();
                case 'settings': return this.renderSettingsView();
                default: return `<h2>Business View: ${this.state.enterpriseView}</h2>`;
            }
        }
        return `<h2>Welcome</h2>`;
    }

    private renderCoPilotView() {
        return `
            <div class="copilot-view">
                <div class="chat-container">
                    <div class="chat-messages" id="copilot-chat-messages">${this.renderChatHistory(this.state.coPilotHistory)}</div>
                    <form class="chat-form" id="copilot-chat-form">
                        <input type="text" class="input-field" placeholder="Ask about your budget, deals, and more..." required ${this.state.isCoPilotLoading ? 'disabled' : ''}>
                        <button type="submit" class="btn btn-primary" aria-label="Send message" ${this.state.isCoPilotLoading ? 'disabled' : ''}>
                             ${this.state.isCoPilotLoading ? `<div class="spinner"></div>` : `<span class="btn-icon">${icons.send}</span>`}
                        </button>
                    </form>
                </div>
            </div>`;
    }
    
    private renderActionableEmptyState(icon: keyof typeof icons, title: string, text: string, buttonText: string, action: string, actionDetail: string): string {
        let buttonAttrs: string;
        let buttonIconHtml = '';

        if (action === 'navigate') {
            buttonAttrs = `data-action="navigate" data-view="${actionDetail}"`;
        } else {
            // Assume it's form focusing
            buttonAttrs = `data-action="focus-add-form" data-form-id="${action}" data-input-id="${actionDetail}"`;
            buttonIconHtml = `<span class="btn-icon">${icons.plusCircle}</span>`;
        }
        
        return `
            <div class="empty-state empty-state-actionable">
                <div class="empty-state-icon">
                    ${icons[icon]}
                </div>
                <h2>${title}</h2>
                <p>${text}</p>
                <button class="btn btn-primary" ${buttonAttrs}>
                    ${buttonIconHtml}
                    <span>${buttonText}</span>
                </button>
            </div>
        `;
    }
    
    private renderExpenseItem(exp: any, isInteractive: boolean): string {
        const categoryClass = exp.category.replace(/[^a-zA-Z0-9]/g, '-');
        const displayDate = new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        return `
            <div class="expense-item">
                <div class="expense-details">
                    <div class="name">${exp.name}</div>
                    <div class="category">
                        <span class="tag ${categoryClass}">${exp.category}</span>
                        <span>&bull;</span>
                        <span class="date">${displayDate}</span>
                    </div>
                </div>
                <div class="expense-amount">${formatNaira(exp.amount)}</div>
                ${isInteractive ? `
                <button class="delete-btn" data-action="delete-expense" data-id="${exp.id}" aria-label="Delete expense">
                    ${icons.trash}
                </button>
                ` : ''}
            </div>
        `;
    }

    private renderExpensesView() {
        const listContent = this.state.expenses.length > 0
            ? this.state.expenses.map(exp => this.renderExpenseItem(exp, true)).join('')
            : this.renderActionableEmptyState(
                'plusCircle',
                "You haven't added any expenses yet.",
                "Log your first transaction to see it here.",
                'Add Your First Expense',
                'add-expense-form',
                'expense-name-input'
            );

        return `
            <div class="expenses-view">
                <div class="view-header">
                    <h1>Expenses</h1>
                    <p class="view-subtitle">Keep a detailed record of all your transactions.</p>
                </div>
                <div class="expenses-view-layout">
                    <div class="card expenses-list-card">
                        <h2>Expense History</h2>
                        <div class="expenses-list-container">${listContent}</div>
                    </div>
                    <div class="card add-expense-card" id="add-expense-form">
                        <h2>Add New Expense</h2>
                        <form>
                            <div class="form-group">
                                <label for="expense-name-input">Description</label>
                                <input type="text" id="expense-name-input" name="name" class="input-field" required placeholder="e.g., Lunch at The Place">
                            </div>
                            <div class="form-group">
                                <label for="expense-amount">Amount (NGN)</label>
                                <input type="number" id="expense-amount" name="amount" class="input-field" required placeholder="e.g., 3500">
                            </div>
                             <div class="form-group">
                                <label for="expense-category">Category</label>
                                <select id="expense-category" name="category" class="input-field" required>
                                    <option value="" disabled selected>Select a category</option>
                                    ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="expense-date">Date</label>
                                <input type="date" id="expense-date" name="date" class="input-field" required value="${new Date().toISOString().substring(0, 10)}">
                            </div>
                            <button type="submit" class="btn btn-primary">Add Expense</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    private renderBudgetsView() {
        const budgetsHtml = this.state.budgets.length > 0
            ? this.state.budgets.map(b => this.renderBudgetCard(b)).join('')
            : this.renderActionableEmptyState(
                'plusCircle',
                "No budgets created yet.",
                "Set spending guidelines for your categories to stay on track.",
                'Create a New Budget',
                'add-budget-form',
                'budget-category-select'
              );

        return `
             <div class="budgets-view">
                <div class="view-header">
                    <h1>Budgets</h1>
                    <p class="view-subtitle">Set and manage your spending guidelines for each category.</p>
                </div>
                <div class="budgets-view-layout">
                     <div class="card">
                        <h2>Your Budgets</h2>
                        <div class="budgets-grid">${budgetsHtml}</div>
                    </div>
                    <div class="card add-budget-card" id="add-budget-form">
                        <h2>Add New Budget</h2>
                        <form>
                            <div class="form-group">
                                <label for="budget-category-select">Category</label>
                                <select id="budget-category-select" name="category" class="input-field" required>
                                    <option value="" disabled selected>Select a category</option>
                                    ${CATEGORIES.filter(c => !this.state.budgets.some(b => b.category === c)).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="budget-amount">Amount (NGN)</label>
                                <input type="number" id="budget-amount" name="amount" class="input-field" required placeholder="e.g., 50000">
                            </div>
                            <button type="submit" class="btn btn-primary">Add Budget</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    private renderBudgetCard(budget: any): string {
        const spent = this.state.expenses.filter(e => e.category === budget.category).reduce((sum, e) => sum + e.amount, 0);
        const remaining = budget.amount - spent;
        const percentage = Math.min((spent / budget.amount) * 100, 100);
        
        let status = 'ok';
        if (percentage > 90) status = 'danger';
        else if (percentage > 70) status = 'warning';
        
        return `
            <div class="budget-card card">
                <div class="budget-card-header">
                    <h3>${budget.category}</h3>
                    <div class="budget-card-total">${formatNaira(budget.amount)}</div>
                </div>
                <div class="budget-progress-bar">
                    <div class="budget-progress-bar-inner status-${status}" style="width: ${percentage}%"></div>
                </div>
                <div class="budget-card-details">
                    <div>
                        <span>Spent</span>
                        <strong>${formatNaira(spent)}</strong>
                    </div>
                     <div>
                        <span>Remaining</span>
                        <strong class="${remaining < 0 ? 'text-danger' : ''}">${formatNaira(remaining)}</strong>
                    </div>
                </div>
            </div>`;
    }

    private renderGoalsView() {
        const goalsHtml = this.state.financialGoals.length > 0
            ? this.state.financialGoals.map(g => this.renderGoalCard(g)).join('')
            : this.renderActionableEmptyState(
                'plusCircle',
                "No financial goals set.",
                "Define what you're saving for, like a vacation or a new phone, and track your progress.",
                'Set a New Goal',
                'add-goal-form',
                'goal-name-input'
            );

        return `
             <div class="goals-view">
                <div class="view-header">
                    <h1>Financial Goals</h1>
                    <p class="view-subtitle">Track your progress towards your long-term savings objectives.</p>
                </div>
                <div class="goals-view-layout">
                     <div class="card">
                        <h2>Your Goals</h2>
                        <div class="goals-grid">${goalsHtml}</div>
                    </div>
                    <div class="card add-goal-card" id="add-goal-form">
                        <h2>Add New Goal</h2>
                        <form>
                             <div class="form-group">
                                <label for="goal-name-input">Goal Name</label>
                                <input type="text" id="goal-name-input" name="name" class="input-field" required placeholder="e.g., New Laptop">
                            </div>
                            <div class="form-group">
                                <label for="goal-target">Target Amount (NGN)</label>
                                <input type="number" id="goal-target" name="target" class="input-field" required placeholder="e.g., 850000">
                            </div>
                            <button type="submit" class="btn btn-primary">Add Goal</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

     private renderGoalCard(goal: any): string {
        const saved = this.state.expenses.filter(e => e.category === "Savings & Investments").reduce((sum, e) => sum + e.amount, 0);
        // In a real app, saved amount would be linked to the specific goal. For demo, we use total savings.
        const percentage = Math.min((saved / goal.target) * 100, 100);
        
        return `
            <div class="goal-card card ${goal.completed ? 'completed' : ''}">
                ${goal.completed ? `<div class="completed-badge"><span class="btn-icon">${icons.checkCircle}</span> Completed</div>` : ''}
                <div class="goal-card-header">
                    <h3>${goal.name}</h3>
                    ${!goal.completed ? `
                     <button class="delete-btn" data-action="delete-goal" data-id="${goal.id}" aria-label="Delete goal">
                        ${icons.trash}
                    </button>
                    ` : ''}
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-bar-inner" style="width: ${percentage}%"></div>
                </div>
                <div class="goal-card-details">
                    <div>
                        <span>Saved</span>
                        <strong>${formatNaira(saved)}</strong>
                    </div>
                     <div>
                        <span>Target</span>
                        <strong>${formatNaira(goal.target)}</strong>
                    </div>
                </div>
            </div>`;
    }
    
    private renderMarketplaceView() {
        const { deals, marketplaceRecommendations, marketplaceSearchQuery, marketplaceFilterCategory } = this.state;
    
        const recommendedDeals = marketplaceRecommendations
            .map(id => deals.find(d => d.id === id))
            .filter(d => d); // Filter out any not found deals

        const otherDeals = deals
            .filter(d => d.productName.toLowerCase().includes(marketplaceSearchQuery) || d.merchantName.toLowerCase().includes(marketplaceSearchQuery))
            .filter(d => marketplaceFilterCategory === 'all' || d.category === marketplaceFilterCategory);
            
        return `
            <div class="marketplace-view">
                <div class="view-header">
                    <h1>Marketplace</h1>
                    <p class="view-subtitle">AI-powered deals, curated just for you.</p>
                </div>

                <div class="recommendations-for-you card">
                    <h2>For You</h2>
                    <p>Based on your spending, you might like these:</p>
                    ${this.state.isGeneratingMarketplaceRecs ? `<div class="spinner-container"><div class="spinner"></div><p>Finding deals...</p></div>` : ''}
                    <div class="recommendations-grid">
                        ${recommendedDeals.length > 0
                            ? recommendedDeals.map(d => this.renderDealCard(d)).join('')
                            : !this.state.isGeneratingMarketplaceRecs ? `<div class="empty-state mini">No specific recommendations right now. Explore all deals below!</div>` : ''
                        }
                    </div>
                </div>

                <div class="marketplace-filters card">
                    <div class="form-group">
                        <label for="marketplace-search-input">Search Deals</label>
                        <input type="search" id="marketplace-search-input" class="input-field" placeholder="Search by product or merchant...">
                    </div>
                    <div class="form-group">
                        <label for="marketplace-category-filter">Filter by Category</label>
                        <select id="marketplace-category-filter" class="input-field">
                            <option value="all">All Categories</option>
                            ${CATEGORIES.map(cat => `<option value="${cat}" ${marketplaceFilterCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                    </div>
                     <div class="form-group">
                        <label for="marketplace-location-filter">Your Location</label>
                        <select id="marketplace-location-filter" class="input-field">
                            ${[...new Set(this.state.deals.map(d => d.location))].map(loc => `<option value="${loc}" ${this.state.userLocation === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="deals-grid">
                    ${otherDeals.length > 0 ? otherDeals.map(d => this.renderDealCard(d)).join('') : '<div class="empty-state">No deals match your search.</div>'}
                </div>
            </div>
        `;
    }

    private renderDealCard(deal: any): string {
        return `
            <div class="deal-card">
                <div class="deal-card-image" style="background-image: url('${deal.imageUrl}')"></div>
                <div class="deal-info">
                    <div class="deal-header">
                        <span class="tag ${deal.category.replace(/[^a-zA-Z0-9]/g, '-')}">${deal.category}</span>
                        <div class="deal-price">${formatNaira(deal.price)}</div>
                    </div>
                    <h3 class="deal-name">${deal.productName}</h3>
                    <p class="deal-merchant">${deal.merchantName}</p>
                </div>
                <div class="deal-card-footer">
                     <button class="btn btn-primary" data-action="buy-now" data-id="${deal.id}">Buy Now</button>
                </div>
            </div>
        `;
    }

    private renderProfileView() { return `<div class="card"><h2>Profile</h2><p>User profile details would be displayed here. This is a placeholder.</p></div>`; }
    
    private renderSettingsView() {
        return `
            <div class="settings-view">
                <div class="view-header">
                    <h1>Settings</h1>
                    <p class="view-subtitle">Manage your application preferences and data.</p>
                </div>
                <div class="card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Start Fresh</h3>
                            <p>Clear all your current transactions, budgets, and goals. This action cannot be undone.</p>
                        </div>
                        <button class="btn btn-danger" data-action="show-start-fresh-modal">Clear All Data</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderPastReportsView() {
        const reportsHtml = this.state.pastPeriods.length > 0
            ? this.state.pastPeriods.map((p, index) => this.renderReportLinkCard(p, index)).join('')
            : this.renderActionableEmptyState(
                'history',
                "No Past Reports",
                "Complete a budget period by spending your wallet balance to generate your first report here.",
                'Back to Snapshot',
                'navigate',
                'insights'
            );

        return `
            <div class="past-reports-view">
                <div class="view-header">
                    <h1>Past Reports</h1>
                    <p class="view-subtitle">Review your spending from previous budget periods.</p>
                </div>
                <div class="past-reports-grid">${reportsHtml}</div>
            </div>
        `;
    }

    private renderReportLinkCard(period: any, index: number) {
        const startDate = new Date(period.startDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
        const endDate = new Date(period.endDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric'});
        const totalSpent = period.initialBalance - period.finalBalance;
        return `
            <a href="#" class="card report-link-card" data-action="navigate" data-view="report/${index}">
                <div class="report-link-date">
                    <span class="btn-icon">${icons.history}</span>
                    <span>${startDate} - ${endDate}</span>
                </div>
                <div class="report-link-summary">
                    <span>Total Spent</span>
                    <strong>${formatNaira(totalSpent)}</strong>
                </div>
            </a>
        `;
    }

    private renderReportView(): string {
        if (this.state.selectedReportIndex === null) return this.renderPastReportsView();
        
        const periodData = this.state.pastPeriods[this.state.selectedReportIndex];
        if (!periodData) return this.renderPastReportsView();
        
        const startDate = new Date(periodData.startDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
        const endDate = new Date(periodData.endDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });

        const totalSpent = periodData.initialBalance - periodData.finalBalance;
        
        return `
            <div class="report-view">
                <div class="view-header report-view-header">
                    <div>
                        <h1>Expense Report</h1>
                        <p class="view-subtitle">For the period: ${startDate} - ${endDate}</p>
                    </div>
                    <button class="btn btn-secondary-outline" data-action="navigate" data-view="past-reports">Back to All Reports</button>
                </div>
                
                <div class="card key-metrics-widget" id="metrics-widget">
                     <div class="metric-item">
                        <div class="metric-title">Starting Balance</div>
                        <div class="metric-value">${formatNaira(periodData.initialBalance)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Total Spent</div>
                        <div class="metric-value spent">${formatNaira(totalSpent)}</div>
                    </div>
                     <div class="metric-item">
                        <div class="metric-title">Ending Balance</div>
                        <div class="metric-value">${formatNaira(periodData.finalBalance)}</div>
                    </div>
                </div>

                <div class="report-details-grid">
                    <div class="card" id="report-needs-widget">
                        ${this.renderSpendingBreakdownWidget('needs', periodData.expenses, periodData.budgets)}
                    </div>
                    <div class="card" id="report-wants-widget">
                        ${this.renderSpendingBreakdownWidget('wants', periodData.expenses, periodData.budgets)}
                    </div>
                     <div class="card" id="report-goals-widget">
                        ${this.renderGoalsProgressWidget(periodData.financialGoals, periodData.expenses)}
                    </div>
                    <div class="card full-span-card" id="report-expenses-widget">
                        <h2>All Transactions From Period</h2>
                        <div class="expenses-list-container">
                            ${periodData.expenses.length > 0
                                ? periodData.expenses.map((exp: any) => this.renderExpenseItem(exp, false)).join('')
                                : `<div class="empty-state mini">No expenses were recorded in this period.</div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private renderWelcomeOnboardingView() {
        return `
            <div class="end-of-period-view">
                <div class="card end-of-period-card">
                    <div class="end-of-period-icon">${icons.wallet}</div>
                    <h2>Welcome to Cravour!</h2>
                    <p>Let's get you set up. Start by creating your first budget. This will be the total amount of funds you have available to spend for this period.</p>
                    <div class="end-of-period-actions">
                        <button class="btn btn-primary" data-action="show-new-budget-modal">Create Your First Budget</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderEndOfPeriodView() {
        const totalSpent = this.state.initialWalletBalance - this.state.walletBalance;
        return `
            <div class="end-of-period-view">
                <div class="card end-of-period-card">
                    <div class="end-of-period-icon">${icons.target}</div>
                    <h2>Budget Period Complete!</h2>
                    <p>You've completed this budget cycle. Let's see how you did and get you ready for the next one.</p>
                    <div class="end-of-period-summary">
                        You spent a total of <strong>${formatNaira(totalSpent)}</strong> from your initial budget of ${formatNaira(this.state.initialWalletBalance)}.
                    </div>
                    <div class="end-of-period-actions">
                        <button class="btn btn-primary" data-action="navigate" data-view="report/0">View Full Report</button>
                        <button class="btn btn-primary" data-action="show-new-budget-modal">Start New Budget Period</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderNotificationBar(): string {
        if (!this.state.notification) return '';

        const { type, message } = this.state.notification;
        const icon = type === 'success' ? icons.checkCircle : icons.insight;

        return `
            <div class="notification-bar type-${type}">
                <div class="notification-content">
                    <span class="btn-icon">${icon}</span>
                    <span>${message}</span>
                </div>
                <button class="notification-dismiss" data-action="dismiss-notification" aria-label="Dismiss notification">
                    ${icons.close}
                </button>
            </div>
        `;
    }

    private renderInsightsView(periodData: any | null = null) {
        const isReportView = !!periodData;
        const walletBalance = isReportView ? periodData.finalBalance : this.state.walletBalance;
        const initialBalance = isReportView ? periodData.initialBalance : this.state.initialWalletBalance;
        const expenses = isReportView ? periodData.expenses : this.state.expenses;
        const budgets = isReportView ? periodData.budgets : this.state.budgets;
        const goals = isReportView ? periodData.financialGoals : this.state.financialGoals;

        const spent = initialBalance - walletBalance;
        const remaining = walletBalance;

        return `
            <div class="insights-view">
                <div class="view-header">
                    <h1>Financial Snapshot</h1>
                    <p class="view-subtitle">Your real-time financial overview for this month.</p>
                </div>
                
                ${!isReportView ? this.renderNotificationBar() : ''}

                <div class="snapshot-grid">
                    <div class="card key-metrics-widget" id="metrics-widget">
                        <div class="metric-item">
                            <div class="metric-title">Monthly Budget</div>
                            <div class="metric-value">${formatNaira(initialBalance)}</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Spent So Far</div>
                            <div class="metric-value spent">${formatNaira(spent)}</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Remaining</div>
                            <div class="metric-value ${remaining > 0 ? 'ok' : 'danger'}">${formatNaira(remaining)}</div>
                        </div>
                    </div>
                    
                    ${!isReportView ? this.renderCravourPayWidget() : ''}

                    <div class="card" id="needs-widget">
                        ${this.renderSpendingBreakdownWidget('needs', expenses, budgets)}
                    </div>
                    <div class="card" id="wants-widget">
                        ${this.renderSpendingBreakdownWidget('wants', expenses, budgets)}
                    </div>
                    <div class="card" id="goals-widget">
                        ${this.renderGoalsProgressWidget(goals, expenses)}
                    </div>

                    ${!isReportView ? this.renderAIInsightsWidget() : ''}
                </div>
            </div>`;
    }

    private renderCravourPayWidget() {
        let content;
        const { step, message, canAfford, details } = this.state.cravourPayState;

        if (step === 'form' || step === 'checking') {
            content = `
                <form id="cravour-pay-form">
                    <div class="form-group">
                        <label for="cravour-pay-amount">Amount</label>
                        <input type="number" id="cravour-pay-amount" name="amount" class="input-field" placeholder="e.g., 15000" required ${step === 'checking' ? 'disabled' : ''}>
                    </div>
                     <div class="form-group">
                        <label for="cravour-pay-category">Category</label>
                        <select id="cravour-pay-category" name="category" class="input-field" required ${step === 'checking' ? 'disabled' : ''}>
                             <option value="" disabled selected>Select a category</option>
                            ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                     <div class="form-group">
                        <label for="cravour-pay-merchant">Merchant (Optional)</label>
                        <input type="text" id="cravour-pay-merchant" name="merchant" class="input-field" placeholder="e.g., Jumia" ${step === 'checking' ? 'disabled' : ''}>
                    </div>
                    <button type="submit" class="btn btn-primary" ${step === 'checking' ? 'disabled' : ''}>
                        ${step === 'checking' ? `<div class="spinner"></div><span>Checking...</span>` : `Check Affordability`}
                    </button>
                </form>
            `;
        } else if (step === 'confirming') {
            content = `
                <div class="cravour-pay-feedback">
                    <div class="cravour-pay-result-icon ${canAfford ? 'ok' : 'danger'}">${canAfford ? '✓' : '!'}</div>
                    <p class="cravour-pay-result-message">${message}</p>
                    <div class="cravour-pay-actions">
                        <button class="btn btn-secondary-outline" data-action="cravour-pay-reset">Cancel</button>
                        ${canAfford ? `<button class="btn btn-primary" data-action="cravour-pay-confirm">Pay & Log Expense</button>`: ''}
                    </div>
                </div>
            `;
        } else { // success
             content = `
                <div class="cravour-pay-feedback">
                    <div class="cravour-pay-result-icon ok">✓</div>
                    <p class="cravour-pay-result-message">Payment of ${formatNaira(details!.amount)} logged successfully!</p>
                </div>
            `;
        }

        return `
            <div class="card cravour-pay-widget" id="pay-widget">
                <div class="cravour-pay-header">
                    <span class="btn-icon">${icons.wallet}</span>
                    <h2>Cravour Pay</h2>
                </div>
                ${content}
            </div>
        `;
    }
    
    private renderSpendingBreakdownWidget(type: 'needs' | 'wants', expenses: any[], budgets: any[]): string {
        const title = type === 'needs' ? 'Essentials Breakdown' : 'Lifestyle Breakdown';
        const relevantCategories = Object.keys(CATEGORY_MAP).filter(cat => CATEGORY_MAP[cat].type === type);
        
        const categorySpending = relevantCategories.map(cat => {
            const spent = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
            return { category: cat, spent };
        }).filter(item => item.spent > 0).sort((a,b) => b.spent - a.spent);

        const content = categorySpending.length > 0
            ? categorySpending.map(item => `
                <div class="category-spending-item">
                    <div class="category-spending-info">
                        <span class="category-name">${item.category}</span>
                        <span class="category-amount">${formatNaira(item.spent)}</span>
                    </div>
                    <div class="category-progress-bar">
                        <div class="category-progress-bar-inner" style="width: ${(item.spent / Math.max(...categorySpending.map(cs => cs.spent))) * 100}%"></div>
                    </div>
                </div>
              `).join('')
            : `<div class="empty-state mini">No spending in this area yet.</div>`;

        return `
            <h2>${title}</h2>
            <div class="spending-breakdown-container">
                ${content}
            </div>
        `;
    }

    private renderGoalsProgressWidget(goals: any[], expenses: any[]): string {
        const totalSaved = expenses.filter(e => e.category === "Savings & Investments").reduce((sum, e) => sum + e.amount, 0);

        const content = goals.length > 0
            ? goals.map(goal => {
                const percentage = Math.min((totalSaved / goal.target) * 100, 100).toFixed(1);
                return `
                    <div class="goal-progress-item ${goal.completed ? 'completed' : ''}">
                        ${goal.completed ? `<div class="completed-badge"><span class="btn-icon">${icons.checkCircle}</span> Completed</div>` : ''}
                        <div class="goal-progress-info">
                            <span class="goal-name">${goal.name}</span>
                            <span class="goal-percentage">${percentage}%</span>
                        </div>
                        <div class="goal-progress-bar">
                            <div class="goal-progress-bar-inner" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `}).join('')
            : `<div class="empty-state mini">No goals set. Add a goal to start tracking.</div>`;
        
        return `
            <h2>Savings Goals</h2>
            <div class="goals-progress-container">
                ${content}
            </div>
        `;
    }

    private renderAIInsightsWidget(): string {
        let content;
        if (this.state.isGeneratingInsights) {
            content = Array(2).fill(0).map(() => `
                <div class="ai-insight-card is-loading">
                    <div class="ph-icon"></div>
                    <div class="ph-content">
                        <div class="ph-title"></div>
                        <div class="ph-text"></div>
                        <div class="ph-text short"></div>
                    </div>
                </div>
            `).join('');
        } else if (this.state.aiInsights.length > 0) {
            content = this.state.aiInsights.map(insight => `
                <div class="ai-insight-card type-${insight.type}">
                    <div class="ai-insight-icon">${icons.insight}</div>
                    <div class="ai-insight-content">
                        <h3>${insight.title}</h3>
                        <p>${insight.advice}</p>
                    </div>
                </div>
            `).join('');
        } else {
            content = `<div class="empty-state mini">AI insights will appear here as you add transactions.</div>`;
        }

        return `
            <div class="card ai-insights-container" id="insights-widget">
                 <h2>AI Insights</h2>
                 <div class="ai-insights-grid">${content}</div>
            </div>
        `;
    }

    private renderEnterpriseDashboard() {
        const { totalRevenue, totalSales } = this.calculateEnterpriseStats();
        return `
            <div class="enterprise-dashboard-view">
                <div class="view-header">
                    <h1>Merchant Dashboard (Konga Demo)</h1>
                    <p class="view-subtitle">Your real-time sales and transaction overview.</p>
                </div>
                <div class="stats-grid">
                    <div class="card stat-card">
                        <h3>Total Revenue</h3>
                        <p>${formatNaira(totalRevenue)}</p>
                    </div>
                    <div class="card stat-card">
                        <h3>Total Sales</h3>
                        <p>${totalSales}</p>
                    </div>
                </div>
            </div>
        `;
    }

    private renderEnterpriseTransactions() {
        const { transactions } = this.calculateEnterpriseStats();
        return `
             <div class="enterprise-transactions-view">
                <div class="view-header">
                    <h1>Transactions</h1>
                    <p class="view-subtitle">A list of all sales processed through Cravour.</p>
                </div>
                <div class="card">
                     <div class="transaction-list">
                       ${transactions.length > 0 ? transactions.map(t => `
                        <div class="transaction-item">
                            <div class="transaction-product">
                                <strong>${t.productName}</strong>
                                <span class="customer">by ${t.customerName}</span>
                            </div>
                            <div class="transaction-date">${new Date(t.date).toLocaleDateString('en-GB')}</div>
                            <div class="transaction-status"><span class="status-pill ${t.status}">${t.status}</span></div>
                            <div class="transaction-amount">${formatNaira(t.price)}</div>
                        </div>
                       `).join('') : '<div class="empty-state mini">No transactions yet.</div>'}
                    </div>
                </div>
            </div>
        `;
    }
    
    private renderPaymentModal() {
        const modal = document.getElementById('payment-modal')!;
        if (this.state.showPaymentModal) {
            modal.classList.remove('hidden');
            let content;
            const deal = this.state.dealToPurchase;

            if (this.state.paymentStep === 'form') {
                 content = `
                    <div class="payment-modal-header paystack-header">
                        <h3 class="paystack-logo">CRAVOUR PAY</h3>
                        <p class="payment-amount">${formatNaira(deal.price)}</p>
                    </div>
                    <div class="payment-modal-body">
                         <div class="item-summary">
                            <p>${deal.productName}</p>
                            <p>From ${deal.merchantName}</p>
                        </div>
                        <p>You are about to log this purchase. This will deduct the amount from your Cravour wallet and add it to your expenses.</p>
                    </div>
                     <div class="payment-modal-footer">
                        <button class="btn btn-primary" data-action="confirm-payment">Confirm Purchase</button>
                        <button class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                    </div>
                `;
            } else if (this.state.paymentStep === 'processing') {
                content = `<div class="payment-feedback"><div class="spinner"></div><p>Processing Payment...</p></div>`;
            } else { // success
                content = `<div class="payment-feedback"><div class="success-icon">${icons.plusCircle}</div><p>Purchase Logged!</p></div>`;
            }

            this.renderBySelector('#payment-modal', `
                 <div class="modal-overlay" data-action="close-modal">
                    <div class="modal-content payment-modal card" onclick="event.stopPropagation()">
                         ${content}
                    </div>
                </div>
            `);

        } else {
             modal.classList.add('hidden');
        }
    }

     private renderActionModal() {
        const modal = document.getElementById('action-modal')!;
        if (this.state.showActionModal) {
            modal.classList.remove('hidden');
            const { type, title, content, action } = this.state.showActionModal;
            const btnClass = type === 'confirm' ? 'btn-danger' : 'btn-primary';
            const btnText = type === 'confirm' ? 'Confirm' : 'Submit';

            const formContent = `
                <h3>${title}</h3>
                <div class="action-modal-content">${content}</div>
                <div class="action-modal-footer">
                    <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                    <button type="submit" class="btn ${btnClass}">${btnText}</button>
                </div>
            `;
            
            this.renderBySelector('#action-modal', `
                 <div class="modal-overlay" data-action="close-modal">
                    <div class="modal-content action-modal card" onclick="event.stopPropagation()">
                        <form id="action-modal-form">
                            ${formContent}
                        </form>
                    </div>
                </div>
            `);

        } else {
             modal.classList.add('hidden');
        }
    }
}

new CravourApp();