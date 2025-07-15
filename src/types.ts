export interface PriceDataItem {
    itemName: string;
    currentPrice: number;
    priceChange: number;
}

export interface BudgetPlanItem {
    itemName: string;
    category: string;
    quantity: string;
    estimatedPrice: number;
}

export interface BudgetPlanResponse {
    estimatedTotal: number;
    items: BudgetPlanItem[];
    notes?: string;
}

export interface PriceReportItem {
    itemName: string;
    averagePrice: string;
    stability: string;
}

export interface PriceReportResponse {
    overallSummary: string;
    savingTips: string;
    itemReports: PriceReportItem[];
}

export interface Merchant {
    name: string;
    address: string;
    deals: string;
}

export interface ExpenseCategorySpending {
    category: string;
    amount: number;
}

export interface ExpenseTransaction {
    date: string;
    item: string;
    category: string;
    amount: number;
}

export interface ExpenseReportResponse {
    totalSpent: number;
    avgDailySpend: number;
    spendingByCategory: ExpenseCategorySpending[];
    transactions: ExpenseTransaction[];
    insights?: string;
}

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}
