import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI instance at the module scope.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


document.addEventListener('DOMContentLoaded', function() {

    // --- Dynamic Plan Items (for create_plan.html) ---
    const addItemBtn = document.getElementById('addItemBtn');
    const planItemsContainer = document.getElementById('planItemsContainer');

    function addPlanItemRow(itemName = '', quantity = '', estPrice = '') {
        if (!planItemsContainer) return;
        const itemRow = document.createElement('div');
        itemRow.classList.add('plan-item-row');
        itemRow.innerHTML = `
            <div class="form-group">
                <label class="sr-only">Item Name</label>
                <input type="text" class="item-name" placeholder="e.g., Rice, Water Bottle" value="${itemName}" required>
            </div>
            <div class="form-group">
                <label class="sr-only">Quantity</label>
                <input type="text" class="item-quantity" placeholder="e.g., 10kg" value="${quantity}" required>
            </div>
            <div class="form-group">
                <label class="sr-only">Estimated Price (₦)</label>
                <input type="number" class="item-price" placeholder="e.g., 25000" min="0" value="${estPrice}" required>
            </div>
            <button type="button" class="btn btn-remove-item"><i class="fas fa-times"></i></button>
        `;
        planItemsContainer.appendChild(itemRow);

        const removeBtn = itemRow.querySelector('.btn-remove-item');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                itemRow.remove();
            });
        }
    }

    if (addItemBtn && planItemsContainer) {
        addItemBtn.addEventListener('click', function() {
            addPlanItemRow();
        });
        // Add one empty row to start with
        addPlanItemRow();
    }

    // --- Tomorrow Quick Select (for create_plan.html) ---
    const tomorrowBtn = document.getElementById('tomorrowBtn');
    const planDateInput = document.getElementById('planDate') as HTMLInputElement;

    if (tomorrowBtn && planDateInput) {
        tomorrowBtn.addEventListener('click', function() {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            planDateInput.value = tomorrow.toISOString().split('T')[0];
        });
    }

    // --- Fund Wallet Method Toggle (for fund_wallet.html) ---
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const bankTransferDetails = document.getElementById('bankTransferDetails');
    const onlinePaymentDetails = document.getElementById('onlinePaymentDetails');

    function togglePaymentDetails() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement;
        if (!selectedMethod || !bankTransferDetails || !onlinePaymentDetails) return;

        if (selectedMethod.value === 'bankTransfer') {
            bankTransferDetails.style.display = 'block';
            onlinePaymentDetails.style.display = 'none';
        } else { // 'onlinePayment' or default
            bankTransferDetails.style.display = 'none';
            onlinePaymentDetails.style.display = 'block';
        }
    }

    if (paymentMethodRadios.length > 0) {
        paymentMethodRadios.forEach(radio => radio.addEventListener('change', togglePaymentDetails));
        // Set initial state
        togglePaymentDetails();
    }

    // --- Dashboard Loader (for expense_report.html) ---
    if (document.getElementById('dashboardGrid')) {
        loadDashboardData();
    }

    // --- Simulate Form Submission (general for all forms) ---
    const allForms = document.querySelectorAll('form');
    allForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual form submission
            
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            console.log(`Form '${form.id || 'Unnamed Form'}' Submitted:`, data);

            alert(`Form submitted! (Simulated) Check console for data. A real app would process this and redirect.`);
        });
    });

});


async function loadDashboardData() {
    const reportSchema = {
        type: Type.OBJECT,
        properties: {
            totalSpent: { type: Type.NUMBER },
            avgDailySpend: { type: Type.NUMBER },
            topCategory: { type: Type.STRING },
            spendingByCategory: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { category: { type: Type.STRING }, amount: { type: Type.NUMBER } },
                    required: ["category", "amount"]
                }
            },
            transactions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING, description: "e.g., Aug 20" },
                        item: { type: Type.STRING },
                        category: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        type: { type: Type.STRING, description: "'in' for income, 'out' for expense" }
                    },
                    required: ["date", "item", "category", "amount", "type"]
                }
            }
        },
        required: ["totalSpent", "avgDailySpend", "topCategory", "spendingByCategory", "transactions"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a sample monthly expense report dashboard in Nigerian Naira (NGN) for a young professional in Lagos. Include total spending, average daily spend, the top spending category name, a breakdown of spending by 4-5 categories (like Food, Transport, Utilities), and a list of 4 sample transactions (include one 'in' type transaction like 'Wallet Top-up').",
            config: {
                responseMimeType: "application/json",
                responseSchema: reportSchema,
            },
        });
        
        const data = JSON.parse(response.text);
        renderDashboard(data);

    } catch(err) {
        console.error("Error loading dashboard data:", err);
        const dashboardGrid = document.getElementById('dashboardGrid');
        if (dashboardGrid) {
            dashboardGrid.innerHTML = `<p class="error-message" style="grid-column: 1 / -1;">Could not load AI dashboard data.</p>`;
        }
    }
}

function renderDashboard(data: any) {
    const totalSpentEl = document.getElementById('totalSpent');
    const avgDailySpendEl = document.getElementById('avgDailySpend');
    const topCategoryEl = document.getElementById('topCategory');
    const barChartContainerEl = document.getElementById('barChartContainer');
    const transactionTableBodyEl = document.getElementById('transactionTableBody');

    if (totalSpentEl) totalSpentEl.textContent = `₦${data.totalSpent.toLocaleString()}`;
    if (avgDailySpendEl) avgDailySpendEl.textContent = `₦${data.avgDailySpend.toLocaleString()}`;
    if (topCategoryEl) topCategoryEl.textContent = data.topCategory;

    if (barChartContainerEl && data.spendingByCategory) {
        const totalCategorySpending = data.spendingByCategory.reduce((sum: number, cat: any) => sum + cat.amount, 0);
        barChartContainerEl.innerHTML = data.spendingByCategory.map((cat: any) => {
            const percentage = totalCategorySpending > 0 ? (cat.amount / totalCategorySpending) * 100 : 0;
            return `
                <div class="bar-chart-item">
                    <span class="bar-label">${cat.category}:</span>
                    <div class="bar-container">
                        <div class="bar" style="width: ${percentage.toFixed(2)}%;">₦${cat.amount.toLocaleString()}</div>
                    </div>
                </div>`;
        }).join('');
    }

    if (transactionTableBodyEl && data.transactions) {
        transactionTableBodyEl.innerHTML = data.transactions.map((tx: any) => {
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
    }
}