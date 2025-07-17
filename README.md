# Cravour: AI Financial Co-Pilot (Webpack SPA Edition)

A responsive, secure, and AI-powered Single-Page Application that provides personalized budgeting, expense reporting, and ad copy generation. This version uses a modern TypeScript and Webpack build process for optimal performance and maintainability.

## Features

-   **Authenticated Single-Page App**: Secure user registration and login backed by JWT. The entire application runs within a single, fast-loading shell after authentication.
-   **Live AI-Powered Dashboard**: On-demand generation of a full financial report, including spending analysis, financial health scores, and actionable recommendations from the Gemini API.
-   **AI-Assisted Transactions**: When adding expenses, the AI instantly suggests the correct category based on the description.
-   **AI Financial Plan Generation**: Users describe a shopping goal, and the AI generates a detailed budget plan, price analysis, and recommended local merchants, which is then saved to their profile.
-   **Secure Payments**: Integration with Paystack for funding wallets, with secure backend verification of every transaction.
-   **AI Ad Copy Generator**: Merchants can describe a promotion to instantly receive professional ad headlines, body text, and hashtags.
-   **Modern UI/UX**: Fully responsive design with a sleek dark-themed landing page and a clean, light-themed app interface.

## Project Structure

The project follows a modern SPA structure, with all source code managed by Webpack.

```
cravour/
├── dist/                 # Build output directory
├── node_modules/         # Dependencies
├── public/               # Static assets & HTML template
│   └── index.html        # The single HTML shell for the SPA
├── src/                  # All source code
│   ├── assets/           # CSS files
│   ├── config/           # AI model schemas
│   ├── types/            # Custom type declarations
│   ├── ai.ts             # Frontend API client (axios)
│   ├── index.ts          # Main entry point, dispatches UI setup
│   ├── ui.ts             # All DOM manipulation and event handlers
│   ├── utils.ts          # Helper functions
│   └── types.ts          # TypeScript interfaces
├── .env                  # For API keys (add to .gitignore)
├── package.json
├── README.md
├── server.js             # Express backend server
├── tsconfig.json
└── webpack.config.js
```

## How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure API Keys**:
    *   Create a `.env` file in the root of the project.
    *   Add your keys to this file. The server uses `GEMINI_API_KEY` and the frontend will receive `PAYSTACK_PUBLIC_KEY` and Firebase keys via `Dotenv-webpack`.
        ```
        # For Node.js Server
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        JWT_SECRET=YOUR_RANDOM_JWT_SECRET
        PAYSTACK_SECRET_KEY=YOUR_PAYSTACK_SECRET

        # For Frontend (loaded by Webpack)
        PAYSTACK_PUBLIC_KEY=YOUR_PAYSTACK_PUBLIC_KEY
        FIREBASE_API_KEY=YOUR_FIREBASE_KEY
        FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_DOMAIN
        FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
        ```

3.  **Start the Development Server**:
    *   This command will start the Node.js backend and the Webpack dev server concurrently.
    ```bash
    npm start
    ```
    *   Open your browser to `http://localhost:8080` (or the port specified in the output).

4.  **Build for Production**:
    *   This command will create an optimized, minified build in the `dist/` directory, ready for deployment.
    ```bash
    npm run build
    ```