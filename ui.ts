import { generateShoppingPlan, generateAdCopy, generateAdImage } from './ai';
import { showLoadingSpinner, showErrorMessage } from './utils';
import { ShoppingPlan, AdCopy } from './types';
import { GoogleGenAI, Type } from "@google/genai";

// AI instance for app-specific tasks (like the dashboard)
const appAi = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });


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
    }
}

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

        const reportSchema = {
            type: Type.OBJECT,
            properties: {
                totalSpent: { type: Type.NUMBER }, avgDailySpend: { type: Type.NUMBER }, topCategory: { type: Type.STRING },
                spendingByCategory: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, amount: { type: Type.NUMBER } }, required: ["category", "amount"] }
                },
                transactions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: "e.g., Aug 20" }, item: { type: Type.STRING }, category: { type: Type.STRING }, amount: { type: Type.NUMBER },
                            type: { type: Type.STRING, description: "'in' for income, 'out' for expense" }
                        },
                        required: ["date", "item", "category", "amount", "type"]
                    }
                }
            },
            required: ["totalSpent", "avgDailySpend", "topCategory", "spendingByCategory", "transactions"]
        };

        try {
            const response = await appAi.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Generate a sample monthly expense report dashboard in Nigerian Naira (NGN) for a young professional in Lagos. Include total spending, average daily spend, the top spending category name, a breakdown of spending by 4-5 categories (like Food, Transport, Utilities), and a list of 4 sample transactions (include one 'in' type transaction like 'Wallet Top-up').",
                config: { responseMimeType: "application/json", responseSchema: reportSchema },
            });
            
            const data = JSON.parse(response.text);

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
            showErrorMessage(barChartContainer, "Could not load AI dashboard data.");
            transactionTableBody.innerHTML = '<tr><td colspan="4"><div class="error-message">Failed to load</div></td></tr>';
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
    const descriptionEl = document.getElementById('adDescription') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('adResultsContainer');

    if (!descriptionEl || !resultsContainer) return;

    const description = descriptionEl.value;
    if (description.trim().length < 15) {
        showErrorMessage(resultsContainer, "Please provide a more detailed description of your product or promotion (at least 15 characters).");
        return;
    }

    showLoadingSpinner(resultsContainer);

    try {
        // Generate both copy and image in parallel
        const [copy, imageBytes] = await Promise.all([
            generateAdCopy(description),
            generateAdImage(description)
        ]);
        renderCombinedAdResult(copy, imageBytes, resultsContainer);
    } catch (err) {
        console.error("Error generating ad content:", err);
        showErrorMessage(resultsContainer, "The AI failed to generate content. Please try rephrasing your description or try again later.");
    }
}

function renderCombinedAdResult(copy: AdCopy, imageBytes: string, container: HTMLElement) {
    const imageUrl = `data:image/jpeg;base64,${imageBytes}`;
    const fullCopyText = `Headline: ${copy.headline}\n\nBody: ${copy.body}\n\nCall to Action: ${copy.callToAction}\n\nHashtags: ${copy.hashtags.join(' ')}`;

    container.innerHTML = `
        <div class="ad-result-card">
            <h3>Your Generated Ad Content</h3>
            <div class="ad-result-grid">
                <div class="ad-image-column">
                    <h4>Promotional Flier</h4>
                    <img src="${imageUrl}" alt="AI-generated promotional flier for '${copy.headline}'">
                    <a href="${imageUrl}" download="cravour-ad-${Date.now()}.jpg" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Download Image
                    </a>
                </div>
                <div class="ad-copy-column">
                    <h4>Social Media Post</h4>
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
        </div>
    `;

    document.getElementById('copyBtn')?.addEventListener('click', (e) => {
        navigator.clipboard.writeText(fullCopyText);
        const button = e.currentTarget as HTMLButtonElement;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.disabled = true;
        setTimeout(() => {
             button.innerHTML = originalText;
             button.disabled = false;
        }, 2000);
    });
}


export function setupMerchantOnboardingPage() {
    document.getElementById('merchantOnboardingForm')?.addEventListener('submit', handleGenericFormSubmit);
}

export function setupMyPlansPage() {
    // This page is currently static HTML, so no JS setup is needed.
    // This function is a placeholder for future interactivity.
    console.log("My Plans page loaded.");
}