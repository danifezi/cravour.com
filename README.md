
# Cravour: AI Financial Co-Pilot (v2.0)

A web application that uses AI to provide personalized budgeting, price tracking, and merchant discovery. This version features a streamlined project structure and enhanced AI capabilities.

## Features

-   **AI-Powered Budgeting**: Generate detailed budget plans based on user input.
-   **Enhanced AI Ad Generation**: Create social media copy and a promotional image from a single description.
-   **AI Expense Reporting**: Analyze spending behavior with AI-generated insights and charts.
-   **Modern UI/UX**: A responsive, unified design system for the landing page and app dashboard, featuring interactive forms, loading states, and error messages.
-   **Clean Architecture**: A professional project structure using TypeScript and Webpack, with a clear separation between public assets, source code, and build output.

## Project Structure

```
cravour/
├── dist/                     // Build output, what Netlify deploys
├── public/                   // All public assets (HTML, CSS)
│   ├── css/
│   │   ├── app_styles.css
│   │   ├── ads-styles.css
│   │   └── styles.css
│   └── *.html                // All HTML pages
├── src/                      // All TypeScript source code
├── .gitignore
├── netlify.toml
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Setup & Deployment

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Configure API Key**:
    *   This project assumes your Gemini API key is managed as a secure environment variable by your deployment platform (e.g., Netlify).
    *   In Netlify's site settings, go to `Site configuration > Environment variables` and add a variable with the key `API_KEY` and your Gemini API key as the value.
3.  **Build the Project**: To create the production-ready `dist` folder:
    ```bash
    npm run build
    ```
4.  **Run Locally**: To preview the production build:
    ```bash
    npm start
    ```
    This will serve the `dist` folder, typically at `http://localhost:3000`.

5.  **Deploy to Netlify**:
    *   Push the code to a GitHub repository.
    *   Connect the repository to Netlify.
    *   Netlify will automatically detect `netlify.toml` and your build settings. The "Publish directory" should be set to `dist`.
    *   Ensure your `API_KEY` environment variable is set in Netlify's UI as described in step 2.
