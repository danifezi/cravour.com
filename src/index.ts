import { initAuthAndApp } from './ui';

// Import global stylesheets to be bundled by Webpack
import './assets/styles.css';
import './assets/app_styles.css';
import './assets/ads-styles.css';

document.addEventListener('DOMContentLoaded', () => {
  initAuthAndApp();
});
