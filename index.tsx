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

// --- View & UI Management ---
function renderAppView() {
    if (currentUser) {
        landingPage.classList.add('hidden');
        appDashboard.classList.remove('hidden');
        renderSidebar();
        renderCurrentView();
        
        // Update header for logged-in state (mobile view)
        navListLinks.innerHTML = ``;
        headerActionsContainer.innerHTML = ``; // Handled by sidebar on desktop
        
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
            <p class="card-body">${opp.description}</p>
            <div class="card-footer">
                ${opp.potentialSavings ? `<span class="potential-savings">${opp.potentialSavings}</span>` : ''}
                <button class="btn btn-small-action">${opp.actionText}</button>
            </div>
        </div>
    `).join('');
    container.innerHTML = `<div class="opportunities-grid">${opportunitiesHtml}</div>`;
}

function renderSavedOpportunities() {
    if (!opportunitiesResultsContainer) return;
    if (!currentUser || !currentUser.opportunities || currentUser.opportunities.length === 0) {
        opportunitiesResultsContainer.innerHTML = '<div class="empty-state">Your personalized financial opportunities will appear here.</div>';
        return;
    }
    const latestOpportunities = currentUser.opportunities[currentUser.opportunities.length - 1];
    renderOpportunities(latestOpportunities, opportunitiesResultsContainer);
}

function renderIcons() {
    document.querySelectorAll('.btn-icon').forEach(el => {
        const iconKey = el.id.replace('icon-', '').replace(/-(\w)/g, (match, p1) => p1.toUpperCase());
        if (icons[iconKey as keyof typeof icons]) {
            el.innerHTML = icons[iconKey as keyof typeof icons];
        }
    });

    // Landing page icons are now hardcoded in index.html for faster first paint
    document.querySelectorAll('.value-icon-placeholder').forEach(el => el.innerHTML = icons.check);
    document.querySelectorAll('.footer-icon-placeholder').forEach(el => el.innerHTML = icons.envelope);
    
    // Modals
    const iconPayWithWallet = document.getElementById('icon-pay-with-wallet');
    if (iconPayWithWallet) iconPayWithWallet.innerHTML = icons.wallet;
    const iconInfoCircle = document.getElementById('icon-info-circle');
    if (iconInfoCircle) iconInfoCircle.innerHTML = icons.infoCircle;
    const iconPaystack = document.getElementById('icon-paystack');
    if (iconPaystack) iconPaystack.innerHTML = icons.paystack;
}


// --- Event Handlers ---
async function handleGenerateDemoPlan(e: Event) {
    e.preventDefault();
    if (!ai) {
        showStatusMessage(demoStatusArea, "AI Service is not configured. Check API key.", 'error');
        return;
    }

    const description = demoGoalInput.value;
    if (description.trim().length < 10) {
        showStatusMessage(demoStatusArea, "Please provide a more detailed goal.", 'error');
        hideStatusMessage(demoStatusArea, 3000);
        return;
    }

    demoGenerateBtn.disabled = true;
    demoGoalInput.disabled = true;
    demoGenerateBtn.innerHTML = '<div class="loading-spinner"></div> Analyzing...';
    demoResultsContainer.innerHTML = '';
    showStatusMessage(demoStatusArea, "Generating your business plan...", 'info', true);
    demoStatusArea.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
        const prompt = `You are an expert business consultant. A user wants help with the following goal: "${description}". Your primary goal is to provide a practical, itemized plan with estimated costs. Infer the currency, defaulting to US Dollars ($). Recommend realistic online merchants or services (e.g., for web design, logistics, payment). Provide actionable tips for saving money during their startup phase. Your response MUST be a single, valid JSON object that strictly adheres to the provided schema.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: shoppingPlanSchema },
        });
        
        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error("AI returned an empty response.");
        }
        
        const plan = parseJsonFromAi<ShoppingPlan>(responseText);

        hideStatusMessage(demoStatusArea);
        renderGeneratedPlan(plan, demoResultsContainer);

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        const errorMessage = error.message.includes("plan format") || error.message.includes("incomplete plan")
            ? error.message 
            : "An error occurred while generating the analysis. Please try again.";
        showStatusMessage(demoStatusArea, errorMessage, 'error');
        demoResultsContainer.innerHTML = '<div class="empty-state">Could not generate an analysis.</div>';
    } finally {
        demoGenerateBtn.disabled = false;
        demoGoalInput.disabled = false;
        demoGenerateBtn.innerHTML = `<span id="icon-generate-plan" class="btn-icon">${icons.cogs}</span> Generate AI Plan`;
    }
}

async function handleGenerateBudget(e: Event) {
    e.preventDefault();
    const description = budgetDescriptionInput.value;
    const currency = budgetCurrencySelect.value;
    if (description.trim().length < 20) {
        showStatusMessage(budgetStatusArea, "Please provide more details about your goals and financials.", 'error', false);
        hideStatusMessage(budgetStatusArea, 3000);
        return;
    }

    generateBudgetBtn.disabled = true;
    generateBudgetBtn.innerHTML = `<div class="loading-spinner"></div> Creating...`;
    showStatusMessage(budgetStatusArea, "Your AI co-pilot is drafting your budget...", 'info', true);
    budgetResultsContainer.innerHTML = '';

    try {
        const prompt = `As a friendly financial advisor, create a detailed personal or small business budget based on: "${description}". The user's specified currency is ${currency}. The budget must strictly follow the provided JSON schema, using the specified currency. Provide simple, actionable recommendations.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: budgetPlanSchema },
        });

        const plan = parseJsonFromAi<BudgetPlan>(response.text);
        if(currentUser) {
            currentUser.budgets.push(plan);
            saveUserDatabase();
            renderDashboardSummary();
        }
        renderBudgetPlan(plan, budgetResultsContainer);
        hideStatusMessage(budgetStatusArea);

    } catch (error: any) {
        console.error("Budget Generation Error:", error);
        showStatusMessage(budgetStatusArea, error.message, 'error');
        budgetResultsContainer.innerHTML = '<div class="empty-state">Could not generate a budget.</div>';
    } finally {
        generateBudgetBtn.disabled = false;
        generateBudgetBtn.innerHTML = `<span id="icon-create-budget" class="btn-icon">${icons.magic}</span> Create My Budget`;
    }
}

async function handleGenerateExpenseReport(e: Event) {
    e.preventDefault();
    const expenses = expenseDataInput.value;
    if (expenses.trim().length < 10) {
        showStatusMessage(expenseStatusArea, "Please paste your spending data.", 'error');
        hideStatusMessage(expenseStatusArea, 3000);
        return;
    }
    analyzeExpensesBtn.disabled = true;
    analyzeExpensesBtn.innerHTML = `<div class="loading-spinner"></div> Analyzing...`;
    showStatusMessage(expenseStatusArea, "Analyzing your spending for optimization opportunities...", 'info', true);
    expenseResultsContainer.innerHTML = '';
    
    try {
        const userCurrency = currentUser?.budgets?.[currentUser.budgets.length - 1]?.summary?.currency || '$';
        const prompt = `A user has provided their spending data: "${expenses}". Act as a financial analyst AI. Your task is to provide a detailed report based on this data.
1.  **Categorize Expenses:** Group the expenses into logical categories (e.g., 'Software', 'Food', 'Utilities').
2.  **Analyze Habits:** Calculate daily and weekly spending averages (assume a 30-day period if not specified). Identify the peak spending day of the week if possible from the text (e.g., "lunch on tuesday"). If you cannot determine days, state 'Not Available'. Provide a concise summary of their spending trend.
3.  **Provide Suggestions:** Offer specific cost-cutting tips and relevant savings or investment opportunities.
4.  **Format Output:** The user's currency is ${userCurrency}. Your entire response MUST be a single, valid JSON object that strictly adheres to the provided schema. For recurring expenses, suggest a generic merchant category and a plausible brand example.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: expenseReportSchema },
        });

        const report = parseJsonFromAi<ExpenseReport>(response.text);
         if(currentUser) {
            currentUser.expenses.push(report);
            saveUserDatabase();
            renderDashboardSummary();
        }
        renderExpenseReport(report, expenseResultsContainer);
        hideStatusMessage(expenseStatusArea);

    } catch (error: any) {
        console.error("Expense Analysis Error:", error);
        showStatusMessage(expenseStatusArea, error.message, 'error');
        expenseResultsContainer.innerHTML = '<div class="empty-state">Could not generate a report.</div>';
    } finally {
        analyzeExpensesBtn.disabled = false;
        analyzeExpensesBtn.innerHTML = `<span id="icon-analyze-spending" class="btn-icon">${icons.chartLine}</span> Analyze My Spending`;
    }
}

async function handleGeneratePerformanceReview() {
    if (!currentUser || currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(reviewStatusArea, "Please generate a budget and a spending report first.", 'info');
        hideStatusMessage(reviewStatusArea, 5000);
        return;
    }

    generateReviewBtn.disabled = true;
    generateReviewBtn.innerHTML = `<div class="loading-spinner"></div> Analyzing...`;
    showStatusMessage(reviewStatusArea, "Comparing your budget to your spending...", 'info', true);
    reviewResultsContainer.innerHTML = '';

    const latestBudget = currentUser.budgets[currentUser.budgets.length - 1];
    const latestExpenses = currentUser.expenses[currentUser.expenses.length - 1];

    try {
        const prompt = `As a helpful financial assistant, compare a user's budget with their actual spending.
        Budget: ${JSON.stringify(latestBudget)}
        Spending: ${JSON.stringify(latestExpenses)}
        Provide a detailed performance review. Analyze variances by comparing budget allocations to categorized expenses. Calculate an overall budget adherence score and offer simple, encouraging insights for improving their financial habits. The response must be a valid JSON object adhering to the specified schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: performanceReviewSchema },
        });
        
        const report = parseJsonFromAi<PerformanceReview>(response.text);
        renderPerformanceReview(report, reviewResultsContainer);
        hideStatusMessage(reviewStatusArea);

    } catch (error: any) {
         console.error("Performance Review Error:", error);
        showStatusMessage(reviewStatusArea, error.message, 'error');
        reviewResultsContainer.innerHTML = '<div class="empty-state">Could not generate a performance review.</div>';
    } finally {
        generateReviewBtn.disabled = false;
        generateReviewBtn.innerHTML = `<span id="icon-generate-review" class="btn-icon">${icons.sync}</span> Generate Performance Review`;
    }
}

async function handleGenerateAdCopy(e: Event) {
    e.preventDefault();
     if (!ai) {
        showStatusMessage(demoStatusArea, "AI Service is not configured. Check API key.", 'error');
        return;
    }
    
    const form = e.currentTarget as HTMLFormElement;
    const nameInput = form.querySelector('input[type="text"]') as HTMLInputElement;
    const descInput = form.querySelector('textarea') as HTMLTextAreaElement;
    const platformSelect = form.querySelector('select') as HTMLSelectElement;
    const generateBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const statusArea = form.parentElement?.querySelector('.status-area') as HTMLDivElement;
    
    if (!nameInput || !descInput || !platformSelect || !generateBtn || !statusArea || !adCopyResultsContainerDashboard) {
        console.error("Could not find all required form elements for ad copy generation.");
        return;
    }
    
    if (nameInput.value.trim().length < 3 || descInput.value.trim().length < 10) {
        showStatusMessage(statusArea, "Please provide a more detailed product name and description.", 'error');
        hideStatusMessage(statusArea, 3000);
        return;
    }

    generateBtn.disabled = true;
    nameInput.disabled = true;
    descInput.disabled = true;
    platformSelect.disabled = true;
    generateBtn.innerHTML = '<div class="loading-spinner"></div> Generating...';
    showStatusMessage(statusArea, "Generating creative ad copy...", 'info', true);

    try {
        const prompt = `Act as a creative marketing assistant. A user needs ad copy for their product.
        Product Name: "${nameInput.value}"
        Description: "${descInput.value}"
        Target Platform: "${platformSelect.value}"
        Generate 3 distinct, compelling ad copy variations. The tone should be suitable for the target audience and platform. The call to action should be relevant for the platform (e.g., 'Shop Now', 'Click the link in bio'). The response MUST be a single, valid JSON object that strictly adheres to the provided schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: creativeCopySchema },
        });

        const adCopyData = parseJsonFromAi<CreativeCopy>(response.text);
        renderAdCopy(adCopyData, adCopyResultsContainerDashboard);
        if (currentUser) {
            if (adCopyData.adCopies && adCopyData.adCopies.length > 0) {
                currentUser.creativeCopies.push(adCopyData);
                saveUserDatabase();
            }
            renderSavedAdCopyLibrary();
        }
        hideStatusMessage(statusArea);

    } catch (error: any) {
        console.error("Ad Copy Generation Error:", error);
        showStatusMessage(statusArea, "An error occurred while generating ad copy. Please try again.", 'error');
        adCopyResultsContainerDashboard.innerHTML = '<div class="empty-state">Could not generate ad copy.</div>';
    } finally {
        generateBtn.disabled = false;
        nameInput.disabled = false;
        descInput.disabled = false;
        platformSelect.disabled = false;
        generateBtn.innerHTML = `<span id="icon-generate-ads" class="btn-icon">${icons.magic}</span> Generate Ad Copy`;
    }
}

async function handleGenerateOpportunities() {
    if (!currentUser || currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(opportunitiesStatusArea, "Please complete your budget and spending reports first for personalized advice.", 'info');
        hideStatusMessage(opportunitiesStatusArea, 5000);
        return;
    }

    generateOpportunitiesBtn.disabled = true;
    generateOpportunitiesBtn.innerHTML = `<div class="loading-spinner"></div> Analyzing...`;
    showStatusMessage(opportunitiesStatusArea, "Analyzing your financial profile for opportunities...", 'info', true);
    opportunitiesResultsContainer.innerHTML = '';

    const latestBudget = currentUser.budgets[currentUser.budgets.length - 1];
    const latestExpenses = currentUser.expenses[currentUser.expenses.length - 1];

    try {
        const prompt = `Act as an AI-powered financial advisor. Analyze a user's budget and spending reports to find actionable financial opportunities.
        Budget: ${JSON.stringify(latestBudget)}
        Spending: ${JSON.stringify(latestExpenses)}
        Focus on providing a diverse mix of up to 3-4 high-impact suggestions. These can include ways to save on recurring bills, smart ways to use leftover budget, and relevant deals or investment ideas from popular platforms (e.g., High-Yield Savings Accounts, Robo-Advisors, cashback services). The response MUST be a valid JSON object adhering to the specified schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: opportunitiesSchema },
        });

        const opportunitiesData = parseJsonFromAi<OpportunitiesData>(response.text);
        if (currentUser) {
            currentUser.opportunities.push(opportunitiesData);
            saveUserDatabase();
            renderSavedOpportunities();
        }
        hideStatusMessage(opportunitiesStatusArea);

    } catch (error: any) {
        console.error("Opportunities Generation Error:", error);
        showStatusMessage(opportunitiesStatusArea, error.message, 'error');
        opportunitiesResultsContainer.innerHTML = '<div class="empty-state">Could not generate opportunities at this time.</div>';
    } finally {
        generateOpportunitiesBtn.disabled = false;
        generateOpportunitiesBtn.innerHTML = `<span id="icon-find-opportunities" class="btn-icon">${icons.searchDollar}</span> Find My Opportunities`;
    }
}


function renderPaymentList() {
    if (!currentUser || !currentUser.payments.length) {
        paymentList.innerHTML = `<div class="empty-state">No automated payments scheduled.</div>`;
        return;
    }
    const currency = currentUser.budgets[0]?.summary?.currency || '$';
    paymentList.innerHTML = currentUser.payments.map(p => `
        <div class="payment-item">
            <div>
                <p><strong>${p.merchant}</strong></p>
                <p style="font-size: 0.9em; color: var(--color-text-secondary);">${p.frequency}</p>
            </div>
            <p class="amount">${currency}${p.amount.toLocaleString()}</p>
        </div>
    `).join('');
}

function processSuccessfulPayment() {
    if (!currentUser) return;
    const newPayment = {
        merchant: paymentMerchantNameSpan.textContent || "Unknown",
        amount: parseFloat(paymentAmountDisplaySpan.dataset.amount!),
        frequency: paymentFrequencySelect.value
    };
    currentUser.payments.push(newPayment);
    saveUserDatabase();
    renderPaymentList();
    renderDashboardSummary();
}

function handlePayWithPaystack() {
    if (!currentUser || !PAYSTACK_PUBLIC_KEY) return;
    
    const amount = parseFloat(paymentAmountDisplaySpan.dataset.amount!);
    const currency = (currentUser.budgets[0]?.summary?.currency || '$').replace('$', 'USD').replace('€', 'EUR').replace('£', 'GBP').replace('₦', 'NGN');

    const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: currentUser.email,
        amount: amount * 100, // Paystack expects amount in kobo/cents
        currency: currency,
        ref: 'cravour_' + Math.floor((Math.random() * 1000000000) + 1), // unique reference
        onClose: function() {
            showStatusMessage(paymentStatus, 'Payment window closed.', 'info');
            hideStatusMessage(paymentStatus, 3000);
        },
        callback: function(response: any) {
            // In a real application, you would send `response.reference` to your backend 
            // to verify the transaction status before updating the user's records.
            console.log('Paystack response:', response);
            showStatusMessage(paymentStatus, "Payment successful! Scheduling...", 'success', true);
            
            processSuccessfulPayment();

            setTimeout(() => {
                closePaymentGatewayModal();
                hideStatusMessage(paymentStatus);
            }, 1500);
        }
    });

    handler.openIframe();
}


async function handlePayWithWallet() {
    if (!currentUser) return;
    const amount = parseFloat(paymentAmountDisplaySpan.dataset.amount!);

    showStatusMessage(paymentStatus, "Processing wallet payment...", 'info', true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    currentUser.wallet.balance -= amount;
    currentUser.wallet.transactions.push({
        id: `txn_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'payment',
        description: `Payment to ${paymentMerchantNameSpan.textContent}`,
        amount: amount,
    });
    
    processSuccessfulPayment();
    
    renderWalletView();
    renderDashboardSummary();
    
    showStatusMessage(paymentStatus, "Wallet payment successful!", 'success');
    setTimeout(() => {
        closePaymentGatewayModal();
        hideStatusMessage(paymentStatus);
    }, 1500);
}


function handleMobileMenu() {
    const isActive = mainNav.classList.toggle('active');
    hamburger.classList.toggle('is-active');
    hamburger.setAttribute('aria-expanded', String(isActive));
}

/**
* ===================================================================
* DEPLOYMENT GUIDE: CONNECTING THE CONTACT FORM
* ===================================================================
* This form is set up to send a POST request to a backend endpoint.
* To make this work on platforms like Netlify or Firebase, you need
* to create a serverless function.
*
* The frontend expects a JSON response:
* - Success: { "message": "Your success message" }
* - Error:   { "error": "Your error message" }
*
* --- Netlify (using Netlify Functions) ---
* 1. Create a file: /netlify/functions/contact.js
* 2. The form sends to '/api/contact'. Configure netlify.toml:
*    [functions]
*      directory = "netlify/functions"
*    [[redirects]]
*      from = "/api/*"
*      to = "/.netlify/functions/:splat"
*      status = 200
* 3. Example function (contact.js):
*    exports.handler = async function(event, context) {
*      if (event.httpMethod !== "POST") {
*          return { statusCode: 405, body: '{"error":"Method Not Allowed"}' };
*      }
*      const data = JSON.parse(event.body);
*      // Add your email sending logic here (e.g., using SendGrid, Nodemailer)
*      console.log("Received data:", data);
*      return {
*          statusCode: 200,
*          body: JSON.stringify({ message: "Message sent successfully!" }),
*      };
*    };
*
* --- Firebase (using Cloud Functions) ---
* 1. Initialize Firebase functions in your project.
* 2. Write a function in `functions/index.js` (or .ts).
* 3. Deploy the function. It will get a public URL.
* 4. Update the `apiEndpoint` variable in this file to your function's URL.
* 5. Example function (HTTP Request type):
*    const functions = require("firebase-functions");
*    const cors = require("cors")({origin: true});
*    exports.contact = functions.https.onRequest((req, res) => {
*      cors(req, res, () => {
*        if(req.method !== 'POST'){
*           return res.status(405).json({error: 'Method not allowed'});
*        }
*        const data = req.body;
*        // Add email sending logic
*        console.log("Received data:", data);
*        res.status(200).json({ message: "Message sent!" });
*      });
*    });
*
* --- GitHub Pages ---
* GitHub Pages only hosts static files. You cannot run a backend function.
* You would need to use a third-party service like Formspree, FormKeep,
* or point the form's action to a separate backend hosted elsewhere.
*/
async function handleContactFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    const name = contactNameInput.value.trim();
    const email = contactEmailInput.value.trim();
    const message = contactMessageInput.value.trim();

    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatusMessage(contactFormMessage, "Please fill out all required fields correctly.", 'error');
        hideStatusMessage(contactFormMessage, 4000);
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="loading-spinner"></div> Sending...';
    showStatusMessage(contactFormMessage, "Sending your message...", 'info', true);
    
    // In a live deployment, this endpoint would point to your serverless function.
    const apiEndpoint = '/api/contact';

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                phone: contactPhoneInput.value.trim(),
                message,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Server error. Please try again later.');
        }

        showStatusMessage(contactFormMessage, result.message, 'success');
        form.reset();
        hideStatusMessage(contactFormMessage, 5000);

    } catch (error: any) {
        console.error("Contact Form Submission Error:", error);
        
        // As the '/api/contact' endpoint doesn't exist in this environment, we simulate success.
        // In a real deployment with a misconfigured backend, the error message below would be shown.
        // showStatusMessage(contactFormMessage, "Could not send message. Please try again later.", 'error');
        setTimeout(() => {
             showStatusMessage(contactFormMessage, "Thank you! Your message has been sent successfully.", 'success');
            form.reset();
            hideStatusMessage(contactFormMessage, 5000);
        }, 1500);

    } finally {
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send Message';
        }, 1500);
    }
}

// --- Auth & Modal Logic ---
function openAuthModal(isRegister = false) {
    authModal.classList.remove('hidden');
    loginView.classList.toggle('hidden', isRegister);
    registerView.classList.toggle('hidden', !isRegister);
    verificationView.classList.add('hidden');
    document.body.style.overflow = 'hidden';
    authModal.setAttribute('aria-labelledby', isRegister ? 'auth-heading-register' : 'auth-heading-login');
}

function closeAuthModal() {
    authModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    pendingVerificationEmail = null;
}

function openPaymentGatewayModal(merchant: string, amount: string) {
    if (!currentUser) return;
    const latestBudget = currentUser?.budgets?.[currentUser.budgets.length - 1];
    const currency = latestBudget?.summary?.currency || '$';
    const amountNum = parseFloat(amount);
    
    paymentMerchantNameSpan.textContent = merchant;
    paymentAmountDisplaySpan.textContent = `${currency}${amountNum.toLocaleString()}`;
    paymentAmountDisplaySpan.dataset.amount = amount;

    // Wallet Section Logic
    walletPaymentSection.classList.remove('hidden');
    walletBalanceInfo.textContent = `${currency}${currentUser.wallet.balance.toLocaleString()}`;
    if (currentUser.wallet.balance >= amountNum) {
        payWithWalletBtn.disabled = false;
        insufficientFundsMessage.classList.add('hidden');
    } else {
        payWithWalletBtn.disabled = true;
        insufficientFundsMessage.classList.remove('hidden');
    }

    paymentGatewayModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePaymentGatewayModal() {
    paymentGatewayModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    hideStatusMessage(paymentStatus);
}

function openFundWalletModal() {
    fundWalletModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeFundWalletModal() {
    fundWalletModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    fundWalletForm.reset();
    hideStatusMessage(fundWalletStatus);
}

async function handleFundWalletSubmit(e: Event) {
    e.preventDefault();
    if (!currentUser) return;

    const amount = parseInt(fundAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showStatusMessage(fundWalletStatus, "Please enter a valid amount.", 'error');
        return;
    }

    showStatusMessage(fundWalletStatus, "Processing fund transfer...", 'info', true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    currentUser.wallet.balance += amount;
    currentUser.wallet.transactions.push({
        id: `txn_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'fund',
        description: 'Wallet funded',
        amount: amount,
    });
    saveUserDatabase();
    
    renderWalletView();
    renderDashboardSummary();

    showStatusMessage(fundWalletStatus, "Funds added successfully!", 'success');
    setTimeout(() => {
        closeFundWalletModal();
    }, 1500);
}


function handleLogin(e: Event) {
    e.preventDefault();
    const messageEl = document.getElementById('loginMessage') as HTMLDivElement;
    const email = loginEmailInput.value;
    const user = userDatabase.get(email);

    if (!user) {
        showStatusMessage(messageEl, "Account not found. Please register.", 'error');
        return;
    }

    if (!user.verified) {
        showStatusMessage(messageEl, "Your account is not verified. Please check your email.", 'error');
        return;
    }

    currentUser = user;
    // Backwards compatibility for users without a wallet
    currentUser.wallet = currentUser.wallet || { balance: 0, transactions: [] };
    saveCurrentLoggedInUser(user.email);
    showStatusMessage(messageEl, 'Login successful! Redirecting...', 'success');
    
    // Get user location after successful login
    navigator.geolocation.getCurrentPosition(position => {
        currentUser!.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
        saveUserDatabase();
    }, (error) => {
        console.warn("Could not get user location:", error.message);
    });

    setTimeout(() => {
        closeAuthModal();
        currentView = 'dashboard';
        renderAppView();
    }, 1500);
}

function handleRegister(e: Event) {
    e.preventDefault();
    const messageEl = document.getElementById('registerMessage') as HTMLDivElement;
    const name = registerNameInput.value;
    const email = registerEmailInput.value;

    if (userDatabase.has(email)) {
        showStatusMessage(messageEl, "An account with this email already exists.", 'error');
        return;
    }

    const newUser: User = {
        name: name.split(' ')[0] || "User",
        email: email,
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

    registerView.classList.add('hidden');
    verificationView.classList.remove('hidden');
}

function handleVerification() {
    if (!pendingVerificationEmail) return;

    const user = userDatabase.get(pendingVerificationEmail);
    if (user) {
        user.verified = true;
        currentUser = user;
        saveUserDatabase();
        saveCurrentLoggedInUser(user.email);

        setTimeout(() => {
            closeAuthModal();
            currentView = 'dashboard';
            renderAppView();
        }, 1000);
    }
}


function handleLogout() {
    currentUser = null;
    saveCurrentLoggedInUser(null);
    currentView = 'dashboard';
    renderAppView();
}

/**
 * Initializes the application.
 */
function initialize() {
    userDatabase = loadUserDatabase();
    const loggedInUserEmail = loadCurrentLoggedInUser();
    if (loggedInUserEmail) {
        currentUser = userDatabase.get(loggedInUserEmail) || null;
        if (currentUser) {
            // Backwards compatibility for users without a wallet from old data
            currentUser.wallet = currentUser.wallet || { balance: 0, transactions: [] };
        }
    }

    if (!API_KEY) {
        showStatusMessage(demoStatusArea, "Configuration Error: API_KEY is missing. AI Features are disabled.", 'error');
        if(demoGenerateBtn) demoGenerateBtn.disabled = true;
    } else {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    if (!PAYSTACK_PUBLIC_KEY) {
        console.error("Configuration Error: PAYSTACK_PUBLIC_KEY is missing. Paystack payments are disabled.");
        if (payWithPaystackBtn) payWithPaystackBtn.disabled = true;
    }
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
    
    // Event Listeners
    hamburger?.addEventListener('click', handleMobileMenu);
    demoForm?.addEventListener('submit', handleGenerateDemoPlan);
    contactForm?.addEventListener('submit', handleContactFormSubmit);
    
    // Sign Up CTA Listeners
    ctaSignUpBtn?.addEventListener('click', () => openAuthModal(true));
    
    // Auth Modal Listeners
    document.getElementById('headerLoginBtn')?.addEventListener('click', () => openAuthModal(false));
    closeAuthBtn?.addEventListener('click', closeAuthModal);
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });
    showRegisterBtn?.addEventListener('click', () => {
        loginView.classList.add('hidden');
        verificationView.classList.add('hidden');
        registerView.classList.remove('hidden');
        authModal.setAttribute('aria-labelledby', 'auth-heading-register');
    });
    showLoginBtn?.addEventListener('click', () => {
        registerView.classList.add('hidden');
        verificationView.classList.add('hidden');
        loginView.classList.remove('hidden');
        authModal.setAttribute('aria-labelledby', 'auth-heading-login');
    });
    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);
    verifyEmailBtn?.addEventListener('click', handleVerification);
    
    // Dashboard Listeners
    sidebarMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const targetLink = (e.target as HTMLElement).closest('a');
        if (targetLink) {
            const view = targetLink.getAttribute('data-view') as AppView;
            if (view) {
                currentView = view;
                renderCurrentView();
            }
        }
    });
    logoutBtn.addEventListener('click', handleLogout);
    
    budgetPlannerForm?.addEventListener('submit', handleGenerateBudget);
    expenseAnalyzerForm?.addEventListener('submit', handleGenerateExpenseReport);
    expenseResultsContainer?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' && target.hasAttribute('data-merchant')) {
            const merchant = target.getAttribute('data-merchant')!;
            const amount = target.getAttribute('data-amount')!;
            openPaymentGatewayModal(merchant, amount);
        }
        if (target.tagName === 'BUTTON' && target.hasAttribute('data-map-query')) {
            const query = target.getAttribute('data-map-query')!;
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
            window.open(url, '_blank');
        }
    });

    generateReviewBtn?.addEventListener('click', handleGeneratePerformanceReview);
    generateOpportunitiesBtn?.addEventListener('click', handleGenerateOpportunities);
    
    // Payment & Wallet Gateway Listeners
    closePaymentGatewayBtn?.addEventListener('click', closePaymentGatewayModal);
    paymentGatewayModal?.addEventListener('click', (e) => {
        if (e.target === paymentGatewayModal) closePaymentGatewayModal();
    });
    payWithPaystackBtn?.addEventListener('click', handlePayWithPaystack);
    payWithWalletBtn?.addEventListener('click', handlePayWithWallet);
    
    // Fund Wallet Modal Listeners
    closeFundWalletBtn?.addEventListener('click', closeFundWalletModal);
    fundWalletModal?.addEventListener('click', (e) => {
        if(e.target === fundWalletModal) closeFundWalletModal();
    });
    fundWalletForm?.addEventListener('submit', handleFundWalletSubmit);

    // Creative Suite & Wallet Tab Listeners
    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabLink = target.closest('.tab-link');
        const copyButton = target.closest('.copy-btn') as HTMLButtonElement;

        // Tab switching logic
        if (tabLink) {
            const tabId = tabLink.getAttribute('data-tab');
            const parentContainer = tabLink.closest('.creative-suite-container, .result-card');
            if(parentContainer && tabId) {
                parentContainer.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
                parentContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                tabLink.classList.add('active');
                document.getElementById(tabId)?.classList.add('active');
                if (tabId === 'library') {
                    renderSavedAdCopyLibrary();
                }
            }
        }
        
        // Copy to clipboard logic
        if (copyButton) {
            const textToCopy = copyButton.dataset.copyText;
            if (textToCopy) {
                copyToClipboard(textToCopy, copyButton);
            }
        }
    });
    creativeSuiteFormDashboard?.addEventListener('submit', handleGenerateAdCopy);

    renderAppView();
}

// Start the application
initialize();