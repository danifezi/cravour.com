import * as api from './api';
import { showStatusMessage, hideStatusMessage, showToast } from './utils';
import { renderGeneratedPlan } from './rendering';

// --- INITIALIZATION ---
export function initLandingPage() {
    setupHamburgerMenu();
    setupWaitlistModal();
    setupShoppingPlanForm();
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
}

// --- LANDING PAGE HANDLERS ---
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

function setupWaitlistModal() {
    const modal = document.getElementById('waitlistModal')!;
    const openBtn = document.getElementById('joinWaitlistBtn')!;
    const closeBtn = document.getElementById('closeWaitlist')!;
    const form = document.getElementById('waitlistForm')!;

    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    form.addEventListener('submit', handleJoinWaitlist);
}

async function handleJoinWaitlist(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailInput = form.querySelector('#waitlistEmail') as HTMLInputElement;
    const email = emailInput.value;
    const statusEl = document.getElementById('waitlistMessage')!;
    const button = form.querySelector('button')!;

    showStatusMessage(statusEl, "Submitting...", 'info', true);
    button.disabled = true;

    try {
        await api.joinWaitlist(email);
        showStatusMessage(statusEl, "Thank you! You've been added to our waitlist.", 'success');
        showToast("Successfully joined the waitlist!", "success");
        form.reset();
        setTimeout(() => document.getElementById('waitlistModal')?.classList.add('hidden'), 2500);
    } catch (error: any) {
        showStatusMessage(statusEl, error.response?.data?.error || "An error occurred. Please try again.", 'error');
        hideStatusMessage(statusEl, 4000);
    } finally {
        button.disabled = false;
    }
}

function setupShoppingPlanForm() {
    document.getElementById('shoppingPlanForm')?.addEventListener('submit', handleGeneratePlan);
}

// --- AI DEMO HANDLER ---
async function handleGeneratePlan(e: Event) {
    e.preventDefault();
    const input = document.getElementById('shoppingGoal') as HTMLTextAreaElement;
    const description = input.value;
    const statusContainer = document.getElementById('planStatusArea')!;
    const resultsContainer = document.getElementById('shoppingPlanResults')!;
    const button = document.getElementById('generatePlanBtn') as HTMLButtonElement;

    if (description.trim().length < 10) {
        showStatusMessage(statusContainer, "Please provide a more detailed shopping goal.", 'error');
        return hideStatusMessage(statusContainer, 3000);
    }

    showStatusMessage(statusContainer, "Generating your intelligent plan...", 'info', true);
    resultsContainer.innerHTML = ''; // Clear previous results
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        const plan = await api.generateShoppingPlan(description);
        hideStatusMessage(statusContainer);
        renderGeneratedPlan(plan, resultsContainer);
    } catch (error: any) {
        const message = error.response?.data?.error || "Failed to generate plan. Please try again.";
        showStatusMessage(statusContainer, message, 'error');
        showToast(message, 'error');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Generate My AI Plan <i class="fas fa-cogs" aria-hidden="true"></i>';
    }
}
