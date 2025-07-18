// This is a basic template for a React application.
// You can expand upon this to create your own components and functionality.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import App from './App'; // Assuming you have an App component
import { initAuthAndApp } from './ui'; // Assuming you have UI initialization logic
// import { initAI } from './ai'; // Assuming you have AI initialization logic

import './assets/styles.css';
import './assets/app_styles.css';
import './assets/ads-styles.css';

declare global {
  interface Window {
    google: any;
  }
}

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get auth instance from the initialized app
const db = getFirestore(app); // Get firestore instance from the initialized app

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </React.StrictMode>
  );

  initAuthAndApp(app, auth, db);
} else {
  console.error('Root element not found!');
}