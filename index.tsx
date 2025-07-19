import { GoogleGenAI, Type } from "@google/genai";

// --- Type Definitions ---
type User = {
    name: string;
    email: string;
    verified: boolean;
    budgets: any[];
    expenses: any[];
    payments: any[];
};

type DashboardState = {
    currentStep: number;
    budgetCompleted: boolean;
    expenseCompleted: boolean;
}

// --- State Management ---
let ai: GoogleGenAI;
let currentUser: User | null = null; // null when logged out, user object when logged in
const userDatabase: Map<string, User> = new Map();
let pendingVerificationEmail: string | null = null;
let dashboardState: DashboardState = {
    currentStep: 1,
    budgetCompleted: false,
    expenseCompleted: false,
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
const registerBtn = document.getElementById('registerBtn') as HTMLButtonElement;
const ctaConsultationBtn = document.getElementById('ctaConsultationBtn') as HTMLButtonElement;
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

// Payment Elements
const paymentGatewayModal = document.getElementById('paymentGatewayModal') as HTMLDivElement;
const closePaymentGatewayBtn = document.getElementById('closePaymentGateway') as HTMLButtonElement;
const paymentForm = document.getElementById('paymentForm') as HTMLFormElement;
const paymentMerchantInput = document.getElementById('merchantName') as HTMLInputElement;
const paymentAmountInput = document.getElementById('paymentAmount') as HTMLInputElement;
const paymentList = document.getElementById('paymentList') as HTMLDivElement;
const paymentStatus = document.getElementById('paymentStatus') as HTMLDivElement;

// Footer Elements
const consultationForm = document.getElementById('consultationForm') as HTMLFormElement;
const consultationNameInput = document.getElementById('consultationName') as HTMLInputElement;
const consultationCompanyInput = document.getElementById('consultationCompany') as HTMLInputElement;
const consultationEmailInput = document.getElementById('consultationEmail') as HTMLInputElement;
const consultationMessage = document.getElementById('consultationMessage') as HTMLDivElement;

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
                    name: { type: Type.STRING },
                    address: { type: Type.STRING, description: "Location within the specified area." },
                    deals: { type: Type.STRING, description: "What they are known for or their current deals." },
                    verified: { type: Type.BOOLEAN, description: "Set to true if this is a major, well-known merchant (e.g., Shoprite, Justrite), otherwise false." }
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
            },
        },
        categorizedExpenses: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "e.g., Utilities, Logistics, Supplies, Food" },
                    amount: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                    isRecurring: { type: Type.BOOLEAN, description: "True if this is a predictable, recurring monthly expense (e.g., rent, subscription), false otherwise." },
                    merchantSuggestion: { type: Type.STRING, description: "Suggest a plausible Nigerian merchant or service provider for this expense category (e.g., 'MTN/Airtel' for 'Internet Subscription')." }
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
                    potentialSavings: { type: Type.STRING, description: "Estimated monthly savings, e.g., 'N5,000 - N10,000'" },
                }
            }
        },
        investmentOpportunities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "e.g., Nigerian Treasury Bills, Agri-tech Investment" },
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
                    area: { type: Type.STRING, description: "The area this insight applies to (e.g., 'Savings', 'Logistics')." }
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

function parseJsonFromAi(text: string) {
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parsing Error:", e);
        throw new Error("AI returned an invalid response format. Please try again.");
    }
}

function validatePlan(plan: any): boolean {
    if (!plan || typeof plan !== 'object') return false;
    const requiredKeys = ['budgetAnalysis', 'budgetItems', 'priceAnalysis', 'recommendedMerchants'];
    return requiredKeys.every(key => key in plan);
}

// --- View & UI Management ---
function renderAppView() {
    if (currentUser) {
        landingPage.classList.add('hidden');
        appDashboard.classList.remove('hidden');
        welcomeMessage.textContent = `Welcome Back, ${currentUser.name}!`;
        
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

        if (!dashboardState.budgetCompleted) dashboardState.currentStep = 1;
        else if (!dashboardState.expenseCompleted) dashboardState.currentStep = 2;
        else dashboardState.currentStep = 3;

        renderDashboardState();

    } else {
        landingPage.classList.remove('hidden');
        appDashboard.classList.add('hidden');
        
        // Restore header for logged-out user
        navListLinks.innerHTML = `
            <li><a href="#services">Our Capabilities</a></li>
            <li><a href="#demo">AI Demo</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
        `;
        headerActionsContainer.innerHTML = `
            <button id="headerLoginBtn" class="btn btn-secondary-outline">Login</button>
            <button id="headerConsultationBtn" class="btn btn-primary">Book Consultation</button>
        `;
        document.getElementById('headerLoginBtn')!.addEventListener('click', () => openAuthModal(false));
        document.getElementById('headerConsultationBtn')!.addEventListener('click', () => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        });
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
            
            (lockOverlay as HTMLElement).classList.toggle('hidden', !isLocked);
        }
    });

    // Render payments list if data exists
    if (currentUser?.payments.length) {
        renderPaymentList();
    }
}


function renderDashboardOverview(data: { [key: string]: { value: number; type?: 'success' | 'error' } }) {
    dashboardOverview.innerHTML = Object.entries(data).map(([title, { value, type }]) => `
        <div class="overview-card">
            <h4>${title}</h4>
            <p class="value ${type || ''}">₦${value.toLocaleString()}</p>
        </div>
    `).join('');
    dashboardOverview.classList.remove('hidden');
}

function renderChart(items: any[], valueKey: string, labelKey: string, percentKey: string) {
    if (!items || items.length === 0) return '';
    const chartHtml = items.map(item => `
        <div class="chart-segment">
            <div class="chart-label">
                <span>${item[labelKey]}</span>
                <span>${item[valueKey].toLocaleString()} ₦</span>
            </div>
            <div class="chart-bar-wrapper">
                <div class="chart-bar" style="--bar-width: ${item[percentKey]}%;"></div>
            </div>
        </div>
    `).join('');
    return `<div class="chart-container">${chartHtml}</div>`;
}

function renderGeneratedPlan(plan: any, container: HTMLElement) {
    const budget = plan.budgetAnalysis;
    const differenceClass = budget.difference >= 0 ? 'success' : 'error';

    const budgetHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. Market Prices</h3>
            <div class="summary-grid">
                <div class="summary-card"><h4>Your Budget</h4><p>₦${budget.userBudget.toLocaleString()}</p></div>
                <div class="summary-card"><h4>AI Estimated Cost</h4><p>₦${budget.estimatedCost.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Difference</h4><p class="${differenceClass}">₦${Math.abs(budget.difference).toLocaleString()}</p></div>
            </div>
            <p class="summary-text">${budget.summary}</p>
        </div>`;
    
    const optimizationHtml = (budget.optimizationTips && budget.optimizationTips.length > 0) ? `
        <div class="result-section optimization-tips">
            <h4 class="result-heading"><i class="fas fa-lightbulb"></i> AI Savings Tips</h4>
            <ul>${budget.optimizationTips.map((tip: string) => `<li>${tip}</li>`).join('')}</ul>
        </div>
    ` : '';
    
    const itemsHtml = `
        <div class="result-section">
             <h3 class="result-heading">Itemized List</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr></thead><tbody>
            ${plan.budgetItems.map((item: any) => `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>₦${item.estimatedPrice.toLocaleString()}</td></tr>`).join('')}
            </tbody></table></div>
        </div>`;

    const analysisHtml = `
        <div class="result-section">
            <h3 class="result-heading">AI Price & Savings Report</h3>
            <div class="analysis-grid">
                ${plan.priceAnalysis.map((item: any) => `<div class="analysis-card"><h4>${item.itemName}</h4><p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p><p class="tip"><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> ${item.savingTip}</p></div>`).join('')}
            </div>
        </div>`;

    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Local Merchants</h3>
            <div class="merchant-grid">
                ${plan.recommendedMerchants.map((merchant: any) => `<div class="merchant-card"><h4>${merchant.name} ${merchant.verified ? '<i class="fas fa-check-circle verified-icon" title="Verified Merchant"></i>' : ''}</h4><p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p><p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p></div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = budgetHtml + optimizationHtml + itemsHtml + analysisHtml + merchantsHtml;
}

function renderBudgetPlan(plan: any, container: HTMLElement) {
    const summary = plan.summary;
    renderDashboardOverview({
        'Total Income': { value: summary.totalIncome, type: 'success' },
        'Total Fixed Costs': { value: summary.totalFixedCosts, type: 'error' },
        'Discretionary Budget': { value: summary.discretionaryBudget, type: 'success' }
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
             ${renderChart(plan.allocations, 'amount', 'category', 'percentage')}
        </div>
    `;

    const allocationsHtml = `
         <div class="result-section">
             <h3 class="result-heading">Detailed Allocations</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Category</th><th>Amount (₦)</th><th>% of Income</th><th>Description</th></tr></thead><tbody>
            ${plan.allocations.map((item: any) => `<tr><td>${item.category}</td><td>${item.amount.toLocaleString()}</td><td>${item.percentage}%</td><td>${item.description}</td></tr>`).join('')}
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

function renderExpenseReport(report: any, container: HTMLElement) {
     renderDashboardOverview({
        'Total Expenses': { value: report.expenseSummary.totalExpenses, type: 'error' },
        'Top Expense': { value: report.categorizedExpenses.reduce((max:number, item:any) => Math.max(max, item.amount), 0) }
    });
    
    const summaryHtml = `
        <div class="result-section">
            <h3 class="result-heading">Expense Summary</h3>
             <div class="summary-grid">
                <div class="summary-card"><h4>Total Expenses</h4><p>₦${report.expenseSummary.totalExpenses.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Top Expense Area</h4><p>${report.expenseSummary.largestExpenseCategory}</p></div>
            </div>
        </div>
    `;

    const chartHtml = `
        <div class="result-section">
            <h3 class="result-heading">Visual Expense Breakdown</h3>
            ${renderChart(report.categorizedExpenses, 'amount', 'category', 'percentage')}
        </div>
    `;

    const breakdownHtml = `
        <div class="result-section">
             <h3 class="result-heading">Detailed Expense Breakdown</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Category</th><th>Amount (₦)</th><th>% of Total</th><th>Action</th></tr></thead><tbody>
            ${report.categorizedExpenses.map((item: any) => `<tr>
                <td>${item.category}</td>
                <td>${item.amount.toLocaleString()}</td>
                <td>${item.percentage}%</td>
                <td>
                    ${item.isRecurring ? `<button class="btn btn-small-action" data-merchant="${item.merchantSuggestion}" data-amount="${item.amount}">Schedule Payment</button>` : '<span>-</span>'}
                </td>
            </tr>`).join('')}
            </tbody></table></div>
        </div>
    `;
    const savingsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Cost-Cutting Suggestions</h3>
            <div class="analysis-grid">
                ${report.costCuttingSuggestions.map((item: any) => `<div class="analysis-card"><h4 class="info">${item.area}</h4><p>${item.suggestion}</p><p class="tip"><strong>Potential Savings:</strong> ${item.potentialSavings}</p></div>`).join('')}
            </div>
        </div>
    `;
    const investmentsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Investment Opportunities</h3>
             <div class="merchant-grid">
                ${report.investmentOpportunities.map((item: any) => `<div class="merchant-card"><h4>${item.name}</h4><p><strong>Risk:</strong> ${item.riskLevel}</p><p>${item.description}</p></div>`).join('')}
            </div>
        </div>
    `;

    container.innerHTML = summaryHtml + chartHtml + breakdownHtml + savingsHtml + investmentsHtml;
}

function renderPerformanceReview(report: any, container: HTMLElement) {
    const score = report.adherenceScore;
    const circumference = 2 * Math.PI * 80; // 80 is radius
    const offset = circumference - (score / 100) * circumference;

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
                    <div class="label">Adherence Score</div>
                </div>
            </div>
            <p class="summary-text" style="max-width: 600px;">${report.overallSummary}</p>
        </div>
    `;

    const varianceHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. Actuals Breakdown</h3>
            <div class="table-wrapper"><table class="data-table">
                <thead><tr><th>Category</th><th>Budgeted (₦)</th><th>Actual (₦)</th><th>Variance (₦)</th></tr></thead>
                <tbody>
                    ${report.varianceAnalysis.map((item: any) => {
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
            <ul>${report.keyInsights.map((item: any) => `<li><strong>${item.area}:</strong> ${item.insight}</li>`).join('')}</ul>
        </div>
    `;

    container.innerHTML = summaryHtml + varianceHtml + insightsHtml;
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
        showStatusMessage(demoStatusArea, "Please provide a more detailed shopping goal.", 'error');
        hideStatusMessage(demoStatusArea, 3000);
        return;
    }

    demoGenerateBtn.disabled = true;
    demoGoalInput.disabled = true;
    demoGenerateBtn.innerHTML = '<div class="loading-spinner"></div> Generating...';
    demoResultsContainer.innerHTML = '';
    showStatusMessage(demoStatusArea, "Generating your intelligent plan...", 'info', true);
    demoStatusArea.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
        const prompt = `You are an expert Nigerian financial planner applying the Pareto principle (80/20 rule). A user wants a shopping plan for: "${description}". Analyze the request. Generate a detailed financial plan using realistic Nigerian market prices (NGN). Focus on the most impactful advice: highlight the biggest cost drivers and provide optimization tips that offer the most significant savings. Your response MUST be a single, valid JSON object that strictly adheres to the provided schema.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: shoppingPlanSchema },
        });
        
        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error("AI returned an empty response.");
        }
        
        const plan = parseJsonFromAi(responseText);

        if (!validatePlan(plan)) {
            throw new Error("AI returned an incomplete plan. Please try rephrasing your request.");
        }

        hideStatusMessage(demoStatusArea);
        renderGeneratedPlan(plan, demoResultsContainer);

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        const errorMessage = error.message.includes("plan format") || error.message.includes("incomplete plan")
            ? error.message 
            : "An error occurred while generating the plan. Please try again.";
        showStatusMessage(demoStatusArea, errorMessage, 'error');
        demoResultsContainer.innerHTML = '<div class="empty-state">Could not generate a plan.</div>';
    } finally {
        demoGenerateBtn.disabled = false;
        demoGoalInput.disabled = false;
        demoGenerateBtn.innerHTML = '<i class="fas fa-cogs"></i> Generate AI Plan';
    }
}

async function handleGenerateBudget(e: Event) {
    e.preventDefault();
    const description = budgetDescriptionInput.value;
    if (description.trim().length < 20) {
        showStatusMessage(budgetStatusArea, "Please provide more details about your goals and finances.", 'error', false);
        hideStatusMessage(budgetStatusArea, 3000);
        return;
    }

    generateBudgetBtn.disabled = true;
    generateBudgetBtn.innerHTML = `<div class="loading-spinner"></div> Creating...`;
    showStatusMessage(budgetStatusArea, "Your AI co-pilot is building your budget...", 'info', true);
    budgetResultsContainer.innerHTML = '';

    try {
        const prompt = `As a Nigerian financial expert, create a detailed budget for a user with these goals: "${description}". The budget must strictly follow the provided JSON schema. Ensure all monetary values are in Nigerian Naira (NGN).`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: budgetPlanSchema },
        });

        const plan = parseJsonFromAi(response.text);
        if(currentUser) {
            currentUser.budgets.push(plan);
            dashboardState.budgetCompleted = true;
            dashboardState.currentStep = 2;
            renderDashboardState();
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
        showStatusMessage(expenseStatusArea, "Please paste your expense data.", 'error');
        hideStatusMessage(expenseStatusArea, 3000);
        return;
    }
    analyzeExpensesBtn.disabled = true;
    analyzeExpensesBtn.innerHTML = `<div class="loading-spinner"></div> Analyzing...`;
    showStatusMessage(expenseStatusArea, "Analyzing your expenses for savings opportunities...", 'info', true);
    expenseResultsContainer.innerHTML = '';
    
    try {
        const prompt = `I am a Nigerian business owner. Here is my list of monthly expenses: "${expenses}". Please act as a financial analyst applying the Pareto principle. Analyze these expenses to identify the top 20% of categories that account for 80% of the costs. For each category, determine if it's a recurring expense and suggest a potential merchant. Provide a report in a valid JSON object strictly following the schema. Prioritize cost-cutting suggestions with the highest potential savings. Suggest relevant, local Nigerian investment opportunities for the saved funds.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: expenseReportSchema },
        });

        const report = parseJsonFromAi(response.text);
         if(currentUser) {
            currentUser.expenses.push(report);
            dashboardState.expenseCompleted = true;
            dashboardState.currentStep = 3;
            renderDashboardState();
        }
        renderExpenseReport(report, expenseResultsContainer);
        hideStatusMessage(expenseStatusArea);

    } catch (error: any) {
        console.error("Expense Analysis Error:", error);
        showStatusMessage(expenseStatusArea, error.message, 'error');
        expenseResultsContainer.innerHTML = '<div class="empty-state">Could not generate a report.</div>';
    } finally {
        analyzeExpensesBtn.disabled = false;
        analyzeExpensesBtn.innerHTML = '<i class="fas fa-chart-line"></i> Generate Report';
    }
}

async function handleGeneratePerformanceReview() {
    if (!currentUser || currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(reviewStatusArea, "Please generate at least one budget and one expense report first.", 'info');
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
        const prompt = `As a Nigerian financial analyst, compare a user's budget with their actual expenses.
        Budget: ${JSON.stringify(latestBudget)}
        Expenses: ${JSON.stringify(latestExpenses)}
        Provide a detailed performance review based on this data. Analyze variances by comparing budget allocations to categorized expenses. Calculate an overall adherence score and offer key insights for improvement. The response must be a valid JSON object adhering to the specified schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: performanceReviewSchema },
        });
        
        const report = parseJsonFromAi(response.text);
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

function renderPaymentList() {
    if (!currentUser || !currentUser.payments.length) {
        paymentList.innerHTML = `<div class="empty-state">No automated payments scheduled.</div>`;
        return;
    }
    paymentList.innerHTML = currentUser.payments.map(p => `
        <div class="payment-item">
            <div>
                <p><strong>${p.merchant}</strong></p>
                <p style="font-size: 0.9em; color: var(--color-text-secondary);">${p.frequency}</p>
            </div>
            <p class="amount">₦${p.amount.toLocaleString()}</p>
        </div>
    `).join('');
}

function handlePaymentSubmit(e: Event) {
    e.preventDefault();
    // Simulate payment processing
    showStatusMessage(paymentStatus, "Scheduling payment...", 'info', true);
    
    setTimeout(() => {
        if (currentUser) {
            const newPayment = {
                merchant: paymentMerchantInput.value,
                amount: parseInt(paymentAmountInput.value),
                frequency: (document.getElementById('paymentFrequency') as HTMLSelectElement).value
            };
            currentUser.payments.push(newPayment);
            renderPaymentList();
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

function handleConsultationSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = consultationEmailInput.value;
    const name = consultationNameInput.value;
    const company = consultationCompanyInput.value;

    if (email && name && company && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatusMessage(consultationMessage, "Thank you! We'll be in touch shortly.", 'success');
        form.reset();
    } else {
        showStatusMessage(consultationMessage, "Please fill out all fields correctly.", 'error');
    }
    hideStatusMessage(consultationMessage, 4000);
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
    paymentMerchantInput.value = merchant;
    paymentAmountInput.value = amount;
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
    showStatusMessage(messageEl, 'Login successful! Redirecting...', 'success');
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
    };

    userDatabase.set(email, newUser);
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

        setTimeout(() => {
            closeAuthModal();
            renderAppView();
        }, 1000);
    }
}


function handleLogout() {
    currentUser = null;
    dashboardState = { currentStep: 1, budgetCompleted: false, expenseCompleted: false };
    renderAppView();
}

/**
 * Initializes the application.
 */
function initialize() {
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
    consultationForm?.addEventListener('submit', handleConsultationSubmit);
    
    // Auth Modal Listeners
    loginBtn?.addEventListener('click', () => openAuthModal(false));
    registerBtn?.addEventListener('click', () => {
         document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    });
    ctaConsultationBtn?.addEventListener('click', () => {
         document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    });
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
    });

    generateReviewBtn?.addEventListener('click', handleGeneratePerformanceReview);
    
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