
import * as api from './ai';
import { showStatusMessage, hideStatusMessage, showToast } from './utils';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, Unsubscribe, Firestore } from 'firebase/firestore';
let currentUser: User | null = null;
let walletUnsubscribe: Unsubscribe | null = null;
const initializedSections = new Set<string>();

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
};

export function initAuthAndApp(app: any, auth: any, db: Firestore) {
    onAuthStateChanged(auth, (user: User | null) => {
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

function setupAuthenticatedApp(auth: any, db: Firestore) {
    if (!currentUser) return;
    document.getElementById('userAvatar')!.innerText = (currentUser.email || 'U').charAt(0).toUpperCase();
    setupNavigation();
    setupLogout();
    listenToWalletBalance();
    
    // Programmatically click the dashboard nav item to load its content first
    const dashboardNavItem = document.querySelector('.nav-item[data-section="dashboardSection"]') as HTMLElement;
    if (dashboardNavItem) {
        dashboardNavItem.click();
    }
}

// --- UI VISIBILITY ---
function showApp(auth: any, db: Firestore) {
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
            const isActive = nav.classList.toggle('active');
            hamburger.classList.toggle('is-active');
            hamburger.setAttribute('aria-expanded', isActive.toString());
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
        await api.loginUser({ email, password });
        // onAuthStateChanged will handle hiding modal and showing the app
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
        await api.registerUser(data);
        // onAuthStateChanged will handle hiding modal and showing the app
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

// --- NAVIGATION & DYNAMIC LOADING ---
function setupNavigation(db: Firestore) {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
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
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const button = e.currentTarget as HTMLButtonElement;
            const targetId = button.dataset.section;
            if (!targetId) return;

            // Prevent re-triggering while a module is loading
            if (button.classList.contains('loading')) return;

            // UI switching logic
            document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active-section'));
            document.getElementById(targetId)?.classList.add('active-section');
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const titles = sectionTitles[targetId];
            if(headerTitleEl && headerP && titles) {
                headerTitleEl.textContent = titles.title;
                headerP.textContent = titles.p;
            }

            // Dynamic loading logic
            if (initializedSections.has(targetId)) {
                return; // Already initialized
            }

            button.classList.add('loading');
            try {
                switch (targetId) {
                    case 'dashboardSection':
                        const { setupDashboardPage } = await import('./dashboard');
                        setupDashboardPage();
                        break;
                    case 'myPlansSection':
                        const { setupMyPlansPage } = await import('./plans');
                        setupMyPlansPage();
                        break;
                    case 'addExpenseSection':
                        const { setupAddExpensePage } = await import('./expense');
                        setupAddExpensePage();
                        break;
                    case 'fundWalletSection':
                        const { setupFundWalletPage } = await import('./wallet');
                        setupFundWalletPage();
                        break;
                    case 'cravourAdsSection':
                        const { setupCravourAdsPage } = await import('./ads');
                        setupCravourAdsPage();
                        break;
                }
                initializedSections.add(targetId);
            } catch (error) {
                console.error(`Failed to load module for ${targetId}:`, error);
                showToast(`Could not load the module. Please try again.`, 'error');
            } finally {
                button.classList.remove('loading');
            }
        });
    });
}

// --- REAL-TIME WALLET ---
function listenToWalletBalance() {
    if (walletUnsubscribe) walletUnsubscribe();
    if (!currentUser?.uid) return;

    const walletEl = document.getElementById('walletBalance');
    const userDocRef = doc(db, 'users', currentUser.uid);

    walletUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && walletEl) {
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
    const statusContainer = document.getElementById('landingStatusArea')!;
    const resultsContainer = document.getElementById('shoppingPlanResultsLanding')!;
    const button = document.getElementById('generatePlanBtnLanding') as HTMLButtonElement;

    if (description.trim().length < 10) {
        showStatusMessage(statusContainer, "Please provide a more detailed shopping goal.", 'error');
        return hideStatusMessage(statusContainer, 3000);
    }

    showStatusMessage(statusContainer, "Generating your intelligent plan...", 'info', true);
    resultsContainer.innerHTML = ''; // Clear previous results
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        const plan = await api.generateShoppingPlanDemo(description);
        hideStatusMessage(statusContainer);
        renderGeneratedPlan(plan, resultsContainer);
    } catch (error: any) {
        showStatusMessage(statusContainer, error.response?.data?.error || "Failed to generate plan. Please try again.", 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Generate My AI Plan <i class="fas fa-cogs" aria-hidden="true"></i>';
    }
}
