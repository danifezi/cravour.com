
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPE DEFINITIONS ---
interface BudgetAnalysis {
    userBudget: number;
    estimatedCost: number;
    difference: number;
    summary: string;
    optimizationTips: string[];
}

interface BudgetItem {
    itemName: string;
    quantity: string;
    estimatedPrice: number;
}

interface PriceAnalysis {
    itemName: string;
    priceStability: string;
    savingTip: string;
}

interface RecommendedMerchant {
    name: string;
    address: string;
    deals: string;
    verified: boolean;
}

interface ShoppingPlan {
    budgetAnalysis: BudgetAnalysis;
    budgetItems: BudgetItem[];
    priceAnalysis: PriceAnalysis[];
    recommendedMerchants: RecommendedMerchant[];
}

// --- GEMINI API CONFIGURATION ---
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
                optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 actionable tips to optimize the budget." }
            },
            required: ["userBudget", "estimatedCost", "difference", "summary", "optimizationTips"]
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
                required: ["itemName", "quantity", "estimatedPrice"]
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
                required: ["itemName", "priceStability", "savingTip"]
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
                required: ["name", "address", "deals", "verified"]
            }
        }
    },
    required: ["budgetAnalysis", "budgetItems", "priceAnalysis", "recommendedMerchants"]
};

// --- API FUNCTIONS ---

/**
 * Generates a shopping plan using the Gemini API.
 * @param description User's request for the shopping plan.
 * @returns A promise that resolves to a ShoppingPlan object.
 */
async function generateShoppingPlan(description: string): Promise<ShoppingPlan> {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured for this application.");
    }
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    const prompt = `You are an expert Nigerian financial planner. A user wants a shopping plan for: "${description}".
    Analyze the request to identify items, budget, and location.
    Generate a detailed financial plan using current, realistic Nigerian market prices (in NGN).
    Your response MUST be a single, valid JSON object that strictly adheres to the provided schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: shoppingPlanSchema,
        },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
        throw new Error("AI returned an empty response.");
    }
    return JSON.parse(responseText);
}

/**
 * MOCK: Submits an email to the waitlist.
 * @param email The user's email address.
 * @returns A promise that resolves with the server's confirmation message.
 */
async function joinWaitlist(email: string): Promise<{ message: string }> {
    console.log(`MOCK SAVE: Simulating save for ${email} to waitlist.`);
    return new Promise(resolve => setTimeout(() => resolve({ message: 'Successfully joined the waitlist.' }), 800));
}

// --- RENDERING FUNCTIONS ---
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
        <div class="result-section optimization-tips">
            <h4 class="result-heading"><i class="fas fa-lightbulb"></i> AI Savings Tips</h4>
            <ul>${budget.optimizationTips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        </div>
    ` : '';
    
    const itemsHtml = `
        <div class="result-section">
             <h3 class="result-heading">Itemized List</h3>
            <table class="data-table"><thead><tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr></thead><tbody>
            ${plan.budgetItems.map(item => `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>₦${item.estimatedPrice.toLocaleString()}</td></tr>`).join('')}
            </tbody></table>
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


// --- UTILITY FUNCTIONS ---
function showStatusMessage(container: HTMLElement | null, message: string, type: 'success' | 'error' | 'info', withSpinner = false) {
    if (!container) return;
    container.classList.remove('hidden');
    container.className = 'status-area';
    
    let spinnerHtml = withSpinner ? '<div class="loading-spinner"></div>' : '';
    
    container.className = `status-area ${type}-message`;
    container.innerHTML = `<div class="loading-state">${spinnerHtml}<p>${message}</p></div>`;
}

function hideStatusMessage(container: HTMLElement | null, delay?: number) {
    if (!container) return;
    if (delay) {
        setTimeout(() => {
            container.classList.add('hidden');
            container.innerHTML = '';
        }, delay);
    } else {
        container.classList.add('hidden');
        container.innerHTML = '';
    }
}

type ToastType = 'success' | 'error' | 'info';
const toastIcons: Record<ToastType, string> = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle'
};

function showToast(message: string, type: ToastType = 'info', duration: number = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `<i class="fas ${toastIcons[type]}"></i><p>${message}</p>`;

    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

// --- UI INITIALIZATION & HANDLERS ---
function initLandingPage() {
    setupHamburgerMenu();
    setupWaitlistModal();
    setupShoppingPlanForm();
    initScrollAnimations();
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
}

/**
 * Initializes IntersectionObserver to trigger animations on scroll.
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate="fade-up"]');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
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
        await joinWaitlist(email);
        showStatusMessage(statusEl, "Thank you! You've been added to our waitlist.", 'success');
        showToast("Successfully joined the waitlist!", "success");
        form.reset();
        setTimeout(() => {
             document.getElementById('waitlistModal')?.classList.add('hidden');
             hideStatusMessage(statusEl);
        }, 2500);
    } catch (error: any) {
        showStatusMessage(statusEl, "An error occurred. Please try again.", 'error');
        hideStatusMessage(statusEl, 4000);
    } finally {
        button.disabled = false;
    }
}

function setupShoppingPlanForm() {
    document.getElementById('shoppingPlanForm')?.addEventListener('submit', handleGeneratePlan);
}

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
    resultsContainer.innerHTML = '';
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
        const plan = await generateShoppingPlan(description);
        hideStatusMessage(statusContainer);
        renderGeneratedPlan(plan, resultsContainer);
    } catch (error: any) {
        const message = "Failed to generate plan. The AI may be experiencing high traffic. Please try again shortly.";
        showStatusMessage(statusContainer, message, 'error');
        showToast(message, 'error');
        console.error("AI Generation Error:", error);
    } finally {
        button.disabled = false;
        button.innerHTML = 'Generate AI Plan <i class="fas fa-cogs" aria-hidden="true"></i>';
    }
}

// --- APP ENTRY POINT ---
document.addEventListener('DOMContentLoaded', initLandingPage);
