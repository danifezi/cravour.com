
import * as api from './api';
import { showToast } from './utils';
import { PlanItem, ShoppingPlan } from './types';
import { renderGeneratedPlan } from './rendering';

let userPlansCache: PlanItem[] = [];

export function setupMyPlansPage() {
    document.getElementById('createPlanForm')?.addEventListener('submit', handleGenerateAndSavePlan);
}

async function handleGenerateAndSavePlan(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = document.getElementById('itemInput') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('planResults');
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;

    if (!input || !resultsContainer || !button) {
        console.error("Plan creation form elements are missing from the DOM.");
        return;
    }

    const description = input.value;
    if (description.trim().length < 10) {
        return showToast("Please provide a more detailed shopping goal.", 'error');
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    resultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating intelligent plan...</p></div>';

    try {
        const planData: ShoppingPlan = await api.generateShoppingPlanDemo(description);
        renderGeneratedPlan(planData, resultsContainer);
        showToast("Plan generated, now saving...", 'info');

        const planToSave = { ...planData, description };
        const savedPlan = await api.savePlan(planToSave);
        
        showToast("Plan saved successfully!", 'success');
        
        userPlansCache.unshift(savedPlan);
        renderPlans(userPlansCache);
        populatePlanSelector();

        input.value = '';
        setTimeout(() => resultsContainer.innerHTML = '', 5000);
    } catch (error: any) {
        const message = error.response?.data?.error || error.message || 'Failed to generate plan.';
        showToast(message, 'error');
        resultsContainer.innerHTML = `<div class="empty-state">${message}</div>`;
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-cogs"></i> Generate & Save Plan';
    }
}

export async function fetchAndRenderPlans() {
    const plansGrid = document.getElementById('plansGrid');
    if (!plansGrid) return;
    
    plansGrid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading your plans...</p></div>';
    try {
        const plans = await api.getPlans();
        userPlansCache = plans;
        renderPlans(plans);
        populatePlanSelector();
    } catch (error: any) {
        const message = error.response?.data?.error || 'Could not load your plans.';
        plansGrid.innerHTML = `<div class="empty-state full-width-panel">${message}</div>`;
        showToast(message, 'error');
    }
}

function renderPlans(plans: PlanItem[]) {
    const plansGrid = document.getElementById('plansGrid');
    if (!plansGrid) return;

    if (plans.length === 0) {
        plansGrid.innerHTML = `<div class="empty-state full-width-panel">You have no financial plans yet. Create one above to get started!</div>`;
        return;
    }

    plansGrid.innerHTML = plans.map(plan => {
        const spent = plan.spent || 0;
        const budget = plan.budgetAnalysis.userBudget;
        const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
        return `
        <div class="plan-card" data-plan-id="${plan.id}">
            <div class="plan-card-header"><h3 class="plan-name">${plan.description}</h3><span class="plan-status ${plan.status}">${plan.status}</span></div>
            <div class="plan-card-body">
                <div class="plan-budget-info">
                    <p><span>Budget:</span> <strong>₦${budget.toLocaleString()}</strong></p>
                    <p><span>Spent:</span> <strong>₦${spent.toLocaleString()}</strong></p>
                </div>
                <div class="plan-progress">
                    <div class="progress-bar-container"><div class="progress-bar" style="width: ${progress.toFixed(2)}%;"></div></div>
                    <span class="progress-text">${Math.round(progress)}%</span>
                </div>
            </div>
            <div class="plan-card-footer">
                <button class="btn btn-tertiary delete-plan-btn" title="Delete Plan"><i class="fas fa-trash"></i></button>
                <div class="plan-toggle"><label class="switch"><input type="checkbox" class="status-toggle" ${plan.status === 'active' ? 'checked' : ''}><span class="slider round"></span></label></div>
            </div>
        </div>`;
    }).join('');

    plansGrid.querySelectorAll('.delete-plan-btn').forEach(btn => btn.addEventListener('click', handleDeletePlan));
    plansGrid.querySelectorAll('.status-toggle').forEach(toggle => toggle.addEventListener('change', handleTogglePlanStatus));
}

async function handleDeletePlan(e: Event) {
    const button = e.currentTarget as HTMLButtonElement;
    const card = button.closest('.plan-card') as HTMLElement;
    const planId = card.dataset.planId;
    if (!planId) return;

    if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
        button.disabled = true;
        card.style.opacity = '0.5';
        try {
            await api.deletePlan(planId);
            userPlansCache = userPlansCache.filter(p => p.id !== planId);
            renderPlans(userPlansCache);
            populatePlanSelector();
            showToast("Plan deleted.", 'success');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Failed to delete plan.', 'error');
            card.style.opacity = '1';
        } finally {
            button.disabled = false;
        }
    }
}

async function handleTogglePlanStatus(e: Event) {
    const toggle = e.currentTarget as HTMLInputElement;
    const card = toggle.closest('.plan-card') as HTMLElement;
    const planId = card.dataset.planId;
    if (!planId) return;

    const newStatus = toggle.checked ? 'active' : 'paused';
    toggle.disabled = true;
    try {
        await api.updatePlanStatus(planId, newStatus);
        const planInCache = userPlansCache.find(p => p.id === planId);
        if (planInCache) planInCache.status = newStatus;
        renderPlans(userPlansCache);
        populatePlanSelector();
        showToast(`Plan status updated to ${newStatus}.`, 'success');
    } catch (error: any) {
        showToast(error.response?.data?.error || 'Failed to update plan status.', 'error');
        toggle.checked = !toggle.checked;
    } finally {
        toggle.disabled = false;
    }
}

export function populatePlanSelector() {
    const container = document.getElementById('expensePlanSelectorContainer');
    if (!container) return;

    const activePlans = userPlansCache.filter(p => p.status === 'active');
    if (activePlans.length === 0) {
        container.innerHTML = '<p class="form-hint">No active plans to link expense to.</p>';
        return;
    }

    container.innerHTML = `
        <label for="expensePlan">Link to a Plan (Optional)</label>
        <select class="input-field" id="expensePlan" name="planId">
            <option value="">-- No Plan --</option>
            ${activePlans.map(plan => `<option value="${plan.id}">${plan.description}</option>`).join('')}
        </select>`;
}
