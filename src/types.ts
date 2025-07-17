// JWT payload structure as received after decoding
export interface JWTToken {
  id: string; // User ID from your auth system
  email: string;
  iat?: number;
  exp?: number;
}

// User Profile (for onboarding data and wallet balance in Firestore)
export interface UserProfile {
  id: string;
  email: string;
  profile?: {
    incomeSource?: string;
    monthlyIncome?: number;
    goals?: string;
  };
  walletBalance?: number; // Stored in Naira
  createdAt?: object;
  password?: string; // Only for registration/login, not persisted
}

// Structures for AI-generated Plan
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

export interface RecommendedMerchant {
  name: string;
  address: string;
  deals: string;
  verified: boolean;
}

export interface ShoppingPlan {
  budgetAnalysis: BudgetAnalysis;
  budgetItems: BudgetItem[];
  recommendedMerchants: RecommendedMerchant[];
}

// Represents a plan as stored in the database and returned to the client
export interface PlanItem extends ShoppingPlan {
    id: string;
    description: string;
    status: 'active' | 'paused';
    createdAt: any; // Firestore timestamp object
    spent?: number; // Optional: calculated field for how much has been spent against this plan
}

// Structures for Dashboard Report
export interface SpendingCategory {
  category: string;
  amount: number;
}

export interface Transaction {
  date: string;
  description: string;
  item?: string; // Optional legacy
  category: string;
  amount: number;
  type: 'in' | 'out';
  reference?: string;
}

export interface DashboardReport {
  totalSpent: number;
  avgDailySpend: number;
  topCategory: string;
  spendingByCategory: SpendingCategory[];
  transactions: Transaction[];
  financialHealthScore: number;
  healthRecommendations: string[];
}

// Historical Price Data for TF.js
export interface HistoricalPricePoint {
  date: number; // Unix timestamp
  price: number;
}

// Paystack Inline SDK `onSuccess` response
export interface PaystackInlineSuccessResponse {
  reference: string;
}

// Backend Paystack Verification Response
export interface PaystackVerificationResponse {
  status: 'success' | 'error';
  message: string;
}
