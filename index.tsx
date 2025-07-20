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
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.25 8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5Z" fill-opacity="0.5" fill="currentColor"/><path d="M15.75 8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75V8.25ZM2.697 4.93a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06-1.06l4.72-4.72-4.72-4.72a.75.75 0 0 1 0-1.06Z" fill="currentColor"/></svg>`,
    cogs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.625a3.375 3.375 0 1 0 0 6.75a3.375 3.375 0 0 0 0-6.75Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M22.25 12c0 .99-.183 1.933-.518 2.787l.462 2.153a.75.75 0 0 1-.933 1.002l-2.31-.99a8.95 8.95 0 0 1-2.43.9V20a.75.75 0 0 1-.75.75H8.22a.75.75 0 0 1-.75-.75v-2.067a8.948 8.948 0 0 1-2.43-.9l-2.31.99a.75.75 0 0 1-.932-1.002l.461-2.153A8.98 8.98 0 0 1 1.75 12c0-.99.183-1.933.518-2.787l-.462-2.153a.75.75 0 0 1 .933-1.002l2.31.99a8.95 8.95 0 0 1 2.43-.9V4a.75.75 0 0 1 .75-.75h5.56a.75.75 0 0 1 .75.75v2.067c.86.299 1.675.72 2.43.9l2.31-.99a.75.75 0 0 1 .932 1.002l-.461 2.153A8.98 8.98 0 0 1 22.25 12Zm-1.636 0c0-1.42-.314-2.757-.88-3.921l-.22-.465.98-4.576-1.96-1.053-4.502 1.93-.497-.27a7.452 7.452 0 0 0-3.303-.896V2.75H8.22v3.003c-1.18.256-2.29.74-3.302.896l-.497.27-4.502-1.93-1.96 1.053.98 4.576-.22.465A7.48 7.48 0 0 0 3.25 12c0 1.42.314 2.757.88 3.921l.22.465-.98 4.576 1.96 1.053 4.502-1.93.497.27a7.452 7.452 0 0 0 3.303.896V21.25h5.56v-3.003c1.18-.256 2.29-.74 3.302-.896l.497-.27 4.502 1.93 1.96-1.053-.98-4.576.22-.465A7.48 7.48 0 0 0 20.614 12Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    magic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m15.808 3.755-2.06 2.06a.75.75 0 0 1-1.06 0l-2.06-2.06a.75.75 0 0 1 1.06-1.06l2.06 2.06 2.06-2.06a.75.75 0 1 1 1.06 1.06Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M9.828 3.22a.75.75 0 0 1 1.06 0l3.89 3.89a2.25 2.25 0 0 1 0 3.182l-3.89 3.89a.75.75 0 0 1-1.06-1.06l3.89-3.89a.75.75 0 0 0 0-1.06L9.828 4.28a.75.75 0 0 1 0-1.06ZM5.293 6.728a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 0 1-1.06-1.06l5.47-5.47-5.47-5.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    chartLine: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.25 18a.75.75 0 0 0 0 1.5H21a.75.75 0 0 0 0-1.5H2.25Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="m4.22 15.78 1.97-1.97a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 0 1.06 0L15.03 13.6a.75.75 0 0 1 1.06 0l4.72 4.72a.75.75 0 1 1-1.06 1.06l-4.19-4.19-3.47 3.47a2.25 2.25 0 0 1-3.18 0L5.28 16.84l-1.06-1.06Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    sync: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 0 1 .75.75v3.66a8.216 8.216 0 0 1 4.237 2.016l2.126-2.125a.75.75 0 1 1 1.06 1.06l-2.125 2.125A8.25 8.25 0 0 1 12 20.25a.75.75 0 0 1 0-1.5 6.75 6.75 0 0 0 0-13.5.75.75 0 0 1-.75-.75V3a.75.75 0 0 1 .75-.75Z" fill-opacity="0.5" fill="currentColor"/><path d="M12 3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75ZM20.25 12a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75Z" fill="currentColor"/></svg>`,
    searchDollar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.625 17.625a6 6 0 1 1 0-12a6 6 0 0 1 0 12Zm0-1.5a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M11.625 3.375a8.25 8.25 0 1 0 4.673 14.316l3.352 3.351a.75.75 0 0 0 1.06-1.06l-3.351-3.352A8.25 8.25 0 0 0 11.625 3.375Zm-6.375 8.25a6.375 6.375 0 1 1 12.75 0a6.375 6.375 0 0 1-12.75 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.56 11.22a.75.75 0 0 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06L7.12 12l2.44-2.78Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M11.756 5.215a.75.75 0 0 1 .988 0l7.5 6a.75.75 0 0 1-.988 1.13l-7.012-5.61-7.012 5.61a.75.75 0 0 1-.988-1.13l7.5-6Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    envelope: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.25 6.75A.75.75 0 0 0 3 7.5v1.51l9-5.4-9-5.4V3.75A.75.75 0 0 0 3 3h18a.75.75 0 0 0 0-1.5H3A2.25 2.25 0 0 0 .75 3.75v16.5A2.25 2.25 0 0 0 3 22.5h18a2.25 2.25 0 0 0 2.25-2.25V7.5a.75.75 0 0 0-1.5 0v12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V6.75Z" fill-opacity="0.5" fill="currentColor"/><path d="M12 13.924 3.018 8.528a.75.75 0 1 0-.786 1.288L12 15.75l9.768-5.934a.75.75 0 0 0-.786-1.288L12 13.924Z" fill="currentColor"/></svg>`,
    infoCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 1 0 0 1.5a.75.75 0 0 0 0-1.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    paystack: `<svg viewBox="0 0 85.03 24" fill="currentColor"><path d="M84.73 11.16a2.25 2.25 0 0 0-1.94-1.04h-4.32a1.08 1.08 0 0 1-1.08-1.08V4.32a1.08 1.08 0 0 1 1.08-1.08h6.84a2.25 2.25 0 0 0 1.94-1.04 2.25 2.25 0 0 0-.54-3.1L84.1.06a1.09 1.09 0 0 0-1.29.22L76.17 6.9a1.08 1.08 0 0 1-.86.43h-4.32a2.57 2.57 0 0 0-2.57 2.57v4.65a2.57 2.57 0 0 0 2.57 2.57h4.32a1.08 1.08 0 0 1 .86.43l6.64 6.63a1.09 1.09 0 0 0 1.29.22l2.61-1.5a2.25 2.25 0 0 0 .54-3.1Z M22.24 2.16a2.16 2.16 0 0 0-2.16-2.16H2.16A2.16 2.16 0 0 0 0 2.16v19.68A2.16 2.16 0 0 0 2.16 24h17.92a2.16 2.16 0 0 0 2.16-2.16V2.16Z M16.96 7.56H7.2a1.08 1.08 0 1 1 0-2.16h9.76a1.08 1.08 0 1 1 0 2.16Z M12.91 18.36H7.2a1.08 1.08 0 1 1 0-2.16h5.71a1.08 1.08 0 1 1 0 2.16Z M16.96 12.96H7.2a1.08 1.08 0 1 1 0-2.16h9.76a1.08 1.08 0 1 1 0 2.16Z M39.69.72a2.16 2.16 0 0 0-2.16 2.16v13.68H28.45a1.08 1.08 0 1 0 0 2.16h9.08a2.16 2.16 0 0 0 2.16-2.16V2.88a2.16 2.16 0 0 0-2.16-2.16h-2.16Z M63.29 9.36a5.04 5.04 0 1 0-5.04-5.04 5.04 5.04 0 0 0 5.04 5.04Z M63.29 11.52a7.2 7.2 0 1 1 7.2-7.2 7.2 7.2 0 0 1-7.2 7.2Z M53.81 21.6a2.16 2.16 0 0 1-2.16-2.16V2.88a2.16 2.16 0 1 0-4.32 0v16.56a2.16 2.16 0 0 0 2.16 2.16h4.32Z"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 3h-9A2.25 2.25 0 0 0 4.5 5.25v9a.75.75 0 0 0 1.5 0v-9c0-.414.336-.75.75-.75h9a.75.75 0 0 0 0-1.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M8.25 6A2.25 2.25 0 0 0 6 8.25v9.75A2.25 2.25 0 0 0 8.25 20.25h9.75A2.25 2.25 0 0 0 20.25 18V8.25A2.25 2.25 0 0 0 18 6H8.25ZM7.5 8.25c0-.414.336-.75.75-.75h9.75c.414 0 .75.336.75.75V18c0 .414-.336.75-.75.75H8.25a.75.75 0 0 1-.75-.75V8.25Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
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
    actionText: string;
}

interface OpportunitiesData {
    opportunities: Opportunity[];
}


// --- App State Type Definitions ---
interface WalletTransaction {
    id: string;
    date: string;
    type: 'fund' | 'payment';
    description: string;
    amount: number;
}

interface MerchantSummary {
    name: string;
    totalSpent: number;
    transactionCount: number;
}

type User = {
    name: string;
    email: string;
    verified: boolean;
    location?: {
        latitude: number;
        longitude: number;
    };
    wallet: {
        balance: number;
        transactions: WalletTransaction[];
    };
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
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;


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
const headerSignUpBtn = document.getElementById('headerSignUpBtn') as HTMLButtonElement;
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
const dashboardOverview = document.getElementById('dashboard-overview') as HTMLDivElement;
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
const reviewStatusArea = document.getElementById('reviewStatus') as HTMLDivElement;
const reviewResultsContainer = document.getElementById('review-results-wrapper') as HTMLDivElement;
const paymentList = document.getElementById('paymentList') as HTMLDivElement;

// AI Creative Suite Elements
const creativeSuiteContainer = document.querySelector('.creative-suite-container') as HTMLDivElement;
const creativeSuiteFormDashboard = document.getElementById('creativeSuiteFormDashboard') as HTMLFormElement;
const adCopyResultsContainerDashboard = document.getElementById('ad-copy-results-wrapper-dashboard') as HTMLDivElement;
const savedAdCopyLibraryContainer = document.getElementById('saved-ad-copy-library') as HTMLDivElement;

// Opportunities Elements
const generateOpportunitiesBtn = document.getElementById('generateOpportunitiesBtn') as HTMLButtonElement;
const opportunitiesStatusArea = document.getElementById('opportunitiesStatus') as HTMLDivElement;
const opportunitiesResultsContainer = document.getElementById('opportunities-results-wrapper') as HTMLDivElement;

// Payment & Wallet Elements
const walletOverviewCard = document.getElementById('wallet-overview-card') as HTMLDivElement;
const transactionList = document.getElementById('transactionList') as HTMLDivElement;
const merchantList = document.getElementById('merchantList') as HTMLDivElement;
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

// Footer Elements
const contactForm = document.getElementById('contactForm') as HTMLFormElement;
const contactNameInput = document.getElementById('contactName') as HTMLInputElement;
const contactEmailInput = document.getElementById('contactEmail') as HTMLInputElement;
const contactPhoneInput = document.getElementById('contactPhone') as HTMLInputElement;
const contactMessageInput = document.getElementById('contactMessageInput') as HTMLTextAreaElement;
const contactFormMessage = document.getElementById('contactFormMessage') as HTMLDivElement;

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
                currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€', '₦') inferred from the user's budget. Default to USD." },
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
                    potentialSavings: { type: Type.STRING, description: "Estimated monthly savings, e.g., '$50 - $100'" },
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
                    type: { type: Type.STRING, description: "Type of opportunity, e.g., 'Savings', 'Investment', 'Merchant Deal'." },
                    title: { type: Type.STRING, description: "A catchy title for the opportunity." },
                    description: { type: Type.STRING, description: "A detailed explanation of the opportunity and why it's relevant to the user." },
                    potentialSavings: { type: Type.STRING, description: "Estimated financial benefit, e.g., '$100/month', '15% discount on Shopify'." },
                    actionText: { type: Type.STRING, description: "A call to action, e.g., 'Start Saving', 'Explore Investment'." }
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

function calculateMerchantSummary(user: User): MerchantSummary[] {
    if (!user.expenses || user.expenses.length === 0) {
        return [];
    }

    const latestExpenses = user.expenses[user.expenses.length - 1];
    const merchantMap = new Map<string, { totalSpent: number; transactionCount: number }>();

    latestExpenses.categorizedExpenses.forEach(expense => {
        const merchantName = expense.merchantBrandExample || expense.merchantCategory;
        if (merchantName) {
            const existing = merchantMap.get(merchantName) || { totalSpent: 0, transactionCount: 0 };
            existing.totalSpent += expense.amount;
            existing.transactionCount += 1;
            merchantMap.set(merchantName, existing);
        }
    });

    return Array.from(merchantMap.entries())
        .map(([name, data]) => ({ name, ...data }))
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
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
        `;
        headerActionsContainer.innerHTML = `
            <button id="headerLoginBtn" class="btn btn-secondary-outline">Login</button>
            <button id="headerSignUpBtn" class="btn btn-primary">Get Started Free</button>
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
            renderReviewView();
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
        { view: 'wallet', label: 'Wallet', icon: icons.wallet },
        { view: 'budget', label: 'Budget Planner', icon: icons.budget },
        { view: 'expenses', label: 'Expense Tracker', icon: icons.expenses },
        { view: 'review', label: 'Performance Review', icon: icons.review },
        { view: 'creative', label: 'Creative Suite', icon: icons.creative },
        { view: 'opportunities', label: 'Opportunities', icon: icons.opportunities },
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
    renderDashboardSummary();
    renderRecentActivity();
}

function renderWalletView() {
    if (!currentUser) return;
    const currency = currentUser.budgets[0]?.summary?.currency || '$';
    const merchantSummary = calculateMerchantSummary(currentUser);

    // Render wallet overview card
    walletOverviewCard.innerHTML = `
        <h4>Cravour Wallet</h4>
        <p class="value success">${currency}${currentUser.wallet.balance.toLocaleString('en-US')}</p>
        <small class="note">Available Balance</small>
        <button id="fundWalletBtn" class="btn btn-secondary-outline" style="margin-top: 20px;">Fund Wallet</button>
    `;
    document.getElementById('fundWalletBtn')?.addEventListener('click', openFundWalletModal);

    // Render transaction history
    if (currentUser.wallet.transactions.length === 0) {
        transactionList.innerHTML = '<div class="empty-state">No transactions yet.</div>';
    } else {
        const transactionsHtml = currentUser.wallet.transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(t => {
                const isDebit = t.type === 'payment';
                const amountClass = isDebit ? 'error' : 'success';
                const sign = isDebit ? '− ' : '+ ';
                return `
                    <div class="payment-item">
                        <div>
                            <p><strong>${t.description}</strong></p>
                            <p style="font-size: 0.9em; color: var(--color-text-secondary);">${new Date(t.date).toLocaleString()}</p>
                        </div>
                        <p class="amount ${amountClass}">${sign}${currency}${t.amount.toLocaleString('en-US')}</p>
                    </div>
                `;
        }).join('');
        transactionList.innerHTML = transactionsHtml;
    }

    // Render merchant summary
    if (merchantSummary.length === 0) {
        merchantList.innerHTML = '<div class="empty-state">Analyze your expenses to see merchant spending.</div>';
    } else {
        const merchantsHtml = merchantSummary.map(m => `
            <div class="payment-item">
                <div>
                    <p><strong>${m.name}</strong></p>
                    <p style="font-size: 0.9em; color: var(--color-text-secondary);">${m.transactionCount} transaction(s)</p>
                </div>
                <p class="amount error">${currency}${m.totalSpent.toLocaleString('en-US')}</p>
            </div>
        `).join('');
        merchantList.innerHTML = merchantsHtml;
    }
}

function renderReviewView() {
    renderPaymentList();
}


function renderDashboardOverview(data: { [key: string]: { value: string; type?: 'success' | 'error'; note?: string } }) {
    dashboardOverview.innerHTML = Object.entries(data).map(([title, { value, type, note }]) => `
        <div class="overview-card glass-effect">
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
    const currency = latestBudget?.summary?.currency || latestExpenses?.expenseSummary?.currency || '$';
    
    const summaryData: { [key: string]: { value: string; type?: 'success' | 'error'; note?: string } } = {};

    summaryData['Discretionary Budget'] = {
        value: `${currency}${discretionaryBudget.toLocaleString()}`,
        type: 'success',
        note: latestBudget ? 'From your latest budget' : 'Create a budget to start'
    };

    summaryData['Total Expenses'] = {
        value: `${currency}${totalExpenses.toLocaleString()}`,
        type: 'error',
        note: latestExpenses ? 'From your latest report' : 'Track expenses to see this'
    };

    if (latestBudget && latestExpenses) {
        const netPosition = discretionaryBudget - totalExpenses;
        summaryData['Net Position'] = {
            value: `${currency}${Math.abs(netPosition).toLocaleString()}`,
            type: netPosition >= 0 ? 'success' : 'error',
            note: netPosition >= 0 ? 'Under Budget' : 'Over Budget'
        };
    } else {
         summaryData['Net Position'] = {
            value: 'N/A',
            note: 'Track budget & expenses'
        };
    }
    
    summaryData['Automated Payments'] = {
        value: `${currentUser.payments.length}`,
        note: 'Total scheduled payments'
    };
    
    renderDashboardOverview(summaryData);
}

function renderRecentActivity() {
    if (!currentUser) return;
    const hasBudgets = currentUser.budgets.length > 0;
    const hasExpenses = currentUser.expenses.length > 0;
    if (!hasBudgets && !hasExpenses) {
        recentActivityList.innerHTML = `<div class="empty-state">Create a budget or analyze expenses to see recent activity.</div>`;
        return;
    }
    let html = '';
    if (hasBudgets) {
        html += `<p>You created a new budget plan.</p>`;
    }
    if (hasExpenses) {
        html += `<p>You analyzed a new expense report.</p>`;
    }
    recentActivityList.innerHTML = html;
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
    const currency = budget.currency || '$';
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
                ${plan.recommendedMerchants.map((merchant) => `<div class="merchant-card"><h4>${merchant.name} ${merchant.verified ? `<span class="verified-icon">${icons.check}</span>` : ''}</h4><p><span class="footer-icon-placeholder"></span> ${merchant.address}</p><p class="deals">${merchant.deals}</p></div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = budgetHtml + optimizationHtml + itemsHtml + analysisHtml + merchantsHtml;
}

function renderBudgetPlan(plan: BudgetPlan, container: HTMLElement) {
    const summary = plan.summary;
    const currency = summary.currency || '$';
    
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
}

function renderExpenseReport(report: ExpenseReport, container: HTMLElement) {
    const currency = report.expenseSummary.currency || '$';
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
                <strong><span class="btn-icon">${icons.chartLine}</span> AI Trend Analysis:</strong> ${habits.trendSummary}
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
                        ${currentUser?.location ? `<button class="btn btn-small-action" data-map-query="${item.merchantCategory}">Find on Map</button>` : ''}
                        ${item.isRecurring ? `<button class="btn btn-small-action" data-merchant="${item.merchantBrandExample || item.merchantCategory}" data-amount="${item.amount}">Schedule Payment</button>` : ''}
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

    container.innerHTML = habitInsightsHtml + chartHtml + breakdownHtml + savingsHtml + investmentsHtml;
}


function renderPerformanceReview(report: PerformanceReview, container: HTMLElement) {
    const score = report.adherenceScore;
    const currency = report.currency || '$';

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

    savedAdCopyLibraryContainer.innerHTML = `<div id="saved-ad-copy-library">${allCopiesHtml || '<div class="empty-state">No ad copy generated yet.</div>'}</div>`;
}

function renderOpportunities(data: OpportunitiesData, container: HTMLElement) {
    if (!data?.opportunities || data.opportunities.length === 0) {
        container.innerHTML = '<div class="empty-state">No specific opportunities found at this time. Try updating your budget or expenses.</div>';
        return;
    }

    const getIconForType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'savings': return icons.wallet;
            case 'investment': return icons.chartLine;
            case 'merchant deal': return icons.searchDollar;
            default: return icons.magic;
        }
    };
    
    const opportunitiesHtml = data.opportunities.map((opp) => `
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
                <button class="btn btn-secondary-outline" style="margin-top: 10px;">${opp.actionText}</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="opportunities-grid">${opportunitiesHtml}</div>`;
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
    if (!currentUser || currentUser.payments.length === 0) {
        paymentList.innerHTML = `<div class="empty-state">No automated payments scheduled.</div>`;
        return;
    }
    const currency = currentUser.budgets[0]?.summary?.currency || '$';

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


function renderIcons() {
    const iconPlaceholders = document.querySelectorAll('[id^="icon-"]');
    iconPlaceholders.forEach(placeholder => {
        const iconKey = placeholder.id.replace('icon-', '').replace(/-/g, '_');
        const camelCaseKey = iconKey.replace(/_([a-z])/g, g => g[1].toUpperCase());
        if (icons[camelCaseKey as keyof typeof icons]) {
            placeholder.innerHTML = icons[camelCaseKey as keyof typeof icons];
        }
    });
    document.querySelectorAll('.value-icon-placeholder').forEach(el => el.innerHTML = icons.cogs);
    document.querySelectorAll('.footer-icon-placeholder').forEach(el => el.innerHTML = icons.envelope);
    document.querySelectorAll('.disclaimer-icon').forEach(el => el.innerHTML = icons.infoCircle);
    document.querySelectorAll('.verified-icon').forEach(el => el.innerHTML = icons.check);
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
        wallet: { balance: 0, transactions: [] },
        budgets: [],
        expenses: [],
        payments: [],
        creativeCopies: [],
        opportunities: [],
    };
    userDatabase.set(email, newUser);
    saveUserDatabase();
    
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
    const goal = demoGoalInput.value;
    if (!goal) {
        showStatusMessage(demoStatusArea, "Please describe your business goal.", "error");
        return;
    }
    showStatusMessage(demoStatusArea, "AI is building your plan...", "info", true);
    demoGenerateBtn.disabled = true;
    renderSkeletonLoader(demoResultsContainer, 'cards');

    try {
        const prompt = `A user wants to start a business. Their goal is: "${goal}". Generate a comprehensive shopping and budget plan for them. Be realistic and provide actionable tips.`;
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
        const prompt = `Based on the following user description, create a detailed budget plan. Ensure the currency is set to '${currency}'. Description: "${description}"`;
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
        saveUserDatabase();
        hideStatusMessage(budgetStatusArea, 500);
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
    
    const data = expenseDataInput.value;
    if (!data) {
        showStatusMessage(expenseStatusArea, 'Please paste your expense data.', 'error');
        return;
    }
    
    const currency = currentUser.budgets[currentUser.budgets.length - 1]?.summary?.currency || 'USD';
    
    showStatusMessage(expenseStatusArea, 'AI is analyzing your spending...', 'info', true);
    analyzeExpensesBtn.disabled = true;
    renderSkeletonLoader(expenseResultsContainer, 'cards');

    try {
        const prompt = `Analyze the following expense data for a month. The user's primary currency is ${currency}. Provide a detailed report, including spending habits (daily/weekly average, peak day, trend), categorization, cost-cutting tips, and investment opportunities. Data: "${data}"`;
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
        saveUserDatabase();
        hideStatusMessage(expenseStatusArea, 500);
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
        reviewResultsContainer.innerHTML = '<div class="empty-state">Could not generate review. Please try again.</div>';
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
    if (!currentUser || currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(opportunitiesStatusArea, 'Complete your budget and expense reports for personalized insights.', 'info');
        return;
    }

    showStatusMessage(opportunitiesStatusArea, 'AI is searching for opportunities...', 'info', true);
    generateOpportunitiesBtn.disabled = true;
    renderSkeletonLoader(opportunitiesResultsContainer, 'cards');

    const userProfile = JSON.stringify({
        budget: currentUser.budgets[currentUser.budgets.length - 1],
        expenses: currentUser.expenses[currentUser.expenses.length - 1],
        merchants: calculateMerchantSummary(currentUser),
    });

    try {
        const prompt = `Based on this user's financial profile, identify 3-4 specific, actionable opportunities for savings, investment, or relevant merchant deals. Profile: ${userProfile}`;
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
        saveUserDatabase();
        hideStatusMessage(opportunitiesStatusArea, 500);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(opportunitiesStatusArea, `Error: ${errorMessage}`, 'error');
        opportunitiesResultsContainer.innerHTML = '<div class="empty-state">Could not find opportunities. Please try again.</div>';
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
    // Add map logic later if needed
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
    
    currentUser.wallet.balance += amount;
    currentUser.wallet.transactions.push({
        id: `fund_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'fund',
        description: 'Wallet funded',
        amount: amount
    });
    
    saveUserDatabase();
    showStatusMessage(fundWalletStatus, `Successfully added ${amount} to your wallet.`, 'success');
    fundWalletForm.reset();
    setTimeout(() => {
        fundWalletModal.classList.add('hidden');
        hideStatusMessage(fundWalletStatus);
        if (currentView === 'wallet') {
            renderWalletView();
        }
    }, 1500);
}


let currentPayment = { merchant: '', amount: 0 };

function openPaymentGateway(merchant: string, amount: number) {
    if (!currentUser) return;
    
    currentPayment = { merchant, amount };
    const currency = currentUser.budgets[0]?.summary.currency || '$';
    
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


function handlePayWithPaystack() {
    if (!currentUser || !PAYSTACK_PUBLIC_KEY) return;
    
    const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: currentUser.email,
        amount: currentPayment.amount * 100, // Paystack amount is in kobo/cents
        currency: currentUser.budgets[0]?.summary.currency.toUpperCase() || 'USD',
        ref: `cravour_${Date.now()}`,
        metadata: {
            merchant: currentPayment.merchant
        },
        onClose: function(){
            showStatusMessage(paymentStatus, 'Payment window closed.', 'info');
        },
        callback: function(response: any){
            // Here you would verify the transaction on your backend
            console.log('Paystack response:', response);
            showStatusMessage(paymentStatus, `Payment to ${currentPayment.merchant} was successful!`, 'success');
            
            currentUser!.payments.push({
                merchant: currentPayment.merchant,
                amount: currentPayment.amount,
                frequency: paymentFrequencySelect.value
            });
            saveUserDatabase();
            
            setTimeout(() => {
                paymentGatewayModal.classList.add('hidden');
                hideStatusMessage(paymentStatus);
                renderPaymentList();
            }, 2000);
        }
    });
    handler.openIframe();
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
    
    currentUser.payments.push({
        merchant: currentPayment.merchant,
        amount: currentPayment.amount,
        frequency: paymentFrequencySelect.value
    });

    saveUserDatabase();
    showStatusMessage(paymentStatus, `Paid ${currentPayment.amount} to ${currentPayment.merchant} from your wallet.`, 'success');

    setTimeout(() => {
        paymentGatewayModal.classList.add('hidden');
        hideStatusMessage(paymentStatus);
        renderPaymentList();
        if (currentView === 'wallet') {
            renderWalletView();
        }
    }, 2000);
}


async function handleContactFormSubmit(e: Event) {
    e.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.disabled = true;
    showStatusMessage(contactFormMessage, "Sending message...", 'info', true);

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
        // This is where you'd call your backend function (e.g., Netlify/Firebase function)
        // const response = await fetch('/.netlify/functions/send-email', {
        // const response = await fetch('YOUR_BACKEND_ENDPOINT_URL', {
        //     method: 'POST',
        //     body: JSON.stringify(data),
        //     headers: { 'Content-Type': 'application/json' }
        // });
        // if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        
        // ---- SIMULATION START ----
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Simulated form submission:", data);
        // ---- SIMULATION END ----

        showStatusMessage(contactFormMessage, "Thank you! Your message has been sent.", 'success');
        contactForm.reset();

    } catch (error) {
        console.error("Contact Form Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(contactFormMessage, `Failed to send message: ${errorMessage}`, 'error');
    } finally {
        submitButton.disabled = false;
        hideStatusMessage(contactFormMessage, 5000);
    }
}


// --- Initialization Functions ---
function initializeLandingPage() {
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
    hamburger.addEventListener('click', handleMobileMenu);
    
    // Auth Modal Triggers - using event delegation on body to ensure buttons exist
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.matches('#headerSignUpBtn') || target.matches('#ctaSignUpBtn')) {
            openAuthModal(true);
        }
        if (target.matches('#headerLoginBtn')) {
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

    sidebarMenu.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a[data-view]');
        if (link) {
            e.preventDefault();
            const view = link.getAttribute('data-view') as AppView;
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
    });

    logoutBtn.addEventListener('click', handleLogout);
    appOverlay.addEventListener('click', handleMobileMenu);
    budgetPlannerForm.addEventListener('submit', handleGenerateBudgetPlan);
    expenseAnalyzerForm.addEventListener('submit', handleAnalyzeExpenses);
    expenseResultsContainer.addEventListener('click', handleExpenseReportActions);
    generateReviewBtn.addEventListener('click', handleGenerateReview);
    paymentList.addEventListener('click', handlePaymentListActions);
    creativeSuiteContainer.addEventListener('click', handleCreativeSuiteTabs);
    creativeSuiteFormDashboard.addEventListener('submit', handleGenerateCreativeCopyDashboard);
    adCopyResultsContainerDashboard.addEventListener('click', handleCopyActions);
    savedAdCopyLibraryContainer.addEventListener('click', handleCopyActions);
    generateOpportunitiesBtn.addEventListener('click', handleGenerateOpportunities);
    fundWalletForm.addEventListener('submit', handleFundWallet);
    closeFundWalletBtn.addEventListener('click', () => fundWalletModal.classList.add('hidden'));
    closePaymentGatewayBtn.addEventListener('click', () => paymentGatewayModal.classList.add('hidden'));
    payWithPaystackBtn.addEventListener('click', handlePayWithPaystack);
    payWithWalletBtn.addEventListener('click', handlePayWithWallet);
}

// --- Main App Start ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (!API_KEY || !PAYSTACK_PUBLIC_KEY) {
            document.body.innerHTML = `<div style="padding: 40px; text-align: center; color: white;"><h1>Configuration Error</h1><p>Required API keys are missing. Please check your environment variables.</p></div>`;
            return;
        }
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (e) {
        console.error("Failed to initialize AI SDK:", e);
        document.body.innerHTML = `<div style="padding: 40px; text-align: center; color: white;"><h1>Initialization Error</h1><p>Could not connect to the AI service.</p></div>`;
        return;
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
            // Handle case where user reloads on verification page
            openAuthModal(false);
            loginView.classList.add('hidden');
            verificationView.classList.remove('hidden');
            pendingVerificationEmail = loggedInUserEmail;
        }
    } else {
        renderAppView();
    }
});
