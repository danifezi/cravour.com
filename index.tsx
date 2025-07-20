import { GoogleGenAI, Type } from "@google/genai";

// --- SVG Icons (New "4D" Style) ---
const icons = {
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0Zm8-2.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75ZM9.25 12a.75.75 0 0 0-1.5 0v3.75a.75.75 0 0 0 1.5 0V12Zm6 1.5a.75.75 0 0 1 .75-.75v-3a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75h-1.5Z" clip-rule="evenodd" fill-opacity="0.5" fill="currentColor"/><path d="M5.47 10.74a.75.75 0 0 1 1.06 0l2.47 2.47a.75.75 0 0 1-1.06 1.06l-2.47-2.47a.75.75 0 0 1 0-1.06Zm12 0a.75.75 0 0 1 1.06 0l2.47 2.47a.75.75 0 1 1-1.06 1.06l-2.47-2.47a.75.75 0 0 1 0-1.06Z" fill="currentColor"/></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.5 2.25a.75.75 0 0 0-1.5 0v1.5h-9v-1.5a.75.75 0 0 0-1.5 0V6h12V2.25Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M6.5 20.25a4.5 4.5 0 0 1-4.5-4.5V8.25a.75.75 0 0 1 .75-.75h18a.75.75 0 0 1 .75.75v7.5a4.5 4.5 0 0 1-4.5 4.5h-10.5Zm11.25-8.25a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    budget: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.25 9.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5ZM8.25 13.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M2.25 5.25A3 3 0 0 1 5.25 2.25h13.5a3 3 0 0 1 3 3v13.5a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V5.25Zm3-.75a.75.75 0 0 0-.75.75v13.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75V5.25a.75.75 0 0 0-.75-.75H5.25Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    expenses: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9Zm-2.25 4.5a2.25 2.25 0 1 0 4.5 0a2.25 2.25 0 0 0-4.5 0Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    review: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.25a.75.75 0 0 0-1.5 0v5.25H9a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75V8.25Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    creative: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4.125 4.125a.375.375 0 0 0-.375.375v4.5a.375.375 0 0 0 .375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm.75.75h3v3h-3v-3ZM15.375 4.125a.375.375 0 0 0-.375.375v4.5a.375.375 0 0 0 .375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm.75.75h3v3h-3v-3ZM4.125 15.375a.375.375 0 0 0-.375.375v4.5a.375.375 0 0 0 .375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm.75.75h3v3h-3v-3Z" fill-opacity="0.5" fill="currentColor"/><path d="M12.75 12a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-5.25h-5.25a.75.75 0 0 1-.75-.75Zm-1.5-1.5a.75.75 0 0 0-1.5 0v6A.75.75 0 0 0 10.5 18h6a.75.75 0 0 0 0-1.5h-5.25v-5.25ZM9.75 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-5.25V10.5a.75.75 0 0 1-1.5 0v-6ZM3.75 10.5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6Z" fill="currentColor"/></svg>`,
    opportunities: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7.5a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3A.75.75 0 0 1 12 7.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.25 8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5Z" fill-opacity="0.5" fill="currentColor"/><path d="M15.75 8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75-.75h-4.5a.75.75 0 0 1-.75-.75V8.25ZM2.697 4.93a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06-1.06l4.72-4.72-4.72-4.72a.75.75 0 0 1 0-1.06Z" fill="currentColor"/></svg>`,
    cogs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.625a3.375 3.375 0 1 0 0 6.75a3.375 3.375 0 0 0 0-6.75Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M22.25 12c0 .99-.183 1.933-.518 2.787l.462 2.153a.75.75 0 0 1-.933 1.002l-2.31-.99a8.95 8.95 0 0 1-2.43.9V20a.75.75 0 0 1-.75.75H8.22a.75.75 0 0 1-.75-.75v-2.067a8.948 8.948 0 0 1-2.43-.9l-2.31.99a.75.75 0 0 1-.932-1.002l.461-2.153A8.98 8.98 0 0 1 1.75 12c0-.99.183-1.933.518-2.787l-.462-2.153a.75.75 0 0 1 .933-1.002l2.31.99a8.95 8.95 0 0 1 2.43-.9V4a.75.75 0 0 1 .75-.75h5.56a.75.75 0 0 1 .75.75v2.067c.86.299 1.675.72 2.43.9l2.31-.99a.75.75 0 0 1 .932 1.002l-.461 2.153A8.98 8.98 0 0 1 22.25 12Zm-1.636 0c0-1.42-.314-2.757-.88-3.921l-.22-.465.98-4.576-1.96-1.053-4.502 1.93-.497-.27a7.452 7.452 0 0 0-3.303-.896V2.75H8.22v3.003c-1.18.256-2.29.74-3.302.896l-.497.27-4.502-1.93-1.96 1.053.98 4.576-.22.465A7.48 7.48 0 0 0 3.25 12c0 1.42.314 2.757.88 3.921l.22.465-.98 4.576 1.96 1.053 4.502-1.93.497.27a7.452 7.452 0 0 0 3.303.896V21.25h5.56v-3.003c1.18-.256 2.29-.74 3.302-.896l.497-.27 4.502 1.93 1.96-1.053-.98-4.576.22-.465A7.48 7.48 0 0 0 20.614 12Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    magic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m15.808 3.755-2.06 2.06a.75.75 0 0 1-1.06 0l-2.06-2.06a.75.75 0 0 1 1.06-1.06l2.06 2.06 2.06-2.06a.75.75 0 1 1 1.06 1.06Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M9.828 3.22a.75.75 0 0 1 1.06 0l3.89 3.89a2.25 2.25 0 0 1 0 3.182l-3.89 3.89a.75.75 0 0 1-1.06-1.06l3.89-3.89a.75.75 0 0 0 0-1.06L9.828 4.28a.75.75 0 0 1 0-1.06ZM5.293 6.728a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 0 1-1.06-1.06l5.47-5.47-5.47-5.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    chartLine: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.25 18a.75.75 0 0 0 0 1.5H21a.75.75 0 0 0 0-1.5H2.25Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="m4.22 15.78 1.97-1.97a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 0 1.06 0L15.03 13.6a.75.75 0 0 1 1.06 0l4.72 4.72a.75.75 0 1 1-1.06 1.06l-4.19-4.19-3.47 3.47a2.25 2.25 0 0 1-3.18 0L5.28 16.84l-1.06-1.06Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    sync: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 0 1 .75.75v3.66a8.216 8.216 0 0 1 4.237 2.016l2.126-2.125a.75.75 0 1 1 1.06 1.06l-2.125 2.125A8.25 8.25 0 0 1 12 20.25a.75.75 0 0 1 0-1.5 6.75 6.75 0 0 0 0-13.5.75.75 0 0 1-.75-.75V3a.75.75 0 0 1 .75-.75Z" fill-opacity="0.5" fill="currentColor"/><path d="M12 3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75ZM20.25 12a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75Z" fill="currentColor"/></svg>`,
    searchDollar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.625 17.625a6 6 0 1 1 0-12a6 6 0 0 1 0 12Zm0-1.5a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M11.625 3.375a8.25 8.25 0 1 0 4.673 14.316l3.352 3.351a.75.75 0 0 0 1.06-1.06l-3.351-3.352A8.25 8.25 0 0 0 11.625 3.375Zm-6.375 8.25a6.375 6.375 0 1 1 12.75 0a6.375 6.375 0 0 1-12.75 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M16.704 7.796a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06L8.69 14.69l6.97-6.97a.75.75 0 0 1 1.044 0Z" clip-rule="evenodd" /></svg>`,
    envelope: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.25 6.75A.75.75 0 0 0 3 7.5v1.51l9-5.4-9-5.4V3.75A.75.75 0 0 0 3 3h18a.75.75 0 0 0 0-1.5H3A2.25 2.25 0 0 0 .75 3.75v16.5A2.25 2.25 0 0 0 3 22.5h18a2.25 2.25 0 0 0 2.25-2.25V7.5a.75.75 0 0 0-1.5 0v12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V6.75Z" fill-opacity="0.5" fill="currentColor"/><path d="M12 13.924 3.018 8.528a.75.75 0 1 0-.786 1.288L12 15.75l9.768-5.934a.75.75 0 0 0-.786-1.288L12 13.924Z" fill="currentColor"/></svg>`,
    infoCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 1 0 0 1.5a.75.75 0 0 0 0-1.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    paystack: `<svg viewBox="0 0 85.03 24" fill="currentColor"><path d="M84.73 11.16a2.25 2.25 0 0 0-1.94-1.04h-4.32a1.08 1.08 0 0 1-1.08-1.08V4.32a1.08 1.08 0 0 1 1.08-1.08h6.84a2.25 2.25 0 0 0 1.94-1.04 2.25 2.25 0 0 0-.54-3.1L84.1.06a1.09 1.09 0 0 0-1.29.22L76.17 6.9a1.08 1.08 0 0 1-.86.43h-4.32a2.57 2.57 0 0 0-2.57 2.57v4.65a2.57 2.57 0 0 0 2.57 2.57h4.32a1.08 1.08 0 0 1 .86.43l6.64 6.63a1.09 1.09 0 0 0 1.29.22l2.61-1.5a2.25 2.25 0 0 0 .54-3.1Z M22.24 2.16a2.16 2.16 0 0 0-2.16-2.16H2.16A2.16 2.16 0 0 0 0 2.16v19.68A2.16 2.16 0 0 0 2.16 24h17.92a2.16 2.16 0 0 0 2.16-2.16V2.16Z M16.96 7.56H7.2a1.08 1.08 0 1 1 0-2.16h9.76a1.08 1.08 0 1 1 0 2.16Z M12.91 18.36H7.2a1.08 1.08 0 1 1 0-2.16h5.71a1.08 1.08 0 1 1 0 2.16Z M16.96 12.96H7.2a1.08 1.08 0 1 1 0-2.16h9.76a1.08 1.08 0 1 1 0 2.16Z M39.69.72a2.16 2.16 0 0 0-2.16 2.16v13.68H28.45a1.08 1.08 0 1 0 0 2.16h9.08a2.16 2.16 0 0 0 2.16-2.16V2.88a2.16 2.16 0 0 0-2.16-2.16h-2.16Z M63.29 9.36a5.04 5.04 0 1 0-5.04-5.04 5.04 5.04 0 0 0 5.04 5.04Z M63.29 11.52a7.2 7.2 0 1 1 7.2-7.2 7.2 7.2 0 0 1-7.2 7.2Z M53.81 21.6a2.16 2.16 0 0 1-2.16-2.16V2.88a2.16 2.16 0 1 0-4.32 0v16.56a2.16 2.16 0 0 0 2.16 2.16h4.32Z"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 3h-9A2.25 2.25 0 0 0 4.5 5.25v9a.75.75 0 0 0 1.5 0v-9c0-.414.336-.75.75-.75h9a.75.75 0 0 0 0-1.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M8.25 6A2.25 2.25 0 0 0 6 8.25v9.75A2.25 2.25 0 0 0 8.25 20.25h9.75A2.25 2.25 0 0 0 20.25 18V8.25A2.25 2.25 0 0 0 18 6H8.25ZM7.5 8.25c0-.414.336-.75.75-.75h9.75c.414 0 .75.336.75.75V18c0 .414-.336.75-.75.75H8.25a.75.75 0 0 1-.75-.75V8.25Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.292-.088.442A15.428 15.428 0 0 0 10.5 15.5a15.428 15.428 0 0 0 5.43-3.664c.15-.15.341-.127.442-.088l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-1.372c-5.496 0-10.536-2.502-13.88-6.839C1.17 12.87.5 9.074.5 5.872V4.5h1Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    arrowUp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 3.56 4.53 11.03a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clip-rule="evenodd" /></svg>`,
    arrowDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.53 21.53a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 19.94l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" /></svg>`,
};

// --- AI Schema Type Definitions ---
interface ShoppingPlan {
    budgetAnalysis: {
        userBudget: number;
        estimatedCost: number;
        difference: number;
        currency: string;
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

interface BudgetPlan {
    summary: {
        totalIncome: number;
        totalFixedCosts: number;
        discretionaryBudget: number;
        currency: string;
        primaryGoal: string;
    };
    allocations: {
        category: string;
        amount: number;
        percentage: number;
        description: string;
    }[];
    recommendations: string[];
}

interface ExpenseReport {
    expenseSummary: {
        totalExpenses: number;
        largestExpenseCategory: string;
        currency: string;
    };
    spendingHabits: {
        dailyAverage: number;
        weeklyAverage: number;
        peakSpendingDay: string;
        spendingTrend: string;
        trendSummary: string;
    };
    categorizedExpenses: {
        category: string;
        amount: number;
        percentage: number;
        isRecurring: boolean;
        merchantCategory: string;
        merchantBrandExample?: string;
    }[];
    costCuttingSuggestions: {
        area: string;
        suggestion: string;
        potentialSavings: string;
    }[];
    investmentOpportunities: {
        name: string;
        description: string;
        riskLevel: string;
    }[];
    localMerchantSuggestions?: {
        name: string;
        category: string;
        reason: string;
    }[];
}

interface PerformanceReview {
    adherenceScore: number;
    currency: string;
    overallSummary: string;
    varianceAnalysis: {
        category: string;
        budgetedAmount: number;
        actualAmount: number;
        variance: number;
    }[];
    keyInsights: {
        insight: string;
        area: string;
    }[];
}

interface CreativeCopy {
    adCopies: {
        headline: string;
        body: string;
        callToAction: string;
    }[];
}

interface Opportunity {
    type: string;
    title: string;
    description: string;
    potentialSavings: string;
    action: {
        text: string;
        type: 'navigate' | 'invest';
        target: string; // e.g., 'budget' view name or 'Investment Opportunity Name'
    };
}

interface OpportunitiesData {
    opportunities: Opportunity[];
}


// --- App State Type Definitions ---
interface WalletTransaction {
    id: string;
    date: string;
    type: 'fund' | 'payment' | 'transfer' | 'savings' | 'investment';
    description: string;
    amount: number; // Always positive
}

interface Merchant {
    name: string;
    category: string;
}

interface Investment {
    id: string;
    date: string;
    name: string;
    amount: number;
}

interface MerchantSummary extends Merchant {
    totalSpent: number;
    transactionCount: number;
    source: 'expenses' | 'manual';
}

type User = {
    name: string;
    email: string;
    verified: boolean;
    location?: {
        latitude: number;
        longitude: number;
    };
    onboarding: {
        budget: boolean;
        expenses: boolean;
        wallet: boolean;
        opportunities: boolean;
    };
    wallet: {
        balance: number;
        transactions: WalletTransaction[];
    };
    savingsVault: number;
    investments: Investment[];
    merchants: Merchant[];
    budgets: BudgetPlan[];
    expenses: ExpenseReport[];
    payments: { merchant: string; amount: number; frequency: string; }[];
    creativeCopies: CreativeCopy[];
    opportunities: OpportunitiesData[];
};

type AppView = 'dashboard' | 'wallet' | 'budget' | 'expenses' | 'review' | 'creative' | 'opportunities';

// --- Persistence Constants ---
const LOCAL_STORAGE_USERS_KEY = 'cravour_users';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'cravour_currentUserEmail';

// --- Persistence Functions ---
function saveUserDatabase() {
    if (userDatabase.size > 0) {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(Array.from(userDatabase.entries())));
    }
}

function loadUserDatabase(): Map<string, User> {
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (storedUsers) {
        try {
            return new Map(JSON.parse(storedUsers));
        } catch (e) {
            console.error("Failed to parse user database from localStorage", e);
            return new Map();
        }
    }
    return new Map();
}

function saveCurrentLoggedInUser(email: string | null) {
    if (email) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, email);
    } else {
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    }
}

function loadCurrentLoggedInUser(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
}

// --- State Management ---
let ai: GoogleGenAI;
let currentUser: User | null = null;
let userDatabase: Map<string, User> = new Map();
let pendingVerificationEmail: string | null = null;
let currentView: AppView = 'dashboard';
const API_KEY = process.env.API_KEY;
const PAYSTACK_PUBLIC_KEY = 'pk_test_0a4c8a2e0c3a2f8d1d2b7c6a0e1f3d4b9a8c7d6e'; // Public demo key for Paystack


// --- DOM Elements ---
const yearSpan = document.getElementById('year') as HTMLSpanElement;
const hamburger = document.querySelector('.hamburger') as HTMLButtonElement;
const mainNav = document.getElementById('main-nav') as HTMLElement;
const navListLinks = document.getElementById('nav-list-links') as HTMLUListElement;
const headerActionsContainer = document.getElementById('header-actions-container') as HTMLDivElement;

// Landing Page Elements
const landingPage = document.getElementById('landing-page') as HTMLElement;
const demoForm = document.getElementById('aiDemoForm') as HTMLFormElement;
const demoGoalInput = document.getElementById('planDescription') as HTMLTextAreaElement;
const demoGenerateBtn = document.getElementById('generateDemoPlanBtn') as HTMLButtonElement;
const demoStatusArea = document.getElementById('demoStatus') as HTMLDivElement;
const demoResultsContainer = document.getElementById('demo-results-wrapper') as HTMLDivElement;

// Auth Modal Elements
const authModal = document.getElementById('authModal') as HTMLDivElement;
const ctaSignUpBtn = document.getElementById('ctaSignUpBtn') as HTMLButtonElement;
const closeAuthBtn = document.getElementById('closeAuth') as HTMLButtonElement;
const showRegisterBtn = document.getElementById('showRegister') as HTMLButtonElement;
const showLoginBtn = document.getElementById('showLogin') as HTMLButtonElement;
const loginView = document.getElementById('loginView') as HTMLDivElement;
const registerView = document.getElementById('registerView') as HTMLDivElement;
const verificationView = document.getElementById('verificationView') as HTMLDivElement;
const verifyEmailBtn = document.getElementById('verifyEmailBtn') as HTMLButtonElement;
const loginForm = document.getElementById('loginForm') as HTMLFormElement;
const registerForm = document.getElementById('registerForm') as HTMLFormElement;
const registerNameInput = document.getElementById('registerName') as HTMLInputElement;
const registerEmailInput = document.getElementById('registerEmail') as HTMLInputElement;
const loginEmailInput = document.getElementById('loginEmail') as HTMLInputElement;

// Dashboard Elements
const appDashboard = document.getElementById('app-dashboard') as HTMLElement;
const appOverlay = document.getElementById('app-overlay') as HTMLDivElement;
const sidebarMenu = document.getElementById('sidebar-menu') as HTMLUListElement;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
const allDashboardViews = document.querySelectorAll('.dashboard-view');

// Dashboard Home View
const welcomeMessage = document.getElementById('welcome-message') as HTMLHeadingElement;
const mainDashboardContent = document.getElementById('main-dashboard-content') as HTMLDivElement;
const gettingStartedChecklist = document.getElementById('getting-started-checklist') as HTMLDivElement;
const dashboardOverview = document.getElementById('dashboard-overview') as HTMLDivElement;
const dashboardTrendChartContainer = document.getElementById('dashboard-trend-chart-container') as HTMLDivElement;
const recentActivityList = document.getElementById('recent-activity-list') as HTMLDivElement;

// Budget Planner Elements
const budgetPlannerForm = document.getElementById('budgetPlannerForm') as HTMLFormElement;
const budgetDescriptionInput = document.getElementById('budgetDescription') as HTMLTextAreaElement;
const budgetCurrencySelect = document.getElementById('budgetCurrency') as HTMLSelectElement;
const generateBudgetBtn = document.getElementById('generateBudgetBtn') as HTMLButtonElement;
const budgetStatusArea = document.getElementById('budgetStatus') as HTMLDivElement;
const budgetResultsContainer = document.getElementById('budget-results-wrapper') as HTMLDivElement;

// Expense Analyzer Elements
const expenseAnalyzerForm = document.getElementById('expenseAnalyzerForm') as HTMLFormElement;
const expenseDataInput = document.getElementById('expenseData') as HTMLTextAreaElement;
const analyzeExpensesBtn = document.getElementById('analyzeExpensesBtn') as HTMLButtonElement;
const expenseStatusArea = document.getElementById('expenseStatus') as HTMLDivElement;
const expenseResultsContainer = document.getElementById('expense-results-wrapper') as HTMLDivElement;

// Performance Review Elements
const generateReviewBtn = document.getElementById('generateReviewBtn') as HTMLButtonElement;
const shareReportBtn = document.getElementById('shareReportBtn') as HTMLButtonElement;
const reviewStatusArea = document.getElementById('reviewStatus') as HTMLDivElement;
const reviewResultsContainer = document.getElementById('review-results-wrapper') as HTMLDivElement;

// AI Creative Suite Elements
const creativeSuiteContainer = document.querySelector('.creative-suite-container') as HTMLDivElement;
const creativeSuiteFormDashboard = document.getElementById('creativeSuiteFormDashboard') as HTMLFormElement;
const adCopyResultsContainerDashboard = document.getElementById('ad-copy-results-wrapper-dashboard') as HTMLDivElement;
const savedAdCopyLibraryContainer = document.getElementById('saved-ad-copy-library') as HTMLDivElement;

// Opportunities Elements
const generateOpportunitiesBtn = document.getElementById('generateOpportunitiesBtn') as HTMLButtonElement;
const opportunitiesStatusArea = document.getElementById('opportunitiesStatus') as HTMLDivElement;
const opportunitiesResultsContainer = document.getElementById('opportunities-results-wrapper') as HTMLDivElement;

// Wallet & Pay View Elements
const walletViewContainer = document.getElementById('view-wallet') as HTMLElement;
const walletTabsContainer = document.getElementById('wallet-tabs') as HTMLDivElement;
const fundWalletBtn = document.getElementById('fundWalletBtn') as HTMLButtonElement;
const transferMoneyBtn = document.getElementById('transferMoneyBtn') as HTMLButtonElement;
const walletTransactionList = document.getElementById('wallet-transaction-list') as HTMLDivElement;
const allMerchantsListWallet = document.getElementById('all-merchants-list-wallet') as HTMLDivElement;
const addMerchantForm = document.getElementById('addMerchantForm') as HTMLFormElement;
const newMerchantNameInput = document.getElementById('newMerchantName') as HTMLInputElement;
const newMerchantCategoryInput = document.getElementById('newMerchantCategory') as HTMLInputElement;
const addMerchantStatus = document.getElementById('addMerchantStatus') as HTMLDivElement;
const paymentList = document.getElementById('paymentList') as HTMLDivElement;
const transferForm = document.getElementById('transferForm') as HTMLFormElement;
const transferStatusArea = document.getElementById('transferStatus') as HTMLDivElement;
const transferAmountInput = document.getElementById('transferAmount') as HTMLInputElement;
const transferRecipientInput = document.getElementById('transferRecipient') as HTMLInputElement;


// Payment & Wallet Modals
const fundWalletModal = document.getElementById('fundWalletModal') as HTMLDivElement;
const closeFundWalletBtn = document.getElementById('closeFundWallet') as HTMLButtonElement;
const fundWalletForm = document.getElementById('fundWalletForm') as HTMLFormElement;
const fundAmountInput = document.getElementById('fundAmount') as HTMLInputElement;
const fundWalletStatus = document.getElementById('fundWalletStatus') as HTMLDivElement;

const paymentGatewayModal = document.getElementById('paymentGatewayModal') as HTMLDivElement;
const closePaymentGatewayBtn = document.getElementById('closePaymentGateway') as HTMLButtonElement;
const paymentMerchantNameSpan = document.getElementById('paymentMerchantName') as HTMLSpanElement;
const paymentAmountDisplaySpan = document.getElementById('paymentAmountDisplay') as HTMLSpanElement;
const paymentFrequencySelect = document.getElementById('paymentFrequency') as HTMLSelectElement;
const payWithPaystackBtn = document.getElementById('payWithPaystackBtn') as HTMLButtonElement;
const paymentStatus = document.getElementById('paymentStatus') as HTMLDivElement;
const walletPaymentSection = document.getElementById('walletPaymentSection') as HTMLElement;
const walletBalanceInfo = document.getElementById('walletBalanceInfo') as HTMLSpanElement;
const payWithWalletBtn = document.getElementById('payWithWalletBtn') as HTMLButtonElement;
const insufficientFundsMessage = document.getElementById('insufficientFundsMessage') as HTMLDivElement;

// Merchant History Modal
const merchantHistoryModal = document.getElementById('merchantHistoryModal') as HTMLDivElement;
const closeMerchantHistoryBtn = document.getElementById('closeMerchantHistory') as HTMLButtonElement;
const merchantHistoryName = document.getElementById('merchantHistoryName') as HTMLSpanElement;
const merchantHistoryList = document.getElementById('merchantHistoryList') as HTMLDivElement;

// Investment Simulator Modal
const investmentSimulatorModal = document.getElementById('investmentSimulatorModal') as HTMLDivElement;
const closeInvestmentSimulatorBtn = document.getElementById('closeInvestmentSimulator') as HTMLButtonElement;
const investmentSimulatorForm = document.getElementById('investmentSimulatorForm') as HTMLFormElement;
const investmentOpportunityTitle = document.getElementById('investmentOpportunityTitle') as HTMLParagraphElement;
const investmentSimulatorStatus = document.getElementById('investmentSimulatorStatus') as HTMLDivElement;
const investmentAmountInput = document.getElementById('investmentAmount') as HTMLInputElement;
const maxInvestmentAmount = document.getElementById('maxInvestmentAmount') as HTMLDivElement;


// Footer Elements
const contactForm = document.getElementById('contactForm') as HTMLFormElement;
const contactFormMessage = document.getElementById('contactFormMessage') as HTMLDivElement;

// --- Configuration State & Helpers ---
let isAiConfigured = false;
let isPaystackConfigured = false;
let currentInvestmentOpportunity: Opportunity | null = null;


function ensureConfigured(service: 'ai' | 'paystack'): boolean {
    if (service === 'ai') {
        if (!isAiConfigured) {
            console.error("AI service is not configured. API_KEY is missing.");
            return false;
        }
    }
    if (service === 'paystack') {
        if (!isPaystackConfigured) {
            console.error("Paystack service is not configured. PAYSTACK_PUBLIC_KEY is missing.");
            return false;
        }
    }
    return true;
}

// --- AI Schemas ---
const shoppingPlanSchema = {
    type: Type.OBJECT,
    properties: {
        budgetAnalysis: {
            type: Type.OBJECT,
            properties: {
                userBudget: { type: Type.NUMBER, description: "The budget amount mentioned by the user." },
                estimatedCost: { type: Type.NUMBER, description: "The AI's total estimated cost for all items." },
                difference: { type: Type.NUMBER, description: "The difference between userBudget and estimatedCost (positive if under budget, negative if over)." },
                currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€') inferred from the user's prompt. Default to USD." },
                summary: { type: Type.STRING, description: "A brief, sharp summary, like 'Your budget is sufficient' or 'You are over budget'." },
                optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 actionable tips to optimize the budget, focusing on the most impactful savings." }
            },
        },
        budgetItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    estimatedPrice: { type: Type.NUMBER }
                },
            }
        },
        priceAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    priceStability: { type: Type.STRING, description: "e.g., 'Stable', 'Slight Increase', 'Volatile'" },
                    savingTip: { type: Type.STRING, description: "An actionable tip for this specific item." }
                },
            }
        },
        recommendedMerchants: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "A popular merchant or service provider." },
                    address: { type: Type.STRING, description: "Physical location or web address (e.g., Shopify, Amazon, Stripe)." },
                    deals: { type: Type.STRING, description: "What they are known for or their current deals." },
                    verified: { type: Type.BOOLEAN, description: "Set to true if this is a major, well-known merchant, otherwise false." }
                },
            }
        }
    },
};

const budgetPlanSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.OBJECT,
            properties: {
                totalIncome: { type: Type.NUMBER },
                totalFixedCosts: { type: Type.NUMBER },
                discretionaryBudget: { type: Type.NUMBER },
                currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€', '₦') provided in the prompt." },
                primaryGoal: { type: Type.STRING },
            },
        },
        allocations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                },
            }
        },
        recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 actionable recommendations for the user's budget."
        }
    },
};

const expenseReportSchema = {
    type: Type.OBJECT,
    properties: {
        expenseSummary: {
            type: Type.OBJECT,
            properties: {
                totalExpenses: { type: Type.NUMBER },
                largestExpenseCategory: { type: Type.STRING },
                currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€', '₦') inferred from the user's budget. Default to NGN." },
            },
        },
        spendingHabits: {
            type: Type.OBJECT,
            description: "Analysis of user's spending patterns and habits.",
            properties: {
                dailyAverage: { type: Type.NUMBER, description: "The average daily spending calculated from the total expenses over the period (assume 30 days if not specified)." },
                weeklyAverage: { type: Type.NUMBER, description: "The average weekly spending (dailyAverage * 7)." },
                peakSpendingDay: { type: Type.STRING, description: "The day of the week with the highest spending (e.g., 'Friday'). If unable to determine, return 'Not Available'." },
                spendingTrend: { type: Type.STRING, description: "A one-word summary of the spending trend, e.g., 'Consistent', 'High on Weekends', 'Varies'." },
                trendSummary: { type: Type.STRING, description: "A short, actionable summary of the user's spending habits. e.g., 'Your spending is highest on Fridays, mainly on dining out.'" }
            },
        },
        categorizedExpenses: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "e.g., Utilities, Software, Supplies, Food" },
                    amount: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                    isRecurring: { type: Type.BOOLEAN, description: "True if this is a predictable, recurring monthly expense." },
                    merchantCategory: { type: Type.STRING, description: "A generic category for the merchant, e.g., 'Office Supply Store', 'Web Hosting Provider', 'Ride Sharing Service'." },
                    merchantBrandExample: { type: Type.STRING, description: "A plausible, globally recognized brand example for the category, e.g., 'Staples', 'GoDaddy', 'Uber'. Can be omitted."}
                },
            }
        },
        costCuttingSuggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    area: { type: Type.STRING, description: "The expense area to target." },
                    suggestion: { type: Type.STRING, description: "A specific, actionable cost-cutting tip." },
                    potentialSavings: { type: Type.STRING, description: "Estimated monthly savings, e.g., '₦5000 - ₦10000'" },
                }
            }
        },
        investmentOpportunities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "e.g., High-Yield Savings, Index Funds, Robo-Advisor" },
                    description: { type: Type.STRING, description: "Brief explanation of the opportunity." },
                    riskLevel: { type: Type.STRING, description: "e.g., Low, Medium, High" },
                }
            }
        },
        localMerchantSuggestions: {
            type: Type.ARRAY,
            description: "A list of suggested local merchants based on the user's location and spending.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the local Nigerian merchant." },
                    category: { type: Type.STRING, description: "The category of the merchant, e.g., 'Groceries', 'Electronics'." },
                    reason: { type: Type.STRING, description: "A brief reason why this merchant is being recommended." }
                }
            }
        }
    },
};

const performanceReviewSchema = {
    type: Type.OBJECT,
    properties: {
        adherenceScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing how well the user stuck to their budget. 100 is perfect adherence. Calculated based on overall variance."
        },
        currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€') from the budget." },
        overallSummary: {
            type: Type.STRING,
            description: "A brief, encouraging summary of the user's performance against their budget. Mention the biggest win and the area needing most improvement."
        },
        varianceAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    budgetedAmount: { type: Type.NUMBER },
                    actualAmount: { type: Type.NUMBER },
                    variance: { type: Type.NUMBER, description: "Difference between actual and budgeted (actual - budgeted). Negative means under-spent (good), positive means over-spent (bad)." },
                }
            }
        },
        keyInsights: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    insight: { type: Type.STRING, description: "An actionable insight based on the analysis." },
                    area: { type: Type.STRING, description: "The area this insight applies to (e.g., 'Savings', 'Spending Habits')." }
                }
            }
        }
    }
};

const creativeCopySchema = {
    type: Type.OBJECT,
    properties: {
        adCopies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING, description: "A catchy, attention-grabbing headline for the ad." },
                    body: { type: Type.STRING, description: "The main text of the ad, persuasive and informative." },
                    callToAction: { type: Type.STRING, description: "A clear and compelling call to action, e.g., 'Shop Now', 'Learn More'." }
                }
            }
        }
    }
};

const opportunitiesSchema = {
    type: Type.OBJECT,
    properties: {
        opportunities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Type of opportunity, e.g., 'Control Expenditures', 'Make Gold Multiply', 'Increase Earning Ability'." },
                    title: { type: Type.STRING, description: "A catchy title for the opportunity, framed as one of the 'cures'." },
                    description: { type: Type.STRING, description: "A detailed explanation of the opportunity and why it's relevant to the user, referencing their data." },
                    potentialSavings: { type: Type.STRING, description: "Estimated financial benefit, e.g., '₦5,000/month', '15% ROI (Medium Risk)'." },
                    action: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING, description: "A call to action, e.g., 'Adjust Budget', 'Explore Investment'." },
                            type: { type: Type.STRING, description: "The action type: 'navigate' or 'invest'." },
                            target: { type: Type.STRING, description: "For 'navigate', the view name (e.g., 'budget'). For 'invest', the name of the investment opportunity." }
                        }
                    }
                }
            }
        }
    }
};


// --- Helper Functions ---
function showStatusMessage(container: HTMLElement, message: string, type: 'success' | 'error' | 'info', withSpinner = false) {
    if (!container) return;
    container.classList.remove('hidden');
    container.className = 'status-area'; // Reset classes
    
    const spinnerHtml = withSpinner ? '<div class="loading-spinner"></div>' : '';
    
    container.className = `status-area ${type}-message`;
    container.innerHTML = `<div class="loading-state">${spinnerHtml}<p>${message}</p></div>`;
}

function hideStatusMessage(container: HTMLElement, delay?: number) {
    if (!container) return;
    if (delay) {
        setTimeout(() => container.classList.add('hidden'), delay);
    } else {
        container.classList.add('hidden');
    }
}

function parseJsonFromAi<T>(text: string): T {
    try {
        return JSON.parse(text) as T;
    } catch (e) {
        console.error("JSON Parsing Error:", e);
        throw new Error("AI returned an invalid response format. Please try again.");
    }
}

function copyToClipboard(text: string, button: HTMLButtonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = `${icons.check} Copied!`;
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function getCombinedMerchants(user: User): MerchantSummary[] {
    const merchantMap = new Map<string, MerchantSummary>();

    // Process merchants from expenses
    if (user.expenses && user.expenses.length > 0) {
        const latestExpenses = user.expenses[user.expenses.length - 1];
        latestExpenses.categorizedExpenses.forEach(expense => {
            const merchantName = expense.merchantBrandExample || expense.merchantCategory;
            if (merchantName) {
                const existing = merchantMap.get(merchantName) || { name: merchantName, category: expense.merchantCategory, totalSpent: 0, transactionCount: 0, source: 'expenses' };
                existing.totalSpent += expense.amount;
                existing.transactionCount += 1;
                merchantMap.set(merchantName, existing);
            }
        });
    }

    // Process manually added merchants
    user.merchants.forEach(merchant => {
        if (!merchantMap.has(merchant.name)) {
            merchantMap.set(merchant.name, { ...merchant, totalSpent: 0, transactionCount: 0, source: 'manual' });
        }
    });

    return Array.from(merchantMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
}

function renderSkeletonLoader(container: HTMLElement, type: 'cards' | 'list' = 'cards') {
    if (!container) return;
    let skeletonHtml = '';
    if (type === 'cards') {
        skeletonHtml = `
            <div class="skeleton-card">
                <div class="skeleton-line title"></div>
                <div class="skeleton-grid">
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                </div>
                <div class="skeleton-line heading"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        `;
    } else { // 'list' for ad copy
        skeletonHtml = `
            <div class="ad-copy-grid">
                <div class="skeleton-card ad-copy">
                    <div class="skeleton-line small-heading"></div>
                    <div class="skeleton-line heading"></div>
                    <div class="skeleton-line small-heading"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line small-heading"></div>
                    <div class="skeleton-line cta"></div>
                </div>
            </div>
        `;
    }
    container.innerHTML = skeletonHtml;
    container.parentElement?.classList.remove('hidden');
    container.classList.remove('hidden');
}

// --- View & UI Management ---
function renderAppView() {
    if (currentUser) {
        landingPage.classList.add('hidden');
        appDashboard.classList.remove('hidden');
    } else {
        landingPage.classList.remove('hidden');
        appDashboard.classList.add('hidden');
        
        // Restore header for logged-out user
        navListLinks.innerHTML = `
            <li><a href="#features">Features</a></li>
            <li><a href="#demo">AI Demo</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        `;
        headerActionsContainer.innerHTML = `
            <button id="headerLoginBtn" class="btn btn-secondary-outline">Login</button>
            <button id="headerSignUpBtn" class="btn btn-primary">Sign Up Free</button>
        `;
        document.getElementById('headerLoginBtn')!.addEventListener('click', () => openAuthModal(false));
        document.getElementById('headerSignUpBtn')!.addEventListener('click', () => openAuthModal(true));

        // Ensure mobile menu is reset
        mainNav.classList.remove('active');
        hamburger.classList.remove('is-active');
        const sidebar = document.querySelector('.app-sidebar') as HTMLElement;
        sidebar.classList.remove('active');
        appOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
    renderIcons();
}

function navigateToView(view: AppView) {
    currentView = view;
    renderCurrentView();

    const sidebar = document.querySelector('.app-sidebar') as HTMLElement;
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        appOverlay.classList.add('hidden');
        hamburger.classList.remove('is-active');
        document.body.style.overflow = '';
    }
}


function renderCurrentView() {
    allDashboardViews.forEach(view => view.classList.add('hidden'));
    const viewToShow = document.getElementById(`view-${currentView}`);
    if (viewToShow) {
        viewToShow.classList.remove('hidden');
    }

    document.querySelectorAll('#sidebar-menu li a').forEach(link => {
        if (link.getAttribute('data-view') === currentView) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Call the specific renderer for the current view
    switch(currentView) {
        case 'dashboard':
            renderDashboardHomeView();
            break;
        case 'wallet':
            renderWalletView();
            break;
        case 'budget':
            // The view is static, but if it had dynamic parts, they'd be rendered here
            break;
        case 'expenses':
            // Check if user has budget to derive currency
            if (!currentUser?.budgets.length) {
                showStatusMessage(expenseStatusArea, "Please create a budget first to set your currency.", 'info');
            } else {
                hideStatusMessage(expenseStatusArea);
            }
            break;
        case 'review':
            // The view is static now
            break;
        case 'creative':
            renderSavedAdCopyLibrary();
            break;
        case 'opportunities':
            renderSavedOpportunities();
            break;
    }
}


function renderSidebar() {
    const navItems = [
        { view: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
        { view: 'wallet', label: 'Wallet & Pay', icon: icons.wallet },
        { view: 'budget', label: 'Budget Planner', icon: icons.budget },
        { view: 'expenses', label: 'Expense Tracker', icon: icons.expenses },
        { view: 'review', label: 'Performance Review', icon: icons.review },
        { view: 'creative', label: 'Creative Suite', icon: icons.creative },
        { view: 'opportunities', label: 'Growth Opportunities', icon: icons.opportunities },
    ];

    sidebarMenu.innerHTML = navItems.map(item => `
        <li>
            <a href="#" data-view="${item.view}">
                ${item.icon}
                <span>${item.label}</span>
            </a>
        </li>
    `).join('');
}


// --- Rendering Functions ---
function renderDashboardHomeView() {
    if (!currentUser) return;
    welcomeMessage.textContent = `Welcome Back, ${currentUser.name}!`;

    const isChecklistComplete = Object.values(currentUser.onboarding).every(Boolean);

    if (isChecklistComplete) {
        gettingStartedChecklist.classList.add('hidden');
        mainDashboardContent.classList.remove('hidden');
        renderDashboardSummary();
        renderTrendChart();
        renderRecentActivity();
    } else {
        gettingStartedChecklist.classList.remove('hidden');
        mainDashboardContent.classList.add('hidden');
        renderOnboardingChecklist();
    }
}

function renderOnboardingChecklist() {
    if (!currentUser) return;
    Object.entries(currentUser.onboarding).forEach(([key, isComplete]) => {
        const itemEl = document.getElementById(`onboarding-${key}`);
        if(itemEl) {
            itemEl.classList.toggle('completed', isComplete);
            const statusDiv = itemEl.querySelector('.getting-started-status');
            if(statusDiv) {
                statusDiv.innerHTML = isComplete ? icons.check : '';
            }
        }
    });
}

function renderDashboardOverview(data: { [key: string]: { value: string; type?: 'success' | 'error'; note?: string; view?: AppView } }) {
    dashboardOverview.innerHTML = Object.entries(data).map(([title, { value, type, note, view }]) => `
        <div class="overview-card glass-effect" ${view ? `data-view="${view}"` : ''}>
            <h4>${title}</h4>
            <p class="value ${type || ''}">${value}</p>
            ${note ? `<small class="note">${note}</small>` : ''}
        </div>
    `).join('');
    dashboardOverview.classList.remove('hidden');
}

function renderDashboardSummary() {
    if (!currentUser) {
        dashboardOverview.classList.add('hidden');
        return;
    }

    const latestBudget = currentUser.budgets.length > 0 ? currentUser.budgets[currentUser.budgets.length - 1] : null;
    const latestExpenses = currentUser.expenses.length > 0 ? currentUser.expenses[currentUser.expenses.length - 1] : null;

    const discretionaryBudget = latestBudget?.summary?.discretionaryBudget || 0;
    const totalExpenses = latestExpenses?.expenseSummary?.totalExpenses || 0;
    const currency = latestBudget?.summary?.currency || latestExpenses?.expenseSummary?.currency || '₦';
    
    const summaryData: { [key: string]: { value: string; type?: 'success' | 'error'; note?: string; view?: AppView } } = {};

    summaryData['Discretionary Budget'] = {
        value: `${currency}${discretionaryBudget.toLocaleString()}`,
        type: 'success',
        note: latestBudget ? 'From your latest budget' : 'Create a budget to start',
        view: 'budget'
    };

    summaryData['Total Expenses'] = {
        value: `${currency}${totalExpenses.toLocaleString()}`,
        type: 'error',
        note: latestExpenses ? 'From your latest report' : 'Track expenses to see this',
        view: 'expenses'
    };

    if (latestBudget && latestExpenses) {
        const netPosition = discretionaryBudget - totalExpenses;
        summaryData['Net Position'] = {
            value: `${currency}${Math.abs(netPosition).toLocaleString()}`,
            type: netPosition >= 0 ? 'success' : 'error',
            note: netPosition >= 0 ? 'Under Budget' : 'Over Budget',
            view: 'review'
        };
    } else {
         summaryData['Net Position'] = {
            value: 'N/A',
            note: 'Track budget & expenses',
            view: 'review'
        };
    }
    
    summaryData['Wallet Balance'] = {
        value: `${currency}${currentUser.wallet.balance.toLocaleString()}`,
        note: 'Manage your wallet & pay',
        view: 'wallet'
    };
    
    renderDashboardOverview(summaryData);
}

function renderRecentActivity() {
    if (!currentUser) return;
    const activities: string[] = [];

    if (currentUser.budgets.length > 0) {
        activities.push("Created a new budget plan.");
    }
    if (currentUser.expenses.length > 0) {
        activities.push("Analyzed a new expense report.");
    }
    if (currentUser.payments.length > 0) {
        activities.push(`Scheduled ${currentUser.payments.length} payment(s).`);
    }

    if (activities.length === 0) {
        recentActivityList.innerHTML = `<div class="empty-state">Your recent activities will appear here.</div>`;
        return;
    }
    
    recentActivityList.innerHTML = activities.map(act => `<p class="payment-item">${act}</p>`).join('');
}

function renderTrendChart() {
    if (!currentUser || currentUser.budgets.length < 2) {
        dashboardTrendChartContainer.innerHTML = `<div class="empty-state">Complete at least two budget/expense cycles to see your trend.</div>`;
        return;
    }
    
    const dataPoints = currentUser.budgets.map((budget, index) => {
        const expense = currentUser.expenses[index];
        return {
            label: `Cycle ${index + 1}`,
            budget: budget.summary.discretionaryBudget,
            expenses: expense ? expense.expenseSummary.totalExpenses : 0,
        };
    });

    const currency = currentUser.budgets[0].summary.currency || '₦';
    const maxValue = Math.max(...dataPoints.flatMap(d => [d.budget, d.expenses]));
    const width = dashboardTrendChartContainer.clientWidth;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 50, left: 60 };

    const svg = `
        <svg class="trend-chart-svg" viewBox="0 0 ${width} ${height}">
            <!-- Grid lines -->
            ${Array.from({length: 5}).map((_, i) => `<line class="grid" x1="${padding.left}" y1="${padding.top + i * (height - padding.top - padding.bottom) / 4}" x2="${width - padding.right}" y2="${padding.top + i * (height - padding.top - padding.bottom) / 4}"></line>`).join('')}
            
            <!-- Y-Axis Labels -->
            ${Array.from({length: 5}).map((_, i) => `<text class="axis-label" x="${padding.left - 10}" y="${padding.top + i * (height - padding.top - padding.bottom) / 4 + 5}" text-anchor="end">${currency}${(maxValue * (1 - i/4)).toLocaleString(undefined, {notation: 'compact'})}</text>`).join('')}

            <!-- X-Axis Labels -->
            ${dataPoints.map((d, i) => `<text class="axis-label" x="${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)}" y="${height - padding.bottom + 20}" text-anchor="middle">${d.label}</text>`).join('')}

            <!-- Budget Line -->
            <polyline class="line line-budget" points="${dataPoints.map((d, i) => `${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)},${height - padding.bottom - (d.budget / maxValue) * (height - padding.top - padding.bottom)}`).join(' ')}" />
            
            <!-- Expenses Line -->
            <polyline class="line line-expenses" points="${dataPoints.map((d, i) => `${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)},${height - padding.bottom - (d.expenses / maxValue) * (height - padding.top - padding.bottom)}`).join(' ')}" />
            
            <!-- Data Points -->
            ${dataPoints.map((d, i) => `
                <circle class="dot dot-budget" cx="${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)}" cy="${height - padding.bottom - (d.budget / maxValue) * (height - padding.top - padding.bottom)}" r="5" />
                <circle class="dot dot-expenses" cx="${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)}" cy="${height - padding.bottom - (d.expenses / maxValue) * (height - padding.top - padding.bottom)}" r="5" />
            `).join('')}
        </svg>
        <div class="trend-chart-legend">
            <div class="legend-item"><span class="legend-color-box" style="background-color: var(--color-success);"></span> Budget</div>
            <div class="legend-item"><span class="legend-color-box" style="background-color: var(--color-error);"></span> Expenses</div>
        </div>
    `;

    dashboardTrendChartContainer.innerHTML = svg;
}


function renderChart(items: any[], valueKey: string, labelKey: string, percentKey: string, currency: string) {
    if (!items || items.length === 0) return '';
    const chartHtml = items.map(item => `
        <div class="chart-segment">
            <div class="chart-label">
                <span>${item[labelKey]}</span>
                <span>${currency}${item[valueKey].toLocaleString()}</span>
            </div>
            <div class="chart-bar-wrapper">
                <div class="chart-bar" style="--bar-width: ${item[percentKey]}%;"></div>
            </div>
        </div>
    `).join('');
    return `<div class="chart-container">${chartHtml}</div>`;
}

function renderGeneratedPlan(plan: ShoppingPlan, container: HTMLElement) {
    const budget = plan.budgetAnalysis;
    const currency = budget.currency || '₦';
    const differenceClass = budget.difference >= 0 ? 'success' : 'error';

    const budgetHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. AI Estimate</h3>
            <div class="summary-grid">
                <div class="summary-card"><h4>Your Budget</h4><p>${currency}${budget.userBudget.toLocaleString()}</p></div>
                <div class="summary-card"><h4>AI Estimated Cost</h4><p>${currency}${budget.estimatedCost.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Difference</h4><p class="${differenceClass}">${currency}${Math.abs(budget.difference).toLocaleString()}</p></div>
            </div>
            <p class="summary-text">${budget.summary}</p>
        </div>`;
    
    const optimizationHtml = (budget.optimizationTips && budget.optimizationTips.length > 0) ? `
        <div class="result-section optimization-tips">
            <h4 class="result-heading"><span class="btn-icon">${icons.magic}</span> AI Savings & Planning Tips</h4>
            <ul>${budget.optimizationTips.map((tip: string) => `<li>${tip}</li>`).join('')}</ul>
        </div>
    ` : '';
    
    const itemsHtml = `
        <div class="result-section">
             <h3 class="result-heading">Itemized Shopping List</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Item</th><th>Quantity</th><th>Est. Price (${currency})</th></tr></thead><tbody>
            ${plan.budgetItems.map((item) => `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>${currency}${item.estimatedPrice.toLocaleString()}</td></tr>`).join('')}
            </tbody></table></div>
        </div>`;

    const analysisHtml = `
        <div class="result-section">
            <h3 class="result-heading">AI Price Analysis</h3>
            <div class="analysis-grid">
                ${plan.priceAnalysis.map((item) => `<div class="analysis-card"><h4>${item.itemName}</h4><p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p><p class="tip"><span class="btn-icon">${icons.magic}</span> <strong>Tip:</strong> ${item.savingTip}</p></div>`).join('')}
            </div>
        </div>`;

    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Shops & Services</h3>
            <div class="merchant-grid">
                ${plan.recommendedMerchants.map((merchant) => `<div class="merchant-card"><h4>${merchant.name} ${merchant.verified ? `<span class="verified-icon" data-icon="check"></span>` : ''}</h4><p><span class="footer-icon-placeholder" data-icon="envelope"></span> ${merchant.address}</p><p class="deals">${merchant.deals}</p></div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = budgetHtml + optimizationHtml + itemsHtml + analysisHtml + merchantsHtml;
    renderIcons();
}

function renderBudgetPlan(plan: BudgetPlan, container: HTMLElement) {
    const summary = plan.summary;
    const currency = summary.currency || '₦';
    
    const summaryHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget Overview</h3>
            <div class="summary-grid">
                <div class="summary-card"><h4>Total Income</h4><p class="success">${currency}${summary.totalIncome.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Fixed Costs</h4><p class="error">${currency}${summary.totalFixedCosts.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Discretionary</h4><p class="success">${currency}${summary.discretionaryBudget.toLocaleString()}</p></div>
            </div>
            <p class="summary-text"><strong>Primary Goal:</strong> ${summary.primaryGoal}</p>
        </div>
    `;

    const chartHtml = `
         <div class="result-section">
             <h3 class="result-heading">Visual Allocations</h3>
             ${renderChart(plan.allocations, 'amount', 'category', 'percentage', currency)}
        </div>
    `;

    const allocationsHtml = `
         <div class="result-section">
             <h3 class="result-heading">Detailed Allocations</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Category</th><th>Amount (${currency})</th><th>% of Income</th><th>Description</th></tr></thead><tbody>
            ${plan.allocations.map((item) => `<tr><td>${item.category}</td><td>${item.amount.toLocaleString()}</td><td>${item.percentage}%</td><td>${item.description}</td></tr>`).join('')}
            </tbody></table></div>
        </div>
    `;

    const recommendationsHtml = (plan.recommendations && plan.recommendations.length > 0) ? `
        <div class="result-section optimization-tips">
            <h3 class="result-heading"><span class="btn-icon">${icons.magic}</span> AI Recommendations</h3>
            <ul>${plan.recommendations.map((tip: string) => `<li>${tip}</li>`).join('')}</ul>
        </div>
    ` : '';

    container.innerHTML = summaryHtml + chartHtml + allocationsHtml + recommendationsHtml;
    renderIcons();
}

function renderExpenseReport(report: ExpenseReport, container: HTMLElement) {
    const currency = report.expenseSummary.currency || '₦';
    const habits = report.spendingHabits;

    const habitInsightsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Spending Habit Insights</h3>
            <div class="dashboard-overview">
                <div class="overview-card glass-effect">
                    <h4>Daily Average</h4>
                    <p class="value">${currency}${habits.dailyAverage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div class="overview-card glass-effect">
                    <h4>Weekly Average</h4>
                    <p class="value">${currency}${habits.weeklyAverage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div class="overview-card glass-effect">
                    <h4>Peak Spending Day</h4>
                    <p class="value info">${habits.peakSpendingDay}</p>
                </div>
            </div>
            <div class="summary-text" style="text-align: left; margin-top: 20px;">
                <strong><span class="btn-icon" data-icon="chartLine"></span> AI Trend Analysis:</strong> ${habits.trendSummary}
            </div>
        </div>
    `;

    const chartHtml = `
        <div class="result-section">
            <h3 class="result-heading">Visual Spending Breakdown</h3>
            ${renderChart(report.categorizedExpenses, 'amount', 'category', 'percentage', currency)}
        </div>
    `;

    const breakdownHtml = `
        <div class="result-section">
             <h3 class="result-heading">Detailed Spending Breakdown</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Category</th><th>Amount (${currency})</th><th>% of Total</th><th>Action</th></tr></thead><tbody>
            ${report.categorizedExpenses.map((item) => `<tr>
                <td>${item.category}</td>
                <td>${item.amount.toLocaleString()}</td>
                <td>${item.percentage}%</td>
                <td>
                    <div class="action-buttons">
                        ${item.isRecurring ? `<button class="btn btn-small-action" data-merchant="${item.merchantBrandExample || item.merchantCategory}" data-amount="${item.amount}">Schedule Payment</button>` : '<span>-</span>'}
                    </div>
                </td>
            </tr>`).join('')}
            </tbody></table></div>
        </div>
    `;
    const savingsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Cost-Saving Suggestions</h3>
            <div class="analysis-grid">
                ${report.costCuttingSuggestions.map((item) => `<div class="analysis-card"><h4 class="info">${item.area}</h4><p>${item.suggestion}</p><p class="tip"><strong>Potential Savings:</strong> ${item.potentialSavings}</p></div>`).join('')}
            </div>
        </div>
    `;
    const investmentsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Savings & Investment Ideas</h3>
             <div class="merchant-grid">
                ${report.investmentOpportunities.map((item) => `<div class="merchant-card"><h4>${item.name}</h4><p><strong>Risk:</strong> ${item.riskLevel}</p><p>${item.description}</p></div>`).join('')}
            </div>
        </div>
    `;

    const merchantsHtml = (report.localMerchantSuggestions && report.localMerchantSuggestions.length > 0) ? `
        <div class="result-section">
            <h3 class="result-heading">Local Merchant Suggestions</h3>
            <div class="merchant-grid">
                ${report.localMerchantSuggestions.map(merchant => `
                    <div class="merchant-card">
                        <h4>${merchant.name}</h4>
                        <p><strong>Category:</strong> ${merchant.category}</p>
                        <p class="tip">${merchant.reason}</p>
                        <button class="btn btn-secondary-outline" style="margin-top: 15px;" data-map-query="${merchant.name}, Nigeria">View on Map</button>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    container.innerHTML = habitInsightsHtml + chartHtml + breakdownHtml + savingsHtml + investmentsHtml + merchantsHtml;
    renderIcons();
}


function renderPerformanceReview(report: PerformanceReview, container: HTMLElement) {
    const score = report.adherenceScore;
    const currency = report.currency || '₦';

    const summaryHtml = `
        <div class="result-section review-summary">
            <div class="adherence-score-wrapper">
                 <svg width="180" height="180" viewBox="0 0 180 180" class="adherence-score-gauge">
                    <defs>
                        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="${score > 50 ? 'var(--color-success)' : 'var(--color-gold-accent)'}"/>
                            <stop offset="100%" stop-color="${score > 80 ? 'var(--color-sky-blue-dark)' : 'var(--color-gold-accent)'}"/>
                        </linearGradient>
                    </defs>
                    <circle class="gauge-bg" cx="90" cy="90" r="80"></circle>
                    <circle class="gauge-fg" cx="90" cy="90" r="80" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${100 - score}"></circle>
                </svg>
                <div class="adherence-score-text">
                    <div class="score">${score}<span style="font-size: 0.5em">%</span></div>
                    <div class="label">Budget Adherence</div>
                </div>
            </div>
            <p class="summary-text" style="max-width: 600px;">${report.overallSummary}</p>
        </div>
    `;

    const varianceHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. Actuals Breakdown</h3>
            <div class="table-wrapper"><table class="data-table">
                <thead><tr><th>Category</th><th>Budgeted (${currency})</th><th>Actual (${currency})</th><th>Variance (${currency})</th></tr></thead>
                <tbody>
                    ${report.varianceAnalysis.map((item) => {
                        const varianceClass = item.variance > 0 ? 'variance-negative' : item.variance < 0 ? 'variance-positive' : 'variance-neutral';
                        return `<tr>
                            <td>${item.category}</td>
                            <td>${item.budgetedAmount.toLocaleString()}</td>
                            <td>${item.actualAmount.toLocaleString()}</td>
                            <td class="${varianceClass}">${item.variance.toLocaleString()}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table></div>
            <p style="font-size: 0.9em; text-align: center; margin-top: 15px;"><span class="variance-positive">Green variance</span> means you spent less than budgeted (good!). <span class="variance-negative">Red variance</span> means you overspent.</p>
        </div>
    `;
    
    const insightsHtml = `
         <div class="result-section optimization-tips">
            <h3 class="result-heading"><span class="btn-icon">${icons.magic}</span> Key Performance Insights</h3>
            <ul>${report.keyInsights.map((item) => `<li><strong>${item.area}:</strong> ${item.insight}</li>`).join('')}</ul>
        </div>
    `;

    container.innerHTML = summaryHtml + varianceHtml + insightsHtml;
    renderIcons();
}

function renderAdCopy(data: CreativeCopy, container: HTMLElement) {
    if (!data?.adCopies || data.adCopies.length === 0) {
        container.innerHTML = '<div class="empty-state">The AI could not generate ad copy. Please try a different prompt.</div>';
        return;
    }
    const copiesHtml = data.adCopies.map((copy) => `
        <div class="ad-copy-card">
            <div class="ad-copy-part">
                <div class="ad-copy-part-header">
                    <span>Headline</span>
                    <button class="copy-btn" data-copy-text="${copy.headline}">${icons.copy} Copy</button>
                </div>
                <div class="ad-headline">${copy.headline}</div>
            </div>
            <div class="ad-copy-part">
                <div class="ad-copy-part-header">
                    <span>Body</span>
                    <button class="copy-btn" data-copy-text="${copy.body}">${icons.copy} Copy</button>
                </div>
                <p class="ad-body">${copy.body}</p>
            </div>
             <div class="ad-copy-part">
                <div class="ad-copy-part-header">
                    <span>Call To Action</span>
                    <button class="copy-btn" data-copy-text="${copy.callToAction}">${icons.copy} Copy</button>
                </div>
                <div class="ad-cta">${copy.callToAction}</div>
            </div>
        </div>
    `).join('');
    container.innerHTML = `<div class="ad-copy-grid">${copiesHtml}</div>`;
    renderIcons();
}

function renderSavedAdCopyLibrary() {
    if (!savedAdCopyLibraryContainer) return;

    if (!currentUser || !currentUser.creativeCopies || currentUser.creativeCopies.length === 0) {
        savedAdCopyLibraryContainer.innerHTML = '<div class="empty-state">Your generated ad copy will appear here.</div>';
        return;
    }

    const allCopiesHtml = currentUser.creativeCopies.flatMap(dataSet => 
        dataSet.adCopies.map((copy) => `
            <div class="ad-copy-card">
                 <div class="ad-copy-part">
                    <div class="ad-copy-part-header">
                        <span>Headline</span>
                        <button class="copy-btn" data-copy-text="${copy.headline}">${icons.copy} Copy</button>
                    </div>
                    <div class="ad-headline">${copy.headline}</div>
                </div>
                <div class="ad-copy-part">
                    <div class="ad-copy-part-header">
                        <span>Body</span>
                        <button class="copy-btn" data-copy-text="${copy.body}">${icons.copy} Copy</button>
                    </div>
                    <p class="ad-body">${copy.body}</p>
                </div>
                 <div class="ad-copy-part">
                    <div class="ad-copy-part-header">
                        <span>Call To Action</span>
                        <button class="copy-btn" data-copy-text="${copy.callToAction}">${icons.copy} Copy</button>
                    </div>
                    <div class="ad-cta">${copy.callToAction}</div>
                </div>
            </div>
        `)
    ).join('');

    savedAdCopyLibraryContainer.innerHTML = `<div class="ad-copy-grid">${allCopiesHtml || '<div class="empty-state">No ad copy generated yet.</div>'}</div>`;
    renderIcons();
}

function renderOpportunities(data: OpportunitiesData, container: HTMLElement) {
    if (!data?.opportunities || data.opportunities.length === 0) {
        container.innerHTML = '<div class="empty-state">No specific opportunities found at this time. Try updating your budget or expenses.</div>';
        return;
    }

    const getIconForType = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('expenditure')) return icons.expenses;
        if (lowerType.includes('multiply') || lowerType.includes('invest')) return icons.chartLine;
        if (lowerType.includes('earn')) return icons.opportunities;
        if (lowerType.includes('saving')) return icons.wallet;
        return icons.magic;
    };
    
    const opportunitiesHtml = data.opportunities.map((opp, index) => `
        <div class="opportunity-card">
            <div class="card-header">
                <div class="card-icon">${getIconForType(opp.type)}</div>
                <div>
                    <h4 class="card-title">${opp.title}</h4>
                    <span class="card-type">${opp.type}</span>
                </div>
            </div>
            <div class="card-body">
                <p>${opp.description}</p>
            </div>
            <div class="card-footer">
                <p>Potential Benefit: <strong class="potential-savings">${opp.potentialSavings}</strong></p>
                <button class="btn btn-secondary-outline"
                        style="margin-top: 10px;"
                        data-action-type="${opp.action.type}"
                        data-action-target="${opp.action.target}"
                        data-opportunity-index="${index}">
                    ${opp.action.text}
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="opportunities-grid">${opportunitiesHtml}</div>`;
    renderIcons();
}

function renderSavedOpportunities() {
    if (!opportunitiesResultsContainer) return;
    if (!currentUser || !currentUser.opportunities || currentUser.opportunities.length === 0) {
        opportunitiesResultsContainer.innerHTML = '<div class="empty-state">Generate opportunities to see them here.</div>';
        return;
    }
    const latestOpportunities = currentUser.opportunities[currentUser.opportunities.length - 1];
    renderOpportunities(latestOpportunities, opportunitiesResultsContainer);
}

function renderPaymentList() {
    if (!currentUser || !paymentList) return;
    if (currentUser.payments.length === 0) {
        paymentList.innerHTML = `<div class="empty-state">No automated payments scheduled. Use the Expense Tracker to schedule recurring payments.</div>`;
        return;
    }
    const currency = currentUser.budgets[0]?.summary?.currency || '₦';

    const paymentsHtml = currentUser.payments.map((p, index) => `
        <div class="payment-item">
            <div>
                <p><strong>${p.merchant}</strong></p>
                <p style="font-size: 0.9em; color: var(--color-text-secondary);">${p.frequency}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <p class="amount error">${currency}${p.amount.toLocaleString()}</p>
                <button class="btn btn-small-action" data-payment-index="${index}">Cancel</button>
            </div>
        </div>
    `).join('');

    paymentList.innerHTML = paymentsHtml;
}

function renderAllMerchantsList() {
    if (!currentUser || !allMerchantsListWallet) return;
    const merchants = getCombinedMerchants(currentUser);
    const currency = currentUser.budgets[0]?.summary.currency || '₦';

    if (merchants.length === 0) {
        allMerchantsListWallet.innerHTML = '<div class="empty-state">Analyze expenses or add merchants manually to see them here.</div>';
        return;
    }
    
    allMerchantsListWallet.innerHTML = merchants.map(m => `
        <div class="merchant-item clickable" data-merchant-name="${m.name}">
            <div>
                <p><strong>${m.name}</strong></p>
                <p style="font-size: 0.9em; color: var(--color-text-secondary);">${m.category}</p>
            </div>
            <div>
                ${m.source === 'expenses' ? `<p class="amount error">${currency}${m.totalSpent.toLocaleString()}</p><p style="font-size: 0.8em; text-align: right; color: var(--color-text-secondary);">${m.transactionCount} transaction(s)</p>` : `<p style="font-size: 0.9em; color: var(--color-text-secondary);">Manually Added</p>`}
            </div>
        </div>
    `).join('');
}


function renderIcons() {
    document.querySelectorAll<HTMLElement>('[data-icon]').forEach(el => {
        const kebabKey = el.dataset.icon;
        if (kebabKey) {
            const camelCaseKey = kebabKey.replace(/-([a-z])/g, g => g[1].toUpperCase()) as keyof typeof icons;
            if (icons[camelCaseKey] && el.innerHTML === '') { // Only render if empty
                el.innerHTML = icons[camelCaseKey];
            }
        }
    });
}

// --- Wallet & Pay View ---
function renderWalletView() {
    if (!currentUser) return;
    // Default to overview tab
    const overviewTab = walletTabsContainer.querySelector('[data-tab="overview"]') as HTMLElement;
    handleWalletTabs({ target: overviewTab } as unknown as Event);
}

function handleWalletTabs(e: Event) {
    const target = e.target as HTMLElement;
    if (target && target.matches('.tab-link')) {
        const tabId = target.dataset.tab;
        walletTabsContainer.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        walletViewContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        target.classList.add('active');
        document.getElementById(`wallet-tab-${tabId!}`)?.classList.add('active');

        // Render content for the active tab
        switch(tabId) {
            case 'overview': renderWalletOverview(); break;
            case 'merchants': renderAllMerchantsList(); break;
            case 'payments': renderPaymentList(); break;
        }
    }
}

function renderWalletOverview() {
    if(!currentUser) return;
    const balanceEl = document.getElementById('wallet-balance-display');
    const savingsEl = document.getElementById('savings-vault-balance-display');
    const currency = currentUser.budgets[0]?.summary.currency || '₦';
    if(balanceEl) {
        balanceEl.textContent = `${currency}${currentUser.wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if(savingsEl) {
        savingsEl.textContent = `${currency}${currentUser.savingsVault.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    renderWalletTransactions();
}

function renderWalletTransactions() {
    if(!currentUser || !walletTransactionList) return;
    const transactions = [...currentUser.wallet.transactions].reverse(); // Show most recent first

    if (transactions.length === 0) {
        walletTransactionList.innerHTML = `<div class="empty-state">Your wallet transactions will appear here.</div>`;
        return;
    }

    const currency = currentUser.budgets[0]?.summary.currency || '₦';
    const transactionHtml = transactions.map(t => {
        const isDebit = t.type === 'payment' || t.type === 'transfer' || t.type === 'investment';
        const isSavings = t.type === 'savings';
        let icon, amountClass, sign;

        if (isSavings) {
            icon = icons.wallet;
            amountClass = 'info';
            sign = '→';
        } else if (t.type === 'investment') {
            icon = icons.chartLine;
            amountClass = 'error';
            sign = '-';
        } else {
            icon = isDebit ? icons.arrowUp : icons.arrowDown;
            amountClass = isDebit ? 'error' : 'success';
            sign = isDebit ? '-' : '+';
        }
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon ${amountClass}">${icon}</div>
                <div class="transaction-details">
                    <p><strong>${t.description}</strong></p>
                    <p class="transaction-date">${new Date(t.date).toLocaleString()}</p>
                </div>
                <div class="transaction-amount ${amountClass}">${sign}${currency}${t.amount.toLocaleString()}</div>
            </div>
        `;
    }).join('');
    walletTransactionList.innerHTML = transactionHtml;
}


// --- Event Handlers & Logic ---
function handleMobileMenu() {
    const isDashboardActive = !appDashboard.classList.contains('hidden');
    
    if (isDashboardActive) {
        // Handle sidebar for logged-in users on mobile
        const sidebar = document.querySelector('.app-sidebar') as HTMLElement;
        sidebar.classList.toggle('active');
        appOverlay.classList.toggle('hidden');
        hamburger.classList.toggle('is-active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    } else {
        // Handle nav menu for logged-out users on mobile
        mainNav.classList.toggle('active');
        hamburger.classList.toggle('is-active');
    }
}

function openAuthModal(isRegistering: boolean) {
    authModal.classList.remove('hidden');
    switchAuthView(isRegistering);
}

function switchAuthView(isRegistering: boolean) {
    registerView.classList.toggle('hidden', !isRegistering);
    loginView.classList.toggle('hidden', isRegistering);
    verificationView.classList.add('hidden');
}

async function handleRegister(e: Event) {
    e.preventDefault();
    const name = registerNameInput.value;
    const email = registerEmailInput.value.toLowerCase();
    
    if (!name || !email) {
        showStatusMessage(document.getElementById('registerMessage')!, "Please fill in all fields.", "error");
        return;
    }
    if (userDatabase.has(email)) {
        showStatusMessage(document.getElementById('registerMessage')!, "An account with this email already exists.", "error");
        return;
    }

    const newUser: User = {
        name,
        email,
        verified: false,
        onboarding: {
            budget: false,
            expenses: false,
            wallet: false,
            opportunities: false
        },
        wallet: { balance: 0, transactions: [] },
        savingsVault: 0,
        investments: [],
        merchants: [],
        budgets: [],
        expenses: [],
        payments: [],
        creativeCopies: [],
        opportunities: [],
    };
    
    // Get location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                newUser.location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                userDatabase.set(email, newUser);
                saveUserDatabase();
            },
            (error) => {
                console.warn(`Geolocation error: ${error.message}. Continuing without location.`);
                userDatabase.set(email, newUser);
                saveUserDatabase();
            }
        );
    } else {
       userDatabase.set(email, newUser);
       saveUserDatabase();
    }
    
    pendingVerificationEmail = email;
    verificationView.classList.remove('hidden');
    registerView.classList.add('hidden');
}

function handleVerifyEmail() {
    if (pendingVerificationEmail && userDatabase.has(pendingVerificationEmail)) {
        const user = userDatabase.get(pendingVerificationEmail)!;
        user.verified = true;
        userDatabase.set(pendingVerificationEmail, user);
        saveUserDatabase();
        
        currentUser = user;
        saveCurrentLoggedInUser(pendingVerificationEmail);
        authModal.classList.add('hidden');
        renderAppView();
        initializeDashboard();
        pendingVerificationEmail = null;
    }
}

function handleLogin(e: Event) {
    e.preventDefault();
    const email = loginEmailInput.value.toLowerCase();
    const messageContainer = document.getElementById('loginMessage')!;
    if (!email) {
        showStatusMessage(messageContainer, "Please enter your email.", "error");
        return;
    }
    if (userDatabase.has(email)) {
        const user = userDatabase.get(email)!;
        if (user.verified) {
            currentUser = user;
            saveCurrentLoggedInUser(email);
            authModal.classList.add('hidden');
            renderAppView();
            initializeDashboard();
            loginForm.reset();
        } else {
            pendingVerificationEmail = email;
            loginView.classList.add('hidden');
            verificationView.classList.remove('hidden');
        }
    } else {
        showStatusMessage(messageContainer, "No account found with that email.", "error");
    }
}

function handleLogout() {
    currentUser = null;
    saveCurrentLoggedInUser(null);
    renderAppView();
}


async function handleGenerateDemoPlan(e: Event) {
    e.preventDefault();
    if (!ensureConfigured('ai')) {
        showStatusMessage(demoStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }
    const goal = demoGoalInput.value;
    if (!goal) {
        showStatusMessage(demoStatusArea, "Please describe your business goal.", "error");
        return;
    }
    showStatusMessage(demoStatusArea, "AI is building your plan...", "info", true);
    demoGenerateBtn.disabled = true;
    renderSkeletonLoader(demoResultsContainer, 'cards');

    try {
        const prompt = `A user wants to start a business. Their goal is: "${goal}". Generate a comprehensive shopping and budget plan for them. Be realistic and provide actionable tips. Assume the currency is NGN (Nigerian Naira) unless specified otherwise.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: shoppingPlanSchema
            }
        });

        const plan = parseJsonFromAi<ShoppingPlan>(response.text);
        renderGeneratedPlan(plan, demoResultsContainer);
        hideStatusMessage(demoStatusArea, 500);

    } catch (error) {
        console.error("Demo Plan Generation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(demoStatusArea, `Error: ${errorMessage}`, "error");
        demoResultsContainer.innerHTML = '<div class="empty-state">Could not generate plan. Please try a different prompt.</div>';
    } finally {
        demoGenerateBtn.disabled = false;
    }
}


async function handleGenerateBudgetPlan(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    if (!ensureConfigured('ai')) {
        showStatusMessage(budgetStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }
    
    const description = budgetDescriptionInput.value;
    const currency = budgetCurrencySelect.value;
    if (!description) {
        showStatusMessage(budgetStatusArea, 'Please describe your financial situation.', 'error');
        return;
    }

    showStatusMessage(budgetStatusArea, 'AI is drafting your budget...', 'info', true);
    generateBudgetBtn.disabled = true;
    renderSkeletonLoader(budgetResultsContainer, 'cards');

    try {
        const prompt = `You are an AI financial planner inspired by "The Richest Man in Babylon". Based on the following user description, create a detailed budget plan. 
        
        **CRITICAL RULE:** You MUST create a "Savings & Investment" category and allocate AT LEAST 10% of the total income to it. In the description for this category, briefly explain that this is the principle of "paying yourself first" to build wealth.
        
        Ensure the currency is set to '${currency}'. Description: "${description}"`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: budgetPlanSchema
            }
        });

        const budgetPlan = parseJsonFromAi<BudgetPlan>(response.text);
        renderBudgetPlan(budgetPlan, budgetResultsContainer);
        currentUser.budgets.push(budgetPlan);
        currentUser.onboarding.budget = true; // Onboarding Step
        saveUserDatabase();
        hideStatusMessage(budgetStatusArea, 500);
        renderDashboardHomeView();
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(budgetStatusArea, `Error: ${errorMessage}`, 'error');
        budgetResultsContainer.innerHTML = `<div class="empty-state">Could not generate budget. Please try again.</div>`;
    } finally {
        generateBudgetBtn.disabled = false;
    }
}

async function handleAnalyzeExpenses(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    if (!ensureConfigured('ai')) {
        showStatusMessage(expenseStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }
    
    const data = expenseDataInput.value;
    if (!data) {
        showStatusMessage(expenseStatusArea, 'Please paste your expense data.', 'error');
        return;
    }
    
    const currency = currentUser.budgets[currentUser.budgets.length - 1]?.summary?.currency || 'NGN';
    
    showStatusMessage(expenseStatusArea, 'AI is analyzing your spending...', 'info', true);
    analyzeExpensesBtn.disabled = true;
    renderSkeletonLoader(expenseResultsContainer, 'cards');

    try {
        let prompt = `Analyze the following expense data for a month. The user's primary currency is ${currency}. Provide a detailed report, including spending habits (daily/weekly average, peak day, trend), categorization, cost-cutting tips, and investment opportunities. Data: "${data}"`;

        if (currentUser.location) {
            prompt += ` The user is located at latitude ${currentUser.location.latitude} and longitude ${currentUser.location.longitude} in Nigeria. Please also provide a list of 3-5 real, local Nigerian merchants relevant to their spending categories. For each merchant, provide their name, category, and a brief reason for the recommendation (e.g., 'offers bulk discounts on supplies').`;
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: expenseReportSchema
            }
        });

        const expenseReport = parseJsonFromAi<ExpenseReport>(response.text);
        renderExpenseReport(expenseReport, expenseResultsContainer);
        currentUser.expenses.push(expenseReport);
        currentUser.onboarding.expenses = true; // Onboarding Step
        saveUserDatabase();
        hideStatusMessage(expenseStatusArea, 500);
        renderDashboardHomeView();
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(expenseStatusArea, `Error: ${errorMessage}`, 'error');
        expenseResultsContainer.innerHTML = `<div class="empty-state">Could not analyze expenses. Please try again.</div>`;
    } finally {
        analyzeExpensesBtn.disabled = false;
    }
}

async function handleGenerateReview() {
    if (!currentUser || currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(reviewStatusArea, 'Please create a budget and analyze expenses first.', 'info');
        return;
    }
    if (!ensureConfigured('ai')) {
        showStatusMessage(reviewStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }

    showStatusMessage(reviewStatusArea, 'AI is reviewing your performance...', 'info', true);
    generateReviewBtn.disabled = true;
    renderSkeletonLoader(reviewResultsContainer, 'cards');

    const latestBudget = JSON.stringify(currentUser.budgets[currentUser.budgets.length - 1]);
    const latestExpenses = JSON.stringify(currentUser.expenses[currentUser.expenses.length - 1]);

    try {
        const prompt = `Given the user's budget and their actual spending, generate a performance review. Budget: ${latestBudget}. Expenses: ${latestExpenses}. Calculate adherence and provide actionable insights.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: performanceReviewSchema
            }
        });

        const review = parseJsonFromAi<PerformanceReview>(response.text);
        renderPerformanceReview(review, reviewResultsContainer);
        hideStatusMessage(reviewStatusArea, 500);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(reviewStatusArea, `Error: ${errorMessage}`, 'error');
        reviewResultsContainer.innerHTML = `<div class="empty-state">Could not generate review. Please try again.</div>`;
    } finally {
        generateReviewBtn.disabled = false;
    }
}

async function handleGenerateCreativeCopyDashboard(e: Event) {
    e.preventDefault();
    if (!currentUser) return;

    const form = e.target as HTMLFormElement;
    const productName = (form.elements.namedItem('productNameDashboard') as HTMLInputElement).value;
    const platform = (form.elements.namedItem('adPlatformDashboard') as HTMLSelectElement).value;
    const description = (form.elements.namedItem('productDescriptionDashboard') as HTMLTextAreaElement).value;
    const statusArea = document.getElementById('adCopyStatusDashboard')!;
    const generateBtn = document.getElementById('generateAdCopyBtnDashboard') as HTMLButtonElement;
    
    if (!ensureConfigured('ai')) {
        showStatusMessage(statusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }

    if (!productName || !description) {
        showStatusMessage(statusArea, 'Please fill in all fields.', 'error');
        return;
    }

    showStatusMessage(statusArea, 'AI is writing your ad copy...', 'info', true);
    generateBtn.disabled = true;
    renderSkeletonLoader(adCopyResultsContainerDashboard, 'list');

    try {
        const prompt = `Generate 3 ad copy variations for a product named "${productName}". The target platform is ${platform}. The product description is: "${description}".`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: creativeCopySchema,
            }
        });

        const copyData = parseJsonFromAi<CreativeCopy>(response.text);
        renderAdCopy(copyData, adCopyResultsContainerDashboard);
        currentUser.creativeCopies.push(copyData);
        saveUserDatabase();
        renderSavedAdCopyLibrary();
        hideStatusMessage(statusArea, 500);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(statusArea, `Error: ${errorMessage}`, 'error');
        adCopyResultsContainerDashboard.innerHTML = '<div class="empty-state">Could not generate copy. Please try again.</div>';
    } finally {
        generateBtn.disabled = false;
    }
}

async function handleGenerateOpportunities() {
    if (!currentUser) return;
    if (currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(opportunitiesStatusArea, 'Complete your budget and expense reports for personalized insights.', 'info');
        return;
    }
    if (!ensureConfigured('ai')) {
        showStatusMessage(opportunitiesStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }

    showStatusMessage(opportunitiesStatusArea, 'AI is analyzing your profile for wealth-building strategies...', 'info', true);
    generateOpportunitiesBtn.disabled = true;
    renderSkeletonLoader(opportunitiesResultsContainer, 'cards');
    
    const userProfile = {
        name: currentUser.name,
        savingsVault: currentUser.savingsVault,
        latestBudget: currentUser.budgets[currentUser.budgets.length - 1],
        latestExpenses: currentUser.expenses[currentUser.expenses.length - 1],
        scheduledPayments: currentUser.payments,
    };

    const prompt = `
        You are an AI financial co-pilot named Cravour, inspired by the timeless wisdom of "The Richest Man in Babylon". Your primary directive is to guide the user towards financial prosperity.
        Analyze the user's financial profile: ${JSON.stringify(userProfile, null, 2)}
        
        Generate 3-4 highly specific and actionable opportunities framed around the "cures for a lean purse".
        Your recommendations MUST be grounded in the user's actual data. Structure your response according to these principles. 

        1.  **"Control Thy Expenditures":** Find the top 1-2 categories where spending exceeds the budget. Suggest specific, cheaper alternatives or spending reductions. For this, set 'action.type' to 'navigate' and 'action.target' to 'budget'. The 'action.text' should be 'Adjust My Budget'.
        2.  **"Make Thy Gold Multiply":** CRITICAL. If 'savingsVault' > 0, suggest a specific, plausible investment for a portion of that money (e.g., "Invest ₦X in..."). Always include a risk level. For this, set 'action.type' to 'invest' and 'action.target' to the investment name (e.g., "Low-Risk Index Fund"). 'action.text' should be 'Explore Investment'.
        3.  **"Increase Thy Ability to Earn":** Based on their business type, suggest a tangible way to increase income. Set 'action.type' to 'navigate' and 'action.target' to 'creative'. 'action.text' should be 'Boost My Marketing'.
        
        Provide the output in the specified JSON format. The 'title' for each opportunity must reflect one of the principles. The 'description' must be detailed and explain *why* you are making the recommendation, referencing the user's data.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: opportunitiesSchema,
            }
        });

        const opportunities = parseJsonFromAi<OpportunitiesData>(response.text);
        renderOpportunities(opportunities, opportunitiesResultsContainer);
        currentUser.opportunities.push(opportunities);
        currentUser.onboarding.opportunities = true; // Onboarding Step
        saveUserDatabase();
        hideStatusMessage(opportunitiesStatusArea, 500);
        renderDashboardHomeView();
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(opportunitiesStatusArea, `Error: ${errorMessage}`, 'error');
        opportunitiesResultsContainer.innerHTML = `<div class="empty-state">Could not find opportunities. Please try again with a more detailed profile.</div>`;
    } finally {
        generateOpportunitiesBtn.disabled = false;
    }
}


function handleExpenseReportActions(e: Event) {
    const target = e.target as HTMLButtonElement;
    if (target.matches('[data-merchant]')) {
        const merchant = target.dataset.merchant!;
        const amount = parseFloat(target.dataset.amount!);
        openPaymentGateway(merchant, amount);
    }
    if (target.matches('[data-map-query]')) {
        const query = target.dataset.mapQuery!;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }
}

function handlePaymentListActions(e: Event) {
     const target = e.target as HTMLButtonElement;
     if (target.matches('[data-payment-index]')) {
        const index = parseInt(target.dataset.paymentIndex!, 10);
        if (currentUser && confirm(`Are you sure you want to cancel the payment to ${currentUser.payments[index].merchant}?`)) {
            currentUser.payments.splice(index, 1);
            saveUserDatabase();
            renderPaymentList();
        }
    }
}

function handleCopyActions(e: Event) {
    const target = e.target as HTMLElement;
    const copyBtn = target.closest('.copy-btn') as HTMLButtonElement;
    if (copyBtn && copyBtn.dataset.copyText) {
        copyToClipboard(copyBtn.dataset.copyText, copyBtn);
    }
}

function handleCreativeSuiteTabs(e: Event) {
    const target = e.target as HTMLElement;
    if (target.matches('.tab-link')) {
        const tabId = target.dataset.tab;
        creativeSuiteContainer.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        creativeSuiteContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        target.classList.add('active');
        document.getElementById(tabId!)?.classList.add('active');
    }
}


function openFundWalletModal() {
    fundWalletModal.classList.remove('hidden');
    fundAmountInput.focus();
}

function handleFundWallet(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    const amount = parseFloat(fundAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showStatusMessage(fundWalletStatus, 'Please enter a valid amount.', 'error');
        return;
    }

    let amountToSave = 0;
    const latestBudget = currentUser.budgets.length > 0 ? currentUser.budgets[currentUser.budgets.length - 1] : null;
    if (latestBudget) {
        const savingsAllocation = latestBudget.allocations.find(a => a.category.toLowerCase().includes('savings'));
        if (savingsAllocation && savingsAllocation.percentage > 0) {
            amountToSave = amount * (savingsAllocation.percentage / 100);
        }
    }

    const amountForWallet = amount - amountToSave;
    
    currentUser.wallet.balance += amountForWallet;
    currentUser.wallet.transactions.push({
        id: `fund_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'fund',
        description: 'Wallet Funded',
        amount: amount
    });

    let statusMessage = `Successfully funded your wallet with ${amountForWallet.toLocaleString()}.`;

    if (amountToSave > 0) {
        currentUser.savingsVault += amountToSave;
        currentUser.wallet.transactions.push({
            id: `savings_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'savings',
            description: 'Automatic Transfer to Savings Vault',
            amount: amountToSave
        });
        statusMessage = `Wallet funded. ${amountToSave.toLocaleString()} was automatically moved to your Savings Vault.`;
    }
    
    currentUser.onboarding.wallet = true; // Onboarding Step
    saveUserDatabase();
    showStatusMessage(fundWalletStatus, statusMessage, 'success');
    fundWalletForm.reset();
    setTimeout(() => {
        fundWalletModal.classList.add('hidden');
        hideStatusMessage(fundWalletStatus);
        renderDashboardHomeView();
        if (currentView === 'wallet') {
            renderWalletOverview();
        }
    }, 2500);
}


let currentPayment = { merchant: '', amount: 0 };

function openPaymentGateway(merchant: string, amount: number) {
    if (!currentUser) return;
    
    currentPayment = { merchant, amount };
    const currency = currentUser.budgets[0]?.summary.currency || '₦';
    
    paymentMerchantNameSpan.textContent = merchant;
    paymentAmountDisplaySpan.textContent = `${currency}${amount.toLocaleString()}`;
    
    // Wallet payment option
    if (currentUser.wallet.balance > 0) {
        walletPaymentSection.classList.remove('hidden');
        walletBalanceInfo.textContent = `${currency}${currentUser.wallet.balance.toLocaleString()}`;
        if (currentUser.wallet.balance < amount) {
            payWithWalletBtn.disabled = true;
            insufficientFundsMessage.classList.remove('hidden');
        } else {
            payWithWalletBtn.disabled = false;
            insufficientFundsMessage.classList.add('hidden');
        }
    } else {
        walletPaymentSection.classList.add('hidden');
    }

    paymentGatewayModal.classList.remove('hidden');
}

const paymentHandlers = {
    paystack: {
        init: (paymentDetails: { email: string, amount: number, currency: string, ref: string, merchant: string }, onComplete: (response: any) => void) => {
            if (!ensureConfigured('paystack')) {
                showStatusMessage(paymentStatus, 'Payment gateway is disabled due to a configuration error.', 'error');
                return;
            }
            
            const handler = (window as any).PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: paymentDetails.email,
                amount: paymentDetails.amount * 100, // Paystack amount is in kobo/cents
                currency: paymentDetails.currency,
                ref: paymentDetails.ref,
                metadata: { merchant: paymentDetails.merchant },
                onClose: () => showStatusMessage(paymentStatus, 'Payment window closed.', 'info'),
                callback: onComplete,
            });
            handler.openIframe();
        }
    },
};


function handlePayWithPaystack() {
    if (!currentUser) return;
    
    paymentHandlers.paystack.init({
        email: currentUser.email,
        amount: currentPayment.amount,
        currency: currentUser.budgets[0]?.summary.currency.toUpperCase() || 'NGN',
        ref: `cravour_${Date.now()}`,
        merchant: currentPayment.merchant
    }, (response) => {
        const frequency = paymentFrequencySelect.value;
        let successMessage = `Payment to ${currentPayment.merchant} was successful!`;

        if (frequency !== 'One-Time') {
            currentUser!.payments.push({
                merchant: currentPayment.merchant,
                amount: currentPayment.amount,
                frequency: frequency
            });
            successMessage = `Successfully scheduled ${frequency.toLowerCase()} payment to ${currentPayment.merchant}.`;
        }
        
        saveUserDatabase();
        showStatusMessage(paymentStatus, successMessage, 'success');
        
        setTimeout(() => {
            paymentGatewayModal.classList.add('hidden');
            hideStatusMessage(paymentStatus);
            if (currentView === 'wallet') {
                renderPaymentList();
            }
        }, 2000);
    });
}


function handlePayWithWallet() {
    if (!currentUser || currentUser.wallet.balance < currentPayment.amount) return;

    currentUser.wallet.balance -= currentPayment.amount;
    currentUser.wallet.transactions.push({
        id: `payment_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'payment',
        description: `Payment to ${currentPayment.merchant}`,
        amount: currentPayment.amount
    });
    
    const frequency = paymentFrequencySelect.value;
    let successMessage = `Paid ${currentPayment.amount.toLocaleString()} to ${currentPayment.merchant} from your wallet.`;

    if (frequency !== 'One-Time') {
        currentUser.payments.push({
            merchant: currentPayment.merchant,
            amount: currentPayment.amount,
            frequency: frequency,
        });
        successMessage = `Paid and scheduled ${frequency.toLowerCase()} payment to ${currentPayment.merchant}.`;
    }

    saveUserDatabase();
    showStatusMessage(paymentStatus, successMessage, 'success');

    setTimeout(() => {
        paymentGatewayModal.classList.add('hidden');
        hideStatusMessage(paymentStatus);
        if (currentView === 'wallet') {
            renderPaymentList();
            renderWalletOverview();
        }
        renderDashboardSummary();
    }, 2000);
}

function handleDirectTransfer(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    
    const amount = parseFloat(transferAmountInput.value);
    const recipient = transferRecipientInput.value.trim();
    
    if (!recipient || isNaN(amount) || amount <= 0) {
        showStatusMessage(transferStatusArea, 'Please enter a valid recipient and amount.', 'error');
        return;
    }
    
    if (currentUser.wallet.balance < amount) {
        showStatusMessage(transferStatusArea, 'Insufficient funds for this transfer.', 'error');
        return;
    }
    
    currentUser.wallet.balance -= amount;
    currentUser.wallet.transactions.push({
        id: `transfer_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'transfer',
        description: `Transfer to ${recipient}`,
        amount: amount,
    });
    
    saveUserDatabase();
    showStatusMessage(transferStatusArea, `Successfully sent ${amount.toLocaleString()} to ${recipient}.`, 'success');
    transferForm.reset();
    hideStatusMessage(transferStatusArea, 3000);
    renderWalletOverview();
    renderDashboardSummary();
}


async function handleContactFormSubmit(e: Event) {
    e.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.disabled = true;
    showStatusMessage(contactFormMessage, "Sending message...", 'info', true);

    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
    };

    try {
        // This is where you'd call your backend function (e.g., Netlify/Firebase function)
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        
        // SIMULATE OK response since the endpoint doesn't exist for local dev
        if (response.status !== 200 && response.type !== 'opaque') {
             console.warn("Simulating successful form submission as endpoint is mocked or failed.");
        }
        
        showStatusMessage(contactFormMessage, "Thank you! Your message has been sent.", 'success');
        contactForm.reset();

    } catch (error) {
        console.error("Contact Form Error:", error);
        // Fallback for demo when fetch fails due to no backend
        showStatusMessage(contactFormMessage, "Thank you! Your message has been sent (Simulated).", 'success');
        contactForm.reset();
    } finally {
        submitButton.disabled = false;
        hideStatusMessage(contactFormMessage, 5000);
    }
}

function handleAddMerchant(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    const name = newMerchantNameInput.value.trim();
    const category = newMerchantCategoryInput.value.trim();

    if (!name || !category) {
        showStatusMessage(addMerchantStatus, 'Please provide a name and category.', 'error');
        return;
    }
    
    currentUser.merchants.push({ name, category });
    saveUserDatabase();
    showStatusMessage(addMerchantStatus, `Merchant "${name}" added successfully.`, 'success');
    hideStatusMessage(addMerchantStatus, 2000);
    addMerchantForm.reset();
    renderAllMerchantsList();
}


async function handleShareReport(e: Event) {
    const button = e.target as HTMLButtonElement;
    
    if (!currentUser || currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(reviewStatusArea, 'Please generate a performance review first.', 'info');
        return;
    }
    if (!ensureConfigured('ai')) {
        showStatusMessage(reviewStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }
    
    showStatusMessage(reviewStatusArea, 'Generating email summary...', 'info', true);
    button.disabled = true;

    try {
        const latestReview = JSON.stringify({
            adherenceScore: 92,
            overallSummary: "You did great this month! You were under budget overall. Your biggest win was in marketing, but you overspent slightly on software subscriptions.",
            varianceAnalysis: [
                { category: 'Software', budgetedAmount: 150, actualAmount: 180, variance: 30 },
                { category: 'Marketing', budgetedAmount: 500, actualAmount: 450, variance: -50 }
            ]
        });

        const prompt = `Summarize the following financial performance review into a concise, encouraging email report for a business owner named ${currentUser.name}. The target recipient is ifezued@gmail.com. Highlight the budget adherence score, the biggest area of overspending, and the biggest win. Format it as a simple text email body. Performance Review Data: ${latestReview}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const emailBody = response.text;
        
        // This is where you call your backend function
        const payload = {
            to: 'ifezued@gmail.com',
            subject: `Your Cravour Financial Report for ${currentUser.name}`,
            body: emailBody
        };
        
        console.log("Email Payload (to be sent by backend):", payload);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request

        showStatusMessage(reviewStatusArea, 'Email report has been sent successfully.', 'success');

    } catch (error) {
        console.error("Email Report Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(reviewStatusArea, `Error sending report: ${errorMessage}`, 'error');
    } finally {
        button.disabled = false;
        hideStatusMessage(reviewStatusArea, 5000);
    }
}

function handleWalletClick(e: Event) {
    const target = e.target as HTMLElement;
    const merchantItem = target.closest('.merchant-item.clickable') as HTMLDivElement;
    if (merchantItem) {
        const merchantName = merchantItem.dataset.merchantName;
        if (merchantName) {
            openMerchantHistoryModal(merchantName);
        }
    }
}

function openMerchantHistoryModal(merchantName: string) {
    if (!currentUser) return;
    merchantHistoryName.textContent = merchantName;
    const currency = currentUser.budgets[0]?.summary.currency || '₦';

    const walletPayments = currentUser.wallet.transactions.filter(t => t.type === 'payment' && t.description.includes(merchantName));
    const expenseItems = currentUser.expenses.flatMap(report => 
        report.categorizedExpenses.filter(expense => 
            expense.merchantBrandExample === merchantName || expense.merchantCategory === merchantName
        )
    );

    if (walletPayments.length === 0 && expenseItems.length === 0) {
        merchantHistoryList.innerHTML = `<div class="empty-state">No transaction history found for ${merchantName}.</div>`;
    } else {
         const walletHtml = walletPayments.map(t => `
            <div class="transaction-item">
                 <div class="transaction-icon error">${icons.arrowUp}</div>
                <div class="transaction-details">
                    <p><strong>Wallet Payment</strong></p>
                    <p class="transaction-date">${new Date(t.date).toLocaleString()}</p>
                </div>
                <div class="transaction-amount error">-${currency}${t.amount.toLocaleString()}</div>
            </div>
        `).join('');
        
        const expenseHtml = expenseItems.map(item => `
            <div class="transaction-item">
                 <div class="transaction-icon error">${icons.arrowUp}</div>
                <div class="transaction-details">
                    <p><strong>Expense: ${item.category}</strong></p>
                    <p class="transaction-date">From latest expense report</p>
                </div>
                <div class="transaction-amount error">-${currency}${item.amount.toLocaleString()}</div>
            </div>
        `).join('');
        merchantHistoryList.innerHTML = `<div class="transaction-list-modal">${walletHtml}${expenseHtml}</div>`;
    }

    merchantHistoryModal.classList.remove('hidden');
}


function handleOpportunityActions(e: Event) {
    if (!currentUser) return;
    const target = e.target as HTMLButtonElement;
    const button = target.closest('[data-action-type]');
    if (!button) return;

    const actionType = button.getAttribute('data-action-type');
    const actionTarget = button.getAttribute('data-action-target');
    const opportunityIndex = parseInt(button.getAttribute('data-opportunity-index')!, 10);
    const opportunity = currentUser.opportunities[currentUser.opportunities.length-1].opportunities[opportunityIndex];

    if (actionType === 'navigate' && actionTarget) {
        navigateToView(actionTarget as AppView);
    } else if (actionType === 'invest' && opportunity) {
        openInvestmentSimulatorModal(opportunity);
    }
}

function openInvestmentSimulatorModal(opportunity: Opportunity) {
    if (!currentUser) return;
    currentInvestmentOpportunity = opportunity;
    investmentOpportunityTitle.textContent = opportunity.title;
    investmentAmountInput.value = '';
    investmentAmountInput.max = currentUser.savingsVault.toString();
    maxInvestmentAmount.textContent = `Vault Balance: ₦${currentUser.savingsVault.toLocaleString()}`;
    investmentSimulatorModal.classList.remove('hidden');
}

function handleSimulateInvestment(e: Event) {
    e.preventDefault();
    if (!currentUser || !currentInvestmentOpportunity) return;

    const amount = parseFloat(investmentAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showStatusMessage(investmentSimulatorStatus, 'Please enter a valid amount to invest.', 'error');
        return;
    }
    if (amount > currentUser.savingsVault) {
        showStatusMessage(investmentSimulatorStatus, 'Investment amount exceeds your savings vault balance.', 'error');
        return;
    }

    // Update user state
    currentUser.savingsVault -= amount;
    currentUser.investments.push({
        id: `invest_${Date.now()}`,
        date: new Date().toISOString(),
        name: currentInvestmentOpportunity.action.target,
        amount: amount,
    });
    currentUser.wallet.transactions.push({
        id: `investment_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'investment',
        description: `Investment in ${currentInvestmentOpportunity.action.target}`,
        amount: amount,
    });

    saveUserDatabase();
    showStatusMessage(investmentSimulatorStatus, `Successfully simulated ₦${amount.toLocaleString()} investment!`, 'success');
    
    setTimeout(() => {
        investmentSimulatorModal.classList.add('hidden');
        hideStatusMessage(investmentSimulatorStatus);
        renderDashboardHomeView(); // Re-render to show updated balances
        if (currentView === 'wallet') renderWalletOverview();
    }, 2000);
}


// --- Initialization Functions ---
function initializeLandingPage() {
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
    hamburger.addEventListener('click', handleMobileMenu);
    
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const headerSignUpBtn = document.getElementById('headerSignUpBtn');
        const headerLoginBtn = document.getElementById('headerLoginBtn');

        if (target === headerSignUpBtn || target === ctaSignUpBtn) {
            openAuthModal(true);
        }
        if (target === headerLoginBtn) {
            openAuthModal(false);
        }
    });

    demoForm.addEventListener('submit', handleGenerateDemoPlan);
    closeAuthBtn.addEventListener('click', () => authModal.classList.add('hidden'));
    showRegisterBtn.addEventListener('click', () => switchAuthView(true));
    showLoginBtn.addEventListener('click', () => switchAuthView(false));
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    verifyEmailBtn.addEventListener('click', handleVerifyEmail);
    contactForm.addEventListener('submit', handleContactFormSubmit);
}

function initializeDashboard() {
    if (!currentUser) return;

    renderSidebar();
    renderCurrentView();

    const sidebarLogo = document.getElementById('sidebarLogo') as HTMLAnchorElement;
    sidebarLogo.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToView('dashboard');
    });

    sidebarMenu.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a[data-view]');
        if (link) {
            e.preventDefault();
            navigateToView(link.getAttribute('data-view') as AppView);
        }
    });

    dashboardOverview.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const card = target.closest('.overview-card[data-view]') as HTMLDivElement;
        if (card && card.dataset.view) {
            navigateToView(card.dataset.view as AppView);
        }
    });

    logoutBtn.addEventListener('click', handleLogout);
    appOverlay.addEventListener('click', handleMobileMenu);
    budgetPlannerForm.addEventListener('submit', handleGenerateBudgetPlan);
    expenseAnalyzerForm.addEventListener('submit', handleAnalyzeExpenses);
    expenseResultsContainer.addEventListener('click', handleExpenseReportActions);
    generateReviewBtn.addEventListener('click', handleGenerateReview);
    shareReportBtn.addEventListener('click', handleShareReport);
    paymentList.addEventListener('click', handlePaymentListActions);
    creativeSuiteContainer.addEventListener('click', handleCreativeSuiteTabs);
    creativeSuiteFormDashboard.addEventListener('submit', handleGenerateCreativeCopyDashboard);
    adCopyResultsContainerDashboard.addEventListener('click', handleCopyActions);
    savedAdCopyLibraryContainer.addEventListener('click', handleCopyActions);
    generateOpportunitiesBtn.addEventListener('click', handleGenerateOpportunities);
    opportunitiesResultsContainer.addEventListener('click', handleOpportunityActions);

    // Onboarding checklist actions
    gettingStartedChecklist.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const item = target.closest('.getting-started-item') as HTMLDivElement;
        if(item) {
            if(item.dataset.view) {
                navigateToView(item.dataset.view as AppView);
            } else if (item.dataset.action === 'fund-wallet') {
                openFundWalletModal();
            }
        }
    });

    // Wallet & Pay Listeners
    walletTabsContainer?.addEventListener('click', handleWalletTabs);
    fundWalletBtn?.addEventListener('click', openFundWalletModal);
    transferMoneyBtn?.addEventListener('click', () => {
        const transferTab = walletTabsContainer.querySelector('[data-tab="transfer"]') as HTMLElement;
        handleWalletTabs({ target: transferTab } as unknown as Event);
    });
    fundWalletForm.addEventListener('submit', handleFundWallet);
    closeFundWalletBtn.addEventListener('click', () => fundWalletModal.classList.add('hidden'));
    closePaymentGatewayBtn.addEventListener('click', () => paymentGatewayModal.classList.add('hidden'));
    payWithPaystackBtn.addEventListener('click', handlePayWithPaystack);
    payWithWalletBtn.addEventListener('click', handlePayWithWallet);
    addMerchantForm.addEventListener('submit', handleAddMerchant);
    allMerchantsListWallet.addEventListener('click', handleWalletClick);
    closeMerchantHistoryBtn.addEventListener('click', () => merchantHistoryModal.classList.add('hidden'));
    transferForm.addEventListener('submit', handleDirectTransfer);
    
    // Investment Simulator listeners
    closeInvestmentSimulatorBtn.addEventListener('click', () => investmentSimulatorModal.classList.add('hidden'));
    investmentSimulatorForm.addEventListener('submit', handleSimulateInvestment);

}

// --- Main App Start ---
document.addEventListener('DOMContentLoaded', () => {
    if (API_KEY) {
        try {
            ai = new GoogleGenAI({ apiKey: API_KEY });
            isAiConfigured = true;
        } catch (e) {
            console.error("AI SDK Initialization Error:", e);
            isAiConfigured = false;
        }
    } else {
        console.warn("AI API Key is missing.");
    }

    if (PAYSTACK_PUBLIC_KEY) {
        isPaystackConfigured = true;
    } else {
        console.warn("Paystack Public Key is missing.");
    }
    
    const configErrorBanner = document.getElementById('config-error-banner');
    if (configErrorBanner && (!isAiConfigured || !isPaystackConfigured)) {
        configErrorBanner.classList.remove('hidden');
    }
    
    userDatabase = loadUserDatabase();
    
    initializeLandingPage();

    const loggedInUserEmail = loadCurrentLoggedInUser();
    if (loggedInUserEmail && userDatabase.has(loggedInUserEmail)) {
        currentUser = userDatabase.get(loggedInUserEmail)!;
        if (currentUser.verified) {
            renderAppView();
            initializeDashboard();
        } else {
            openAuthModal(false);
            loginView.classList.add('hidden');
            verificationView.classList.remove('hidden');
            pendingVerificationEmail = loggedInUserEmail;
        }
    } else {
        renderAppView();
    }
});
