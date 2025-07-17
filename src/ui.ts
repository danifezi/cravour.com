import * as api from './ai';
import { showLoading, showMessage, hideMessage, decodeJwt } from './utils';
import { ShoppingPlan, DashboardReport, UserProfile, PaystackInlineSuccessResponse, PlanItem } from './types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import Chart from 'chart.js/auto';
import PaystackPop from '@paystack/inline-js';

// --- STATE MANAGEMENT ---
let currentUser: UserProfile | null = null;
let activeChart: Chart | null = null;
let walletUnsubscribe: (() => void) | null = null;

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
};

let db: any;
if(firebaseConfig.apiKey) {
    // Initialize Firebase only if it hasn't been already.
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
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
    setupCreatePlanPage();
    setupFundWalletPage();
    setupAddExpensePage();
    setupMyPlansPage();
    setupLogout();
    listenToWalletBalance();
    (document.querySelector('.nav-item[data-section="dashboardGrid"]') as HTMLElement)?.click();
}

// --- AUTHENTICATION & UI VISIBILITY ---
function showApp() {
    document.getElementById('landingPageShell')?.classList.add('hidden');
    document.getElementById('appShell')?.classList.remove('hidden');
    setupAuthenticatedApp();
}

function showAuth() {
    document.getElementById('landingPageShell')?.classList.remove('hidden');
    document.getElementById('appShell')?.classList.add('hidden');
}

function setupLandingPageHandlers() {
    document.querySelector('.hero-cta a')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#unleash-ai')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    const showAuthModal = () => document.getElementById('loginModal')?.classList.remove('hidden');

    document.getElementById('goToAppBtnLanding')?.addEventListener('click', showAuthModal);
    document.getElementById('getStartedUnleashBtn')?.addEventListener('click', showAuthModal);
    document.getElementById('footerGoToAppBtn')?.addEventListener('click', showAuthModal);
    
    const yearSpan = document.getElementById('year');
    if(yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
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
        switchAuthModal(false);
        document.getElementById('loginModal')?.classList.add('hidden');
        showApp();
    } catch (error: any) {
        showMessage(statusEl, error.response?.data?.error || "Login failed.", 'error');
    }
}

async function handleRegister(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    const statusEl = document.getElementById('onboardingMessage')!;
    
    showLoading(statusEl, "Creating account...");
    try {
        const { token, user } = await api.registerUser(data);
        localStorage.setItem('cravour_token', token);
        currentUser = { id: user.id, email: user.email };
        hideMessage(statusEl);
        document.getElementById('onboardingModal')?.classList.add('hidden');
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
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = (item as HTMLElement).dataset.section;
            if (!targetId) return;

            document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active-section'));
            document.getElementById(targetId)?.classList.add('active-section');

            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const title = item.querySelector('span')?.textContent || 'Dashboard';
            document.querySelector('#appHeaderTitle h1')!.textContent = title;
        });
    });
}

// --- REAL-TIME WALLET ---
function listenToWalletBalance() {
    if (walletUnsubscribe) walletUnsubscribe();
    if (!currentUser?.id || !db) return;

    const walletEl = document.getElementById('walletBalance');
    const userDocRef = db.collection('users').doc(currentUser.id);

    walletUnsubscribe = userDocRef.onSnapshot((docSnap: any) => {
        if (docSnap.exists && walletEl) {
            const balance = docSnap.data()?.walletBalance || 0;
            walletEl.innerHTML = `Balance: <strong>₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>`;
        }
    }, (error: any) => console.error("Error listening to wallet balance:", error));
}

// --- MY PLANS PAGE ---
function setupMyPlansPage() {
    const plansSection = document.getElementById('myPlansSection');
    if (!plansSection) return;

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            await fetchAndRenderPlans();
        }
    }, { threshold: 0.1 });

    observer.observe(plansSection);
}

async function fetchAndRenderPlans() {
    const plansGrid = document.getElementById('plansGrid')!;
    showLoading(plansGrid, 'Loading your plans...');
    try {
        const plans = await api.getPlans();
        renderPlans(plans);
    } catch (error: any) {
        showMessage(plansGrid, error.message || 'Could not load your plans.', 'error');
    }
}

function renderPlans(plans: PlanItem[]) {
    const plansGrid = document.getElementById('plansGrid')!;
    if (plans.length === 0) {
        plansGrid.innerHTML = `<div class="empty-state">You have no financial plans yet. Go to "New Plan" to create one!</div>`;
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
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progress.toFixed(2)}%;"></div>
                    </div>
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
            alert('Failed to delete plan: ' + error.message);
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
    const originalStatus = statusEl.textContent;
    const originalChecked = !toggle.checked;

    statusEl.textContent = '...';
    toggle.disabled = true;

    try {
        await api.updatePlanStatus(planId, newStatus);
        statusEl.textContent = newStatus;
        statusEl.className = `plan-status ${newStatus}`;
    } catch (error: any) {
        alert('Failed to update plan status: ' + error.message);
        statusEl.textContent = originalStatus;
        statusEl.className = `plan-status ${originalStatus}`;
        toggle.checked = originalChecked;
    } finally {
        toggle.disabled = false;
    }
}

// --- DASHBOARD PAGE ---
function setupDashboardPage() {
    const dashboardSection = document.getElementById('dashboardGrid');
    if (!dashboardSection) return;

    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            const statsContainer = document.getElementById('dashboardStats')!;
            const insightsContainer = document.getElementById('aiInsights')!;
            showLoading(statsContainer, 'Loading stats...');
            showLoading(insightsContainer, 'Generating AI insights...');
            try {
                const report = await api.generateDashboardReport();
                renderDashboard(report);
            } catch (error: any) {
                showMessage(statsContainer, error.message, 'error');
                showMessage(insightsContainer, 'Could not load AI insights.', 'error');
            }
            observer.unobserve(dashboardSection);
        }
    }, { threshold: 0.1 });

    observer.observe(dashboardSection);
}

function renderDashboard(report: DashboardReport) {
    const statsContainer = document.getElementById('dashboardStats')!;
    const insightsContainer = document.getElementById('aiInsights')!;
    const transactionsContainer = document.getElementById('transactionTableBody')!;
    
    statsContainer.innerHTML = `
        <div class="summary-card"><h3>Total Spent</h3><div class="amount spent">₦${report.totalSpent.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Avg. Daily Spend</h3><div class="amount">₦${report.avgDailySpend.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Top Category</h3><div class="amount">${report.topCategory}</div></div>
        <div class="summary-card health-score-card"><h3>Financial Health</h3><div class="amount">${report.financialHealthScore}/10</div></div>
    `;

    insightsContainer.innerHTML = report.healthRecommendations.map(rec => 
        `<div class="ai-insight"><p>${rec}</p></div>`
    ).join('');

    transactionsContainer.innerHTML = report.transactions.map(t => `
        <tr>
            <td>${new Date(t.date).toLocaleDateString()}</td>
            <td>${t.description}</td><td>${t.category}</td>
            <td class="${t.type === 'in' ? 'amount-in' : 'amount-out'}">${t.type === 'in' ? '+' : '-'}₦${t.amount.toLocaleString()}</td>
        </tr>
    `).join('');
    
    renderSpendingChart(report.spendingByCategory);
}

function renderSpendingChart(data: DashboardReport['spendingByCategory']) {
    const canvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeChart) activeChart.destroy();

    activeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                data: data.map(d => d.amount),
                backgroundColor: ['#008751', '#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0', '#9966FF'],
                hoverOffset: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });
}

// --- CREATE PLAN PAGE ---
function setupCreatePlanPage() {
    document.getElementById('createPlanForm')?.addEventListener('submit', handleGeneratePlan);
}

async function handleGeneratePlan(e: Event) {
    e.preventDefault();
    const input = document.getElementById('itemInput') as HTMLInputElement;
    const description = input.value;
    const resultsContainer = document.getElementById('planResults')!;

    if (description.trim().length < 10) {
        return showMessage(resultsContainer, "Please provide a more detailed shopping goal.", 'error');
    }

    showLoading(resultsContainer, "Generating and saving your intelligent plan...");
    try {
        const plan = await api.generateShoppingPlan(description);
        resultsContainer.innerHTML = `<h3 class="result-heading">AI Plan Generated & Saved!</h3><p class="summary-text">${plan.budgetAnalysis.summary}</p>`;
        await fetchAndRenderPlans();
    } catch (error: any) {
        showMessage(resultsContainer, error.message, 'error');
    }
}

// --- ADD EXPENSE PAGE ---
function setupAddExpensePage() {
    document.getElementById('addExpenseForm')?.addEventListener('submit', handleAddExpense);
    document.getElementById('expenseDescription')?.addEventListener('input', handleExpenseDescriptionChange);
}

async function handleExpenseDescriptionChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const description = input.value;
    const categorySelect = document.getElementById('expenseCategory') as HTMLSelectElement;
    const statusEl = document.getElementById('addExpenseMessage')!;

    if (description.length < 5) {
        hideMessage(statusEl);
        return;
    }

    try {
        const { category } = await api.categorizeTransaction(description);
        if (category && categorySelect.querySelector(`option[value="${category}"]`)) {
            categorySelect.value = category;
            showMessage(statusEl, `AI Suggested Category: ${category}`, 'info');
        }
    } catch (error) {
        // Fail silently on suggestion
        console.warn('AI categorization failed');
    }
}

async function handleAddExpense(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    const statusEl = document.getElementById('addExpenseMessage')!;
    
    showLoading(statusEl, "Adding transaction...");
    try {
        await api.addTransaction(data);
        showMessage(statusEl, 'Transaction added successfully!', 'success');
        form.reset();
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
    const amountInput = document.getElementById('amount') as HTMLInputElement;
    const amount = Number(amountInput.value);
    const statusEl = document.getElementById('paymentStatus')!;

    if (isNaN(amount) || amount < 100) {
        return showMessage(statusEl, "Please enter a valid amount (minimum ₦100).", 'error');
    }
    if (!process.env.PAYSTACK_PUBLIC_KEY) {
        return showMessage(statusEl, "Online payment is currently unavailable.", 'error');
    }

    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: process.env.PAYSTACK_PUBLIC_KEY,
        email: currentUser!.email,
        amount: amount * 100,
        onSuccess: async (transaction: PaystackInlineSuccessResponse) => {
            showLoading(statusEl, 'Verifying payment...');
            try {
                const result = await api.verifyPayment(transaction.reference);
                showMessage(statusEl, result.message, 'success');
            } catch (error: any) {
                showMessage(statusEl, error.response?.data?.error || "Verification failed.", 'error');
            }
        },
        onClose: () => showMessage(statusEl, 'Payment window closed.', 'info'),
    });
}