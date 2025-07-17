
import * as ai from './ai.js';
import { showLoadingSpinner, showErrorMessage } from './utils.js';

// ==================================================================
// LANDING PAGE UI LOGIC
// ==================================================================

export function setupLandingPage() {
    setupHamburgerMenu();
    setupCravourAI();

    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear().toString();
    }
}

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

function setupCravourAI() {
    const generatePlanBtn = document.getElementById('generatePlanBtn');
    if (generatePlanBtn) {
        generatePlanBtn.addEventListener('click', handleGeneratePlan);
    } else {
        console.error("Cravour AI 'Generate Plan' button not found. AI planner will not function.");
    }
}

async function handleGeneratePlan() {
    const descriptionEl = document.getElementById('planDescription');
    const resultsContainer = document.getElementById('shopping-plan-results');
    const generateBtn = document.getElementById('generatePlanBtn');

    if (!descriptionEl || !resultsContainer || !generateBtn) {
        console.error("One or more essential UI elements for the AI planner are missing.");
        return;
    }

    const description = descriptionEl.value;
    if (description.trim().length < 10) {
        showErrorMessage(resultsContainer, "Please provide a more detailed shopping goal (e.g., items, budget, and location).");
        return;
    }

    showLoadingSpinner(resultsContainer);
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating... <i class="fas fa-spinner fa-spin"></i>';

    try {
        const data = await ai.generateShoppingPlan(description);
        renderShoppingPlan(data, resultsContainer);
    } catch (err) {
        console.error("Error generating shopping plan:", err);
        const errorMessage = err.message.includes("API key") 
            ? "The AI service is currently unavailable. Please check your configuration or contact support."
            : "The AI couldn't create a plan. Try rephrasing your goal to be more specific or check your connection.";
        showErrorMessage(resultsContainer, errorMessage);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate My AI Plan <i class="fas fa-cogs" aria-hidden="true"></i>';
    }
}

function renderShoppingPlan(data, container) {
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

    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Local Merchants</h3>
            <div class="merchant-grid">
                ${data.recommendedMerchants.map(merchant => `
                    <div class="merchant-card">
                        <h4><i class="fas fa-store"></i> ${merchant.name}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p>
                        <p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = budgetHtml + analysisHtml + merchantsHtml;
}


// ==================================================================
// APP PAGES UI LOGIC
// ==================================================================

function handleGenericFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => { data[key] = value; });
    console.log(`Form '${form.id || 'Unnamed Form'}' Submitted:`, data);
    alert(`Form submitted successfully! (This is a simulation).`);
    form.reset();
}

export function setupCreatePlanPage() {
    const addItemBtn = document.getElementById('addItemBtn');
    const planItemsContainer = document.getElementById('planItemsContainer');

    function addPlanItemRow(itemName = '', quantity = '', estPrice = '') {
        if (!planItemsContainer) return;
        const itemRow = document.createElement('div');
        itemRow.classList.add('plan-item-row');
        itemRow.innerHTML = `
            <div class="form-group">
                <label class="sr-only" for="itemName">Item Name</label>
                <input type="text" name="itemName[]" class="item-name" placeholder="e.g., Rice, Water Bottle" value="${itemName}" required>
            </div>
            <div class="form-group">
                <label class="sr-only" for="itemQuantity">Quantity</label>
                <input type="text" name="itemQuantity[]" class="item-quantity" placeholder="e.g., 10kg" value="${quantity}" required>
            </div>
            <div class="form-group">
                <label class="sr-only" for="itemPrice">Estimated Price (₦)</label>
                <input type="number" name="itemPrice[]" class="item-price" placeholder="e.g., 25000" min="0" value="${estPrice}" required>
            </div>
            <button type="button" class="btn btn-remove-item" aria-label="Remove Item"><i class="fas fa-times"></i></button>
        `;
        planItemsContainer.appendChild(itemRow);
        itemRow.querySelector('.btn-remove-item')?.addEventListener('click', () => itemRow.remove());
    }

    if (addItemBtn && planItemsContainer) {
        addItemBtn.addEventListener('click', () => addPlanItemRow());
        addPlanItemRow(); // Add one row by default
    }

    const tomorrowBtn = document.getElementById('tomorrowBtn');
    const planDateInput = document.getElementById('planDate');
    if (tomorrowBtn && planDateInput) {
        tomorrowBtn.addEventListener('click', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            planDateInput.value = tomorrow.toISOString().split('T')[0];
        });
    }
    
    document.getElementById('createPlanForm')?.addEventListener('submit', handleGenericFormSubmit);
}

export function setupFundWalletPage() {
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const bankTransferDetails = document.getElementById('bankTransferDetails');
    const onlinePaymentDetails = document.getElementById('onlinePaymentDetails');

    function togglePaymentDetails() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedMethod || !bankTransferDetails || !onlinePaymentDetails) return;

        bankTransferDetails.style.display = selectedMethod.value === 'bankTransfer' ? 'block' : 'none';
        onlinePaymentDetails.style.display = selectedMethod.value === 'onlinePayment' ? 'block' : 'none';
    }

    paymentMethodRadios.forEach(radio => radio.addEventListener('change', togglePaymentDetails));
    togglePaymentDetails(); // Initial call
    
    document.getElementById('fundWalletForm')?.addEventListener('submit', handleGenericFormSubmit);
}

export function setupDashboardPage() {
    async function loadDashboardData() {
        const dashboardGrid = document.getElementById('dashboardGrid');
        const barChartContainer = document.getElementById('barChartContainer');
        const transactionTableBody = document.getElementById('transactionTableBody');

        if (!dashboardGrid || !barChartContainer || !transactionTableBody) return;

        showLoadingSpinner(barChartContainer);
        transactionTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';

        try {
            const data = await ai.generateDashboardReport();

            const totalSpentEl = document.getElementById('totalSpent');
            const avgDailySpendEl = document.getElementById('avgDailySpend');
            const topCategoryEl = document.getElementById('topCategory');
            if (totalSpentEl) totalSpentEl.textContent = `₦${data.totalSpent.toLocaleString()}`;
            if (avgDailySpendEl) avgDailySpendEl.textContent = `₦${data.avgDailySpend.toLocaleString()}`;
            if (topCategoryEl) topCategoryEl.textContent = data.topCategory;

            const totalCategorySpending = data.spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0);
            barChartContainer.innerHTML = data.spendingByCategory.map((cat) => {
                const percentage = totalCategorySpending > 0 ? (cat.amount / totalCategorySpending) * 100 : 0;
                return `
                    <div class="bar-chart-item">
                        <span class="bar-label">${cat.category}:</span>
                        <div class="bar-container">
                            <div class="bar" style="width: ${percentage.toFixed(2)}%;">₦${cat.amount.toLocaleString()}</div>
                        </div>
                    </div>`;
            }).join('');

            transactionTableBody.innerHTML = data.transactions.map((tx) => {
                const amountClass = tx.type === 'in' ? 'amount-in' : 'amount-out';
                const amountPrefix = tx.type === 'in' ? '+' : '-';
                return `
                    <tr>
                        <td>${tx.date}</td>
                        <td>${tx.item}</td>
                        <td>${tx.category}</td>
                        <td class="${amountClass}">${amountPrefix}₦${tx.amount.toLocaleString()}</td>
                    </tr>`;
            }).join('');

        } catch(err) {
            console.error("Error loading dashboard data:", err);
            const errorMessage = err.message.includes("API key")
                ? "Could not load AI dashboard data due to a configuration issue."
                : "Failed to load dashboard data. Please check your connection and try again.";
            showErrorMessage(barChartContainer, errorMessage);
            transactionTableBody.innerHTML = `<tr><td colspan="4"><div class="error-message">${errorMessage}</div></td></tr>`;
        }
    }
    loadDashboardData();
}

export function setupCravourAdsPage() {
    const generateBtn = document.getElementById('generateAdBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateAd);
    }
}

async function handleGenerateAd() {
    const descriptionEl = document.getElementById('adDescription');
    const resultsContainer = document.getElementById('adResultsContainer');
    const generateBtn = document.getElementById('generateAdBtn');

    if (!descriptionEl || !resultsContainer || !generateBtn) return;

    const description = descriptionEl.value;
    if (description.trim().length < 15) {
        showErrorMessage(resultsContainer, "Please provide a more detailed description of your product or promotion (at least 15 characters).");
        return;
    }

    showLoadingSpinner(resultsContainer);
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating... <i class="fas fa-spinner fa-spin"></i>';

    try {
        const copy = await ai.generateAdCopy(description);
        renderAdCopy(copy, resultsContainer);
    } catch (err) {
        console.error("Error generating ad copy:", err);
        const errorMessage = err.message.includes("API key")
            ? "The AI service is currently unavailable. Please contact support."
            : "The AI failed to generate ad copy. Please try rephrasing your description or try again later.";
        showErrorMessage(resultsContainer, errorMessage);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Ad Copy';
    }
}

function attachCopyToClipboardListener(button, textProvider) {
    button.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent any parent event handlers from firing
        const textToCopy = textProvider();
        try {
            await navigator.clipboard.writeText(textToCopy);
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
        }
    });
}

function renderAdCopy(copy, container) {
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
                    <div class="copy-content">
                        ${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                    <button class="copy-button" title="Copy Hashtags"><i class="far fa-copy"></i></button>
                </div>
                <button id="copyAllBtn" class="btn btn-primary-outline"><i class="fas fa-copy"></i> Copy All Text</button>
            </div>
        </div>
    `;

    // Attach event listeners
    const fullCopyText = `Headline: ${copy.headline}\n\nBody: ${copy.body}\n\nCall to Action: ${copy.callToAction}\n\nHashtags: ${copy.hashtags.join(' ')}`;
    
    attachCopyToClipboardListener(container.querySelector('#copy-headline .copy-button'), () => copy.headline);
    attachCopyToClipboardListener(container.querySelector('#copy-body .copy-button'), () => copy.body);
    attachCopyToClipboardListener(container.querySelector('#copy-cta .copy-button'), () => copy.callToAction);
    attachCopyToClipboardListener(container.querySelector('#copy-hashtags .copy-button'), () => copy.hashtags.join(' '));
    attachCopyToClipboardListener(container.querySelector('#copyAllBtn'), () => fullCopyText);
}


export function setupMerchantOnboardingPage() {
    document.getElementById('merchantOnboardingForm')?.addEventListener('submit', handleGenericFormSubmit);
}

export function setupMyPlansPage() {
    // This page is currently static HTML, so no JS setup is needed.
    // This function is a placeholder for future interactivity.
    console.log("My Plans page loaded.");
}