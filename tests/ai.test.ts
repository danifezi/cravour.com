
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { GoogleGenAI } from "@google/genai";
import { shoppingPlanSchema } from '../src/config/constants';
import { ShoppingPlan } from '../src/types';

// Mock the @google/genai module. This happens before any imports.
jest.mock('@google/genai');

const MockedGoogleGenAI = GoogleGenAI as jest.Mock;

// By explicitly typing the mock function, we provide TypeScript with the
// necessary information about its parameters and return value, resolving 'any'/'unknown' issues.
const mockGenerateContent = jest.fn<(args: {
    model: string;
    contents: string;
    config: {
        responseMimeType: string;
        responseSchema: any;
    };
}) => Promise<{ text: string }>>();

// The mock constructor for GoogleGenAI returns an object with our mock method.
MockedGoogleGenAI.mockImplementation(() => ({
    models: {
        generateContent: mockGenerateContent,
    },
}));

// Dynamically import the module under test to handle changes to process.env.
let generateShoppingPlan: (description: string) => Promise<ShoppingPlan>;

describe('AI Function: generateShoppingPlan', () => {
    const originalApiKey = process.env.API_KEY;

    beforeEach(async () => {
        // Reset mocks and environment before each test
        mockGenerateContent.mockClear();
        MockedGoogleGenAI.mockClear();
        
        // Ensure a valid API key is set for most tests
        process.env.API_KEY = 'mock-api-key-for-testing';

        // Re-import the module to apply environment changes
        const aiModule = await import('../src/ai');
        generateShoppingPlan = aiModule.generateShoppingPlan;
    });

    afterEach(() => {
        // Restore original environment and reset modules
        process.env.API_KEY = originalApiKey;
        jest.resetModules();
    });

    it('should successfully call the AI and return parsed JSON data', async () => {
        const description = "I want to buy milk and bread in Ikeja with a budget of 2000 NGN.";
        const mockAiResponseData: ShoppingPlan = {
            budgetAnalysis: { userBudget: 2000, estimatedCost: 1500, difference: 500, summary: "Budget is sufficient." },
            budgetItems: [{ itemName: "Milk", quantity: "1 tin", estimatedPrice: 1200 }, { itemName: "Bread", quantity: "1 loaf", estimatedPrice: 300 }],
            priceAnalysis: [{ itemName: "Milk", priceStability: "Stable", savingTip: "Buy powdered milk for longer shelf life." }],
            recommendedMerchants: [{ name: "Shoprite", address: "Ikeja City Mall", deals: "Weekly deals available." }]
        };
        
        mockGenerateContent.mockResolvedValue({
            text: JSON.stringify(mockAiResponseData),
        });

        const result = await generateShoppingPlan(description);

        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const callArgs = mockGenerateContent.mock.calls[0][0];
        expect(callArgs.model).toBe("gemini-2.5-flash");
        expect(callArgs.contents).toContain(description);
        expect(callArgs.config.responseSchema).toEqual(shoppingPlanSchema);
        expect(result).toEqual(mockAiResponseData);
    });

    it('should throw a specific error when the AI service call fails', async () => {
        const description = "some goal";
        const aiError = new Error("Network failure");
        mockGenerateContent.mockRejectedValue(aiError);
        
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(generateShoppingPlan(description)).rejects.toThrow(
            "Failed to generate a shopping plan from the AI service."
        );
        
        expect(consoleSpy).toHaveBeenCalledWith("AI Generation Error:", aiError);
        consoleSpy.mockRestore();
    });

    it('should throw an error if API key is not configured', async () => {
        process.env.API_KEY = '';

        // We need to re-import the module for the new env variable to be picked up
        const { generateShoppingPlan: newGenerateShoppingPlan } = await import('../src/ai');
        
        await expect(newGenerateShoppingPlan('any description')).rejects.toThrow(
            'API key is missing. Please configure your environment variables.'
        );

        expect(mockGenerateContent).not.toHaveBeenCalled();
    });
});
