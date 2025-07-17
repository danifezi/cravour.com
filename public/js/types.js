
/**
 * @typedef {object} BudgetAnalysis
 * @property {number} userBudget
 * @property {number} estimatedCost
 * @property {number} difference
 * @property {string} summary
 */

/**
 * @typedef {object} BudgetItem
 * @property {string} itemName
 * @property {string} quantity
 * @property {number} estimatedPrice
 */

/**
 * @typedef {object} PriceAnalysisItem
 * @property {string} itemName
 * @property {string} priceStability
 * @property {string} savingTip
 */

/**
 * @typedef {object} Merchant
 * @property {string} name
 * @property {string} address
 * @property {string} deals
 */

/**
 * @typedef {object} ShoppingPlan
 * @property {BudgetAnalysis} budgetAnalysis
 * @property {BudgetItem[]} budgetItems
 * @property {PriceAnalysisItem[]} priceAnalysis
 * @property {Merchant[]} recommendedMerchants
 */

/**
 * @typedef {object} AdCopy
 * @property {string} headline
 * @property {string} body
 * @property {string} callToAction
 * @property {string[]} hashtags
 */

/**
 * @typedef {object} DashboardReport
 * @property {number} totalSpent
 * @property {number} avgDailySpend
 * @property {string} topCategory
 * @property {Array<{category: string; amount: number;}>} spendingByCategory
 * @property {Array<{date: string; item: string; category: string; amount: number; type: 'in' | 'out'}>} transactions
 */

// This file is for JSDoc type definitions and does not export any runtime code.
export {};
