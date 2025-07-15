
import { fetchPriceData as fetchPrices, generatePlan, generatePriceReportForPlan, findMerchantsForPlan, fetchExpenseReport as fetchReport } from './ai';
import { showLoadingSpinner, showErrorMessage, showToast, sanitizeInput, debounce } from './utils';
import { BudgetPlanResponse, PriceReportResponse, Merchant, ExpenseReportResponse } from './types';
import { API_CONFIG } from './config/constants';

let isExpenseReportFetched = false;

export function setupUI() {
    setupHamburgerMenu();
    setupPlanner();
    setupMerchantSuggestions();
    fetchPriceData(); 
    
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

function fetchPriceData() {
    const grid = document.getElementById('price-tracker-grid');
    if (!grid) return;

    showLoadingSpinner(grid, 'card');

    fetchPrices().then(data => {
        requestAnimationFrame(() => {
            grid.innerHTML = '';
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'price-card';
                
                const isIncreased = item.priceChange > 0;
                const changeClass = item.priceChange === 0 ? 'stable' : (isIncreased ? 'up' : 'down');
                const changeIcon = item.priceChange === 0 ? 'fa-equals' : (isIncreased ? 'fa-arrow-up' : 'fa-arrow-down');
                const trendWidth = Math.min(Math.abs(item.priceChange) / 200 * 100, 100);
                let priceChangeText = item.priceChange === 0 ? 'Stable' : `${isIncreased ? '+' : '-'}₦${Math.abs(item.priceChange).toLocaleString()}`;

                card.innerHTML = `
                    <div class="item-name">${sanitizeInput(item.itemName)}</div>
                    <div class="item-price">₦${item.currentPrice.toLocaleString()}</div>
                    <div class="price-change ${changeClass}">
                        <i class="fas ${changeIcon}"></i>
                        <span>${sanitizeInput(priceChangeText)} (24h)</span>
                    </div>
                    <div class="price-trend">
                        <div class="trend-bar ${changeClass}" style="width: ${trendWidth}%" aria-label="Price trend indicator"></div>
                    </div>
                `;
                grid.appendChild(card);
            });
        });
    }).catch(err => {
        showErrorMessage(grid, API_CONFIG.FALLBACK_MESSAGE);
        console.error("Error displaying price data:", err);
    });
}

function setupPlanner() {
    const tabsContainer = document.querySelector('.planner-tabs');
    const generatePlanBtn = document.getElementById('generatePlanBtn');
    const resetPlanBtn = document.getElementById('resetPlanBtn');
    const descriptionEl = document.getElementById('planDescription') as HTMLTextAreaElement;

    if (tabsContainer) {
        tabsContainer.addEventListener('click', e => {
            if (!(e.target instanceof Element)) return;
            const clickedTab = e.target.closest('.tab-link');
            if (!clickedTab) return;

            // Deactivate all tabs and content first
            document.querySelectorAll('.tab-link').forEach(link => {
                link.classList.remove('active');
                link.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Activate the clicked tab and its corresponding content
            clickedTab.classList.add('active');
            clickedTab.setAttribute('aria-selected', 'true');
            
            const tabId = (clickedTab as HTMLElement).dataset.tab;
            if (tabId) {
                const activeTabContent = document.getElementById(tabId);
                if (activeTabContent) {
                    activeTabContent.classList.add('active');
                }
            }

            if (tabId === 'expense-report-tab' && !isExpenseReportFetched) {
                fetchExpenseReport();
                isExpenseReportFetched = true;
            }
        });
    }

    if (generatePlanBtn) generatePlanBtn.addEventListener('click', handleGeneratePlan);
    
    if (resetPlanBtn && descriptionEl) {
        resetPlanBtn.addEventListener('click', () => {
            descriptionEl.value = '';
            document.getElementById('planResultWrapper')!.innerHTML = `
                <div id="planResult" class="result-container" role="region" aria-live="polite"></div>
                <h3 class="result-heading">AI Price & Savings Report</h3>
                <div id="planPriceReportResult" class="result-container" role="region" aria-live="polite"></div>
                <h3 class="result-heading">Suggested Local Merchants</h3>
                <div id="planMerchantsResult" class="merchant-list-container" role="region" aria-live="polite"></div>`;
            document.getElementById('planDescriptionError')!.textContent = '';
            showToast('Budget planner form reset.', 'success');
        });
    }

    if (descriptionEl) descriptionEl.addEventListener('input', debounce(() => validatePlanDescription(descriptionEl), 300));
}

function validatePlanDescription(el: HTMLTextAreaElement): boolean {
    const errorEl = document.getElementById('planDescriptionError') as HTMLDivElement;
    const value = sanitizeInput(el.value.trim());
    if (value.length < 10) {
        errorEl.textContent = 'Please provide a more descriptive goal (at least 10 characters).';
        return false;
    }
    errorEl.textContent = '';
    return true;
}

async function handleGeneratePlan() {
    const descriptionEl = document.getElementById('planDescription') as HTMLTextAreaElement;
    const planContainer = document.getElementById('planResult')!;
    const reportContainer = document.getElementById('planPriceReportResult')!;
    const merchantsContainer = document.getElementById('planMerchantsResult')!;

    if (!validatePlanDescription(descriptionEl)) {
        showToast('Please correct the input errors.', 'error');
        return;
    }

    showLoadingSpinner(planContainer, 'card');
    showLoadingSpinner(reportContainer, 'card');
    showLoadingSpinner(merchantsContainer, 'card');

    try {
        const planData = await generatePlan(sanitizeInput(descriptionEl.value));
        renderPlanResult(planData, planContainer);
        if (!planData.items || planData.items.length === 0) {
            showErrorMessage(reportContainer, 'Price report could not be generated.');
            showErrorMessage(merchantsContainer, 'Merchant suggestions could not be generated.');
            return;
        }

        const location = {
            city: sanitizeInput((document.getElementById('userCity') as HTMLInputElement).value || 'Lagos'),
            lga: sanitizeInput((document.getElementById('userLGA') as HTMLInputElement).value || '')
        };

        await Promise.all([
            generatePriceReportForPlan(planData.items).then(report => renderPriceReport(report, reportContainer)),
            findMerchantsForPlan(planData.items, location).then(merchants => renderMerchantResults(merchants, merchantsContainer))
        ]);
        
        showToast('Budget plan and reports generated!', 'success');
    } catch (err) {
        showErrorMessage(planContainer, API_CONFIG.FALLBACK_MESSAGE);
        showErrorMessage(reportContainer, 'Price report generation failed.');
        showErrorMessage(merchantsContainer, 'Merchant search failed.');
        console.error("Error in handleGeneratePlan:", err);
    }
}

function renderPlanResult(data: BudgetPlanResponse, container: HTMLElement) {
    if (!data.items || data.items.length === 0) {
        showErrorMessage(container, 'Could not generate a detailed plan. Please try again.');
        return;
    }
    const itemsHtml = data.items.map(item => `
        <tr>
            <td>${sanitizeInput(item.itemName)}</td>
            <td>${sanitizeInput(item.category)}</td>
            <td>${sanitizeInput(item.quantity)}</td>
            <td>₦${item.estimatedPrice.toLocaleString()}</td>
        </tr>
    `).join('');

    requestAnimationFrame(() => {
        container.innerHTML = `
            <h3 class="result-heading">Your AI-Generated Budget Breakdown:</h3>
            <table class="plan-result-table">
                <thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Est. Price</th></tr></thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="total-row"><td colspan="3">Estimated Total</td><td>₦${data.estimatedTotal.toLocaleString()}</td></tr>
                </tbody>
            </table>
            ${data.notes ? `<div class="success-message" role="note"><p><strong>AI Tip:</strong> ${sanitizeInput(data.notes)}</p></div>` : ''}
        `;
    });
}

function renderPriceReport(data: PriceReportResponse, container: HTMLElement) {
    if (!data.itemReports || data.itemReports.length === 0) {
        showErrorMessage(container, 'AI could not generate a price report.');
        return;
    }
    const itemsHtml = data.itemReports.map(item => `
        <div class="report-item">
            <span class="report-item-name">${sanitizeInput(item.itemName)}</span>
            <span class="report-item-price">${sanitizeInput(item.averagePrice)}</span>
            <span class="report-item-stability">${sanitizeInput(item.stability)}</span>
        </div>
    `).join('');

    requestAnimationFrame(() => {
        container.innerHTML = `
            <div class="price-report-card">
                <div class="report-summary"><h4>Market Summary</h4><p>${sanitizeInput(data.overallSummary)}</p></div>
                <div class="report-items-list"><h4>Item Price Insights</h4>${itemsHtml}</div>
                <div class="report-tips"><h4><i class="fas fa-lightbulb"></i> Savings Tip</h4><p>${sanitizeInput(data.savingTips)}</p></div>
            </div>
        `;
    });
}

async function fetchExpenseReport() {
    const container = document.getElementById('reportResult')!;
    showLoadingSpinner(container, 'card');

    try {
        const data = await fetchReport();
        if (!data || !data.spendingByCategory) {
            showErrorMessage(container, 'AI could not generate a sample expense report.');
            return;
        }
        renderExpenseReport(data, container);
        showToast('Expense report loaded!', 'success');
    } catch (err) {
        showErrorMessage(container, API_CONFIG.FALLBACK_MESSAGE);
        console.error("Error fetching expense report:", err);
    }
}

function renderExpenseReport(data: ExpenseReportResponse, container: HTMLElement) {
    const summaryHtml = `
        <div class="report-summary-grid">
            <div class="summary-card"><h3>Total Spent (Sample)</h3><div class="amount spent">₦${data.totalSpent.toLocaleString()}</div></div>
            <div class="summary-card"><h3>Avg. Daily Spend</h3><div class="amount">₦${data.avgDailySpend.toLocaleString()}</div></div>
        </div>
    `;

    const barsHtml = data.spendingByCategory.map(cat => {
        const percentage = data.totalSpent > 0 ? (cat.amount / data.totalSpent) * 100 : 0;
        return `
            <div class="report-bar-item">
                <span class="bar-label">${sanitizeInput(cat.category)}:</span>
                <div class="bar-container"><div class="bar" style="width: ${percentage.toFixed(2)}%;">₦${cat.amount.toLocaleString()}</div></div>
            </div>`;
    }).join('');

    const transactionsHtml = data.transactions.map(tx => `
        <tr><td>${sanitizeInput(tx.date)}</td><td>${sanitizeInput(tx.item)}</td><td>${sanitizeInput(tx.category)}</td><td>₦${tx.amount.toLocaleString()}</td></tr>
    `).join('');

    requestAnimationFrame(() => {
        container.innerHTML = summaryHtml +
            `<div class="report-chart-section"><h3 class="result-heading">Spending by Category</h3><div class="report-bar-chart">${barsHtml}</div></div>` +
            `<div class="report-transaction-list"><h3 class="result-heading">Recent Transactions</h3><table class="report-transaction-table"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>${transactionsHtml}</tbody></table></div>` +
            (data.insights ? `<div class="success-message" role="note"><p><strong>AI Insight:</strong> ${sanitizeInput(data.insights)}</p></div>` : '');
    });
}

function setupMerchantSuggestions() {
    const findBtn = document.getElementById('findMerchantsBtn');
    if (findBtn) findBtn.addEventListener('click', debounce(findClosestMerchants, 300));
}

async function findClosestMerchants() {
    const cityEl = document.getElementById('userCity') as HTMLInputElement;
    const lgaEl = document.getElementById('userLGA') as HTMLInputElement;
    const categoryEl = document.getElementById('itemCategory') as HTMLSelectElement;
    const container = document.getElementById('merchant-list')!;

    const city = sanitizeInput(cityEl.value.trim());
    if (!city) {
        showErrorMessage(container, "Please enter a city to find merchants.");
        return;
    }
    showLoadingSpinner(container, 'card');

    try {
        const merchants = await findMerchantsForPlan([], { city, lga: sanitizeInput(lgaEl.value), category: sanitizeInput(categoryEl.value) });
        renderMerchantResults(merchants, container);
        showToast(merchants && merchants.length > 0 ? 'Merchants found!' : 'No merchants found for your criteria.', 'success');
    } catch (err) {
        showErrorMessage(container, API_CONFIG.FALLBACK_MESSAGE);
        console.error("Error finding merchants:", err);
    }
}


function renderMerchantResults(merchants: Merchant[], container: HTMLElement) {
    requestAnimationFrame(() => {
        if (!merchants || merchants.length === 0) {
            showErrorMessage(container, `No merchants found matching your criteria.`);
            return;
        }
        container.innerHTML = '';
        const listDiv = document.createElement('div');
        listDiv.className = 'merchant-grid';
        merchants.forEach(merchant => {
            const card = document.createElement('div');
            card.className = 'merchant-card';
            card.innerHTML = `
                <h4><i class="fas fa-store"></i> ${sanitizeInput(merchant.name)}</h4>
                <div class="details"><p><i class="fas fa-map-marker-alt"></i> ${sanitizeInput(merchant.address)}</p></div>
                <p class="deals"><i class="fas fa-tags"></i> ${sanitizeInput(merchant.deals)}</p>
            `;
            listDiv.appendChild(card);
        });
        container.appendChild(listDiv);
    });
}
