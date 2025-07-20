import { GoogleGenAI, Type } from "@google/genai";

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
type User = {
    name: string;
    email: string;
    verified: boolean;
    location?: {
        latitude: number;
        longitude: number;
    };
    budgets: BudgetPlan[];
    expenses: ExpenseReport[];
    payments: { merchant: string; amount: number; frequency: string; }[];
    creativeCopies: CreativeCopy[];
    opportunities: OpportunitiesData[];
};

type DashboardState = {
    currentStep: number;
    budgetCompleted: boolean;
    expenseCompleted: boolean;
    creativeCompleted: boolean;
}

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
let dashboardState: DashboardState = {
    currentStep: 1,
    budgetCompleted: false,
    expenseCompleted: false,
    creativeCompleted: false,
};
const API_KEY = process.env.API_KEY;


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
const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
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
const welcomeMessage = document.getElementById('welcome-message') as HTMLHeadingElement;
const dashboardOverview = document.getElementById('dashboard-overview') as HTMLDivElement;
const stepper = document.querySelector('.dashboard-stepper') as HTMLElement;
const stepContents = document.querySelectorAll('.dashboard-step-content');

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

// AI Creative Suite Elements
const creativeSuiteFormDashboard = document.getElementById('creativeSuiteFormDashboard') as HTMLFormElement;

// Opportunities Elements
const generateOpportunitiesBtn = document.getElementById('generateOpportunitiesBtn') as HTMLButtonElement;
const opportunitiesStatusArea = document.getElementById('opportunitiesStatus') as HTMLDivElement;
const opportunitiesResultsContainer = document.getElementById('opportunities-results-wrapper') as HTMLDivElement;

// Payment Elements
const paymentGatewayModal = document.getElementById('paymentGatewayModal') as HTMLDivElement;
const closePaymentGatewayBtn = document.getElementById('closePaymentGateway') as HTMLButtonElement;
const paymentForm = document.getElementById('paymentForm') as HTMLFormElement;
const paymentMerchantInput = document.getElementById('merchantName') as HTMLInputElement;
const paymentAmountInput = document.getElementById('paymentAmount') as HTMLInputElement;
const paymentAmountLabel = document.getElementById('paymentAmountLabel') as HTMLLabelElement;
const paymentList = document.getElementById('paymentList') as HTMLDivElement;
const paymentStatus = document.getElementById('paymentStatus') as HTMLDivElement;

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

// --- View & UI Management ---
function renderAppView() {
    if (currentUser) {
        landingPage.classList.add('hidden');
        appDashboard.classList.remove('hidden');
        welcomeMessage.textContent = `Welcome Back, ${currentUser.name}!`;
        renderDashboardSummary();
        
        // Update header for logged-in user
        navListLinks.innerHTML = `
            <li><a href="#" id="dashboard-link">Dashboard</a></li>
        `;
        headerActionsContainer.innerHTML = `
            <button id="logoutBtn" class="btn btn-secondary-outline">Logout</button>
        `;
        document.getElementById('logoutBtn')!.addEventListener('click', handleLogout);
        document.getElementById('dashboard-link')!.addEventListener('click', (e) => {
            e.preventDefault();
            appDashboard.scrollIntoView({ behavior: 'smooth' });
        });
        
        dashboardState.budgetCompleted = currentUser.budgets.length > 0;
        dashboardState.expenseCompleted = currentUser.expenses.length > 0;
        dashboardState.creativeCompleted = currentUser.creativeCopies.length > 0;

        if (!dashboardState.budgetCompleted) dashboardState.currentStep = 1;
        else if (!dashboardState.expenseCompleted) dashboardState.currentStep = 2;
        else dashboardState.currentStep = 3;

        renderDashboardState();
        renderSavedAdCopies();
        renderSavedOpportunities();

    } else {
        landingPage.classList.remove('hidden');
        appDashboard.classList.add('hidden');
        
        // Restore header for logged-out user
        navListLinks.innerHTML = `
            <li><a href="#features">Features</a></li>
            <li><a href="#demo">AI Demo</a></li>
            <li><a href="#contact">Contact</a></li>
        `;
        headerActionsContainer.innerHTML = `
            <button id="headerLoginBtn" class="btn btn-secondary-outline">Login</button>
            <button id="headerSignUpBtn" class="btn btn-primary">Get Started Free</button>
        `;
        document.getElementById('headerLoginBtn')!.addEventListener('click', () => openAuthModal(false));
        document.getElementById('headerSignUpBtn')!.addEventListener('click', () => openAuthModal(true));
    }
}

// --- Rendering Functions ---
function renderDashboardState() {
    // Update Stepper
    stepper.querySelectorAll('.step').forEach(stepEl => {
        const step = parseInt(stepEl.getAttribute('data-step')!);
        stepEl.classList.remove('active', 'completed', 'clickable');

        if (step < dashboardState.currentStep) {
            stepEl.classList.add('completed', 'clickable');
        } else if (step === dashboardState.currentStep) {
            stepEl.classList.add('active');
        }
        
        // Manually handle completion and clickability for non-linear steps
        if (step === 4 && dashboardState.creativeCompleted) {
             stepEl.classList.add('completed');
        }
        if (dashboardState.budgetCompleted && (step === 2 || step === 4)) {
            stepEl.classList.add('clickable');
        }
        if (dashboardState.expenseCompleted && step === 3) {
            stepEl.classList.add('clickable');
        }
    });

    // Update Content Panes
    stepContents.forEach(contentEl => {
        const step = parseInt((contentEl as HTMLElement).id.split('-')[2]);
        const lockOverlay = contentEl.querySelector('.step-lock-overlay');

        if (step === dashboardState.currentStep) {
            contentEl.classList.add('active');
        } else {
            contentEl.classList.remove('active');
        }

        if (lockOverlay) {
            let isLocked = true;
            if (step === 1) isLocked = false;
            if (step === 2 && dashboardState.budgetCompleted) isLocked = false;
            if (step === 3 && dashboardState.expenseCompleted) isLocked = false;
            if (step === 4 && dashboardState.budgetCompleted) isLocked = false;
            
            (lockOverlay as HTMLElement).classList.toggle('hidden', !isLocked);
        }
    });

    // Render payments list if data exists
    if (currentUser?.payments.length) {
        renderPaymentList();
    }
}


function renderDashboardOverview(data: { [key: string]: { value: string; type?: 'success' | 'error'; note?: string } }) {
    dashboardOverview.innerHTML = Object.entries(data).map(([title, { value, type, note }]) => `
        <div class="overview-card">
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
            <h4 class="result-heading"><i class="fas fa-lightbulb"></i> AI Savings & Planning Tips</h4>
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
                ${plan.priceAnalysis.map((item) => `<div class="analysis-card"><h4>${item.itemName}</h4><p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p><p class="tip"><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> ${item.savingTip}</p></div>`).join('')}
            </div>
        </div>`;

    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Shops & Services</h3>
            <div class="merchant-grid">
                ${plan.recommendedMerchants.map((merchant) => `<div class="merchant-card"><h4>${merchant.name} ${merchant.verified ? '<i class="fas fa-check-circle verified-icon" title="Verified Supplier"></i>' : ''}</h4><p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p><p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p></div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = budgetHtml + optimizationHtml + itemsHtml + analysisHtml + merchantsHtml;
}

function renderBudgetPlan(plan: BudgetPlan, container: HTMLElement) {
    const summary = plan.summary;
    const currency = summary.currency || '$';
    renderDashboardOverview({
        'Total Income': { value: `${currency}${summary.totalIncome.toLocaleString()}`, type: 'success' },
        'Total Fixed Costs': { value: `${currency}${summary.totalFixedCosts.toLocaleString()}`, type: 'error' },
        'Discretionary Budget': { value: `${currency}${summary.discretionaryBudget.toLocaleString()}`, type: 'success' }
    });

    const summaryHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget Overview</h3>
            <p><strong>Primary Goal:</strong> ${summary.primaryGoal}</p>
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
            <h3 class="result-heading"><i class="fas fa-lightbulb"></i> AI Recommendations</h3>
            <ul>${plan.recommendations.map((tip: string) => `<li>${tip}</li>`).join('')}</ul>
        </div>
    ` : '';

    container.innerHTML = summaryHtml + chartHtml + allocationsHtml + recommendationsHtml;
}

function renderExpenseReport(report: ExpenseReport, container: HTMLElement) {
    const currency = report.expenseSummary.currency || '$';
     renderDashboardOverview({
        'Total Spending': { value: `${currency}${report.expenseSummary.totalExpenses.toLocaleString()}`, type: 'error' },
        'Top Spending Category': { value: `${report.expenseSummary.largestExpenseCategory}` }
    });
    
    const summaryHtml = `
        <div class="result-section">
            <h3 class="result-heading">Spending Summary</h3>
             <div class="summary-grid">
                <div class="summary-card"><h4>Total Spending</h4><p>${currency}${report.expenseSummary.totalExpenses.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Top Category</h4><p>${report.expenseSummary.largestExpenseCategory}</p></div>
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

    container.innerHTML = summaryHtml + chartHtml + breakdownHtml + savingsHtml + investmentsHtml;
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
            <h3 class="result-heading"><i class="fas fa-lightbulb"></i> Key Performance Insights</h3>
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
            <h4 class="ad-headline">${copy.headline}</h4>
            <p class="ad-body">${copy.body}</p>
            <footer class="ad-cta-footer">
                <strong>Call to Action:</strong>
                <span class="ad-cta">${copy.callToAction}</span>
            </footer>
        </div>
    `).join('');
    container.innerHTML = `<div class="ad-copy-grid">${copiesHtml}</div>`;
}

function renderSavedAdCopies() {
    const container = document.getElementById('ad-copy-results-wrapper-dashboard') as HTMLDivElement;
    if (!container) return;

    if (!currentUser || !currentUser.creativeCopies || currentUser.creativeCopies.length === 0) {
        container.innerHTML = '<div class="empty-state">Your generated ad copy will appear here.</div>';
        return;
    }

    const allCopiesHtml = currentUser.creativeCopies.flatMap(dataSet => 
        dataSet.adCopies.map((copy) => `
            <div class="ad-copy-card">
                <h4 class="ad-headline">${copy.headline}</h4>
                <p class="ad-body">${copy.body}</p>
                <footer class="ad-cta-footer">
                    <strong>Call to Action:</strong>
                    <span class="ad-cta">${copy.callToAction}</span>
                </footer>
            </div>
        `)
    ).join('');

    container.innerHTML = `<div class="ad-copy-grid">${allCopiesHtml || '<div class="empty-state">No ad copy generated yet.</div>'}</div>`;
}

function renderOpportunities(data: OpportunitiesData, container: HTMLElement) {
    if (!data?.opportunities || data.opportunities.length === 0) {
        container.innerHTML = '<div class="empty-state">No specific opportunities found at this time. Try updating your budget or expenses.</div>';
        return;
    }

    const getIconForType = (type: string) => {
        switch (type.toLowerCase()) {
            case 'savings': return 'fa-piggy-bank';
            case 'investment': return 'fa-chart-line';
            case 'merchant deal': return 'fa-tags';
            default: return 'fa-lightbulb';
        }
    };
    
    const opportunitiesHtml = data.opportunities.map((opp) => `
        <div class="opportunity-card">
            <div class="card-header">
                <i class="fas ${getIconForType(opp.type)} card-icon"></i>
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
        demoGenerateBtn.innerHTML = '<i class="fas fa-cogs"></i> Generate AI Plan';
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
            dashboardState.budgetCompleted = true;
            dashboardState.currentStep = 2;
            renderDashboardState();
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
        generateBudgetBtn.innerHTML = '<i class="fas fa-magic"></i> Create My Budget';
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
        const prompt = `A user has provided their spending data: "${expenses}". Act as a helpful financial assistant. Analyze these expenses to identify the top spending categories. The user's currency is ${userCurrency}. When suggesting merchants for recurring expenses, provide a generic category (e.g., 'Web Hosting Provider') and a plausible brand example (e.g., 'GoDaddy'). Provide a report in a valid JSON object strictly following the schema. Suggest cost-cutting tips and relevant savings/investment opportunities (like High-Yield Savings Accounts, Index Funds).`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: expenseReportSchema },
        });

        const report = parseJsonFromAi<ExpenseReport>(response.text);
         if(currentUser) {
            currentUser.expenses.push(report);
            saveUserDatabase();
            dashboardState.expenseCompleted = true;
            dashboardState.currentStep = 3;
            renderDashboardState();
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
        analyzeExpensesBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze My Spending';
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
        generateReviewBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Generate Performance Review';
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
    const resultsContainer = form.parentElement?.parentElement?.querySelector('.results-wrapper') as HTMLDivElement;

    if (!nameInput || !descInput || !platformSelect || !generateBtn || !statusArea || !resultsContainer) {
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

        if (currentUser) {
            if (adCopyData.adCopies && adCopyData.adCopies.length > 0) {
                currentUser.creativeCopies.push(adCopyData);
                saveUserDatabase();
                dashboardState.creativeCompleted = true;
                renderDashboardState();
            }
            renderSavedAdCopies();
        }
        hideStatusMessage(statusArea);

    } catch (error: any) {
        console.error("Ad Copy Generation Error:", error);
        showStatusMessage(statusArea, "An error occurred while generating ad copy. Please try again.", 'error');
        resultsContainer.innerHTML = '<div class="empty-state">Could not generate ad copy.</div>';
    } finally {
        generateBtn.disabled = false;
        nameInput.disabled = false;
        descInput.disabled = false;
        platformSelect.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Ad Copy';
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
        generateOpportunitiesBtn.innerHTML = '<i class="fas fa-search-dollar"></i> Find My Opportunities';
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

function handlePaymentSubmit(e: Event) {
    e.preventDefault();
    showStatusMessage(paymentStatus, "Scheduling payment...", 'info', true);
    
    setTimeout(() => {
        if (currentUser) {
            const newPayment = {
                merchant: paymentMerchantInput.value,
                amount: parseInt(paymentAmountInput.value),
                frequency: (document.getElementById('paymentFrequency') as HTMLSelectElement).value
            };
            currentUser.payments.push(newPayment);
            saveUserDatabase();
            renderPaymentList();
            renderDashboardSummary();
        }
        showStatusMessage(paymentStatus, "Payment scheduled successfully!", 'success');
        setTimeout(() => {
            closePaymentGatewayModal();
            paymentForm.reset();
            hideStatusMessage(paymentStatus);
        }, 1500);
    }, 1000);
}

function handleMobileMenu() {
    const isActive = mainNav.classList.toggle('active');
    hamburger.classList.toggle('is-active');
    hamburger.setAttribute('aria-expanded', String(isActive));
}

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
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showStatusMessage(contactFormMessage, "Thank you for your message! We'll be in touch shortly.", 'success');
    form.reset();
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send Message';
    hideStatusMessage(contactFormMessage, 5000);
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
    const latestBudget = currentUser?.budgets?.[currentUser.budgets.length - 1];
    const currency = latestBudget?.summary?.currency || '$';
    paymentMerchantInput.value = merchant;
    paymentAmountInput.value = amount;
    paymentAmountLabel.textContent = `Amount (${currency})`;
    paymentGatewayModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePaymentGatewayModal() {
    paymentGatewayModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
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
            renderAppView();
        }, 1000);
    }
}


function handleLogout() {
    currentUser = null;
    saveCurrentLoggedInUser(null);
    dashboardState = { currentStep: 1, budgetCompleted: false, expenseCompleted: false, creativeCompleted: false };
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
    }

    if (!API_KEY) {
        showStatusMessage(demoStatusArea, "Configuration Error: API_KEY is missing. AI Demo is disabled.", 'error');
        if(demoGenerateBtn) demoGenerateBtn.disabled = true;
    } else {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
    
    // Event Listeners
    hamburger?.addEventListener('click', handleMobileMenu);
    demoForm?.addEventListener('submit', handleGenerateDemoPlan);
    contactForm?.addEventListener('submit', handleContactFormSubmit);
    creativeSuiteFormDashboard?.addEventListener('submit', handleGenerateAdCopy);
    
    // Sign Up CTA Listeners
    ctaSignUpBtn?.addEventListener('click', () => openAuthModal(true));
    
    // Auth Modal Listeners
    loginBtn?.addEventListener('click', () => openAuthModal(false));
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
    stepper.addEventListener('click', (e) => {
        const targetStep = (e.target as HTMLElement).closest('.step');
        if (!targetStep || !targetStep.classList.contains('clickable')) return;

        const stepNumber = parseInt(targetStep.getAttribute('data-step')!);
        dashboardState.currentStep = stepNumber;
        renderDashboardState();
    });
    
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
    
    // Payment Gateway Listeners
    closePaymentGatewayBtn?.addEventListener('click', closePaymentGatewayModal);
    paymentGatewayModal?.addEventListener('click', (e) => {
        if (e.target === paymentGatewayModal) closePaymentGatewayModal();
    });
    paymentForm?.addEventListener('submit', handlePaymentSubmit);

    renderAppView();
}

// Start the application
initialize();