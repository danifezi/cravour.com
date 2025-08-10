
import { setupDashboardPage, loadAndRenderDashboard } from './dashboard';
import { setupMyPlansPage, fetchAndRenderPlans } from './plans';
import { setupAddExpensePage } from './expense';
import { setupCravourAdsPage } from './ads';
import { setupFundWalletPage } from './wallet';

interface Route {
    section: HTMLElement;
    setup: () => void;
    onNavigate: () => Promise<void>; // Function to call when navigating to the route
    isInitialized: boolean;
}

const routes: Record<string, Route> = {};

function defineRoutes() {
    const routeDefinitions = {
        'dashboard': { setup: setupDashboardPage, onNavigate: loadAndRenderDashboard, sectionId: 'dashboardSection' },
        'my-plans': { setup: setupMyPlansPage, onNavigate: fetchAndRenderPlans, sectionId: 'myPlansSection' },
        'add-expense': { setup: setupAddExpensePage, onNavigate: async () => {}, sectionId: 'addExpenseSection' },
        'fund-wallet': { setup: setupFundWalletPage, onNavigate: async () => {}, sectionId: 'fundWalletSection' },
        'ads': { setup: setupCravourAdsPage, onNavigate: async () => {}, sectionId: 'adsSection' },
    };

    for (const [path, { setup, sectionId, onNavigate }] of Object.entries(routeDefinitions)) {
        const section = document.getElementById(sectionId);
        if (section) {
            routes[path] = { section, setup, isInitialized: false, onNavigate };
        }
    }
}

async function navigate() {
    // Get the path from the hash, default to 'dashboard'
    let path = window.location.hash.substring(1) || 'dashboard';
    
    // Validate path, default to dashboard if invalid
    if (!routes[path]) {
        path = 'dashboard';
        window.location.hash = path;
    }
    
    const route = routes[path];
    if (!route) return;

    // Hide all sections
    Object.values(routes).forEach(r => r.section.classList.remove('active-section'));
    
    // Show the active section
    route.section.classList.add('active-section');

    // If the route's setup function hasn't been run yet, run it.
    if (!route.isInitialized) {
        route.setup();
        route.isInitialized = true;
    }
    
    // Always call the onNavigate function to refresh data
    await route.onNavigate();

    // Update the active state of the sidebar navigation buttons
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(button => {
        const buttonPath = button.getAttribute('data-route');
        button.classList.toggle('active', buttonPath === path);
    });
}

export function initRouter() {
    defineRoutes();
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const route = (e.currentTarget as HTMLElement).getAttribute('data-route');
            if (route) {
                window.location.hash = route;
            }
        });
    });
    
    window.addEventListener('hashchange', navigate);
    // Initial navigation call to handle the page load
    navigate();
}
