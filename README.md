# Cravour - Smart Budgeting Website

This repository contains the source code for the Cravour marketing website, a responsive, multi-page static site designed to showcase the features of the Cravour financial app and encourage users to join the waitlist.

## Overview

Cravour is a fictional smart budgeting application. This website serves as its online presence, featuring a modern design, interactive elements, and integration with the Google Gemini API for an AI-powered savings calculator.

## Pages & Features

*   **Home Page (`index.html`):** The main landing page with a hero section, feature overview, an interactive AI savings calculator, and a testimonial slider.
*   **Features Page (`features.html`):** A dedicated page detailing the core features of the Cravour app.
*   **Pricing Page (`pricing.html`):** A page outlining the different subscription tiers.
*   **Testimonials Page (`testimonials.html`):** A grid-style page showcasing user testimonials.
*   **Waitlist Signup (`signin.html`):** A stylish two-panel page for users to sign up for the waitlist.
*   **Success Page (`success.html`):** A confirmation page shown after a user successfully joins the waitlist.
*   **Dashboard (`dashboard.html`):** A sample design of a logged-in user's product dashboard.

### Key Technical Features

*   **Responsive Design:** The entire website is fully responsive and optimized for various screen sizes, from mobile phones to desktop monitors.
*   **AI Savings Calculator:** The calculator on the homepage takes user input about an expense and uses the **Google Gemini API** to:
    1.  Calculate potential yearly and 5-year savings.
    2.  Generate personalized, aspirational financial goals that could be achieved with the saved amount.
*   **Modern UI/UX:** The site features smooth scroll animations, a particle-effect hero background, and a clean, consistent design language.
*   **Robust Interactivity:** All interactive elements, like the mobile menu and testimonial slider, are built with pure TypeScript for performance and reliability.

## Tech Stack

*   **HTML5**
*   **CSS3:** For styling and responsive design.
*   **TypeScript:** For all interactive logic.
*   **Vite:** As a modern frontend build tool.
*   **Google Gemini API:** Used to power the AI-driven insights in the savings calculator.

## Getting Started

### Prerequisites

*   Node.js and npm (or a compatible package manager).
*   A Google Gemini API key.

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up your environment variables:**
    Create a `.env.local` file in the root of the project and add your API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start a local server, and you can view the site in your browser at the provided URL (usually `http://localhost:5173`).

### Building for Production

To create a production-ready build of the site:
```bash
npm run build
```
The optimized static files will be generated in the `dist` directory.

### Deploying

The application is configured for easy deployment on static hosting providers like Netlify, Vercel, or GitHub Pages.

1.  Push your code to a Git repository.
2.  Connect your repository to the hosting provider.
3.  Set the build command to `npm run build`.
4.  Set the publish directory to `dist`.
5.  Set the `GEMINI_API_KEY` environment variable in your hosting provider's project settings.
