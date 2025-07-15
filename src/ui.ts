
import { generateShoppingPlan } from './ai';
import { showLoadingSpinner, showErrorMessage } from './utils';
import { ShoppingPlan } from './types';

/**
 * Main UI setup function. Initializes all event listeners.
 */
export function setupUI() {
    setupHamburgerMenu();
    setupCravourAI();

    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear().toString();
    }
}

/**
 * Sets up the mobile hamburger menu functionality.
 */
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const headerNav = document.querySelector('.header-nav');

    if (hamburger && headerNav) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('is-active');
            headerNav.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', String(isActive));
        });

        document.querySelectorAll('.header-nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (headerNav.classList.contains('active')) {
                    hamburger.classList.remove('is-active');
                    headerNav.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
}

/**
 * Sets up the event listener for the main "Cravour AI" form submission.
 */
function setupCravourAI() {
    const generatePlanBtn = document.getElementById('generatePlanBtn');
    if (generatePlanBtn) {
        generatePlanBtn.addEventListener('click', handleGeneratePlan);
    }
}

/**
 * Handles the click event for generating a shopping plan.
 * It validates input, shows a loading state, calls the AI, and renders the result.
 */
async function handleGeneratePlan() {
    const descriptionEl = document.getElementById('planDescription') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('shopping-plan-results');

    if (!descriptionEl || !resultsContainer) return;

    const description = descriptionEl.value;
    if (description.trim().length < 10) {
        showErrorMessage(resultsContainer, "Please provide a more detailed shopping goal (e.g., items, budget, and location).");
        return;
    }

    showLoadingSpinner(resultsContainer);

    try {
        const data = await generateShoppingPlan(description);
        renderShoppingPlan(data, resultsContainer);
    } catch (err) {
        console.error("Error generating shopping plan:", err);
        showErrorMessage(resultsContainer, "The AI couldn't generate a shopping plan. Please try rephrasing your goal to be more specific about items, budget, and your location.");
    }
}

/**
 * Renders the entire multi-section shopping plan report.
 * @param data The typed ShoppingPlan object from the AI.
 * @param container The HTML element to render the results into.
 */
function renderShoppingPlan(data: ShoppingPlan, container: HTMLElement) {
    // --- 1. Budget Analysis Section ---
    const budget = data.budgetAnalysis;
    const differenceClass = budget.difference >= 0 ? 'success' : 'error';
    const budgetHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. Market Prices</h3>
            <div class="summary-grid">
                <div class="summary-card">
                    <h4>Your Budget</h4>
                    <p>₦${budget.userBudget.toLocaleString()}</p>
                </div>
                <div class="summary-card">
                    <h4>AI Estimated Cost</h4>
                    <p>₦${budget.estimatedCost.toLocaleString()}</p>
                </div>
                <div class="summary-card">
                    <h4>Difference</h4>
                    <p class="${differenceClass}">₦${Math.abs(budget.difference).toLocaleString()}</p>
                </div>
            </div>
            <p class="summary-text">${budget.summary}</p>
            <table class="plan-result-table">
                <thead>
                    <tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr>
                </thead>
                <tbody>
                    ${data.budgetItems.map(item => `
                        <tr>
                            <td>${item.itemName}</td>
                            <td>${item.quantity}</td>
                            <td>₦${item.estimatedPrice.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // --- 2. Price Analysis & Savings Tips Section ---
    const analysisHtml = `
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
    `;

    // --- 3. Recommended Merchants Section ---
    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Local Merchants</h3>
            <div class="merchant-grid">
                ${data.recommendedMerchants.map(merchant => `
                    <div class="merchant-card">
                        <h4><i class="fas fa-store"></i> ${merchant.name}</h4>
                        <div class="details">
                            <p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p>
                        </div>
                        <p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = budgetHtml + analysisHtml + merchantsHtml;
}
