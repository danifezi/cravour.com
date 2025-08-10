
import * as api from './api';
import { showToast } from './utils';
import { DashboardReport, SpendingByCategory } from './types';
import Chart from 'chart.js/auto';

let activeChart: Chart | null = null;

export function setupDashboardPage() {
    // Initial one-time setup logic can go here if needed
}

export async function loadAndRenderDashboard() {
    renderDashboardSkeleton();
    try {
        const fullReport = await api.getDashboardData();
        renderDashboard(fullReport);
    } catch (error: any) {
        const errorContainer = document.getElementById('aiInsights');
        const errorMessage = error.response?.data?.error || "Could not load dashboard data.";
        if (errorContainer) {
            errorContainer.innerHTML = `<div class="empty-state">${errorMessage}</div>`;
        }
        showToast(errorMessage, 'error');
    }
}

function renderDashboardSkeleton() {
    document.getElementById('dashboardStats')?.insertAdjacentHTML('beforeend', Array(4).fill('<div class="summary-card skeleton"><h3>&nbsp;</h3><div class="amount">&nbsp;</div></div>').join(''));
    const aiInsights = document.getElementById('aiInsights');
    if (aiInsights) aiInsights.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating AI insights...</p></div>';
    
    const transactionTableBody = document.getElementById('transactionTableBody');
    if (transactionTableBody) transactionTableBody.innerHTML = `<tr><td colspan="4" class="loading-state"><div class="loading-spinner"></div><p>Loading transactions...</p></td></tr>`;

    const userBalance = document.getElementById('userBalance');
    if(userBalance) userBalance.textContent = '...';
    
    const userAvatar = document.getElementById('userAvatar');
    if(userAvatar) userAvatar.textContent = '';

    const canvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            if (activeChart) activeChart.destroy();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

function renderDashboard(report: DashboardReport) {
    // Update header info
    const userBalance = document.getElementById('userBalance');
    if(userBalance) userBalance.textContent = `₦${report.walletBalance.toLocaleString()}`;

    const avatar = document.getElementById('userAvatar');
    if (avatar && report.name) {
        avatar.textContent = report.name.charAt(0).toUpperCase();
        avatar.title = report.name;
    }

    // Update stats
    const dashboardStats = document.getElementById('dashboardStats');
    if(dashboardStats) {
        dashboardStats.innerHTML = `
        <div class="summary-card"><h3>Total Spent (30d)</h3><div class="amount spent">₦${report.totalSpent.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Avg. Daily Spend</h3><div class="amount">₦${report.avgDailySpend.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div></div>
        <div class="summary-card"><h3>Top Category</h3><div class="amount">${report.topCategory}</div></div>
        <div class="summary-card health-score-card"><h3>Financial Health</h3><div class="amount">${report.financialHealth.score}/100</div></div>`;
    }
    
    // Update AI Insights
    const aiInsights = document.getElementById('aiInsights');
    if(aiInsights) {
        aiInsights.innerHTML = `
        <div class="ai-insight"><i class="fas fa-info-circle"></i><span>${report.financialHealth.summary}</span></div>
        ${report.financialHealth.recommendations.map(rec => `<div class="ai-insight"><i class="fas fa-lightbulb"></i><span>${rec}</span></div>`).join('')}`;
    }

    // Update transactions table
    const transactionBody = document.getElementById('transactionTableBody');
    if (transactionBody) {
        transactionBody.innerHTML = report.transactions.length > 0
        ? report.transactions.map(tx => `<tr><td>${tx.date}</td><td>${tx.description}</td><td>${tx.category}</td><td class="${tx.type === 'in' ? 'amount-in' : 'amount-out'}">${tx.type === 'in' ? '+' : '-'}₦${tx.amount.toLocaleString()}</td></tr>`).join('')
        : `<tr><td colspan="4" class="empty-state">No transactions recorded yet.</td></tr>`;
    }
        
    renderSpendingChart(report.spendingByCategory);
}

function renderSpendingChart(data: SpendingByCategory[]) {
    const canvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    const chartContainer = canvas?.parentElement;
    if (!chartContainer) return;
    
    if (activeChart) activeChart.destroy();

    if(data.length === 0){
        chartContainer.innerHTML = `<div class="empty-state" style="height: 100%; display: flex; align-items: center; justify-content: center;">No spending data for chart.</div><canvas id="spendingChart" style="display: none;"></canvas>`;
        return;
    }
    
    const existingCanvas = document.getElementById('spendingChart');
    if (!existingCanvas) {
         chartContainer.innerHTML = '<canvas id="spendingChart"></canvas>';
    }
    const spendingChartCanvas = document.getElementById('spendingChart') as HTMLCanvasElement | null;
    if (spendingChartCanvas) {
        spendingChartCanvas.style.display = 'block';
    }


    const newCanvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    const ctx = newCanvas.getContext('2d');
    if (!ctx) return;
    
    activeChart = new Chart(ctx, {
        type: 'doughnut',
        data: { 
            labels: data.map(d => d.category), 
            datasets: [{ 
                data: data.map(d => d.amount), 
                backgroundColor: ['#FFC107', '#36A2EB', '#FF6384', '#4BC0C0', '#9966FF', '#FF9F40'], 
                borderWidth: 0,
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'right' } 
            }, 
            cutout: '70%' 
        }
    });
}
