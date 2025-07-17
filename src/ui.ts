import * as api from './ai';
import { showLoading, showMessage, hideMessage, decodeJwt } from './utils';
import { ShoppingPlan, DashboardReport, UserProfile, PaystackInlineSuccessResponse, PlanItem, AdCopy } from './types';
import firebase from 'firebase/app';
import 'firebase/firestore';
import Chart from 'chart.js/auto';
import PaystackPop from '@paystack/inline-js';

// --- STATE MANAGEMENT ---
let currentUser: UserProfile | null = null;
let activeChart: Chart | null = null;
let walletUnsubscribe: (() => void) | null = null;
let userPlansCache: PlanItem[] = [];

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
};

let db: firebase.firestore.Firestore;
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
} else {
    console.warn("Firebase configuration is missing. Wallet balance will not be real-time.");
}


// --- INITIALIZATION ---
export function initAuthAndApp() {
    const token = localStorage.getItem('cravour_token');
    if (token) {
        const decoded = decodeJwt(token);
        if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
            currentUser = { id: decoded.id, email: decoded.email };
            showApp();
        } else {
            localStorage.removeItem('cravour_token');
            showAuth();
        }
    } else {
        showAuth();
    }
    setupAuthHandlers();
    setupLandingPageHandlers();
}

function setupAuthenticatedApp() {
    if (!currentUser) return;
    document.getElementById('userAvatar')!.innerText = currentUser.email.charAt(0).toUpperCase();
    setupNavigation();
    setupDashboardPage();
    setupMyPlansPage(); // This now handles create and view
    setupFundWalletPage();
    setupAddExpensePage();
    setupCravourAdsPage();
    setupLogout();
    listenToWalletBalance();
    // Trigger the initial view
    (document.querySelector('.nav-item[data-section="dashboardSection"]') as HTMLElement)?.click();
}

// --- AUTHENTICATION & UI VISIBILITY ---
function showApp() {
    document.getElementById('landingPageShell')?.classList.add('hidden');
    document.getElementById('appShell')?.classList.remove('hidden');
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    setupAuthenticatedApp();
}

function showAuth() {
    document.getElementById('landingPageShell')?.classList.remove('hidden');
    document.getElementById('appShell')?.classList.add('hidden');
}

function setupLandingPageHandlers() {
    // Hamburger Menu Logic
    const hamburger = document.querySelector('.hamburger');
    const headerNav = document.querySelector('.header-nav');
    if (hamburger && headerNav) {
        hamburger.addEventListener('click', () => {
            headerNav.classList.toggle('active');
        });
    }

    // Smooth scroll for hero CTA
    document.querySelector('.hero-cta a')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#unleash-ai')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Show Login Modal
    const showAuthModal = () => document.getElementById('loginModal')?.classList.remove('hidden');
    document.getElementById('goToAppBtnLanding')?.addEventListener('click', showAuthModal);
    document.getElementById('footerGoToAppBtn')?.addEventListener('click', showAuthModal);
    
    // Set current year in footer
    const yearSpan = document.getElementById('year');
    if(yearSpan) yearSpan.textContent = new Date().getFullYear().toString();

    // Setup AI Demo form
    document.getElementById('shoppingPlanFormLanding')?.addEventListener('submit', handleGeneratePlanLanding);
}

function setupAuthHandlers() {
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
    
    showLoading(statusEl, "Logging in...");
    try {
        const { token, user } = await api.loginUser({ email, password });
        localStorage.setItem('cravour_token', token);
        currentUser = { id: user.id, email: user.email };
        hideMessage(statusEl);
        showApp();
    } catch (error: any) {
        showMessage(statusEl, error.response?.data?.error || "Login failed.", 'error');
    }
}

async function handleRegister(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());
    const statusEl = document.getElementById('onboardingMessage')!;
    
    showLoading(statusEl, "Creating account...");
    try {
        const { token, user } = await api.registerUser(data);
        localStorage.setItem('cravour_token', token);
        currentUser = { id: user.id, email: user.email };
        hideMessage(statusEl);
        showApp();
    } catch (error: any) {
        showMessage(statusEl, error.response?.data?.error || "Registration failed.", 'error');
    }
}

function setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('cravour_token');
        currentUser = null;
        if(walletUnsubscribe) walletUnsubscribe();
        window.location.reload();
    });
}

// --- NAVIGATION ---
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const headerTitle = document.querySelector('#appHeaderTitle h1');
    const headerP = document.querySelector('#appHeaderTitle p');

    const sectionTitles = {
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
            if(headerTitle && headerP && titles) {
                headerTitle.textContent = titles.title;
                headerP.textContent = titles.p;
            }
        });
    });
}

// --- REAL-TIME WALLET ---
function listenToWalletBalance() {
    if (walletUnsubscribe) walletUnsubscribe();
    if (!currentUser?.id || !db) return;

    const walletEl = document.getElementById('walletBalance');
    const userDocRef = db.collection('users').doc(currentUser.id);

    walletUnsubscribe = userDocRef.onSnapshot((docSnap) => {
        if (docSnap.exists && walletEl) {
            const data = docSnap.data();
            const balance = data?.walletBalance || 0;
            walletEl.innerHTML = `Balance: <strong>₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>`;
        }
    }, (error: any) => console.error("Error listening to wallet balance:", error));
}


// --- LANDING PAGE DEMO AI PLAN ---
async function handleGeneratePlanLanding(e: Event) {
    e.preventDefault();
    const input = document.getElementById('shoppingGoalLanding') as HTMLTextAreaElement;
    const description = input.value;
    const resultsContainer = document.getElementById('shoppingPlanResultsLanding')!;
    const button = document.getElementById('generatePlanBtnLanding') as HTMLButtonElement;

    if (description.trim().length < 10) {
        resultsContainer.innerHTML = ''; // Clear old results
        showMessage(resultsContainer, "Please provide a more detailed shopping goal.", 'error');
        return;
    }

    showLoading(resultsContainer, "Generating your intelligent plan...");
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        const plan = await api.generateShoppingPlanDemo(description);
        renderGeneratedPlan(plan, resultsContainer, false); // Render without card base
    } catch (error: any) {
        showMessage(resultsContainer, error.response?.data?.error || "Failed to generate plan. Please try again.", 'error');
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

    // Use IntersectionObserver to load plans when the section becomes visible
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
    const resultsContainer = document.getElementById('planResults')!;
    const button = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;

    if (description.trim().length < 10) {
        return showMessage(resultsContainer, "Please provide a more detailed shopping goal.", 'error');
    }

    showLoading(resultsContainer, "Generating and saving your intelligent plan...");
    button.disabled = true;

    try {
        const plan = await api.generateShoppingPlan(description);
        renderGeneratedPlan(plan, resultsContainer, true); // Render with card base
        // Refresh the list of plans below
        await fetchAndRenderPlans(); 
        input.value = '';
    } catch (error: any) {
        showMessage(resultsContainer, error.response?.data?.error || 'Failed to generate plan.', 'error');
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
            <div class="plan-card-header">
                <h3 class="plan-name">${plan.description}</h3>
                <span class="plan-status ${plan.status}">${plan.status}</span>
            </div>
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
                <div class="plan-toggle">
                    <label class="switch">
                      <input type="checkbox" class="status-toggle" ${plan.status === 'active' ? 'checked' : ''}>
                      <span class="slider round"></span>
                    </label>
                </div>
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
        toggle.checked = !toggle.checked; // Revert on failure
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
    const statsContainer = document.getElementById('dashboardStats')!;
    const insightsContainer = document.getElementById('aiInsights')!;
    const transactionsContainer = document.getElementById('transactionTableBody')!;
    
    statsContainer.innerHTML = `
        <div class="summary-card"><h3>Total Spent</h3><div class="amount spent">₦${report.totalSpent.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Avg. Daily Spend</h3><div class="amount">₦${report.avgDailySpend.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Top Category</h3><div class="amount">${report.topCategory}</div></div>
        <div class="summary-card health-score-card"><h3>Financial Health</h3><div class="amount">${report.financialHealth.score}/100</div></div>
    `;

    insightsContainer.innerHTML = `
        <div class="ai-insight"><strong>AI Summary:</strong> ${report.financialHealth.summary}</div>
        ${report.financialHealth.recommendations.map(rec => 
            `<div class="ai-insight"><i class="fas fa-lightbulb"></i> ${rec}</div>`
        ).join('')}`;

    if (report.transactions.length > 0) {
        transactionsContainer.innerHTML = report.transactions.map(t => `
            <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.item || t.description}</td><td>${t.category}</td>
                <td class="${t.type === 'in' ? 'amount-in' : 'amount-out'}">${t.type === 'in' ? '+' : '-'}₦${t.amount.toLocaleString()}</td>
            </tr>
        `).join('');
    } else {
        transactionsContainer.innerHTML = `<tr><td colspan="4" style="text-align: center;">No transactions found for this period.</td></tr>`;
    }
    
    renderSpendingChart(report.spendingByCategory);
}

function renderSpendingChart(data: DashboardReport['spendingByCategory']) {
    const container = document.querySelector('.chart-container') as HTMLElement;
    if (!container) return;
    container.innerHTML = `<canvas id="spendingChart"></canvas>`;
    const ctx = (document.getElementById('spendingChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    if (activeChart) activeChart.destroy();

    activeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                data: data.map(d => d.amount),
                backgroundColor: ['#008751', '#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0', '#9966FF', '#FF9F40'],
                hoverOffset: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });
}

function renderGeneratedPlan(data: ShoppingPlan, container: HTMLElement, useCardBase: boolean) {
    const budget = data.budgetAnalysis;
    const differenceClass = budget.difference >= 0 ? 'success' : 'error';

    const tipsHtml = (budget.optimizationTips && budget.optimizationTips.length > 0) ? `
        <div class="optimization-tips">
            <h4 class="tips-heading"><i class="fas fa-lightbulb"></i> AI Savings Tips</h4>
            <ul>${budget.optimizationTips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        </div>` : '';
    
    const budgetHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. Market Prices</h3>
            <div class="summary-grid">
                <div class="summary-card"><h4>Your Budget</h4><p>₦${budget.userBudget.toLocaleString()}</p></div>
                <div class="summary-card"><h4>AI Estimated Cost</h4><p>₦${budget.estimatedCost.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Difference</h4><p class="${differenceClass}">₦${Math.abs(budget.difference).toLocaleString()}</p></div>
            </div>
            <p class="summary-text">${budget.summary}</p>
            ${tipsHtml}
            <div class="table-wrapper"><table class="data-table">
                <thead><tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr></thead>
                <tbody>${data.budgetItems.map(item => `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>₦${item.estimatedPrice.toLocaleString()}</td></tr>`).join('')}</tbody>
            </table></div>
        </div>`;
    
    const analysisHtml = (data.priceAnalysis && data.priceAnalysis.length > 0) ? `
        <div class="result-section">
            <h3 class="result-heading">AI Price & Savings Report</h3>
            <div class="analysis-grid">
                ${data.priceAnalysis.map(item => `
                    <div class="analysis-card">
                        <h4>${item.itemName}</h4>
                        <p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p>
                        <p class="tip"><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> ${item.savingTip}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    const merchantsHtml = (data.recommendedMerchants && data.recommendedMerchants.length > 0) ? `
        <div class="result-section">
            <h3 class="result-heading">Recommended Local Merchants</h3>
            <div class="merchant-grid">
                ${data.recommendedMerchants.map(merchant => `
                    <div class="merchant-card">
                        <h4>
                            <i class="fas fa-store"></i> ${merchant.name}
                            ${merchant.verified ? '<i class="fas fa-check-circle verified-icon" title="Verified Merchant"></i>' : ''}
                        </h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p>
                        <p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';


    const finalHtml = `${budgetHtml}${analysisHtml}${merchantsHtml}`;
    container.innerHTML = useCardBase ? `<div class="card-base">${finalHtml}</div>` : finalHtml;
}


// --- ADD EXPENSE PAGE ---
function setupAddExpensePage() {
    document.getElementById('addExpenseForm')?.addEventListener('submit', handleAddExpense);
    document.getElementById('expenseDescription')?.addEventListener('input', handleExpenseDescriptionChange);
}

function populatePlanSelector() {
    const container = document.getElementById('expensePlanSelectorContainer');
    if (!container) return;
    const activePlans = userPlansCache.filter(p => p.status === 'active');
    if (activePlans.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = `
        <label for="expensePlan">Link to a Plan (Optional)</label>
        <select class="input-field" id="expensePlan" name="planId">
            <option value="">-- No Plan --</option>
            ${activePlans.map(plan => `<option value="${plan.id}">${plan.description}</option>`).join('')}
        </select>`;
}

async function handleExpenseDescriptionChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const categorySelect = document.getElementById('expenseCategory') as HTMLSelectElement;
    if (input.value.length < 5) return;
    try {
        const { category } = await api.categorizeTransaction(input.value);
        if (category && categorySelect.querySelector(`option[value="${category}"]`)) {
            categorySelect.value = category;
        }
    } catch (error) {
        console.warn('AI categorization failed silently.', error);
    }
}

async function handleAddExpense(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());
    const statusEl = document.getElementById('addExpenseMessage')!;
    
    showLoading(statusEl, "Adding transaction...");
    try {
        await api.addTransaction(data);
        showMessage(statusEl, 'Transaction added successfully!', 'success');
        form.reset();
        if (data.planId) await fetchAndRenderPlans();
        setTimeout(() => hideMessage(statusEl), 3000);
    } catch (error: any) {
        showMessage(statusEl, error.response?.data?.error || 'Failed to add transaction.', 'error');
    }
}

// --- FUND WALLET PAGE ---
function setupFundWalletPage() {
    document.getElementById('fundWalletForm')?.addEventListener('submit', handleFundWallet);
}

function handleFundWallet(e: Event) {
    e.preventDefault();
    const amountInput = (e.target as HTMLFormElement).querySelector('#amount') as HTMLInputElement;
    const amount = Number(amountInput.value);
    const statusEl = document.getElementById('paymentStatus')!;

    if (isNaN(amount) || amount < 100) return showMessage(statusEl, "Please enter a valid amount (minimum ₦100).", 'error');
    if (!process.env.PAYSTACK_PUBLIC_KEY) return showMessage(statusEl, "Online payment is currently unavailable.", 'error');
    if (!currentUser) return showMessage(statusEl, "You must be logged in to fund your wallet.", 'error');

    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: process.env.PAYSTACK_PUBLIC_KEY,
        email: currentUser.email,
        amount: amount * 100, // Amount in Kobo
        onSuccess: async (transaction: PaystackInlineSuccessResponse) => {
            showLoading(statusEl, 'Verifying payment...');
            try {
                const result = await api.verifyPayment(transaction.reference);
                showMessage(statusEl, result.message, 'success');
                amountInput.value = '';
            } catch (error: any) {
                showMessage(statusEl, error.response?.data?.error || "Verification failed.", 'error');
            }
        },
        onClose: () => {
            if (statusEl.innerHTML === '' || statusEl.classList.contains('hidden')) {
                 showMessage(statusEl, 'Payment window closed.', 'info')
            }
        },
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
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

    if (description.trim().length < 15) return showMessage(resultsContainer, "Please provide a more detailed description.", 'error');

    showLoading(resultsContainer, "Generating brilliant ad copy...");
    button.disabled = true;
    try {
        const adCopy = await api.generateAdCopy(description);
        renderAdCopy(adCopy, resultsContainer);
    } catch (error: any) {
        showMessage(resultsContainer, error.response?.data?.error || 'Failed to generate ad copy.', 'error');
    } finally {
        button.disabled = false;
    }
}

function renderAdCopy(copy: AdCopy, container: HTMLElement) {
    container.innerHTML = `
        <div class="ad-result-card">
            <h3>Your AI-Generated Ad Copy</h3>
            <div class="ad-copy-column">
                ${createCopySection('Headline', copy.headline)}
                ${createCopySection('Body', copy.body)}
                ${createCopySection('Call to Action', copy.callToAction)}
                <div class="ad-copy-section ad-hashtags">
                     <h5>Hashtags</h5>
                     <div class="copy-content">${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}</div>
                     <button class="copy-button" title="Copy Hashtags"><i class="far fa-copy"></i></button>
                </div>
            </div>
        </div>`;

    container.querySelectorAll('.copy-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = (e.currentTarget as HTMLElement).closest('.ad-copy-section')!;
            const contentEl = section.querySelector('.copy-content')!;
            const textToCopy = section.classList.contains('ad-hashtags')
                ? Array.from(contentEl.querySelectorAll('span')).map(s => s.textContent).join(' ')
                : contentEl.textContent;
            copyToClipboard(e, textToCopy || '');
        });
    });
}

function createCopySection(title: string, content: string): string {
    return `
        <div class="ad-copy-section">
            <h5>${title}</h5>
            <div class="copy-content">${content.replace(/\n/g, '<br>')}</div>
            <button class="copy-button" title="Copy ${title}"><i class="far fa-copy"></i></button>
        </div>`;
}

function copyToClipboard(e: Event, text: string) {
    const button = e.currentTarget as HTMLButtonElement;
    navigator.clipboard.writeText(text).then(() => {
        const icon = button.querySelector('i')!;
        icon.className = 'fas fa-check';
        button.classList.add('copied');
        setTimeout(() => {
            icon.className = 'far fa-copy';
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}