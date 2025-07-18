import './assets/styles.css';
import { initLandingPage } from './ui';

// This is the main entry point for the Webpack bundle.
// It initializes the main UI controller which handles the landing page logic.
document.addEventListener('DOMContentLoaded', () => {
    initLandingPage();
});
