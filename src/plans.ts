
import * as api from './ai';
import { showToast } from './utils';
import { PlanItem } from './types';
import { renderGeneratedPlan } from './rendering';

// Module-level cache for user plans
let userPlansCache: PlanItem[] = [];

export function setupMyPlansPage() {
    document.getElementById('createPlanForm')?.addEventListener('submit', handleGenerateAndSavePlan);
    const plansSection = document.getElementById('myPlansSection');
    if (!plansSection) return;

    // Use an observer to fetch plans only when the section is viewed
    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            await fetchAndRenderPlans();
        }
    }, { threshold: 0.1 });

    observer.observe(plansSection);
}

async function handleGenerateAndSavePlan(e: Event) {
    e.preventDefault();
    const input = document.getElementById('itemInput') as HTMLInputElement;
    const description = input.value;
    const resultsContainer = document.getElementById('planResults')!;
    const button = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement;

    if (description.trim().length < 10) {
        return showToast("Please provide a more detailed shopping goal.", 'error');
    }

    showToast("Generating and saving your plan...", 'info');
    button.disabled = true;
    resultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating intelligent plan...</p></div>';

    try {
        const plan = await api.generateShoppingPlan(description);
        renderGeneratedPlan(plan, resultsContainer);
        showToast("Plan saved successfully!", 'success');
        await fetchAndRenderPlans(); 
        input.value = '';
    } catch (error: any) {
        showToast(error.response?.data?.error || 'Failed to generate plan.', 'error');
        resultsContainer.innerHTML = '';
    } finally {
        button.disabled = false;
    }
}

export async function fetchAndRenderPlans() {
    const plansGrid = document.getElementById('plansGrid')!;
    plansGrid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading your plans...</p></div>';
    try {
        const plans = await api.getPlans();
        userPlansCache = plans; // Update cache
        renderPlans(plans);
        populatePlanSelector(); // Update the dropdown in the "Add Expense" form
    } catch (error: any) {
        plansGrid.innerHTML = `<div class="empty-state">${error.response?.data?.error || 'Could not load your plans.'}</div>`;
        showToast(error.response?.data?.error || 'Could not load your plans.', 'error');
    }
}

function renderPlans(plans: PlanItem[]) {
    const plansGrid = document.getElementById('plansGrid')!;
    if (plans.length === 0) {
        plansGrid.innerHTML = `<div class="empty-state">You have no financial plans yet. Create one above to get started!</div>`;
        return;
    }

    plansGrid.innerHTML = plans.map(plan => {
        const spent = plan.spent || 0;
        const budget = plan.budgetAnalysis.userBudget;
        const progress = budget > 0 ? (spent / budget) * 100 : 0;
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
        card.style.opacity = '0.5';
        try {
            await api.deletePlan(planId);
            card.remove();
            showToast("Plan deleted.", 'success');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Failed to delete plan.', 'error');
            card.style.opacity = '1';
        }
    }
}

async function handleTogglePlanStatus(e: Event) {
    const toggle = e.currentTarget as HTMLInputElement;
    const card = toggle.closest('.plan-card') as HTMLElement;
    const planId = card.dataset.planId;
    const statusEl = card.querySelector('.plan-status') as HTMLElement;
    if (!planId || !statusEl) return;

    const newStatus = toggle.checked ? 'active' : 'paused';
    toggle.disabled = true;
    try {
        await api.updatePlanStatus(planId, newStatus);
        statusEl.textContent = newStatus;
        statusEl.className = `plan-status ${newStatus}`;
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
    if (!container) return; // Guard against the element not being in the DOM yet

    const activePlans = userPlansCache.filter(p => p.status === 'active');
    if (activePlans.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <label for="expensePlan">Link to a Plan (Optional)</label>
        <select class="input-field" id="expensePlan" name="planId">
            <option value="">-- No Plan --</option>
            ${activePlans.map(plan => `<option value="${plan.id}">${plan.description}</option>`).join('')}
        </select>`;
}
