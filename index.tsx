import { GoogleGenAI, Type } from "@google/genai";

// --- Type Definitions ---
type User = {
    name: string;
};

// --- State Management ---
let ai: GoogleGenAI;
let currentUser: User | null = null; // null when logged out, user object when logged in
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
const ctaRegisterBtn = document.getElementById('ctaRegisterBtn') as HTMLButtonElement;
const closeAuthBtn = document.getElementById('closeAuth') as HTMLButtonElement;
const showRegisterBtn = document.getElementById('showRegister') as HTMLButtonElement;
const showLoginBtn = document.getElementById('showLogin') as HTMLButtonElement;
const loginView = document.getElementById('loginView') as HTMLDivElement;
const registerView = document.getElementById('registerView') as HTMLDivElement;
const loginForm = document.getElementById('loginForm') as HTMLFormElement;
const registerForm = document.getElementById('registerForm') as HTMLFormElement;
const registerNameInput = document.getElementById('registerName') as HTMLInputElement;

// Dashboard Elements
const appDashboard = document.getElementById('app-dashboard') as HTMLElement;
const welcomeMessage = document.getElementById('welcome-message') as HTMLHeadingElement;
const dashboardOverview = document.getElementById('dashboard-overview') as HTMLDivElement;
const dashboardTabs = document.querySelector('.dashboard-tabs') as HTMLElement;
const tabButtons = document.querySelectorAll('.dashboard-tab-btn');
const tabContents = document.querySelectorAll('.dashboard-content');

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

// Payment Elements
const paymentForm = document.getElementById('paymentForm') as HTMLFormElement;
const paymentList = document.getElementById('paymentList') as HTMLDivElement;
const paymentStatus = document.getElementById('paymentStatus') as HTMLDivElement;

// Footer Elements
const waitlistForm = document.getElementById('waitlistForm') as HTMLFormElement;
const waitlistEmailInput = document.getElementById('waitlistEmail') as HTMLInputElement;
const waitlistMessage = document.getElementById('waitlistMessage') as HTMLDivElement;

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
        dashboardOverview.classList.add('hidden'); // Hide overview on initial login

    } else {
        landingPage.classList.remove('hidden');
        appDashboard.classList.add('hidden');
        
        // Restore header for logged-out user
        navListLinks.innerHTML = `
            <li><a href="#services">Services</a></li>
            <li><a href="#cravour-ai">Cravour AI</a></li>
            <li><a href="#about">About Us</a></li>
        `;
        headerActionsContainer.innerHTML = `
            <button id="loginBtn" class="btn btn-secondary-outline">Login</button>
            <button id="registerBtn" class="btn btn-primary">Get Started</button>
        `;
        document.getElementById('loginBtn')!.addEventListener('click', () => openModal(false));
        document.getElementById('registerBtn')!.addEventListener('click', () => openModal(true));
    }
}

// --- Rendering Functions ---
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
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Category</th><th>Amount (₦)</th><th>% of Total</th></tr></thead><tbody>
            ${report.categorizedExpenses.map((item: any) => `<tr><td>${item.category}</td><td>${item.amount.toLocaleString()}</td><td>${item.percentage}%</td></tr>`).join('')}
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
        const prompt = `I am a Nigerian business owner. Here is my list of monthly expenses: "${expenses}". Please act as a financial analyst applying the Pareto principle. Analyze these expenses to identify the top 20% of categories that account for 80% of the costs. Provide a report in a valid JSON object strictly following the schema. Prioritize cost-cutting suggestions with the highest potential savings. Suggest relevant, local Nigerian investment opportunities for the saved funds.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: expenseReportSchema },
        });

        const report = parseJsonFromAi(response.text);
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

function handlePaymentSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const merchant = (document.getElementById('merchantName') as HTMLInputElement).value;
    const amount = (document.getElementById('paymentAmount') as HTMLInputElement).value;
    
    if(!merchant || !amount) {
        showStatusMessage(paymentStatus, "Please fill in all fields.", 'error');
        hideStatusMessage(paymentStatus, 3000);
        return;
    }

    if (paymentList.classList.contains('empty-state')) {
        paymentList.classList.remove('empty-state');
        paymentList.innerHTML = '';
    }
    
    const paymentItem = document.createElement('div');
    paymentItem.className = 'payment-item';
    paymentItem.innerHTML = `
        <p><strong>${merchant}</strong></p>
        <p class="amount">₦${parseInt(amount).toLocaleString()}</p>
    `;
    paymentList.appendChild(paymentItem);
    showStatusMessage(paymentStatus, "Payment scheduled successfully!", 'success');
    hideStatusMessage(paymentStatus, 3000);
    form.reset();
}

function handleMobileMenu() {
    const isActive = mainNav.classList.toggle('active');
    hamburger.classList.toggle('is-active');
    hamburger.setAttribute('aria-expanded', String(isActive));
}

function handleWaitlistSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = waitlistEmailInput.value;
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatusMessage(waitlistMessage, "Thank you for joining!", 'success');
        form.reset();
    } else {
        showStatusMessage(waitlistMessage, "Please enter a valid email.", 'error');
    }
    hideStatusMessage(waitlistMessage, 4000);
}

// --- Auth Logic ---
function openModal(isRegister = false) {
    authModal.classList.remove('hidden');
    loginView.classList.toggle('hidden', isRegister);
    registerView.classList.toggle('hidden', !isRegister);
    document.body.style.overflow = 'hidden';
    authModal.setAttribute('aria-labelledby', isRegister ? 'auth-heading-register' : 'auth-heading-login');
}

function closeModal() {
    authModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function handleAuthSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formId = form.id;
    const messageEl = document.getElementById(formId === 'loginForm' ? 'loginMessage' : 'registerMessage') as HTMLDivElement;
    const name = formId === 'registerForm' ? registerNameInput.value.split(' ')[0] || "User" : 'User';
    
    currentUser = { name: name };
    
    const message = formId === 'loginForm' ? 'Login successful! Redirecting...' : 'Account created! Welcome.';
    showStatusMessage(messageEl, message, 'success');
    setTimeout(() => {
        closeModal();
        renderAppView();
    }, 1500);
}

function handleLogout() {
    currentUser = null;
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
    waitlistForm?.addEventListener('submit', handleWaitlistSubmit);
    
    // Auth Modal Listeners
    loginBtn?.addEventListener('click', () => openModal(false));
    registerBtn?.addEventListener('click', () => openModal(true));
    ctaRegisterBtn?.addEventListener('click', () => openModal(true));
    closeAuthBtn?.addEventListener('click', closeModal);
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });
    showRegisterBtn?.addEventListener('click', () => {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
        authModal.setAttribute('aria-labelledby', 'auth-heading-register');
    });
    showLoginBtn?.addEventListener('click', () => {
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
        authModal.setAttribute('aria-labelledby', 'auth-heading-login');
    });
    loginForm?.addEventListener('submit', handleAuthSubmit);
    registerForm?.addEventListener('submit', handleAuthSubmit);
    
    // Dashboard Listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active');
            });
            
            const tabId = (button as HTMLElement).dataset.tab;
            if (tabId) {
                const activeTabContent = document.getElementById(tabId);
                if (activeTabContent) {
                    activeTabContent.classList.remove('hidden');
                    activeTabContent.classList.add('active');
                }
            }
        });
    });

    budgetPlannerForm?.addEventListener('submit', handleGenerateBudget);
    expenseAnalyzerForm?.addEventListener('submit', handleGenerateExpenseReport);
    paymentForm?.addEventListener('submit', handlePaymentSubmit);

    renderAppView();
}

// Start the application
initialize();