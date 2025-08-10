
import * as api from './api';
import * as authFlow from './auth-flow';
import { showStatusMessage, hideStatusMessage, showToast } from './utils';
import { renderGeneratedPlan } from './rendering';
import { ShoppingPlan } from './types';

export function initLandingPage() {
    setupHamburgerMenu();
    setupAuthModals();
    setupAiDemoForm();
    setupWaitlistForm();
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
}

function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.header-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            const isActive = nav.classList.toggle('active');
            hamburger.classList.toggle('is-active');
            hamburger.setAttribute('aria-expanded', isActive.toString());
        });
    }
}

function setupAuthModals() {
    const authModal = document.getElementById('authModal');
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    
    if (!authModal || !loginView || !registerView) {
        console.error("Auth modal components not found in the DOM. Auth functionality will be disabled.");
        return;
    }

    const openModal = (view: 'login' | 'register') => {
        loginView.classList.toggle('hidden', view !== 'login');
        registerView.classList.toggle('hidden', view !== 'register');
        authModal.classList.remove('hidden');
    };

    document.getElementById('loginBtn')?.addEventListener('click', () => openModal('login'));
    document.getElementById('registerBtn')?.addEventListener('click', () => openModal('register'));
    document.getElementById('ctaRegisterBtn')?.addEventListener('click', () => openModal('register'));
    
    document.getElementById('closeAuth')?.addEventListener('click', () => authModal.classList.add('hidden'));
    document.getElementById('showRegister')?.addEventListener('click', () => openModal('register'));
    document.getElementById('showLogin')?.addEventListener('click', () => openModal('login'));

    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
}


async function handleLogin(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.querySelector('#loginEmail') as HTMLInputElement).value;
    const password = (form.querySelector('#loginPassword') as HTMLInputElement).value;
    const statusEl = document.getElementById('loginMessage');
    const button = form.querySelector('button');

    if (button) button.disabled = true;
    if (statusEl) showStatusMessage(statusEl, "Logging in...", 'info', true);
    
    try {
        await authFlow.loginUser({ email, password });
        showToast("Login successful! Welcome back.", "success");
    } catch (error: any) {
        if (button) button.disabled = false;
        const message = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found'
            ? 'Invalid email or password.' 
            : 'Login failed. Please try again.';
        if (statusEl) {
            showStatusMessage(statusEl, message, 'error');
            hideStatusMessage(statusEl, 4000);
        }
    }
}

async function handleRegister(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.querySelector('#registerName') as HTMLInputElement).value;
    const email = (form.querySelector('#registerEmail') as HTMLInputElement).value;
    const password = (form.querySelector('#registerPassword') as HTMLInputElement).value;
    const statusEl = document.getElementById('registerMessage');
    const button = form.querySelector('button');

    if (button) button.disabled = true;
    if (statusEl) showStatusMessage(statusEl, "Creating account...", 'info', true);

    try {
        await authFlow.registerUser({ name, email, password });
        if (statusEl) showStatusMessage(statusEl, 'Account created! Welcome.', 'success');
        showToast("Welcome to Cravour!", "success");
    } catch (error: any) {
        if (button) button.disabled = false;
        const message = error.code === 'auth/email-already-in-use' 
            ? 'An account with this email already exists.' 
            : 'Registration failed. Please try again.';
        if (statusEl) {
            showStatusMessage(statusEl, message, 'error');
            hideStatusMessage(statusEl, 4000);
        }
    }
}

function setupAiDemoForm() {
    const form = document.getElementById('aiDemoForm');
    form?.addEventListener('submit', handleGenerateDemoPlan);
}

async function handleGenerateDemoPlan(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const descriptionInput = document.getElementById('planDescription') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('demo-results-wrapper');
    const statusContainer = document.getElementById('demoStatus');
    const button = form.querySelector('button');

    if (!descriptionInput || !resultsContainer || !statusContainer || !button) {
        console.error("AI Demo form elements are missing from the DOM.");
        return;
    }

    const description = descriptionInput.value;
    if (description.trim().length < 10) {
        showStatusMessage(statusContainer, "Please provide a more detailed shopping goal.", 'error');
        hideStatusMessage(statusContainer, 3000);
        return;
    }

    button.disabled = true;
    button.innerHTML = '<div class="loading-spinner"></div> Generating...';
    showStatusMessage(statusContainer, "Our AI is analyzing your request...", 'info', true);
    resultsContainer.innerHTML = '';

    try {
        const plan: ShoppingPlan = await api.generateShoppingPlanDemo(description);
        renderGeneratedPlan(plan, resultsContainer);
        hideStatusMessage(statusContainer);
    } catch (error: any) {
        const message = error.response?.data?.error || "The AI failed to create a plan. Please try rephrasing.";
        showStatusMessage(statusContainer, message, 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-cogs"></i> Generate AI Plan';
    }
}

function setupWaitlistForm() {
    const form = document.getElementById('waitlistForm');
    form?.addEventListener('submit', handleJoinWaitlist);
}

async function handleJoinWaitlist(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailInput = document.getElementById('waitlistEmail') as HTMLInputElement;
    const statusEl = document.getElementById('waitlistMessage');
    const button = form.querySelector('button');

    if (!emailInput || !statusEl || !button) {
        console.error("Waitlist form elements are missing from the DOM.");
        return;
    }

    button.disabled = true;
    showStatusMessage(statusEl, 'Submitting...', 'info');

    try {
        const response = await api.joinWaitlist(emailInput.value);
        showToast(response.message, 'success');
        showStatusMessage(statusEl, response.message, 'success');
        emailInput.value = '';
        hideStatusMessage(statusEl, 3000);
    } catch (error: any) {
        const message = error.response?.data?.message || "An error occurred. Please try again.";
        showToast(message, 'error');
        showStatusMessage(statusEl, message, 'error');
        hideStatusMessage(statusEl, 3000);
    } finally {
        button.disabled = false;
    }
}
