import { 
    setupLandingPage,
    setupCreatePlanPage,
    setupFundWalletPage,
    setupDashboardPage,
    setupCravourAdsPage,
    setupMerchantOnboardingPage,
    setupMyPlansPage,
} from './ui';

// Import global stylesheets to be bundled by Webpack
import './assets/styles.css';
import './assets/app_styles.css';
import './assets/ads-styles.css';


/**
 * Main entry point for the application.
 * This acts as a dispatcher, running the correct UI setup logic
 * based on the currently loaded page by checking for a unique element ID.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Landing Page Logic ---
    if (document.getElementById('cravour-ai')) {
        setupLandingPage();
    }
    
    // --- App Pages Logic ---
    if (document.getElementById('dashboardGrid')) {
        setupDashboardPage();
    }
    if (document.getElementById('createPlanForm')) {
        setupCreatePlanPage();
    }
    if (document.getElementById('fundWalletForm')) {
        setupFundWalletPage();
    }
    if (document.getElementById('merchantOnboardingForm')) {
        setupMerchantOnboardingPage();
    }
    if (document.querySelector('.plans-grid')) {
        setupMyPlansPage();
    }
    if (document.getElementById('cravourAdsForm')) {
        setupCravourAdsPage();
    }
});