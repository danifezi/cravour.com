
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import Chart from 'chart.js/auto';
import PaystackPop from '@paystack/inline-js';

// --- FIREBASE & GLOBAL INITIALIZATION ---
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- STATE ---
let currentUser: User | null = null;
let walletUnsubscribe: Unsubscribe | null = null;
let userPlansCache: PlanItem[] = [];
let activeChart: Chart | null = null;
const initializedSections = new Set<string>();

// --- TYPE DEFINITIONS ---
export interface UserProfile {
  id:string;
  email: string;
  profile?: {
    incomeSource?: string;
    monthlyIncome?: number;
    goals?: string;
  };
  walletBalance?: number; 
  createdAt?: object;
  password?: string;
}
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
export interface PlanItem extends ShoppingPlan {
    id: string;
    description: string;
    status: 'active' | 'paused';
    createdAt: any;
    spent?: number;
}
export interface SpendingCategory {
  category: string;
  amount: number;
}
export interface Transaction {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'in' | 'out';
  reference?: string;
  planId?: string;
}
export interface FinancialHealth {
    score: number;
    summary: string;
    recommendations: string[];
}
export interface DashboardReport {
  totalSpent: number;
  avgDailySpend: number;
  topCategory: string;
  spendingByCategory: SpendingCategory[];
  transactions: Transaction[];
  financialHealth: FinancialHealth;
}
export interface PaystackInlineSuccessResponse {
  reference: string;
}
export interface PaystackVerificationResponse {
  status: 'success' | 'error';
  message: string;
}
export interface AdCopy {
  headline: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  imageUrl: string;
}

// --- UTILITIES ---
type ToastType = 'success' | 'error' | 'info';
const toastIcons: Record<ToastType, string> = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };

export function showToast(message: string, type: ToastType = 'info', duration: number = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `<i class="fas ${toastIcons[type]}"></i><p>${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

export function showStatusMessage(container: HTMLElement | null, message: string, type: 'success' | 'error' | 'info', withSpinner = false) {
    if (!container) return;
    container.classList.remove('hidden');
    container.className = `status-area ${type}-message`;
    let spinnerHtml = withSpinner ? '<div class="loading-spinner"></div>' : '';
    container.innerHTML = `<div class="loading-state">${spinnerHtml}<p>${message}</p></div>`;
}

export function hideStatusMessage(container: HTMLElement | null, delay?: number) {
    if (!container) return;
    const action = () => {
        container.classList.add('hidden');
        container.innerHTML = '';
    };
    if (delay) setTimeout(action, delay);
    else action();
}

// --- RENDERING LOGIC ---
export function renderGeneratedPlan(plan: ShoppingPlan, container: HTMLElement) {
    const budget = plan.budgetAnalysis;
    const differenceClass = budget.difference >= 0 ? 'success' : 'error';

    const budgetHtml = `<div class="result-section">
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
            <ul>${budget.optimizationTips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        </div>` : '';
    
    const itemsHtml = `<div class="result-section">
             <h3 class="result-heading">Itemized List</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr></thead><tbody>
            ${plan.budgetItems.map(item => `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>₦${item.estimatedPrice.toLocaleString()}</td></tr>`).join('')}
            </tbody></table></div>
        </div>`;

    const analysisHtml = `<div class="result-section">
            <h3 class="result-heading">AI Price & Savings Report</h3>
            <div class="analysis-grid">
                ${plan.priceAnalysis.map(item => `<div class="analysis-card"><h4>${item.itemName}</h4><p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p><p class="tip"><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> ${item.savingTip}</p></div>`).join('')}
            </div>
        </div>`;

    const merchantsHtml = `<div class="result-section">
            <h3 class="result-heading">Recommended Local Merchants</h3>
            <div class="merchant-grid">
                ${plan.recommendedMerchants.map(merchant => `<div class="merchant-card"><h4>${merchant.name} ${merchant.verified ? '<i class="fas fa-check-circle verified-icon" title="Verified Merchant"></i>' : ''}</h4><p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p><p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p></div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = budgetHtml + optimizationHtml + itemsHtml + analysisHtml + merchantsHtml;
}

// --- API CLIENT ---
const API_BASE_URL = '/api';
async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication token not found. Please log in.');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}
export async function registerUser(userData: any): Promise<UserCredential> {
    const { email, password, ...profile } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await axios.post(`${API_BASE_URL}/auth/register`, { profile }, { headers: await getAuthHeaders() });
    return userCredential;
}
export async function loginUser(credentials: any): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password);
}
export async function generateShoppingPlanDemo(description: string): Promise<ShoppingPlan> {
    const response = await axios.post<ShoppingPlan>(`${API_BASE_URL}/plans/demo`, { description });
    return response.data;
}
export async function generateShoppingPlan(description: string): Promise<ShoppingPlan> {
    const response = await axios.post<ShoppingPlan>(`${API_BASE_URL}/plans`, { description }, { headers: await getAuthHeaders() });
    return response.data;
}
export async function getPlans(): Promise<PlanItem[]> {
    const response = await axios.get<PlanItem[]>(`${API_BASE_URL}/plans`, { headers: await getAuthHeaders() });
    return response.data;
}
export async function updatePlanStatus(planId: string, status: 'active' | 'paused'): Promise<any> {
    const response = await axios.patch(`${API_BASE_URL}/plans/${planId}`, { status }, { headers: await getAuthHeaders() });
    return response.data;
}
export async function deletePlan(planId: string): Promise<any> {
    const response = await axios.delete(`${API_BASE_URL}/plans/${planId}`, { headers: await getAuthHeaders() });
    return response.data;
}
export async function generateDashboardReport(): Promise<DashboardReport> {
    const response = await axios.post<DashboardReport>(`${API_BASE_URL}/dashboard`, {}, { headers: await getAuthHeaders() });
    return response.data;
}
export async function addTransaction(transactionData: any) {
    const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData, { headers: await getAuthHeaders() });
    return response.data;
}
export async function categorizeTransaction(description: string): Promise<{ category: string }> {
    const response = await axios.post(`${API_BASE_URL}/transactions/categorize`, { description }, { headers: await getAuthHeaders() });
    return response.data;
}
export async function verifyPayment(reference: string): Promise<PaystackVerificationResponse> {
    const response = await axios.post<PaystackVerificationResponse>(`/api/payments/verify`, { reference }, { headers: await getAuthHeaders() });
    return response.data;
}
export async function generateAdCopy(description: string): Promise<AdCopy> {
    const response = await axios.post<AdCopy>(`${API_BASE_URL}/ads/generate`, { description }, { headers: await getAuthHeaders() });
    return response.data;
}

// --- PAGE MODULE LOGIC ---

// --- Plans Page ---
function setupMyPlansPage() {
    document.getElementById('createPlanForm')?.addEventListener('submit', handleGenerateAndSavePlan);
    const plansSection = document.getElementById('myPlansSection');
    if (!plansSection) return;
    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) await fetchAndRenderPlans();
    }, { threshold: 0.1 });
    observer.observe(plansSection);
}
async function handleGenerateAndSavePlan(e: Event) {
    e.preventDefault();
    const input = document.getElementById('itemInput') as HTMLInputElement;
    const description = input.value;
    const resultsContainer = document.getElementById('planResults')!;
    const button = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    if (description.trim().length < 10) return showToast("Please provide a more detailed shopping goal.", 'error');
    showToast("Generating and saving your plan...", 'info');
    button.disabled = true;
    resultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating intelligent plan...</p></div>';
    try {
        const plan = await generateShoppingPlan(description);
        renderGeneratedPlan(plan, resultsContainer);
        showToast("Plan saved successfully!", 'success');
        await fetchAndRenderPlans(); 
        input.value = '';
    } catch (error: any) {
        showToast(error.response?.data?.error || 'Failed to generate plan.', 'error');
        resultsContainer.innerHTML = '';
    } finally {
        button.disabled = false;
    }
}
async function fetchAndRenderPlans() {
    const plansGrid = document.getElementById('plansGrid')!;
    plansGrid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading your plans...</p></div>';
    try {
        userPlansCache = await getPlans();
        renderPlans(userPlansCache);
        populatePlanSelector();
    } catch (error: any) {
        plansGrid.innerHTML = `<div class="empty-state">${error.response?.data?.error || 'Could not load your plans.'}</div>`;
        showToast(error.response?.data?.error || 'Could not load your plans.', 'error');
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
            await deletePlan(planId);
            card.remove();
            showToast("Plan deleted.", 'success');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Failed to delete plan.', 'error');
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
        await updatePlanStatus(planId, newStatus);
        statusEl.textContent = newStatus;
        statusEl.className = `plan-status ${newStatus}`;
        showToast(`Plan status updated to ${newStatus}.`, 'success');
    } catch (error: any) {
        showToast(error.response?.data?.error || 'Failed to update plan status.', 'error');
        toggle.checked = !toggle.checked;
    } finally {
        toggle.disabled = false;
    }
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

// --- Expense Page ---
function setupAddExpensePage() {
    const form = document.getElementById('addExpenseForm') as HTMLFormElement;
    form.addEventListener('submit', handleAddTransaction);
    document.getElementById('expenseDescription')?.addEventListener('blur', handleCategorizeExpense);
    populatePlanSelector();
}
async function handleCategorizeExpense(e: Event) {
    const input = e.target as HTMLInputElement;
    const categorySelect = document.getElementById('expenseCategory') as HTMLSelectElement;
    if (input.value.length < 5) return;
    categorySelect.disabled = true;
    try {
        const { category } = await categorizeTransaction(input.value);
        if (Array.from(categorySelect.options).some(opt => opt.value === category)) {
            categorySelect.value = category;
        }
    } catch (error) {
        console.error("AI Categorization failed:", error);
    } finally {
        categorySelect.disabled = false;
    }
}
async function handleAddTransaction(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const statusEl = document.getElementById('addExpenseMessage')!;
    const formData = new FormData(form);
    const data: { [key: string]: any } = {};
    formData.forEach((value, key) => { data[key] = value; });
    showStatusMessage(statusEl, 'Adding transaction...', 'info', true);
    button.disabled = true;
    try {
        const response = await addTransaction(data);
        showStatusMessage(statusEl, response.message, 'success');
        showToast(response.message, 'success');
        form.reset();
        await fetchAndRenderPlans();
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to add transaction.';
        showStatusMessage(statusEl, errorMessage, 'error');
    } finally {
        button.disabled = false;
        hideStatusMessage(statusEl, 3000);
    }
}

// --- Wallet Page ---
function setupFundWalletPage() {
    document.getElementById('fundWalletForm')?.addEventListener('submit', handleFundWallet);
}
function handleFundWallet(e: Event) {
    e.preventDefault();
    if (!currentUser || !process.env.PAYSTACK_PUBLIC_KEY) {
        return showToast("Payment service is not configured.", 'error');
    }
    const amountInput = document.getElementById('amount') as HTMLInputElement;
    const amount = Number(amountInput.value);
    const statusEl = document.getElementById('paymentStatus')!;
    if (isNaN(amount) || amount < 100) {
        return showStatusMessage(statusEl, 'Please enter a valid amount (minimum ₦100).', 'error');
    }
    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: process.env.PAYSTACK_PUBLIC_KEY,
        email: currentUser.email!,
        amount: amount * 100,
        onSuccess: async (transaction: PaystackInlineSuccessResponse) => {
            showStatusMessage(statusEl, 'Verifying payment...', 'info', true);
            try {
                const result = await verifyPayment(transaction.reference);
                showStatusMessage(statusEl, result.message, 'success');
                showToast(result.message, 'success');
                amountInput.value = '';
            } catch (error: any) {
                const message = error.response?.data?.message || 'Verification failed.';
                showStatusMessage(statusEl, message, 'error');
            }
        },
        onCancel: () => showStatusMessage(statusEl, 'Payment was cancelled.', 'info'),
    });
}

// --- Ads Page ---
function setupCravourAdsPage() {
    document.getElementById('cravourAdsForm')?.addEventListener('submit', handleGenerateAd);
}
async function handleGenerateAd(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const description = (form.querySelector('#adDescription') as HTMLTextAreaElement).value;
    const resultsContainer = document.getElementById('adResultsContainer')!;
    const button = form.querySelector('button') as HTMLButtonElement;
    if (description.trim().length < 15) {
        return showToast('Please provide a more detailed description.', 'error');
    }
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    resultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating text & image...</p></div>';
    try {
        const adCreative = await generateAdCopy(description);
        renderAdCopy(adCreative, resultsContainer);
    } catch (error: any) {
        showToast(error.response?.data?.error || 'Failed to generate ad creative.', 'error');
        resultsContainer.innerHTML = `<div class="empty-state">${error.response?.data?.error || 'Failed to generate ad creative.'}</div>`;
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-magic"></i> Generate Creative';
    }
}
function renderAdCopy(copy: AdCopy, container: HTMLElement) {
    container.innerHTML = `
        <div class="ad-result-card">
            <h3>Your AI-Generated Ad Creative</h3>
            <div class="ad-creative-grid">
                <div class="ad-image-column">
                     <img src="${copy.imageUrl}" alt="AI-generated image for: ${copy.headline}" />
                </div>
                <div class="ad-copy-column">
                    <div class="ad-copy-section"><h5>Headline</h5><div class="copy-content">${copy.headline}</div><button class="copy-button" title="Copy Headline"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section"><h5>Body</h5><div class="copy-content">${copy.body}</div><button class="copy-button" title="Copy Body"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section"><h5>Call to Action</h5><div class="copy-content">${copy.callToAction}</div><button class="copy-button" title="Copy Call to Action"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section ad-hashtags"><h5>Hashtags</h5><div class="copy-content">${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}</div><button class="copy-button" title="Copy Hashtags"><i class="far fa-copy"></i></button></div>
                </div>
            </div>
        </div>`;
    
    container.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const contentEl = button.parentElement!.querySelector('.copy-content') as HTMLElement;
            const textToCopy = contentEl.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Copied to clipboard!', 'success', 2000);
            }).catch(err => console.error('Copy failed', err));
        });
    });
}

// --- Dashboard Page ---
function setupDashboardPage() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (!dashboardSection) return;
    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            renderDashboardSkeleton();
            try {
                const report = await generateDashboardReport();
                renderDashboard(report);
            } catch (error: any) {
                const errorContainer = document.getElementById('aiInsights');
                if (errorContainer) {
                   errorContainer.innerHTML = `<div class="empty-state">${error.response?.data?.error || "Could not load dashboard"}</div>`;
                }
                showToast(error.response?.data?.error || "Could not load dashboard", 'error');
            }
        }
    }, { threshold: 0.1 });
    observer.observe(dashboardSection);
}
function renderDashboardSkeleton() {
    document.getElementById('dashboardStats')!.innerHTML = Array(4).fill('<div class="summary-card skeleton"><h3>&nbsp;</h3><div class="amount">&nbsp;</div></div>').join('');
    document.getElementById('aiInsights')!.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating AI insights...</p></div>';
    document.getElementById('transactionTableBody')!.innerHTML = `<tr><td colspan="4" class="loading-state"><p>Loading transactions...</p></td></tr>`;
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

    const transactionBody = document.getElementById('transactionTableBody');
    if (transactionBody) {
        transactionBody.innerHTML = report.transactions.length > 0
        ? report.transactions.map(tx => `<tr><td>${tx.date}</td><td>${tx.description}</td><td>${tx.category}</td><td class="${tx.type === 'in' ? 'amount-in' : 'amount-out'}">${tx.type === 'in' ? '+' : '-'}₦${tx.amount.toLocaleString()}</td></tr>`).join('')
        : `<tr><td colspan="4" class="empty-state">No transactions recorded yet.</td></tr>`;
    }
    renderSpendingChart(report.spendingByCategory);
}
function renderSpendingChart(data: DashboardReport['spendingByCategory']) {
    const canvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (activeChart) activeChart.destroy();
    
    activeChart = new Chart(ctx, {
        type: 'doughnut',
        data: { 
            labels: data.map(d => d.category), 
            datasets: [{ 
                data: data.map(d => d.amount), 
                backgroundColor: ['#FFC107', '#36A2EB', '#FF6384', '#4BC0C0', '#9966FF', '#FF9F40'], 
                borderWidth: 0,
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'right' } 
            }, 
            cutout: '70%' 
        }
    });
}

// --- MAIN UI CONTROLLER & AUTH ---
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
function setupAuthenticatedApp() {
    if (!currentUser) return;
    document.getElementById('userAvatar')!.innerText = (currentUser.email || 'U').charAt(0).toUpperCase();
    setupNavigation();
    setupLogout();
    listenToWalletBalance();
    
    const dashboardNavItem = document.querySelector('.nav-item[data-section="dashboardSection"]') as HTMLElement;
    if (dashboardNavItem && !initializedSections.has('dashboardSection')) {
        dashboardNavItem.click();
    }
}
function setupLandingPageHandlers() {
    document.querySelector('.hamburger')?.addEventListener('click', () => {
        const nav = document.querySelector('.header-nav');
        const hamburger = document.querySelector('.hamburger');
        const isActive = nav!.classList.toggle('active');
        hamburger!.classList.toggle('is-active');
        hamburger!.setAttribute('aria-expanded', isActive.toString());
    });
    
    document.getElementById('year')!.textContent = new Date().getFullYear().toString();
    document.getElementById('shoppingPlanFormLanding')?.addEventListener('submit', handleGeneratePlanLanding);
}
function setupAuthModals() {
    const showAuthModal = () => document.getElementById('loginModal')?.classList.remove('hidden');
    document.getElementById('goToAppBtnLanding')?.addEventListener('click', showAuthModal);
    document.getElementById('footerGoToAppBtn')?.addEventListener('click', showAuthModal);
    document.getElementById('closeLogin')?.addEventListener('click', () => document.getElementById('loginModal')?.classList.add('hidden'));
    document.getElementById('closeOnboarding')?.addEventListener('click', () => document.getElementById('onboardingModal')?.classList.add('hidden'));
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
    showStatusMessage(statusEl, "Logging in...", 'info', true);
    button.disabled = true;
    try {
        await loginUser({ email, password });
    } catch (error: any) {
        showStatusMessage(statusEl, error.response?.data?.error || "Login failed. Check credentials.", 'error');
        hideStatusMessage(statusEl, 3000);
    } finally {
        button.disabled = false;
    }
}
async function handleRegister(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: { [key: string]: any } = {};
    formData.forEach((value, key) => { data[key] = value; });
    const statusEl = document.getElementById('onboardingMessage')!;
    const button = form.querySelector('button')!;
    showStatusMessage(statusEl, "Creating account...", 'info', true);
    button.disabled = true;
    try {
        await registerUser(data);
    } catch (error: any) {
        showStatusMessage(statusEl, error.response?.data?.error || "Registration failed.", 'error');
        hideStatusMessage(statusEl, 3000);
    } finally {
        button.disabled = false;
    }
}
function setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        signOut(auth);
        showToast("You have been logged out.", "info");
    });
}
function setupNavigation() {
    const navItems = document.querySelectorAll('.app-sidebar .nav-item');
    const headerTitleEl = document.querySelector('#appHeaderTitle h1');
    const headerP = document.querySelector('#appHeaderTitle p');
    const sectionTitles: { [key: string]: { title: string; p: string } } = {
        dashboardSection: { title: 'Dashboard', p: 'Your AI-powered financial overview.'},
        myPlansSection: { title: 'Financial Plans', p: 'Create new goals and track their progress.'},
        addExpenseSection: { title: 'Add Expense', p: 'Log a new transaction.'},
        fundWalletSection: { title: 'Fund Wallet', p: 'Add money to your Cravour account.'},
        cravourAdsSection: { title: 'Cravour Ads', p: 'Generate ad creatives with AI.'}
    };
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const button = e.currentTarget as HTMLButtonElement;
            const targetId = button.dataset.section;
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

            if (!initializedSections.has(targetId)) {
                 switch (targetId) {
                    case 'dashboardSection': setupDashboardPage(); break;
                    case 'myPlansSection': setupMyPlansPage(); break;
                    case 'addExpenseSection': setupAddExpensePage(); break;
                    case 'fundWalletSection': setupFundWalletPage(); break;
                    case 'cravourAdsSection': setupCravourAdsPage(); break;
                }
                initializedSections.add(targetId);
            }
        });
    });
}
function listenToWalletBalance() {
    if (walletUnsubscribe) walletUnsubscribe();
    if (!currentUser?.uid) return;
    const walletEl = document.getElementById('walletBalance');
    const userDocRef = doc(db, 'users', currentUser.uid);
    walletUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && walletEl) {
            const balance = docSnap.data()?.walletBalance || 0;
            walletEl.innerHTML = `Balance: <strong>₦${balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>`;
        }
    }, (error: any) => console.error("Error listening to wallet balance:", error));
}
async function handleGeneratePlanLanding(e: Event) {
    e.preventDefault();
    const input = document.getElementById('shoppingGoalLanding') as HTMLTextAreaElement;
    const description = input.value;
    const statusContainer = document.getElementById('landingStatusArea')!;
    const resultsContainer = document.getElementById('shoppingPlanResultsLanding')!;
    const button = document.getElementById('generatePlanBtnLanding') as HTMLButtonElement;
    if (description.trim().length < 10) {
        showStatusMessage(statusContainer, "Please provide a more detailed shopping goal.", 'error');
        return hideStatusMessage(statusContainer, 3000);
    }
    showStatusMessage(statusContainer, "Generating your intelligent plan...", 'info', true);
    resultsContainer.innerHTML = '';
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    try {
        const plan = await generateShoppingPlanDemo(description);
        hideStatusMessage(statusContainer);
        renderGeneratedPlan(plan, resultsContainer);
    } catch (error: any) {
        showStatusMessage(statusContainer, error.response?.data?.error || "Failed to generate plan. Please try again.", 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Generate My AI Plan <i class="fas fa-cogs" aria-hidden="true"></i>';
    }
}

// --- APP ENTRY POINT ---
document.addEventListener('DOMContentLoaded', () => {
    setupAuthModals();
    setupLandingPageHandlers();
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            showApp();
        } else {
            if (walletUnsubscribe) walletUnsubscribe();
            showLandingPage();
        }
    });
});
