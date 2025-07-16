
import * as ai from './ai';
import { showLoadingSpinner, showErrorMessage } from './utils';
import { ShoppingPlan, AdCopy } from './types';

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
    const generatePlanBtn = document.getElementById('generatePlanBtn') as HTMLButtonElement;
    if (generatePlanBtn) {
        // Check for API Key and update UI accordingly for better developer feedback.
        if (!process.env.API_KEY) {
            generatePlanBtn.disabled = true;
            generatePlanBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> AI Offline: API Key Missing';
            generatePlanBtn.title = 'The AI service is unavailable. An API_KEY environment variable must be configured for this feature to work.';
            generatePlanBtn.style.cursor = 'not-allowed';
            generatePlanBtn.style.opacity = '0.7';
            return; // Stop further setup for this feature
        }
        generatePlanBtn.addEventListener('click', handleGeneratePlan);
    } else {
        console.error("Cravour AI 'Generate Plan' button not found. AI planner will not function.");
    }
}

async function handleGeneratePlan() {
    const descriptionEl = document.getElementById('planDescription') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('shopping-plan-results');
    const generateBtn = document.getElementById('generatePlanBtn') as HTMLButtonElement;

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
        const errorMessage = (err as Error).message.includes("API key") 
            ? "The AI service is not configured. Please contact support."
            : "The AI couldn't generate a plan. Please try rephrasing your goal to be more specific.";
        showErrorMessage(resultsContainer, errorMessage);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate My AI Plan <i class="fas fa-cogs" aria-hidden="true"></i>';
    }
}

function renderShoppingPlan(data: ShoppingPlan, container: HTMLElement) {
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

function handleGenericFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: { [key: string]: FormDataEntryValue } = {};
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
    const planDateInput = document.getElementById('planDate') as HTMLInputElement;
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
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement;
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

            const totalCategorySpending = data.spendingByCategory.reduce((sum: number, cat: any) => sum + cat.amount, 0);
            barChartContainer.innerHTML = data.spendingByCategory.map((cat: any) => {
                const percentage = totalCategorySpending > 0 ? (cat.amount / totalCategorySpending) * 100 : 0;
                return `
                    <div class="bar-chart-item">
                        <span class="bar-label">${cat.category}:</span>
                        <div class="bar-container">
                            <div class="bar" style="width: ${percentage.toFixed(2)}%;">₦${cat.amount.toLocaleString()}</div>
                        </div>
                    </div>`;
            }).join('');

            transactionTableBody.innerHTML = data.transactions.map((tx: any) => {
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
            const errorMessage = (err as Error).message.includes("API key")
                ? "Could not load AI dashboard data due to a configuration issue."
                : "Failed to load dashboard data from the AI service.";
            showErrorMessage(barChartContainer, errorMessage);
            transactionTableBody.innerHTML = `<tr><td colspan="4"><div class="error-message">${errorMessage}</div></td></tr>`;
        }
    }
    loadDashboardData();
}

export function setupCravourAdsPage() {
    const generateBtn = document.getElementById('generateAdBtn') as HTMLButtonElement;
    if (generateBtn) {
        if (!process.env.API_KEY) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> AI Offline: Key Missing';
            generateBtn.title = 'An API_KEY environment variable must be configured for this feature to work.';
            return;
        }
        generateBtn.addEventListener('click', handleGenerateAd);
    }
}

async function handleGenerateAd() {
    const descriptionEl = document.getElementById('adDescription') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('adResultsContainer');
    const adTypeEl = document.querySelector('input[name="adType"]:checked') as HTMLInputElement;
    const generateBtn = document.getElementById('generateAdBtn') as HTMLButtonElement;

    if (!descriptionEl || !resultsContainer || !adTypeEl || !generateBtn) return;

    const description = descriptionEl.value;
    const adType = adTypeEl.value;

    if (description.trim().length < 15) {
        showErrorMessage(resultsContainer, "Please provide a more detailed description of your product or promotion (at least 15 characters).");
        return;
    }

    showLoadingSpinner(resultsContainer);
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating... <i class="fas fa-spinner fa-spin"></i>';


    try {
        if (adType === 'copy') {
            const copy = await ai.generateAdCopy(description);
            renderAdCopyResult(copy, resultsContainer);
        } else if (adType === 'image') {
            const [imageBytes, copy] = await Promise.all([
                ai.generateAdImage(description),
                ai.generateAdCopy(description)
            ]);
            renderAdImageAndCopyResult(imageBytes, copy, description, resultsContainer);
        }
    } catch (err) {
        console.error("Error generating ad content:", err);
        const errorMessage = (err as Error).message.includes("API key")
            ? "The AI service is not configured. Please contact support."
            : "The AI failed to generate content. Please try rephrasing your description or try again later.";
        showErrorMessage(resultsContainer, errorMessage);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Content';
    }
}

function attachCopyToClipboardListener(button: HTMLElement, textToCopy: string) {
    button.addEventListener('click', (e) => {
        navigator.clipboard.writeText(textToCopy);
        const targetButton = e.currentTarget as HTMLButtonElement;
        const originalText = targetButton.innerHTML;
        targetButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        targetButton.disabled = true;
        setTimeout(() => {
             targetButton.innerHTML = originalText;
             targetButton.disabled = false;
        }, 2000);
    });
}

function renderAdCopyResult(copy: AdCopy, container: HTMLElement) {
    const fullCopyText = `Headline: ${copy.headline}\n\nBody: ${copy.body}\n\nCall to Action: ${copy.callToAction}\n\nHashtags: ${copy.hashtags.join(' ')}`;
    container.innerHTML = `
        <div class="ad-result-card">
            <h3>Your Generated Ad Copy</h3>
            <div class="ad-copy-column">
                <div class="ad-copy-section">
                    <h5>Headline</h5>
                    <p>${copy.headline}</p>
                </div>
                <div class="ad-copy-section">
                    <h5>Body</h5>
                    <p>${copy.body}</p>
                </div>
                <div class="ad-copy-section">
                    <h5>Call to Action</h5>
                    <p class="cta">${copy.callToAction}</p>
                </div>
                <div class="ad-copy-section">
                    <h5>Hashtags</h5>
                    <div class="ad-hashtags">
                        ${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                </div>
                <button id="copyBtn" class="btn btn-primary-outline"><i class="fas fa-copy"></i> Copy Full Text</button>
            </div>
        </div>
    `;
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        attachCopyToClipboardListener(copyBtn, fullCopyText);
    }
}

function renderAdImageAndCopyResult(imageBytes: string, copy: AdCopy, description: string, container: HTMLElement) {
    const imageUrl = `data:image/jpeg;base64,${imageBytes}`;
    const fullCopyText = `Headline: ${copy.headline}\n\nBody: ${copy.body}\n\nCall to Action: ${copy.callToAction}\n\nHashtags: ${copy.hashtags.join(' ')}`;
    
    container.innerHTML = `
        <div class="ad-result-card">
            <h3>Your Generated Ad Content</h3>
            <div class="ad-result-grid">
                <div class="ad-image-column">
                    <img src="${imageUrl}" alt="AI-generated promotional flier for '${description}'">
                    <a href="${imageUrl}" download="cravour-ad-${Date.now()}.jpg" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Download Image
                    </a>
                </div>
                <div class="ad-copy-column">
                    <div class="ad-copy-section">
                        <h5>Headline</h5>
                        <p>${copy.headline}</p>
                    </div>
                    <div class="ad-copy-section">
                        <h5>Body</h5>
                        <p>${copy.body}</p>
                    </div>
                    <div class="ad-copy-section">
                        <h5>Call to Action</h5>
                        <p class="cta">${copy.callToAction}</p>
                    </div>
                    <div class="ad-copy-section">
                        <h5>Hashtags</h5>
                        <div class="ad-hashtags">
                            ${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                    </div>
                    <button id="copyBtn" class="btn btn-primary-outline"><i class="fas fa-copy"></i> Copy Ad Text</button>
                </div>
            </div>
        </div>
    `;

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        attachCopyToClipboardListener(copyBtn, fullCopyText);
    }
}


export function setupMerchantOnboardingPage() {
    document.getElementById('merchantOnboardingForm')?.addEventListener('submit', handleGenericFormSubmit);
}

export function setupMyPlansPage() {
    // This page is currently static HTML, so no JS setup is needed.
    // This function is a placeholder for future interactivity.
    console.log("My Plans page loaded.");
}
