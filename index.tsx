
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI instance with a fallback for deployment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Main entry point: Sets up the UI once the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    setupUI();
    setupCravourAI();
});

/**
 * Sets up general UI event listeners, like the mobile navigation.
 */
function setupUI() {
    const hamburger = document.querySelector('.hamburger');
    const headerNav = document.querySelector('.header-nav');

    if (hamburger && headerNav) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('is-active');
            headerNav.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive.toString());
        });

        document.querySelectorAll('.header-nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (headerNav.classList.contains('active')) {
                    hamburger.classList.remove('is-active');
                    headerNav.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear().toString();
    }
}

/**
 * Displays a loading spinner in a given container.
 * @param container The HTML element to show the spinner in.
 */
function showLoadingSpinner(container: HTMLElement) {
    container.innerHTML = '<div class="loading-spinner"></div>';
}

/**
 * Displays an error message in a given container.
 * @param container The HTML element to show the error in.
 * @param message The error message to display.
 */
function showErrorMessage(container: HTMLElement, message: string) {
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}

/**
 * Sets up the event listener for the main "Cravour AI" form submission.
 */
function setupCravourAI() {
    const generatePlanBtn = document.getElementById('generatePlanBtn');
    if (generatePlanBtn) {
        generatePlanBtn.addEventListener('click', generateShoppingPlan);
    }
}

/**
 * The core function that handles the AI request and renders the results.
 */
async function generateShoppingPlan() {
    const descriptionEl = document.getElementById('planDescription') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('shopping-plan-results');

    if (!descriptionEl || !resultsContainer) return;

    const description = descriptionEl.value;
    if (description.trim().length < 10) {
        showErrorMessage(resultsContainer, "Please provide a more detailed shopping goal (e.g., items, budget, and location).");
        return;
    }

    showLoadingSpinner(resultsContainer);

    // Define the comprehensive JSON structure we expect from the AI
    const shoppingPlanSchema = {
        type: Type.OBJECT,
        properties: {
            budgetAnalysis: {
                type: Type.OBJECT,
                properties: {
                    userBudget: { type: Type.NUMBER, description: "The budget amount mentioned by the user." },
                    estimatedCost: { type: Type.NUMBER, description: "The AI's total estimated cost for all items." },
                    difference: { type: Type.NUMBER, description: "The difference between userBudget and estimatedCost." },
                    summary: { type: Type.STRING, description: "A brief, sharp summary, like 'Your budget is sufficient' or 'You are over budget'." }
                },
                required: ["userBudget", "estimatedCost", "difference", "summary"]
            },
            budgetItems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        itemName: { type: Type.STRING },
                        quantity: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER }
                    },
                    required: ["itemName", "quantity", "estimatedPrice"]
                }
            },
            priceAnalysis: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        itemName: { type: Type.STRING },
                        priceStability: { type: Type.STRING, description: "e.g., 'Stable', 'Slight Increase', 'Volatile'" },
                        savingTip: { type: Type.STRING, description: "An actionable tip for this specific item." }
                    },
                    required: ["itemName", "priceStability", "savingTip"]
                }
            },
            recommendedMerchants: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        address: { type: Type.STRING, description: "Location within the specified area." },
                        deals: { type: Type.STRING, description: "What they are known for or their current deals." }
                    },
                    required: ["name", "address", "deals"]
                }
            }
        },
        required: ["budgetAnalysis", "budgetItems", "priceAnalysis", "recommendedMerchants"]
    };

    // Construct the detailed prompt for the AI
    const prompt = `A user in Nigeria provides the following shopping goal: "${description}". 
    From this text, extract the items, the user's total budget, and their location (e.g., city/area).
    Then, generate a complete shopping plan based on current, realistic Nigerian market prices (in NGN).
    Your response must be a single JSON object that includes:
    1.  A 'budgetAnalysis' object comparing the user's budget to the AI-estimated total cost.
    2.  A 'budgetItems' array detailing each item, its quantity, and its AI-estimated price.
    3.  A 'priceAnalysis' array for each item, commenting on its current price stability and offering a specific saving tip.
    4.  A 'recommendedMerchants' array of 3-4 real-sounding local merchants in the user's specified location that are suitable for purchasing these items.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: shoppingPlanSchema,
            },
        });

        const data = JSON.parse(response.text);
        renderShoppingPlan(data, resultsContainer);

    } catch (err) {
        console.error("Error generating shopping plan:", err);
        showErrorMessage(resultsContainer, "The AI couldn't generate a shopping plan. Please try rephrasing your goal to be more specific about items, budget, and your location.");
    }
}

/**
 * Renders the entire multi-section shopping plan report.
 * @param data The JSON data object from the AI.
 * @param container The HTML element to render the results into.
 */
function renderShoppingPlan(data: any, container: HTMLElement) {
    // --- 1. Budget Analysis Section ---
    const budget = data.budgetAnalysis;
    const differenceClass = budget.difference >= 0 ? 'success' : 'error';
    const budgetHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. Market Prices</h3>
            <div class="summary-grid">
                <div class="summary-card">
                    <h4>Your Budget</h4>
                    <p>₦${budget.userBudget.toLocaleString()}</p>
                </div>
                <div class="summary-card">
                    <h4>AI Estimated Cost</h4>
                    <p>₦${budget.estimatedCost.toLocaleString()}</p>
                </div>
                <div class="summary-card">
                    <h4>Difference</h4>
                    <p class="${differenceClass}">₦${Math.abs(budget.difference).toLocaleString()}</p>
                </div>
            </div>
            <p class="summary-text">${budget.summary}</p>
            <table class="plan-result-table">
                <thead>
                    <tr><th>Item</th><th>Quantity</th><th>Est. Price</th></tr>
                </thead>
                <tbody>
                    ${data.budgetItems.map((item: any) => `
                        <tr>
                            <td>${item.itemName}</td>
                            <td>${item.quantity}</td>
                            <td>₦${item.estimatedPrice.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // --- 2. Price Analysis & Savings Tips Section ---
    const analysisHtml = `
        <div class="result-section">
            <h3 class="result-heading">AI Price & Savings Report</h3>
            <div class="analysis-grid">
                ${data.priceAnalysis.map((item: any) => `
                    <div class="analysis-card">
                        <h4>${item.itemName}</h4>
                        <p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p>
                        <p class="tip"><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> ${item.savingTip}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // --- 3. Recommended Merchants Section ---
    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Local Merchants</h3>
            <div class="merchant-grid">
                ${data.recommendedMerchants.map((merchant: any) => `
                    <div class="merchant-card">
                        <h4><i class="fas fa-store"></i> ${merchant.name}</h4>
                        <div class="details">
                            <p><i class="fas fa-map-marker-alt"></i> ${merchant.address}</p>
                        </div>
                        <p class="deals"><i class="fas fa-tags"></i> ${merchant.deals}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = budgetHtml + analysisHtml + merchantsHtml;
}
