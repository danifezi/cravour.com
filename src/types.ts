export interface BudgetAnalysis {
    userBudget: number;
    estimatedCost: number;
    difference: number;
    summary: string;
}

export interface BudgetItem {
    itemName: string;
    quantity: string;
    estimatedPrice: number;
}

export interface PriceAnalysisItem {
    itemName: string;
    priceStability: string;
    savingTip: string;
}

export interface Merchant {
    name: string;
    address: string;
    deals: string;
}

export interface ShoppingPlan {
    budgetAnalysis: BudgetAnalysis;
    budgetItems: BudgetItem[];
    priceAnalysis: PriceAnalysisItem[];
    recommendedMerchants: Merchant[];
}

export interface AdCopy {
    headline: string;
    body: string;
    callToAction: string;
    hashtags: string[];
}

export interface DashboardReport {
    totalSpent: number;
    avgDailySpend: number;
    topCategory: string;
    spendingByCategory: { category: string; amount: number }[];
    transactions: {
        date: string;
        item: string;
        category: string;
        amount: number;
        type: 'in' | 'out';
    }[];
}