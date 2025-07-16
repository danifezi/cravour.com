
import * as ai from './ai.js';
import { showLoadingSpinner, showErrorMessage } from './utils.js';
import { AdCopy, DashboardReport, ShoppingPlan } from './types.js';

// ==================================================================
// LANDING PAGE UI LOGIC
// ==================================================================

export function setupLandingPage(): void {
    setupHamburgerMenu();
    setupShoppingPlanForm();

    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear().toString();
    }
}

function setupHamburgerMenu(): void {
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

function setupShoppingPlanForm(): void {
    const shoppingPlanForm = document.getElementById('shoppingPlanForm');
    if (shoppingPlanForm) {
        shoppingPlanForm.addEventListener('submit', handleGeneratePlan);
    }
}

async function handleGeneratePlan(event: SubmitEvent): Promise<void> {
    event.preventDefault(); // Prevent the default form submission
    
    const descriptionEl = document.getElementById('shoppingGoal') as HTMLTextAreaElement;
    const statusContainer = document.getElementById('shoppingPlanStatus') as HTMLDivElement;
    const resultsContainer = document.getElementById('shoppingPlanResults') as HTMLDivElement;
    const generateBtn = document.getElementById('generatePlanBtn') as HTMLButtonElement;

    if (!descriptionEl || !resultsContainer || !generateBtn || !statusContainer) return;

    const description = descriptionEl.value;
    if (description.trim().length < 10) {
        showErrorMessage(statusContainer, "Please provide a more detailed shopping goal (e.g., items, budget, and location).");
        return;
    }

    showLoadingSpinner(statusContainer);
    resultsContainer.innerHTML = ''; // Clear previous results
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating... <i class="fas fa-spinner fa-spin"></i>';

    try {
        const data = await ai.generateShoppingPlan(description);
        renderShoppingPlan(data, resultsContainer);
        statusContainer.innerHTML = ''; // Clear status on success
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while generating the plan.";
        const finalMessage = errorMessage.includes("API key")
            ? "The AI service is currently unavailable. Please check your configuration or contact support."
            : errorMessage;
        showErrorMessage(statusContainer, finalMessage);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate My AI Plan <i class="fas fa-cogs" aria-hidden="true"></i>';
    }
}

function renderShoppingPlan(data: ShoppingPlan, container: HTMLElement): void {
    const budget = data.budgetAnalysis;
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
            <table class="plan-result-table">
                <thead><tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr></thead>
                <tbody>
                    ${data.budgetItems.map(item => `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>₦${item.estimatedPrice.toLocaleString()}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>`;

    const analysisHtml = `
        <div class="result-section">
            <h3 class="result-heading">AI Price & Savings Report</h3>
            <div class="analysis-grid">
                ${data.priceAnalysis.map(item => `
                    <div class="analysis-card">
                        <h4>${item.itemName}</h4>
                        <p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p>
                        <p class="tip"><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> ${item.savingTip}</p>
                    </div>`).join('')}
            </div>
        </div>`;

    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Local Merchants</h3>
            <div class="merchant-grid">
                ${data.recommendedMerchants.map(merchant => `
                    <div class="merchant-card">
                        <h4><i class="fas fa-store"></i> ${merchant.name}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p>
                        <p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p>
                    </div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = budgetHtml + analysisHtml + merchantsHtml;
}

// ==================================================================
// APP PAGES UI LOGIC
// ==================================================================

function handleGenericFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    alert(`Form '${form.id || 'Unnamed Form'}' submitted successfully! (This is a simulation).`);
    form.reset();
}

export function setupCreatePlanPage(): void {
    const addItemBtn = document.getElementById('addItemBtn');
    const planItemsContainer = document.getElementById('planItemsContainer');

    function addPlanItemRow() {
        if (!planItemsContainer) return;
        const itemRow = document.createElement('div');
        itemRow.classList.add('plan-item-row');
        itemRow.innerHTML = `
            <div class="form-group"><input type="text" name="itemName[]" placeholder="e.g., Rice" required></div>
            <div class="form-group"><input type="text" name="itemQuantity[]" placeholder="e.g., 10kg" required></div>
            <div class="form-group"><input type="number" name="itemPrice[]" placeholder="e.g., 25000" min="0" required></div>
            <button type="button" class="btn btn-remove-item" aria-label="Remove Item"><i class="fas fa-times"></i></button>`;
        planItemsContainer.appendChild(itemRow);
        itemRow.querySelector('.btn-remove-item')?.addEventListener('click', () => itemRow.remove());
    }

    if (addItemBtn && planItemsContainer) {
        addItemBtn.addEventListener('click', () => addPlanItemRow());
        addPlanItemRow();
    }

    const tomorrowBtn = document.getElementById('tomorrowBtn');
    const planDateInput = document.getElementById('planDate') as HTMLInputElement;
    if (tomorrowBtn && planDateInput) {
        tomorrowBtn.addEventListener('click', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            planDateInput.value = tomorrow.toISOString().split('T')[0];
        });
    }
    
    document.getElementById('createPlanForm')?.addEventListener('submit', handleGenericFormSubmit);
    document.getElementById('schedulePaymentBtn')?.addEventListener('click', () => {
        alert('Payment scheduling is handled by our backend service and will be active on your account upon saving the plan.');
    });
}

export function setupFundWalletPage(): void {
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const bankTransferDetails = document.getElementById('bankTransferDetails') as HTMLDivElement;
    const onlinePaymentDetails = document.getElementById('onlinePaymentDetails') as HTMLDivElement;

    function togglePaymentDetails() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement;
        if (!selectedMethod || !bankTransferDetails || !onlinePaymentDetails) return;
        bankTransferDetails.style.display = selectedMethod.value === 'bankTransfer' ? 'block' : 'none';
        onlinePaymentDetails.style.display = selectedMethod.value === 'onlinePayment' ? 'block' : 'none';
    }

    paymentMethodRadios.forEach(radio => radio.addEventListener('change', togglePaymentDetails));
    togglePaymentDetails();
    
    document.getElementById('fundWalletForm')?.addEventListener('submit', handleGenericFormSubmit);
}

export function setupDashboardPage(): void {
    async function loadDashboardData() {
        const barChartContainer = document.getElementById('barChartContainer') as HTMLDivElement;
        const transactionTableBody = document.getElementById('transactionTableBody') as HTMLTableSectionElement;

        if (!barChartContainer || !transactionTableBody) return;

        showLoadingSpinner(barChartContainer);
        transactionTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';

        try {
            const data: DashboardReport = await ai.generateDashboardReport();
            
            (document.getElementById('totalSpent') as HTMLDivElement).textContent = `₦${data.totalSpent.toLocaleString()}`;
            (document.getElementById('avgDailySpend') as HTMLDivElement).textContent = `₦${data.avgDailySpend.toLocaleString()}`;
            (document.getElementById('topCategory') as HTMLDivElement).textContent = data.topCategory;

            const totalCategorySpending = data.spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0);
            barChartContainer.innerHTML = data.spendingByCategory.map(cat => {
                const percentage = totalCategorySpending > 0 ? (cat.amount / totalCategorySpending) * 100 : 0;
                return `
                    <div class="bar-chart-item">
                        <span class="bar-label">${cat.category}:</span>
                        <div class="bar-container"><div class="bar" style="width: ${percentage.toFixed(2)}%;">₦${cat.amount.toLocaleString()}</div></div>
                    </div>`;
            }).join('');

            transactionTableBody.innerHTML = data.transactions.map(tx => {
                const amountClass = tx.type === 'in' ? 'amount-in' : 'amount-out';
                const amountPrefix = tx.type === 'in' ? '+' : '-';
                return `<tr><td>${tx.date}</td><td>${tx.item}</td><td>${tx.category}</td><td class="${amountClass}">${amountPrefix}₦${tx.amount.toLocaleString()}</td></tr>`;
            }).join('');

        } catch(err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while loading dashboard.";
            const finalMessage = errorMessage.includes("API key")
                ? "Could not load AI dashboard data due to a configuration issue."
                : errorMessage;
            showErrorMessage(barChartContainer, finalMessage);
            transactionTableBody.innerHTML = `<tr><td colspan="4"><div class="error-message">${finalMessage}</div></td></tr>`;
        }
    }
    loadDashboardData();
}

export function setupCravourAdsPage(): void {
    document.getElementById('cravourAdsForm')?.addEventListener('submit', handleGenerateAd);
}

async function handleGenerateAd(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const descriptionEl = document.getElementById('adDescription') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('adResultsContainer') as HTMLDivElement;
    const generateBtn = document.getElementById('generateAdBtn') as HTMLButtonElement;

    if (!descriptionEl || !resultsContainer || !generateBtn) return;

    const description = descriptionEl.value;
    if (description.trim().length < 15) {
        showErrorMessage(resultsContainer, "Please provide a more detailed description of your product or promotion.");
        return;
    }

    showLoadingSpinner(resultsContainer);
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating... <i class="fas fa-spinner fa-spin"></i>';

    try {
        const copy = await ai.generateAdCopy(description);
        renderAdCopy(copy, resultsContainer);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while generating ad copy.";
        const finalMessage = errorMessage.includes("API key")
            ? "The AI service is currently unavailable. Please contact support."
            : errorMessage;
        showErrorMessage(resultsContainer, finalMessage);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Ad Copy';
    }
}

function attachCopyToClipboardListener(button: HTMLButtonElement, textProvider: () => string): void {
    button.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(textProvider());
            const icon = button.querySelector('i');
            if (icon) {
                const originalIconClass = icon.className;
                button.classList.add('copied');
                icon.className = 'fas fa-check';
                setTimeout(() => {
                    button.classList.remove('copied');
                    icon.className = originalIconClass;
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Could not copy text to clipboard.');
        }
    });
}

function renderAdCopy(copy: AdCopy, container: HTMLElement): void {
    container.innerHTML = `
        <div class="ad-result-card">
            <h3>Your AI-Generated Ad Copy</h3>
            <div class="ad-copy-column">
                <div id="copy-headline" class="ad-copy-section">
                    <h5>Headline</h5>
                    <div class="copy-content">${copy.headline}</div>
                    <button class="copy-button" title="Copy Headline"><i class="far fa-copy"></i></button>
                </div>
                <div id="copy-body" class="ad-copy-section">
                    <h5>Body</h5>
                    <div class="copy-content">${copy.body}</div>
                    <button class="copy-button" title="Copy Body"><i class="far fa-copy"></i></button>
                </div>
                <div id="copy-cta" class="ad-copy-section">
                    <h5>Call to Action</h5>
                    <div class="copy-content">${copy.callToAction}</div>
                    <button class="copy-button" title="Copy Call to Action"><i class="far fa-copy"></i></button>
                </div>
                <div id="copy-hashtags" class="ad-copy-section ad-hashtags">
                    <h5>Hashtags</h5>
                    <div class="copy-content">${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}</div>
                    <button class="copy-button" title="Copy Hashtags"><i class="far fa-copy"></i></button>
                </div>
            </div>
        </div>`;

    attachCopyToClipboardListener(container.querySelector('#copy-headline .copy-button') as HTMLButtonElement, () => copy.headline);
    attachCopyToClipboardListener(container.querySelector('#copy-body .copy-button') as HTMLButtonElement, () => copy.body);
    attachCopyToClipboardListener(container.querySelector('#copy-cta .copy-button') as HTMLButtonElement, () => copy.callToAction);
    attachCopyToClipboardListener(container.querySelector('#copy-hashtags .copy-button') as HTMLButtonElement, () => copy.hashtags.join(' '));
}

export function setupMerchantOnboardingPage(): void {
    document.getElementById('merchantOnboardingForm')?.addEventListener('submit', handleGenericFormSubmit);
}

export function setupMyPlansPage(): void {
    document.querySelectorAll('.plan-card').forEach(card => {
        const planName = card.querySelector('.plan-name')?.textContent || 'this plan';

        card.querySelector('.btn-tertiary')?.addEventListener('click', () => {
            alert(`Viewing details for '${planName}'.\n(This is a demo feature)`);
        });
        
        const editButton = card.querySelector('.btn-secondary') as HTMLButtonElement;
        editButton?.addEventListener('click', () => {
            if (!editButton.classList.contains('disabled')) {
                alert(`Editing '${planName}'.\n(This is a demo feature)`);
            }
        });

        const toggle = card.querySelector('.switch input[type="checkbox"]') as HTMLInputElement;
        toggle?.addEventListener('change', () => {
            if (toggle.disabled) return;
            const status = toggle.checked ? 'activated' : 'paused';
            alert(`Plan '${planName}' has been ${status}.`);
        });
    });
}
