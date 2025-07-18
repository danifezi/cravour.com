
import * as api from './ai';
import { showToast, showStatusMessage, hideStatusMessage } from './utils';
import { fetchAndRenderPlans, populatePlanSelector } from './plans';

export function setupAddExpensePage() {
    const form = document.getElementById('addExpenseForm') as HTMLFormElement;
    form.addEventListener('submit', handleAddTransaction);
    document.getElementById('expenseDescription')?.addEventListener('blur', handleCategorizeExpense);
    
    // Initial population of dropdown when this section loads
    populatePlanSelector();
}

async function handleCategorizeExpense(e: Event) {
    const input = e.target as HTMLInputElement;
    const categorySelect = document.getElementById('expenseCategory') as HTMLSelectElement;
    if (input.value.length < 5) return;
    
    categorySelect.disabled = true;
    try {
        const { category } = await api.categorizeTransaction(input.value);
        if (Array.from(categorySelect.options).some(opt => opt.value === category)) {
            categorySelect.value = category;
        }
    } catch (error) {
        console.error("AI Categorization failed:", error);
    } finally {
        categorySelect.disabled = false;
    }
}

async function handleAddTransaction(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const statusEl = document.getElementById('addExpenseMessage')!;
    
    const formData = new FormData(form);
    const data: { [key: string]: any } = {};
    formData.forEach((value, key) => { data[key] = value; });

    showStatusMessage(statusEl, 'Adding transaction...', 'info', true);
    button.disabled = true;

    try {
        const response = await api.addTransaction(data);
        showStatusMessage(statusEl, response.message, 'success');
        showToast(response.message, 'success');
        form.reset();
        await fetchAndRenderPlans(); // Refresh plans to update spending
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to add transaction.';
        showStatusMessage(statusEl, errorMessage, 'error');
    } finally {
        button.disabled = false;
        hideStatusMessage(statusEl, 3000);
    }
}
