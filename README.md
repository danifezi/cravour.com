# Cravour: AI Financial Co-Pilot

A web application that uses AI to provide personalized budgeting, price tracking, and merchant discovery. All client-side AI data is simulated for demonstration purposes.

## Features

-   **AI-Powered Budgeting**: Generate detailed budget plans based on user input.
-   **Real-Time Price Tracking**: Monitor simulated market prices for essential goods with trend indicators.
-   **Smart Merchant Finder**: Discover simulated local merchants with competitive prices based on location and category.
-   **Expense Report**: Analyze sample spending behavior with AI insights.
-   **Enhanced User Experience**:
    -   **Toast Notifications**: Provide timely feedback for user actions.
    -   **Skeleton Screens**: Improve perceived performance during data loading.
    -   **Form Validation**: Real-time validation with debouncing.
    -   **Reset Button**: Easily clear the budget planner form.
    -   **Accessibility**: Improved ARIA attributes, keyboard navigation, and focus states.
-   **Robust AI Integration**:
    -   **Retry Logic**: API calls include exponential backoff for transient failures.
    -   **Caching**: AI responses are cached locally to reduce redundant calls.
    -   **Fallback Data**: The UI remains functional even if AI services are unavailable, displaying simulated data.
    -   **Refined Prompts**: AI prompts are carefully crafted for better, more reliable output.
-   **Code Quality**:
    -   **Modular Structure**: Code split into clear, maintainable modules (`ai.ts`, `ui.ts`, `utils.ts`, `types.ts`, `config/constants.ts`).
    -   **Type Safety**: Comprehensive TypeScript interfaces for all data structures.
    -   **Security**: Input sanitization (`sanitize-html`) to prevent XSS.

## Project Structure

```
cravour/
├── src/
│   ├── config/
│   │   └── constants.ts      // API configurations, AI schemas, fallback data
│   ├── types.ts              // All TypeScript interfaces
│   ├── ai.ts                 // Core AI API calls with retry and caching logic
│   ├── ui.ts                 // UI setup, event listeners, and rendering logic
│   ├── utils.ts              // Utility functions (toast, DOM helpers, sanitize, debounce, cache)
│   └── index.tsx             // Application entry point
├── public/
│   ├── index.html            // Main HTML file
│   ├── styles.css            // Global CSS styles
│   ├── cravour-ads.html      // Coming soon page for Cravour Ads
│   └── index.js              // Compiled JavaScript (output of Webpack)
│   └── index.js.map          // Source map for debugging
├── tests/
│   ├── utils.test.ts         // Unit tests for utility functions
│   └── ai.test.ts            // Unit tests for AI response handling and fallbacks
├── .env                      // Environment variables (e.g., Gemini API Key)
├── package.json              // Project dependencies and scripts
├── webpack.config.js         // Webpack build configuration
├── tsconfig.json             // TypeScript compiler configuration
└── README.md                 // Project documentation
```

## Setup Instructions

1.  **Clone or Download**: Get the project files.
2.  **Install Dependencies**: Navigate to the project root directory (`cravour/`) in your terminal and install the required packages:
    ```bash
    npm install
    ```
3.  **Configure API Key**:
    *   Obtain a Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Create a file named `.env` in the root of your `cravour/` directory.
    *   Add your Gemini API key to this file:
        ```dotenv
        GEMINI_API_KEY=your-actual-gemini-api-key-here
        ```
    *   **Important**: Replace `your-actual-gemini-api-key-here` with your actual key. For production environments, API keys should be handled server-side to prevent exposure.
4.  **Build the Project**: Compile the TypeScript files into JavaScript:
    ```bash
    npm run build
    ```
    This command uses Webpack and TS-Loader to generate `public/index.js`.
5.  **Run the Application**: Start a local development server:
    ```bash
    npm start
    ```
    This will typically open the application at `http://localhost:3000` in your browser.
6.  **Run Tests**: Execute the unit tests:
    ```bash
    npm test
    ```

## Notes

-   **Simulated Data**: All AI-generated data (budgets, prices, merchants, expenses) is simulated for demonstration purposes, as emphasized in the UI and README. It does not reflect real-time market data or actual business information.
-   **API Key Security**: For production deployments, it is highly recommended to move AI API calls to a backend server to prevent exposing your API key directly in client-side code.
-   **Scalability**: The modular and typed structure supports easier expansion with new features (e.g., user authentication, integration with real data APIs).
-   **Testing**: The provided tests are basic unit tests for key utilities and AI integration points. Comprehensive testing would involve more extensive unit, integration, and end-to-end (E2E) tests.
-   **Accessibility**: While efforts have been made to improve accessibility, further enhancements, including full screen reader testing and WCAG 2.1 compliance checks, can be implemented.

## License

SPDX-License-Identifier: Apache-2.0
