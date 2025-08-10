
import * as api from './api';
import { showToast, showStatusMessage, hideStatusMessage } from './utils';
import { fetchAndRenderPlans, populatePlanSelector } from './plans';
import { loadAndRenderDashboard } from './dashboard';

export function setupAddExpensePage() {
    const form = document.getElementById('addExpenseForm') as HTMLFormElement;
    if(form){
        form.addEventListener('submit', handleAddTransaction);
        document.getElementById('expenseDescription')?.addEventListener('blur', handleCategorizeExpense);
        
        populatePlanSelector();
    }
}

async function handleCategorizeExpense(e: Event) {
    const input = e.target as HTMLInputElement;
    const categorySelect = document.getElementById('expenseCategory') as HTMLSelectElement;
    if (input.value.length < 5 || !categorySelect) return;
    
    categorySelect.disabled = true;
    try {
        const { category } = await api.categorizeTransaction(input.value);
        if (Array.from(categorySelect.options).some(opt => opt.value === category)) {
            categorySelect.value = category;
        }
    } catch (error: any) {
        console.error("AI Categorization failed:", error.message);
    } finally {
        categorySelect.disabled = false;
    }
}

async function handleAddTransaction(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    const statusEl = document.getElementById('addExpenseMessage');
    
    if (!statusEl || !button) {
        console.error("Add expense form elements are missing from the DOM.");
        return;
    }

    const formData = new FormData(form);
    const data: { [key: string]: any } = {};
    formData.forEach((value, key) => { data[key] = value; });

    data.amount = parseFloat(data.amount);
    if(isNaN(data.amount) || data.amount <= 0) {
        showStatusMessage(statusEl, "Please enter a valid, positive amount.", "error");
        hideStatusMessage(statusEl, 3000);
        return;
    }

    showStatusMessage(statusEl, 'Adding transaction...', 'info', true);
    button.disabled = true;

    try {
        const response = await api.addTransaction(data);
        showStatusMessage(statusEl, response.message, 'success');
        showToast(response.message, 'success');
        form.reset();
        await Promise.all([
            fetchAndRenderPlans(),
            loadAndRenderDashboard()
        ]);
        populatePlanSelector();
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to add transaction.';
        showStatusMessage(statusEl, errorMessage, 'error');
    } finally {
        button.disabled = false;
        hideStatusMessage(statusEl, 3000);
    }
}
