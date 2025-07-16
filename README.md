# Cravour: AI Financial Co-Pilot (Webpack Edition)

A responsive, AI-powered web application that provides personalized budgeting, expense reporting, and ad copy generation. This version uses a modern TypeScript and Webpack build process for optimal performance and maintainability.

## Features

-   **AI-Powered Shopping Planner**: Users describe a shopping goal, and the AI generates a detailed budget plan, price analysis, and recommended local merchants.
-   **AI-Powered Expense Dashboard**: On page load, the AI generates a sample expense report, complete with summary cards, a categorical spending chart, and a transaction list.
-   **AI Ad Copy Generator**: Merchants can describe a promotion to instantly receive professional ad headlines, body text, and hashtags.
-   **Modern UI/UX**: The application features a fully responsive design with a sleek, dark-themed landing page and a clean, light-themed app interface. Interactive elements include mobile-friendly navigation, loading spinners, and helpful error messages.
-   **Webpack Build System**: All TypeScript, CSS, and assets are bundled efficiently for production, with a hot-reloading dev server for a smooth development experience.

## Project Structure

The project follows a standard Webpack project structure:

```
cravour/
├── dist/                 # Build output directory
├── node_modules/         # Dependencies
├── public/               # HTML templates
│   ├── index.html
│   ├── cravour-ads.html
│   └── ... (other html files)
├── src/                  # All source code
│   ├── assets/           # CSS files
│   │   ├── app_styles.css
│   │   ├── ads-styles.css
│   │   └── styles.css
│   ├── config/           # AI model schemas
│   │   └── constants.ts
│   ├── ai.ts             # Handles all Gemini API calls
│   ├── index.ts          # Main entry point, dispatches UI setup
│   ├── ui.ts             # All DOM manipulation and event handlers
│   ├── utils.ts          # Helper functions (spinners, etc.)
│   └── types.ts          # TypeScript interfaces
├── .env                  # For API Key (add to .gitignore)
├── .gitignore
├── package.json
├── README.md
├── tsconfig.json
└── webpack.config.js
```

## How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure API Key**:
    *   Create a `.env` file in the root of the project.
    *   Add your Google Gemini API key to this file:
        ```
        API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```
    *   The `webpack.config.js` is configured to automatically load this key into the application.

3.  **Start the Development Server**:
    *   This command will start a local server with hot-reloading.
    ```bash
    npm start
    ```
    *   Open your browser to `http://localhost:8080` (or the port specified in the output).

4.  **Build for Production**:
    *   This command will create an optimized build in the `dist/` directory, ready for deployment.
    ```bash
    npm run build
    ```