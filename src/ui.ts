import * as api from './ai';
import { showLoading, showMessage, hideMessage } from './utils';
import { ShoppingPlan, DashboardReport, PaystackInlineSuccessResponse, PlanItem, AdCopy } from './types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { User } from "firebase/auth";
import Chart from 'chart.js/auto';
import PaystackPop from '@paystack/inline-js';

// --- STATE MANAGEMENT ---
let currentUser: User | null = null;
let activeChart: Chart | null = null;
let walletUnsubscribe: (() => void) | null = null;
let userPlansCache: PlanItem[] = [];

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- INITIALIZATION ---
export function initAuthAndApp() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showApp();
        } else {
            currentUser = null;
            if (walletUnsubscribe) walletUnsubscribe();
            showLandingPage();
        }
    });
    setupAuthModals();
    setupLandingPageHandlers();
}

function setupAuthenticatedApp() {
    if (!currentUser) return;
    document.getElementById('userAvatar')!.innerText = (currentUser.email || 'U').charAt(0).toUpperCase();
    setupNavigation();
    setupDashboardPage();
    setupMyPlansPage();
    setupFundWalletPage();
    setupAddExpensePage();
    setupCravourAdsPage();
    setupLogout();
    listenToWalletBalance();
    (document.querySelector('.nav-item[data-section="dashboardSection"]') as HTMLElement)?.click();
}

// --- UI VISIBILITY ---
function showApp() {
    document.getElementById('landingPageShell')?.classList.add('hidden');
    document.getElementById('appShell')?.classList.remove('hidden');
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    setupAuthenticatedApp();
}

function showLandingPage() {
    document.getElementById('landingPageShell')?.classList.remove('hidden');
    document.getElementById('appShell')?.classList.add('hidden');
}

function setupLandingPageHandlers() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.header-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('active');
            hamburger.classList.toggle('is-active');
            hamburger.setAttribute('aria-expanded', nav.classList.contains('active').toString());
        });
    }
    
    const yearSpan = document.getElementById('year');
    if(yearSpan) yearSpan.textContent = new Date().getFullYear().toString();

    document.getElementById('shoppingPlanFormLanding')?.addEventListener('submit', handleGeneratePlanLanding);
}

function setupAuthModals() {
    const showAuthModal = () => document.getElementById('loginModal')?.classList.remove('hidden');
    document.getElementById('goToAppBtnLanding')?.addEventListener('click', showAuthModal);
    document.getElementById('footerGoToAppBtn')?.addEventListener('click', showAuthModal);
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('onboardingForm')?.addEventListener('submit', handleRegister);
    document.getElementById('showOnboardingBtn')?.addEventListener('click', () => switchAuthModal(true));
    document.getElementById('backToLoginBtn')?.addEventListener('click', () => switchAuthModal(false));
}

function switchAuthModal(showOnboarding: boolean) {
    document.getElementById('loginModal')?.classList.toggle('hidden', showOnboarding);
    document.getElementById('onboardingModal')?.classList.toggle('hidden', !showOnboarding);
}

async function handleLogin(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.querySelector('#loginEmail') as HTMLInputElement).value;
    const password = (form.querySelector('#loginPassword') as HTMLInputElement).value;
    const statusEl = document.getElementById('loginMessage')!;
    const button = form.querySelector('button')!;
    
    showLoading(statusEl, "Logging in...");
    button.disabled = true;
    try {
        await api.loginUser({ email, password });
        // onAuthStateChanged will handle showing the app
        hideMessage(statusEl);
    } catch (error: any) {
        showMessage(statusEl, error.response?.data?.error || "Login failed. Check credentials.", 'error');
    } finally {
        button.disabled = false;
    }
}

async function handleRegister(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const statusEl = document.getElementById('onboardingMessage')!;
    const button = form.querySelector('button')!;
    
    showLoading(statusEl, "Creating account...");
    button.disabled = true;
    try {
        await api.registerUser(data);
        // onAuthStateChanged will handle showing the app
        hideMessage(statusEl);
    } catch (error: any) {
        showMessage(statusEl, error.response?.data?.error || "Registration failed.", 'error');
    } finally {
        button.disabled = false;
    }
}

function setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        auth.signOut();
    });
}

// --- NAVIGATION ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const headerTitleEl = document.querySelector('#appHeaderTitle h1');
    const headerP = document.querySelector('#appHeaderTitle p');

    const sectionTitles: { [key: string]: { title: string; p: string } } = {
        dashboardSection: { title: 'Dashboard', p: 'Your AI-powered financial overview.'},
        myPlansSection: { title: 'Financial Plans', p: 'Create new goals and track their progress.'},
        addExpenseSection: { title: 'Add Expense', p: 'Log a new transaction.'},
        fundWalletSection: { title: 'Fund Wallet', p: 'Add money to your Cravour account.'},
        cravourAdsSection: { title: 'Cravour Ads', p: 'Generate ad copy with AI.'}
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = (item as HTMLElement).dataset.section;
            if (!targetId) return;

            document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active-section'));
            document.getElementById(targetId)?.classList.add('active-section');

            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const titles = sectionTitles[targetId];
            if(headerTitleEl && headerP && titles) {
                headerTitleEl.textContent = titles.title;
                headerP.textContent = titles.p;
            }
        });
    });
}

// --- REAL-TIME WALLET ---
function listenToWalletBalance() {
    if (walletUnsubscribe) walletUnsubscribe();
    if (!currentUser?.uid) return;

    const walletEl = document.getElementById('walletBalance');
    const userDocRef = db.collection('users').doc(currentUser.uid);

    walletUnsubscribe = userDocRef.onSnapshot((docSnap) => {
        if (docSnap.exists && walletEl) {
            const data = docSnap.data();
            const balance = data?.walletBalance || 0;
            walletEl.innerHTML = `Balance: <strong>₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>`;
        }
    }, (error: any) => console.error("Error listening to wallet balance:", error));
}

// --- PLAN RENDERING ---
function renderGeneratedPlan(plan: ShoppingPlan, container: HTMLElement) {
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
        <div class="optimization-tips">
            <h4 class="tips-heading"><i class="fas fa-lightbulb"></i> AI Savings Tips</h4>
            <ul>${budget.optimizationTips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        </div>
    ` : '';
    
    const itemsHtml = `
        <div class="result-section">
             <h3 class="result-heading">Itemized List</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr></thead><tbody>
            ${plan.budgetItems.map(item => `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>₦${item.estimatedPrice.toLocaleString()}</td></tr>`).join('')}
            </tbody></table></div>
        </div>`;

    const analysisHtml = `
        <div class="result-section">
            <h3 class="result-heading">AI Price & Savings Report</h3>
            <div class="analysis-grid">
                ${plan.priceAnalysis.map(item => `<div class="analysis-card"><h4>${item.itemName}</h4><p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p><p class="tip"><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> ${item.savingTip}</p></div>`).join('')}
            </div>
        </div>`;

    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Local Merchants</h3>
            <div class="merchant-grid">
                ${plan.recommendedMerchants.map(merchant => `<div class="merchant-card"><h4>${merchant.name} ${merchant.verified ? '<i class="fas fa-check-circle verified-icon" title="Verified Merchant"></i>' : ''}</h4><p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p><p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p></div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = budgetHtml + optimizationHtml + itemsHtml + analysisHtml + merchantsHtml;
}


// --- LANDING PAGE DEMO AI PLAN ---
async function handleGeneratePlanLanding(e: Event) {
    e.preventDefault();
    const input = document.getElementById('shoppingGoalLanding') as HTMLTextAreaElement;
    const description = input.value;
    const statusContainer = document.getElementById('landingStatusArea')!;
    const resultsContainer = document.getElementById('shoppingPlanResultsLanding')!;
    const button = document.getElementById('generatePlanBtnLanding') as HTMLButtonElement;

    if (description.trim().length < 10) {
        return showMessage(statusContainer, "Please provide a more detailed shopping goal.", 'error');
    }

    showLoading(statusContainer, "Generating your intelligent plan...");
    resultsContainer.innerHTML = ''; // Clear previous results
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        const plan = await api.generateShoppingPlanDemo(description);
        hideMessage(statusContainer);
        renderGeneratedPlan(plan, resultsContainer);
    } catch (error: any) {
        showMessage(statusContainer, error.response?.data?.error || "Failed to generate plan. Please try again.", 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Generate My AI Plan <i class="fas fa-cogs" aria-hidden="true"></i>';
    }
}


// --- MY PLANS PAGE (CREATE + VIEW) ---
function setupMyPlansPage() {
    document.getElementById('createPlanForm')?.addEventListener('submit', handleGenerateAndSavePlan);
    const plansSection = document.getElementById('myPlansSection');
    if (!plansSection) return;

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            await fetchAndRenderPlans();
        }
    }, { threshold: 0.1 });

    observer.observe(plansSection);
}

async function handleGenerateAndSavePlan(e: Event) {
    e.preventDefault();
    const input = document.getElementById('itemInput') as HTMLInputElement;
    const description = input.value;
    const statusContainer = document.getElementById('planStatus')!;
    const resultsContainer = document.getElementById('planResults')!;
    const button = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;

    if (description.trim().length < 10) {
        return showMessage(statusContainer, "Please provide a more detailed shopping goal.", 'error');
    }

    showLoading(statusContainer, "Generating and saving your intelligent plan...");
    button.disabled = true;

    try {
        const plan = await api.generateShoppingPlan(description);
        hideMessage(statusContainer);
        renderGeneratedPlan(plan, resultsContainer);
        await fetchAndRenderPlans(); 
        input.value = '';
    } catch (error: any) {
        showMessage(statusContainer, error.response?.data?.error || 'Failed to generate plan.', 'error');
    } finally {
        button.disabled = false;
    }
}

async function fetchAndRenderPlans() {
    const plansGrid = document.getElementById('plansGrid')!;
    showLoading(plansGrid, 'Loading your plans...');
    try {
        const plans = await api.getPlans();
        userPlansCache = plans;
        renderPlans(plans);
        populatePlanSelector();
    } catch (error: any) {
        showMessage(plansGrid, error.response?.data?.error || 'Could not load your plans.', 'error');
    }
}

function renderPlans(plans: PlanItem[]) {
    const plansGrid = document.getElementById('plansGrid')!;
    if (plans.length === 0) {
        plansGrid.innerHTML = `<div class="empty-state">You have no financial plans yet. Create one above to get started!</div>`;
        return;
    }

    plansGrid.innerHTML = plans.map(plan => {
        const spent = plan.spent || 0;
        const budget = plan.budgetAnalysis.userBudget;
        const progress = budget > 0 ? (spent / budget) * 100 : 0;
        return `
        <div class="plan-card" data-plan-id="${plan.id}">
            <div class="plan-card-header"><h3 class="plan-name">${plan.description}</h3><span class="plan-status ${plan.status}">${plan.status}</span></div>
            <div class="plan-card-body">
                <div class="plan-budget-info">
                    <p><span>Budget:</span> <strong>₦${budget.toLocaleString()}</strong></p>
                    <p><span>Spent:</span> <strong>₦${spent.toLocaleString()}</strong></p>
                </div>
                <div class="plan-progress">
                    <div class="progress-bar-container"><div class="progress-bar" style="width: ${progress.toFixed(2)}%;"></div></div>
                    <span class="progress-text">${Math.round(progress)}%</span>
                </div>
            </div>
            <div class="plan-card-footer">
                <button class="btn btn-tertiary delete-plan-btn" title="Delete Plan"><i class="fas fa-trash"></i></button>
                <div class="plan-toggle"><label class="switch"><input type="checkbox" class="status-toggle" ${plan.status === 'active' ? 'checked' : ''}><span class="slider round"></span></label></div>
            </div>
        </div>`;
    }).join('');

    plansGrid.querySelectorAll('.delete-plan-btn').forEach(btn => btn.addEventListener('click', handleDeletePlan));
    plansGrid.querySelectorAll('.status-toggle').forEach(toggle => toggle.addEventListener('change', handleTogglePlanStatus));
}

async function handleDeletePlan(e: Event) {
    const button = e.currentTarget as HTMLButtonElement;
    const card = button.closest('.plan-card') as HTMLElement;
    const planId = card.dataset.planId;
    if (!planId) return;

    if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
        card.style.opacity = '0.5';
        try {
            await api.deletePlan(planId);
            card.remove();
        } catch (error: any) {
            alert('Failed to delete plan: ' + error.response?.data?.error);
            card.style.opacity = '1';
        }
    }
}

async function handleTogglePlanStatus(e: Event) {
    const toggle = e.currentTarget as HTMLInputElement;
    const card = toggle.closest('.plan-card') as HTMLElement;
    const planId = card.dataset.planId;
    const statusEl = card.querySelector('.plan-status') as HTMLElement;
    if (!planId || !statusEl) return;

    const newStatus = toggle.checked ? 'active' : 'paused';
    toggle.disabled = true;
    try {
        await api.updatePlanStatus(planId, newStatus);
        statusEl.textContent = newStatus;
        statusEl.className = `plan-status ${newStatus}`;
    } catch (error: any) {
        alert('Failed to update plan status: ' + error.response?.data?.error);
        toggle.checked = !toggle.checked;
    } finally {
        toggle.disabled = false;
    }
}

// --- DASHBOARD PAGE ---
function setupDashboardPage() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (!dashboardSection) return;

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            renderDashboardSkeleton();
            try {
                const report = await api.generateDashboardReport();
                renderDashboard(report);
            } catch (error: any) {
                const statsContainer = document.getElementById('dashboardStats')!;
                showMessage(statsContainer, error.response?.data?.error || "Could not load dashboard", 'error');
            }
        }
    }, { threshold: 0.1 });

    observer.observe(dashboardSection);
}

function renderDashboardSkeleton() {
    document.getElementById('dashboardStats')!.innerHTML = Array(4).fill('<div class="summary-card skeleton"><h3>&nbsp;</h3><div class="amount">&nbsp;</div></div>').join('');
    document.getElementById('aiInsights')!.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating AI insights...</p></div>';
    document.getElementById('transactionTableBody')!.innerHTML = `<tr><td colspan="4"><div class="loading-state"><p>Loading transactions...</p></div></td></tr>`;
}

function renderDashboard(report: DashboardReport) {
    document.getElementById('dashboardStats')!.innerHTML = `
        <div class="summary-card"><h3>Total Spent</h3><div class="amount spent">₦${report.totalSpent.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Avg. Daily Spend</h3><div class="amount">₦${report.avgDailySpend.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Top Category</h3><div class="amount">${report.topCategory}</div></div>
        <div class="summary-card health-score-card"><h3>Financial Health</h3><div class="amount">${report.financialHealth.score}/100</div></div>`;
    
    document.getElementById('aiInsights')!.innerHTML = `
        <div class="ai-insight"><i class="fas fa-info-circle"></i><span>${report.financialHealth.summary}</span></div>
        ${report.financialHealth.recommendations.map(rec => `<div class="ai-insight"><i class="fas fa-lightbulb"></i><span>${rec}</span></div>`).join('')}`;

    document.getElementById('transactionTableBody')!.innerHTML = report.transactions.length > 0
        ? report.transactions.map(tx => `<tr><td>${tx.date}</td><td>${tx.item}</td><td>${tx.category}</td><td class="${tx.type === 'in' ? 'amount-in' : 'amount-out'}">${tx.type === 'in' ? '+' : '-'}₦${tx.amount.toLocaleString()}</td></tr>`).join('')
        : `<tr><td colspan="4" class="empty-state">No transactions recorded yet.</td></tr>`;
        
    renderSpendingChart(report.spendingByCategory);
}

function renderSpendingChart(data: DashboardReport['spendingByCategory']) {
    const canvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (activeChart) activeChart.destroy();
    
    activeChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: data.map(d => d.category), datasets: [{ data: data.map(d => d.amount), backgroundColor: ['#FFC107', '#36A2EB', '#FF6384', '#4BC0C0', '#9966FF', '#FF9F40'], borderWidth: 0, }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '70%' }
    });
}

// --- ADD EXPENSE PAGE ---
function setupAddExpensePage() {
    const form = document.getElementById('addExpenseForm') as HTMLFormElement;
    form.addEventListener('submit', handleAddTransaction);
    document.getElementById('expenseDescription')?.addEventListener('blur', handleCategorizeExpense);
}

async function handleCategorizeExpense(e: Event) {
    const input = e.target as HTMLInputElement;
    const categorySelect = document.getElementById('expenseCategory') as HTMLSelectElement;
    if (input.value.length < 5) return;
    
    categorySelect.disabled = true;
    try {
        const { category } = await api.categorizeTransaction(input.value);
        if (Array.from(categorySelect.options).some(opt => opt.value === category)) {
            categorySelect.value = category;
        }
    } catch (error) {
        console.error("AI Categorization failed:", error);
    } finally {
        categorySelect.disabled = false;
    }
}

function populatePlanSelector() {
    const container = document.getElementById('expensePlanSelectorContainer')!;
    if (userPlansCache.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = `
        <label for="expensePlan">Link to a Plan (Optional)</label>
        <select class="input-field" id="expensePlan" name="planId">
            <option value="">-- No Plan --</option>
            ${userPlansCache.filter(p => p.status === 'active').map(plan => `<option value="${plan.id}">${plan.description}</option>`).join('')}
        </select>`;
}

async function handleAddTransaction(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const statusEl = document.getElementById('addExpenseMessage')!;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    const data = Object.fromEntries(new FormData(form).entries());

    showLoading(statusEl, 'Adding transaction...');
    button.disabled = true;

    try {
        const response = await api.addTransaction(data);
        showMessage(statusEl, response.message, 'success');
        form.reset();
        await fetchAndRenderPlans();
    } catch (error: any) {
        showMessage(statusEl, error.response?.data?.error || 'Failed to add transaction.', 'error');
    } finally {
        button.disabled = false;
    }
}

// --- FUND WALLET PAGE ---
function setupFundWalletPage() {
    document.getElementById('fundWalletForm')?.addEventListener('submit', handleFundWallet);
}

function handleFundWallet(e: Event) {
    e.preventDefault();
    if (!currentUser || !process.env.PAYSTACK_PUBLIC_KEY) {
        return alert("Payment service is not configured.");
    }

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    const statusEl = document.getElementById('paymentStatus')!;
    const amount = Number(amountInput.value);

    if (isNaN(amount) || amount < 100) {
        return showMessage(statusEl, 'Please enter a valid amount (minimum ₦100).', 'error');
    }

    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: process.env.PAYSTACK_PUBLIC_KEY,
        email: currentUser.email!,
        amount: amount * 100,
        onSuccess: async (transaction: PaystackInlineSuccessResponse) => {
            showLoading(statusEl, 'Verifying payment...');
            try {
                const result = await api.verifyPayment(transaction.reference);
                showMessage(statusEl, result.message, 'success');
                amountInput.value = '';
            } catch (error: any) {
                showMessage(statusEl, error.response?.data?.message || 'Verification failed.', 'error');
            }
        },
        onCancel: () => showMessage(statusEl, 'Payment was cancelled.', 'info'),
    });
}

// --- CRAVOUR ADS PAGE ---
function setupCravourAdsPage() {
    document.getElementById('cravourAdsForm')?.addEventListener('submit', handleGenerateAd);
}

async function handleGenerateAd(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const description = (form.querySelector('#adDescription') as HTMLTextAreaElement).value;
    const resultsContainer = document.getElementById('adResultsContainer')!;
    const button = form.querySelector('button') as HTMLButtonElement;
    
    if (description.trim().length < 15) return showMessage(resultsContainer, 'Please provide a more detailed description.', 'error', 'status-area');
    
    showLoading(resultsContainer, 'Generating brilliant ad copy...');
    button.disabled = true;
    
    try {
        const adCopy = await api.generateAdCopy(description);
        renderAdCopy(adCopy, resultsContainer);
    } catch (error: any) {
        showMessage(resultsContainer, error.response?.data?.error || 'Failed to generate ad copy.', 'error', 'status-area');
    } finally {
        button.disabled = false;
    }
}

function renderAdCopy(copy: AdCopy, container: HTMLElement) {
    container.innerHTML = `
        <div class="ad-result-card"><h3>Your AI-Generated Ad Copy</h3><div class="ad-copy-column">
            <div class="ad-copy-section"><div class="copy-content">${copy.headline}</div><button class="copy-button" title="Copy Headline"><i class="far fa-copy"></i></button></div>
            <div class="ad-copy-section"><div class="copy-content">${copy.body}</div><button class="copy-button" title="Copy Body"><i class="far fa-copy"></i></button></div>
            <div class="ad-copy-section"><div class="copy-content">${copy.callToAction}</div><button class="copy-button" title="Copy Call to Action"><i class="far fa-copy"></i></button></div>
            <div class="ad-copy-section ad-hashtags"><div class="copy-content">${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}</div><button class="copy-button" title="Copy Hashtags"><i class="far fa-copy"></i></button></div>
        </div></div>`;

    container.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const textToCopy = (button.previousElementSibling as HTMLElement).innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.classList.add('copied');
                setTimeout(() => button.classList.remove('copied'), 2000);
            }).catch(err => console.error('Copy failed', err));
        });
    });
}