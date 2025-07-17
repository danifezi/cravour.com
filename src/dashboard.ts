
import * as api from './ai';
import { showToast } from './utils';
import { DashboardReport } from './types';
import Chart from 'chart.js/auto';

let activeChart: Chart | null = null;

export function setupDashboardPage() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (!dashboardSection) return;

    // Use an observer to fetch data only when the section is actively viewed
    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
            renderDashboardSkeleton();
            try {
                const report = await api.generateDashboardReport();
                renderDashboard(report);
            } catch (error: any) {
                const errorContainer = document.getElementById('aiInsights');
                if (errorContainer) {
                   errorContainer.innerHTML = `<div class="empty-state">${error.response?.data?.error || "Could not load dashboard"}</div>`;
                }
                showToast(error.response?.data?.error || "Could not load dashboard", 'error');
            }
        }
    }, { threshold: 0.1 });

    observer.observe(dashboardSection);
}

function renderDashboardSkeleton() {
    document.getElementById('dashboardStats')!.innerHTML = Array(4).fill('<div class="summary-card skeleton"><h3>&nbsp;</h3><div class="amount">&nbsp;</div></div>').join('');
    document.getElementById('aiInsights')!.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating AI insights...</p></div>';
    document.getElementById('transactionTableBody')!.innerHTML = `<tr><td colspan="4" class="loading-state"><p>Loading transactions...</p></td></tr>`;
}

function renderDashboard(report: DashboardReport) {
    document.getElementById('dashboardStats')!.innerHTML = `
        <div class="summary-card"><h3>Total Spent</h3><div class="amount spent">₦${report.totalSpent.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Avg. Daily Spend</h3><div class="amount">₦${report.avgDailySpend.toLocaleString()}</div></div>
        <div class="summary-card"><h3>Top Category</h3><div class="amount">${report.topCategory}</div></div>
        <div class="summary-card health-score-card"><h3>Financial Health</h3><div class="amount">${report.financialHealth.score}/100</div></div>`;
    
    document.getElementById('aiInsights')!.innerHTML = `
        <div class="ai-insight"><i class="fas fa-info-circle"></i><span>${report.financialHealth.summary}</span></div>
        ${report.financialHealth.recommendations.map(rec => `<div class="ai-insight"><i class="fas fa-lightbulb"></i><span>${rec}</span></div>`).join('')}`;

    const transactionBody = document.getElementById('transactionTableBody');
    if (transactionBody) {
        transactionBody.innerHTML = report.transactions.length > 0
        ? report.transactions.map(tx => `<tr><td>${tx.date}</td><td>${tx.description}</td><td>${tx.category}</td><td class="${tx.type === 'in' ? 'amount-in' : 'amount-out'}">${tx.type === 'in' ? '+' : '-'}₦${tx.amount.toLocaleString()}</td></tr>`).join('')
        : `<tr><td colspan="4" class="empty-state">No transactions recorded yet.</td></tr>`;
    }
        
    renderSpendingChart(report.spendingByCategory);
}

function renderSpendingChart(data: DashboardReport['spendingByCategory']) {
    const canvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    if (activeChart) activeChart.destroy();
    
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
