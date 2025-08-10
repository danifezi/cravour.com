// Import all styles first to ensure they are bundled correctly.
import './src/assets/landing.css';
import './src/assets/app_styles.css';
import './src/assets/ads-styles.css';

// Import initializers and services
import { initLandingPage } from './src/ui-landing';
import { initRouter } from './src/router';
import { initAppUI } from './src/ui-app';
import { auth } from './src/utils';
import type { User } from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landingPage');
    const appLayout = document.querySelector('.app-layout') as HTMLElement | null;
    const authModal = document.getElementById('authModal');
    
    // Initialize listeners for modals and forms on the landing page.
    initLandingPage();

    if (!auth) {
        console.error("Firebase Auth is not initialized. App functionality will be limited.");
        landingPage?.classList.remove('hidden');
        appLayout?.classList.add('hidden');
        return;
    }
    
    // The core logic that makes this a true SPA.
    // It listens for auth state changes and toggles the UI accordingly.
    auth.onAuthStateChanged(user => {
        if (user) {
            // --- User is signed IN ---
            landingPage?.classList.add('hidden');
            appLayout?.classList.remove('hidden');
            
            // Ensure the auth modal is closed if it was open during login/signup
            authModal?.classList.add('hidden');
            
            // Initialize the authenticated app modules
            initAppUI(user as User);
            initRouter();
        } else {
            // --- User is signed OUT ---
            landingPage?.classList.remove('hidden');
            appLayout?.classList.add('hidden');
        }
    });
});
