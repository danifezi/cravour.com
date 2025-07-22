import { GoogleGenAI, Chat, Type } from "@google/genai";

// --- SVG Icons ---
const icons = {
    logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 7L12 12L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    coPilot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Zm-2.39.264a.75.75 0 0 0 1.06 1.06l2.122-2.12a.75.75 0 0 0-1.061-1.061L5.11 12.264Zm13.84-.001a.75.75 0 0 0-1.06-1.06l-2.123 2.12a.75.75 0 0 0 1.061 1.061l2.122-2.12ZM12 7.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V8.25A.75.75 0 0 1 12 7.5ZM5.11 7.236a.75.75 0 0 0-1.06 1.06l2.122 2.122a.75.75 0 1 0 1.06-1.06L5.11 7.236Zm13.84-.001a.75.75 0 1 0-1.06-1.06l-2.122 2.122a.75.75 0 0 0 1.06 1.06l2.122-2.122ZM12 16.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z"/></svg>`,
    budgets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.925 5.512a2.25 2.25 0 0 0-2.175-1.762H5.25a2.25 2.25 0 0 0-2.175 1.762l-1.313 7.875A2.25 2.25 0 0 0 3.938 16h16.125a2.25 2.25 0 0 0 2.175-2.613l-1.313-7.875ZM5.25 5.25h13.5c.31 0 .59.167.737.438l1.313 7.875a.75.75 0 0 1-.725.887H3.938a.75.75 0 0 1-.725-.887l1.313-7.875A.75.75 0 0 1 5.25 5.25Z"/><path d="M10 10.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z M18 8.625a.75.75 0 0 0-1.5 0V11a.75.75 0 0 0 1.5 0V8.625Z"/><path d="M4.5 17.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"/></svg>`,
    deals: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.964 2.634a2.25 2.25 0 0 0-3.182 0l-7.25 7.25a2.25 2.25 0 0 0 0 3.182l7.25 7.25a2.25 2.25 0 0 0 3.182 0l7.25-7.25a2.25 2.25 0 0 0 0-3.182l-7.25-7.25ZM11 8.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" /></svg>`,
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
    { id: 1, name: "Vacation to Ghana", target: 500000 },
    { id: 2, name: "New MacBook", target: 1200000 },
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
        coPilotHistory: { role: 'user' | 'model', parts: { text: string }[] }[];
        isCoPilotLoading: boolean;
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

        financialGoals: any[];
        nextGoalId: number;

        // Business user state
        enterpriseView: string;
        transactions: any[];
        nextTransactionId: number;
        
        // Demo state
        demoChatHistory: { role: 'user' | 'model', parts: { text: string }[] }[];
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

        financialGoals: [],
        nextGoalId: 1,

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
                    parts: [{ text: "Hello! I'm your AI Budget Assistant. I've analyzed some sample data. Ask me a question, like 'Where can I get lunch in Lekki for ₦10k?', to see how I can help you spend smarter!" }]
                },
            ]
        });

        document.addEventListener('click', this.handleDelegatedClick.bind(this));
        document.addEventListener('submit', this.handleDelegatedSubmit.bind(this));
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
                break;
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
        }
    }

    private handleDelegatedChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        if (target.id === 'location-selector') {
            this.setState({ userLocation: target.value });
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
            this.setupPersonalAccount();
        } else {
            this.setupBusinessAccount();
        }
        this.hideAuthModal();
    }

    private async updateCoPilotContext() {
        if (!this.state.coPilotChat) return;

        const contextMessage = `SILENT_CONTEXT_UPDATE: Here is the user's latest financial data. Do not acknowledge this message directly in your response. Simply use this information to answer any subsequent questions from the user.
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
- All monetary values are in Nigerian Naira (NGN), use the symbol ₦.
- When a user asks about affording an item or for product suggestions, find the deal with the lowest price for that item's category in the provided data.
- Respond SIMPLY and DIRECTLY. For example: "Yes, you can. Konga has Wireless Earbuds for ₦15,500."
- If no deal is found, check their budget for that category and give a simple yes/no with the remaining budget. Example: "Yes, you have ₦12,000 left for Shopping."
- If there's no budget, just say it's not budgeted.
- Keep all answers extremely brief and to the point.
- IMPORTANT: Never mention "SILENT_CONTEXT_UPDATE" or acknowledge receiving data. Just use the data to answer questions.`
                },
            });
        }
        
        this.setState({ 
            currentView: 'insights',
            expenses: [...sampleExpenses],
            nextExpenseId: sampleExpenses.length + 1,
            budgets: [...sampleBudgets],
            deals: [...sampleDeals],
            financialGoals: [...sampleGoals],
            nextGoalId: sampleGoals.length + 1,
            coPilotChat: coPilotChat,
            coPilotHistory: [
                {
                    role: 'model',
                    parts: [{ text: "Hello! I'm your Cravour AI Co-pilot. How can I help you manage your finances today? You can ask me things like 'How much did I spend on food this month?' or 'Can I afford to buy new shoes?'" }]
                }
            ]
        });
        
        setTimeout(() => {
            this.scrollToBottom('#copilot-chat-messages');
            this.updateCoPilotContext(); // Prime the AI with initial data
            this.generateAIInsights();
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
            expenses: [],
            coPilotHistory: [],
            coPilotChat: null,
            budgets: [],
            deals: [],
            financialGoals: [],
            transactions: [],
            aiInsights: [],
        });
    }

    private navigate(view: string) {
        if(this.state.isMobileMenuOpen) this.toggleMobileMenu();
        if(this.state.isAppMenuOpen) this.toggleAppMenu();
        
        if (view.startsWith('#')) {
            document.querySelector(view)?.scrollIntoView({ behavior: 'smooth' });
        } else if (this.state.accountType === 'personal') {
            this.setState({ currentView: view });
            if (view === 'co-pilot') {
                setTimeout(() => this.scrollToBottom('#copilot-chat-messages'), 0);
            }
        } else if (this.state.accountType === 'business') {
            this.setState({ enterpriseView: view });
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
            form.reset();
        } else {
            newExpenseData = form;
        }

        const newExpense = { id: this.state.nextExpenseId, ...newExpenseData };
        this.setState({
            expenses: [newExpense, ...this.state.expenses],
            nextExpenseId: this.state.nextExpenseId + 1,
        });
        
        this.generateAIInsights();
        this.updateCoPilotContext();
    }
    
    private deleteExpense(id: number) {
        this.setState({ expenses: this.state.expenses.filter(exp => exp.id !== id) });
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
            // Add to user's expenses
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
        const budget = this.state.budgets.find(b => b.category === category);
        const spent = this.state.expenses
            .filter(e => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);

        setTimeout(() => {
            let result;
            if (budget) {
                const remaining = budget.amount - spent;
                const afterPurchase = remaining - amount;
                result = {
                    canAfford: afterPurchase >= 0,
                    message: afterPurchase >= 0
                        ? `You have ${formatNaira(remaining)} left in your ${category} budget. After this, you'll have ${formatNaira(afterPurchase)}.`
                        : `This purchase will put you ${formatNaira(Math.abs(afterPurchase))} over your ${category} budget.`,
                };
            } else {
                result = {
                    canAfford: true, // No budget to check against
                    message: `You don't have a budget for ${category}, but this purchase will be tracked.`
                };
            }
            this.setState({ 
                cravourPayState: {
                    step: 'confirming',
                    message: result.message,
                    canAfford: result.canAfford,
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
    private async generateAIInsights() {
        if (!this.state.ai || this.state.isGeneratingInsights) return;

        this.setState({ isGeneratingInsights: true });

        const insightPrompt = `
            Analyze the following Nigerian user's financial data. Provide 2-3 short, actionable, and encouraging insights based on their spending habits versus their budgets and goals.
            - Distinguish between 'Essentials' (needs) and 'Lifestyle' (wants).
            - Compare their savings contributions towards their financial goals.
            - Frame the insights as if you are a friendly, savvy Nigerian financial assistant. Use Naira (₦).

            Financial Data:
            Category Types: ${JSON.stringify(CATEGORY_MAP)}
            Expenses: ${JSON.stringify(this.state.expenses)}
            Budgets: ${JSON.stringify(this.state.budgets)}
            Financial Goals: ${JSON.stringify(this.state.financialGoals)}
        `;

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
                                        title: { type: Type.STRING, description: "A catchy, short title for the insight (e.g., 'Transportation Alert')." },
                                        advice: { type: Type.STRING, description: "The core piece of advice, 1-2 sentences long. Use Naira (₦) when mentioning money." },
                                        type: { type: Type.STRING, description: "The type of insight. Choose from: 'warning', 'suggestion', 'info'."}
                                    },
                                },
                            },
                        },
                    },
                },
            });

            const responseText = result.text;
            const parsedResponse = JSON.parse(responseText);
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
        If you cannot find a specific 'deal' from the provided sample data that perfectly matches the user's query, YOU MUST use your general knowledge of the Nigerian market to suggest plausible vendors or types of places where they could find what they're looking for within their stated budget.
        Always frame your answer in the context of budgeting. Be helpful and never just say you cannot find anything.

        Sample Data:
        Budgets: ${JSON.stringify(sampleBudgets)}
        Local Deals: ${JSON.stringify(sampleDeals)}`;
        
        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the provided data and your instructions, answer the user's question: "${query}"`,
                config: {
                    systemInstruction: systemInstruction,
                }
            });
            const responseText = result.text;
            
            this.setState({
                demoChatHistory: [...newHistory, { role: 'model' as const, parts: [{ text: responseText }] }],
                isDemoLoading: false
            });
            this.scrollToBottom('#demo-chat-messages');
        } catch (error) {
            // Demo AI Error: Show a user-friendly message
            this.setState({
                demoChatHistory: [...newHistory, { role: 'model' as const, parts: [{ text: "Sorry, I couldn't process that request. The server might be busy. Please try again." }] }],
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
            let historyWithPlaceholder = [...historyWithUserMsg, { role: 'model' as const, parts: [{ text: "" }] }];
            this.setState({ coPilotHistory: historyWithPlaceholder });
            this.scrollToBottom('#copilot-chat-messages');

            let fullResponse = "";
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                historyWithPlaceholder[historyWithPlaceholder.length - 1].parts[0].text = fullResponse;
                this.setState({ coPilotHistory: [...historyWithPlaceholder] });
                this.scrollToBottom('#copilot-chat-messages');
            }
        } catch(error) {
            // Co-pilot AI Error: Show a user-friendly message
            this.setState({coPilotHistory: [...historyWithUserMsg, { role: 'model' as const, parts: [{text: "I encountered an error."}]}]});
            this.scrollToBottom('#copilot-chat-messages');
        } finally {
            this.setState({ isCoPilotLoading: false });
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
                    <div class="chat-messages" id="demo-chat-messages">${this.renderChatHistory(this.state.demoChatHistory, this.state.isDemoLoading)}</div>
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

    private renderInsightCard(insight: any): string {
        const icon = icons[insight.icon as keyof typeof icons] || icons.insight;
        return `
            <div class="ai-message message insight-card">
                <div class="insight-header"><span class="insight-icon">${icon}</span><h4 class="insight-title">${insight.title}</h4></div>
                <div class="insight-body"><p class="insight-detail">${insight.detail}</p><p class="insight-recommendation">${insight.recommendation}</p></div>
            </div>`;
    }

    private renderChatHistory(history: any[], isLoading: boolean, parseJson = true): string {
        let html = history.map(msg => {
            const textContent = msg.parts[0]?.text || '';

            if (msg.role === 'model') {
                if (parseJson) {
                    try {
                        const insightData = JSON.parse(textContent);
                        if (insightData.insight) {
                            return this.renderInsightCard(insightData.insight);
                        }
                    } catch (e) {
                        // Not valid JSON, render as plain text below
                    }
                }
                // Render as plain text
                return `<div class="ai-message message">${textContent.replace(/\n/g, '<br>')}</div>`;
            }
            
            // User message
            return `<div class="user-message message">${textContent.replace(/\n/g, '<br>')}</div>`;
        }).join('');
    
        if (isLoading && (history.length === 0 || history[history.length - 1]?.role === 'user')) {
            html += `<div class="ai-message message thinking-indicator"><div class="spinner"></div><span>Cravour is thinking...</span></div>`;
        }
        return html;
    }

    private renderFeatures(): string {
         const featuresData = [
            { icon: icons.budgets, title: 'Smart Budgeting', text: 'Create budgets that work for you. Track your spending in Naira and always know where your money is going.' },
            { icon: icons.deals, title: 'Local Naija Deals', text: 'Discover exclusive offers from Nigerian shops. We connect your budget needs with the best prices in your area.' },
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
            { view: 'deals', label: 'Local Deals', icon: 'deals' },
        ];
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
            { view: 'deals', label: 'Local Deals', icon: 'deals' },
            { view: 'profile', label: 'Profile', icon: 'profile' },
            { view: 'settings', label: 'Settings', icon: 'settings' },
        ];
        const enterpriseNav = [
            { view: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { view: 'transactions', label: 'Transactions', icon: 'transactions' },
            { view: 'profile', label: 'Profile', icon: 'profile' },
            { view: 'settings', label: 'Settings', icon: 'settings' },
        ];
        const currentNav = this.state.accountType === 'personal' ? personalNav : enterpriseNav;
        const currentView = this.state.accountType === 'personal' ? this.state.currentView : this.state.enterpriseView;
        return currentNav.find(item => item.view === currentView);
    }
    
    private isActiveView(view: string): boolean {
        const currentView = this.state.accountType === 'personal' ? this.state.currentView : this.state.enterpriseView;
        return currentView === view;
    }
    
    private renderCurrentView(): string {
        const view = this.state.accountType === 'personal' ? this.state.currentView : this.state.enterpriseView;

        if (this.state.accountType === 'personal') {
            switch (view) {
                case 'co-pilot': return this.renderCoPilotView();
                case 'insights': return this.renderInsightsView();
                case 'expenses': return this.renderExpensesView();
                case 'budgets': return this.renderBudgetsView();
                case 'goals': return this.renderGoalsView();
                case 'deals': return this.renderDealsView();
                default: return `<div class="card"><h2>${view}</h2><p>This view is under construction.</p></div>`;
            }
        } else { // Business account
             switch (view) {
                case 'dashboard': return this.renderEnterpriseDashboard();
                case 'transactions': return this.renderEnterpriseTransactions();
                default: return `<div class="card"><h2>${view}</h2><p>This view is under construction.</p></div>`;
            }
        }
    }
    
    private renderCoPilotView(): string {
        return `
            <div class="copilot-view">
                <div class="chat-container">
                     <div class="chat-messages" id="copilot-chat-messages">${this.renderChatHistory(this.state.coPilotHistory, this.state.isCoPilotLoading, false)}</div>
                     <form class="chat-form" id="copilot-chat-form">
                        <input type="text" class="input-field" placeholder="Ask about your budget, deals, and more..." required ${this.state.isCoPilotLoading ? 'disabled' : ''}>
                        <button type="submit" class="btn btn-primary" aria-label="Send message" ${this.state.isCoPilotLoading ? 'disabled' : ''}>
                            ${this.state.isCoPilotLoading ? `<div class="spinner"></div>` : `<span class="btn-icon">${icons.send}</span>`}
                        </button>
                    </form>
                </div>
            </div>
        `;
    }
    
    private renderSpendingBreakdown(title: string, type: 'needs' | 'wants'): string {
        const now = new Date();
        const currentMonthExpenses = this.state.expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getFullYear() === now.getFullYear() && expenseDate.getMonth() === now.getMonth();
        });

        const relevantCategories = Object.keys(CATEGORY_MAP).filter(cat => CATEGORY_MAP[cat].type === type);
        
        const spendingByCategory = relevantCategories.map(category => {
            const spent = currentMonthExpenses
                .filter(e => e.category === category)
                .reduce((sum, e) => sum + e.amount, 0);
            return { category, spent };
        })
        .filter(c => c.spent > 0)
        .sort((a, b) => b.spent - a.spent);

        const totalSpentInType = spendingByCategory.reduce((sum, item) => sum + item.spent, 0);

        const breakdownHtml = spendingByCategory.length > 0
            ? spendingByCategory.map(item => {
                const percentage = totalSpentInType > 0 ? (item.spent / totalSpentInType) * 100 : 0;
                return `
                    <div class="category-spending-item">
                        <div class="category-spending-info">
                            <span class="category-name">${item.category}</span>
                            <span class="category-amount">${formatNaira(item.spent)}</span>
                        </div>
                        <div class="category-progress-bar">
                            <div class="category-progress-bar-inner" style="width: ${percentage}%;"></div>
                        </div>
                    </div>
                `;
            }).join('')
            : '<div class="empty-state mini">No spending in this area this month.</div>';

        return `
            <div class="card" id="${type}-widget">
                <h2>${title}</h2>
                <div class="spending-breakdown-container">
                    ${breakdownHtml}
                </div>
            </div>
        `;
    }

    private renderCravourPayWidget(): string {
        const { step, message, canAfford, details } = this.state.cravourPayState;

        let content = '';
        switch (step) {
            case 'form':
                content = `
                    <form id="cravour-pay-form">
                        <div class="form-group">
                            <label for="cravour-pay-amount">Amount (NGN)</label>
                            <input type="number" id="cravour-pay-amount" name="amount" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label for="cravour-pay-merchant">Merchant</label>
                            <input type="text" id="cravour-pay-merchant" name="merchant" class="input-field" required>
                        </div>
                        <div class="form-group">
                            <label for="cravour-pay-category">Category</label>
                            <select id="cravour-pay-category" name="category" class="input-field" required>
                                ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Check Budget</button>
                    </form>
                `;
                break;
            case 'checking':
                content = `<div class="cravour-pay-feedback"><div class="spinner"></div><p>Checking your budget...</p></div>`;
                break;
            case 'confirming':
                content = `
                    <div class="cravour-pay-feedback">
                        <div class="cravour-pay-result-icon ${canAfford ? 'ok' : 'danger'}">${canAfford ? '✓' : '!'}</div>
                        <p class="cravour-pay-result-message">${message}</p>
                        <div class="cravour-pay-actions">
                            <button class="btn btn-primary" data-action="cravour-pay-confirm">Pay & Log Expense</button>
                            <button class="btn btn-secondary-outline" data-action="cravour-pay-reset">Cancel</button>
                        </div>
                    </div>
                `;
                break;
             case 'success':
                content = `<div class="cravour-pay-feedback"><div class="success-icon">✓</div><p>Expense Logged!</p></div>`;
                break;
        }

        return `
            <div class="card cravour-pay-widget" id="cravour-pay-widget">
                <div class="cravour-pay-header">
                    <span class="btn-icon">${icons.pay}</span>
                    <h2>Cravour Pay</h2>
                </div>
                <div class="cravour-pay-body">
                    ${content}
                </div>
            </div>
        `;
    }

    private renderInsightsView(): string {
        const now = new Date();
        const currentMonthExpenses = this.state.expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getFullYear() === now.getFullYear() && expenseDate.getMonth() === now.getMonth();
        });

        const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalBudget = this.state.budgets.reduce((sum, b) => sum + b.amount, 0);
        const moneyLeft = totalBudget - totalSpent;
        
        // --- Goals Widget ---
        const totalSavedForGoals = this.state.expenses
            .filter(e => CATEGORY_MAP[e.category]?.type === 'goals')
            .reduce((sum, e) => sum + e.amount, 0);

        const goalsHtml = this.state.financialGoals.length > 0 ? this.state.financialGoals.map(goal => {
            const percentage = goal.target > 0 ? (totalSavedForGoals / goal.target) * 100 : 0;
            return `
                 <div class="goal-progress-item">
                    <div class="goal-progress-info">
                        <span class="goal-name">${goal.name}</span>
                        <span class="goal-percentage">${Math.floor(percentage)}%</span>
                    </div>
                    <div class="goal-progress-bar">
                        <div class="goal-progress-bar-inner" style="width: ${Math.min(percentage, 100)}%;"></div>
                    </div>
                </div>
            `;
        }).join('') : '<div class="empty-state mini">No goals set yet. Go to the Goals page to add one!</div>';

        // --- AI Insights Rendering ---
        let insightContent;
        if (this.state.isGeneratingInsights) {
            insightContent = Array(2).fill(0).map(() => `
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
            insightContent = this.state.aiInsights.map(insight => `
                <div class="ai-insight-card type-${insight.type}">
                    <div class="ai-insight-icon">
                        ${icons.insight}
                    </div>
                    <div class="ai-insight-content">
                        <h3>${insight.title}</h3>
                        <p>${insight.advice}</p>
                    </div>
                </div>
            `).join('');
        } else {
            insightContent = `<div class="empty-state mini">Add expenses to get AI insights.</div>`;
        }

        return `
            <div class="view-header">
                <h1>Financial Snapshot</h1>
                <p class="view-subtitle">Your real-time financial overview for this month.</p>
            </div>
            <div class="snapshot-grid">
                <div class="card key-metrics-widget" id="metrics-widget">
                    <div class="metric-item">
                        <span class="metric-icon">${icons.budgets}</span>
                        <div>
                            <h3 class="metric-title">Monthly Budget</h3>
                            <p class="metric-value">${formatNaira(totalBudget)}</p>
                        </div>
                    </div>
                    <div class="metric-item">
                        <span class="metric-icon">${icons.transactions}</span>
                        <div>
                            <h3 class="metric-title">Spent So Far</h3>
                            <p class="metric-value spent">${formatNaira(totalSpent)}</p>
                        </div>
                    </div>
                    <div class="metric-item">
                         <span class="metric-icon">${icons.wallet}</span>
                        <div>
                            <h3 class="metric-title">Remaining</h3>
                            <p class="metric-value ${moneyLeft < 0 ? 'danger' : 'ok'}">${formatNaira(moneyLeft)}</p>
                        </div>
                    </div>
                </div>
                
                ${this.renderCravourPayWidget()}

                <div class="card" id="goals-widget">
                    <h2>Goals Progress</h2>
                    <div class="goals-progress-container">
                        ${goalsHtml}
                    </div>
                </div>
                
                ${this.renderSpendingBreakdown('Essentials Breakdown (Needs)', 'needs')}
                
                ${this.renderSpendingBreakdown('Lifestyle Breakdown (Wants)', 'wants')}

                <div class="card ai-insights-container" id="insights-widget">
                    <h2>AI-Powered Insights</h2>
                    <div class="ai-insights-grid">
                        ${insightContent}
                    </div>
                </div>
            </div>
        `;
    }

    private renderExpensesView(): string {
        const expenseItems = this.state.expenses.length > 0
            ? this.state.expenses.map(exp => `
                <div class="expense-item">
                    <div class="expense-details">
                        <div class="name">${exp.name}</div>
                        <div class="category">${exp.category} - ${new Date(exp.date).toLocaleDateString()}</div>
                    </div>
                    <div class="expense-amount">${formatNaira(exp.amount)}</div>
                    <button class="delete-btn" data-action="delete-expense" data-id="${exp.id}" aria-label="Delete expense">
                        <span class="btn-icon">${icons.trash}</span>
                    </button>
                </div>
            `).join('')
            : '<div class="empty-state">No expenses logged yet. Add one to get started!</div>';
        
        return `
            <div class="view-header"><h1>Manage Expenses</h1></div>
            <div class="expenses-view-layout">
                <div class="card expenses-list-card">
                    <h2>Recent Transactions</h2>
                    <div class="expense-list-container">
                        ${expenseItems}
                    </div>
                </div>
                <div class="card add-expense-card">
                    <h2>Add New Expense</h2>
                    <form id="add-expense-form">
                        <div class="form-group"><label for="expense-name">Name</label><input type="text" id="expense-name" name="name" class="input-field" required></div>
                        <div class="form-group"><label for="expense-category">Category</label><select id="expense-category" name="category" class="input-field" required>${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
                        <div class="form-group"><label for="expense-amount">Amount (NGN)</label><input type="number" id="expense-amount" name="amount" class="input-field" required></div>
                        <div class="form-group"><label for="expense-date">Date</label><input type="date" id="expense-date" name="date" class="input-field" value="${new Date().toISOString().substring(0, 10)}" required></div>
                        <button type="submit" class="btn btn-primary">Add Expense</button>
                    </form>
                </div>
            </div>
        `;
    }
    
    private renderBudgetsView(): string {
        const budgetCards = this.state.budgets.length > 0 ? this.state.budgets.map(b => {
            const spent = this.state.expenses
                .filter(e => e.category === b.category)
                .reduce((sum, e) => sum + e.amount, 0);
            const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
            const remaining = b.amount - spent;
            let progressBarClass = 'status-ok';
            if (percentage > 90) progressBarClass = 'status-danger';
            else if (percentage > 70) progressBarClass = 'status-warning';

            return `
                <div class="card budget-card">
                    <div class="budget-card-header">
                        <h3>${b.category}</h3>
                        <div class="budget-card-total">${formatNaira(b.amount)}</div>
                    </div>
                    <div class="budget-progress-bar"><div class="budget-progress-bar-inner ${progressBarClass}" style="width: ${Math.min(percentage, 100)}%;"></div></div>
                    <div class="budget-card-details">
                        <div><span>Spent</span><strong>${formatNaira(spent)}</strong></div>
                        <div><span>Remaining</span><strong>${formatNaira(remaining)}</strong></div>
                    </div>
                </div>`;
        }).join('') : '<div class="empty-state">You haven\'t set any budgets. Add one to start tracking!</div>';

        const availableBudgetCategories = CATEGORIES.filter(c => !this.state.budgets.some(b => b.category === c));

        return `
            <div class="view-header"><h1>Track Budgets</h1></div>
            <div class="budgets-view-layout">
                <div class="card">
                    <h2>Your Budgets</h2>
                    <div class="budgets-grid">${budgetCards}</div>
                </div>
                <div class="card add-budget-card">
                    <h2>Set New Budget</h2>
                    <form id="add-budget-form">
                        <div class="form-group">
                            <label for="budget-category">Category</label>
                            <select id="budget-category" name="category" class="input-field" required ${availableBudgetCategories.length === 0 ? 'disabled': ''}>
                                ${availableBudgetCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group"><label for="budget-amount">Amount (NGN)</label><input type="number" id="budget-amount" name="amount" class="input-field" required></div>
                        <button type="submit" class="btn btn-primary" ${availableBudgetCategories.length === 0 ? 'disabled': ''}>
                            ${availableBudgetCategories.length === 0 ? 'All Budgets Set' : 'Set Budget'}
                        </button>
                    </form>
                </div>
            </div>
        `;
    }
    
    private renderGoalsView(): string {
        const totalSavedForGoals = this.state.expenses
            .filter(e => CATEGORY_MAP[e.category]?.type === 'goals')
            .reduce((sum, e) => sum + e.amount, 0);

        const goalCards = this.state.financialGoals.map(goal => {
            const percentage = goal.target > 0 ? (totalSavedForGoals / goal.target) * 100 : 0;
            return `
                <div class="card goal-card">
                    <div class="goal-card-header">
                        <h3>${goal.name}</h3>
                        <button class="delete-btn" data-action="delete-goal" data-id="${goal.id}" aria-label="Delete goal">
                            <span class="btn-icon">${icons.trash}</span>
                        </button>
                    </div>
                    <div class="goal-progress-bar"><div class="goal-progress-bar-inner status-ok" style="width: ${Math.min(percentage, 100)}%;"></div></div>
                    <div class="goal-card-details">
                        <div><span>Saved</span><strong>${formatNaira(totalSavedForGoals)}</strong></div>
                        <div><span>Target</span><strong>${formatNaira(goal.target)}</strong></div>
                    </div>
                </div>`;
        }).join('');

        return `
            <div class="view-header"><h1>Financial Goals</h1></div>
            <div class="goals-view-layout">
                <div class="card">
                    <h2>Your Progress</h2>
                    <p class="view-subtitle" style="margin-bottom: 20px;">Your total 'Savings & Investments' contributions count towards all your goals.</p>
                    <div class="goals-grid">
                        ${goalCards.length > 0 ? goalCards : '<div class="empty-state">No goals yet. Add one to start saving for your future!</div>'}
                    </div>
                </div>
                <div class="card add-goal-card">
                    <h2>Set New Goal</h2>
                    <form id="add-goal-form">
                        <div class="form-group"><label for="goal-name">Goal Name</label><input type="text" id="goal-name" name="name" class="input-field" placeholder="e.g., New Laptop" required></div>
                        <div class="form-group"><label for="goal-target">Target Amount (NGN)</label><input type="number" id="goal-target" name="target" class="input-field" required></div>
                        <button type="submit" class="btn btn-primary">Add Goal</button>
                    </form>
                </div>
            </div>
        `;
    }

    private renderDealsView(): string {
        const dealCards = this.state.deals
            .filter(deal => deal.location === this.state.userLocation)
            .map(deal => `
                <div class="deal-card">
                    <div class="deal-card-image" style="background-image: url('${deal.imageUrl}')"></div>
                    <div class="deal-info">
                        <div class="deal-header">
                            <span class="tag ${deal.category.replace(/ & /g, '-')}">${deal.category}</span>
                            <div class="deal-price">${formatNaira(deal.price)}</div>
                        </div>
                        <h3 class="deal-name">${deal.productName}</h3>
                        <p class="deal-merchant">at ${deal.merchantName}</p>
                    </div>
                    <div class="deal-card-footer">
                        <button class="btn btn-secondary-outline" data-action="buy-now" data-id="${deal.id}">Buy Now</button>
                    </div>
                </div>
            `).join('');

        return `
            <div class="view-header deals-header-flex">
                <div>
                    <h1>Local Deals</h1>
                    <p class="view-subtitle">Top offers from merchants in your area.</p>
                </div>
                <div class="location-selector-wrapper">
                    <label for="location-selector">Your Location:</label>
                    <select id="location-selector" class="input-field">
                        ${['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'].map(loc => `<option value="${loc}" ${this.state.userLocation === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="deals-grid">
                ${dealCards || '<div class="empty-state">No deals found in your selected location.</div>'}
            </div>
        `;
    }
    
    private renderEnterpriseDashboard() {
        const stats = this.calculateEnterpriseStats();
        return `
            <div class="view-header"><h1>Merchant Dashboard</h1></div>
            <div class="stats-grid">
                <div class="card stat-card"><h3>Total Revenue</h3><p>${formatNaira(stats.totalRevenue)}</p></div>
                <div class="card stat-card"><h3>Total Sales</h3><p>${stats.totalSales}</p></div>
            </div>
            <div class="card" style="margin-top: 30px;">
                <h2>Recent Sales</h2>
                ${this.renderTransactionList(stats.transactions.slice(0, 5))}
            </div>
        `;
    }

    private renderEnterpriseTransactions() {
        const stats = this.calculateEnterpriseStats();
        return `
            <div class="view-header"><h1>All Transactions</h1></div>
            <div class="card">
                ${this.renderTransactionList(stats.transactions)}
            </div>
        `;
    }

    private renderTransactionList(transactions: any[]): string {
        if (transactions.length === 0) return '<div class="empty-state">No transactions yet.</div>';
        const headers = `<div class="transaction-item transaction-header"><strong>Product</strong><strong>Date</strong><strong>Status</strong><strong style="text-align: right;">Amount</strong></div>`;
        const items = transactions.map(t => `
            <div class="transaction-item">
                <div class="transaction-product">
                    <strong>${t.productName}</strong>
                    <span class="customer">by ${t.customerName}</span>
                </div>
                <div class="transaction-date">${new Date(t.date).toLocaleDateString()}</div>
                <div class="transaction-status"><span class="status-pill ${t.status}">${t.status}</span></div>
                <div class="transaction-amount">${formatNaira(t.price)}</div>
            </div>
        `).join('');
        return `<div class="transaction-list">${headers}${items}</div>`;
    }

    private renderPaymentModal() {
        if (!this.state.showPaymentModal || !this.state.dealToPurchase) {
            this.renderBySelector('#payment-modal', '');
            return;
        }

        let content = '';
        switch(this.state.paymentStep) {
            case 'form':
                content = `
                    <div class="paystack-header payment-modal-header">
                        <h3 class="paystack-logo">Paystack</h3>
                        <h4>Demo User (demo@cravour.com)</h4>
                        <p>Pay <span class="payment-amount">${formatNaira(this.state.dealToPurchase.price)}</span></p>
                    </div>
                    <div class="payment-modal-body">
                        <div class="item-summary">
                            <strong>${this.state.dealToPurchase.productName}</strong>
                            <p>from ${this.state.dealToPurchase.merchantName}</p>
                        </div>
                        <div class="form-group">
                            <label for="card-number">Card Number</label>
                            <input type="text" class="input-field" id="card-number" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="card-expiry">Expiry</label>
                                <input type="text" class="input-field" id="card-expiry" placeholder="MM / YY" />
                            </div>
                            <div class="form-group">
                                <label for="card-cvv">CVV</label>
                                <input type="text" class="input-field" id="card-cvv" placeholder="123" />
                            </div>
                        </div>
                    </div>
                    <div class="payment-modal-footer">
                        <button class="btn btn-primary" data-action="confirm-payment">Pay ${formatNaira(this.state.dealToPurchase.price)}</button>
                        <button class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                    </div>
                `;
                break;
            case 'processing':
                content = `<div class="payment-feedback"><div class="spinner"></div><p>Processing Payment...</p></div>`;
                break;
            case 'success':
                content = `<div class="payment-feedback"><div class="success-icon">✓</div><p>Payment Successful!</p></div>`;
                break;
        }

        this.renderBySelector('#payment-modal', `
            <div class="modal-overlay">
                <div class="modal-content payment-modal card">
                    <button class="modal-close-btn" aria-label="Close payment form" data-action="close-modal">&times;</button>
                    ${content}
                </div>
            </div>
        `);
    }
}

new CravourApp();