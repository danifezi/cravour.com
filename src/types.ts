
// Structures for AI-generated Shopping Plan
export interface BudgetAnalysis {
  userBudget: number;
  estimatedCost: number;
  difference: number;
  summary: string;
  optimizationTips: string[];
}

export interface BudgetItem {
  itemName: string;
  quantity: string;
  estimatedPrice: number;
}

export interface PriceAnalysis {
    itemName: string;
    priceStability: string;
    savingTip: string;
}

export interface RecommendedMerchant {
  name: string;
  address: string;
  deals: string;
  verified: boolean;
}

export interface ShoppingPlan {
  budgetAnalysis: BudgetAnalysis;
  budgetItems: BudgetItem[];
  priceAnalysis: PriceAnalysis[];
  recommendedMerchants: RecommendedMerchant[];
}

// For App Plans
export interface PlanItem extends ShoppingPlan {
    id: string;
    description: string;
    status: 'active' | 'paused';
    spent: number;
}

// For Dashboard
export interface FinancialHealth {
    score: number;
    summary: string;
    recommendations: string[];
}

export interface Transaction {
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'in' | 'out';
}

export interface SpendingByCategory {
    category: string;
    amount: number;
}

export interface DashboardReport {
    totalSpent: number;
    avgDailySpend: number;
    topCategory: string;
    financialHealth: FinancialHealth;
    transactions: Transaction[];
    spendingByCategory: SpendingByCategory[];
}

// For Ads
export interface AdCopy {
    headline: string;
    body: string;
    callToAction: string;
    hashtags: string[];
    imageUrl: string;
}

// For Payments
export interface PaystackInlineSuccessResponse {
    reference: string;
}

export interface PaystackVerificationResponse {
    status: 'success' | 'error';
    message: string;
}
