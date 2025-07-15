import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GoogleGenAI } from "@google/genai";
import { fetchPriceData, generatePlan, generatePriceReportForPlan, findMerchantsForPlan, fetchExpenseReport } from '../src/ai';
import { setCachedData, getCachedData } from '../src/utils';
import { API_CONFIG, FALLBACK_DATA } from '../src/config/constants';

// Instruct Jest to use an automatic mock for the @google/genai module
jest.mock('@google/genai');

// Infer Jest's mock type from an actual mock function.
// This is a workaround for environments where Jest's global types are not automatically recognized.
const _jestFn = jest.fn();
type JestMock = typeof _jestFn;

// Get a handle on the mocked class constructor
const mockGoogleGenAI = GoogleGenAI as JestMock;
// Create a persistent mock function for the generateContent method
const mockGenerateContent = jest.fn();

// Mock localStorage for caching tests
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: jest.fn((key: string) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

process.env.GEMINI_API_KEY = 'mock-api-key';

describe('AI Functions', () => {

    beforeEach(() => {
        // Clear mock history and implementations before each test
        mockGenerateContent.mockClear();
        mockGoogleGenAI.mockClear();
        localStorageMock.clear();
        jest.clearAllMocks();

        // Before each test, we configure the mock implementation.
        // When `new GoogleGenAI()` is called in `ai.ts`, it will return our mock object.
        mockGoogleGenAI.mockImplementation(() => ({
            models: {
                generateContent: mockGenerateContent,
            },
        }));
    });

    describe('fetchPriceData', () => {
        it('should return cached data if available', async () => {
            setCachedData('cravour-price-data', FALLBACK_DATA.PRICE_DATA);
            const result = await fetchPriceData();
            expect(result).toEqual(FALLBACK_DATA.PRICE_DATA);
            // Ensure the AI was not called because cached data was used
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it('should fetch from AI and cache if not in cache', async () => {
            const aiResponse = [{ itemName: "Test Rice", currentPrice: 100, priceChange: 10 }];
            mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(aiResponse) });

            const result = await fetchPriceData();

            expect(result).toEqual(aiResponse);
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            // Verify that the new data was cached
            expect(localStorageMock.setItem).toHaveBeenCalledWith('cravour-price-data', expect.any(String));
        });

        it('should return fallback data on AI failure after retries', async () => {
            // Mock the AI call to consistently fail
            mockGenerateContent.mockRejectedValue(new Error('AI network error'));
            
            const result = await fetchPriceData();
            
            expect(result).toEqual(FALLBACK_DATA.PRICE_DATA);
            // Expect initial call + 2 retries
            expect(mockGenerateContent).toHaveBeenCalledTimes(API_CONFIG.MAX_RETRIES + 1);
        });
    });

    describe('generatePlan', () => {
        it('should return a valid plan on success', async () => {
            const aiResponse = { estimatedTotal: 500, items: [{itemName: 'a', category: 'b', quantity: 'c', estimatedPrice: 500}] };
            mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(aiResponse) });
            
            const result = await generatePlan('test');
            
            expect(result).toEqual(aiResponse);
        });
        
        it('should return empty plan fallback on AI failure', async () => {
            mockGenerateContent.mockRejectedValue(new Error('AI error'));
            
            const result = await generatePlan('test');
            
            expect(result).toEqual(FALLBACK_DATA.EMPTY_PLAN);
        });
    });
    
    describe('generatePriceReportForPlan', () => {
        const mockItems = [{ itemName: 'Rice', category: 'Food', quantity: '1kg', estimatedPrice: 500 }];
        
        it('should return a valid report on success', async () => {
            const aiResponse = { overallSummary: 's', savingTips: 't', itemReports: [{itemName: 'Rice', averagePrice: '500', stability: 'Stable'}]};
            mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(aiResponse) });
            
            const result = await generatePriceReportForPlan(mockItems);

            expect(result).toEqual(aiResponse);
        });
        
        it('should return empty report fallback on AI failure', async () => {
            mockGenerateContent.mockRejectedValue(new Error('AI error'));

            const result = await generatePriceReportForPlan(mockItems);

            expect(result).toEqual(FALLBACK_DATA.EMPTY_PRICE_REPORT);
        });
    });

    describe('findMerchantsForPlan', () => {
        const mockItems = [{ itemName: 'TV', category: 'Electronics', quantity: '1', estimatedPrice: 100000 }];
        const mockLocation = { city: 'Lagos', lga: 'Ikeja' };

        it('should return merchants on success', async () => {
            const aiResponse = [{ name: 'm1', address: 'a1', deals: 'd1'}];
            mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(aiResponse) });
            
            const result = await findMerchantsForPlan(mockItems, mockLocation);
            
            expect(result).toEqual(aiResponse);
        });

        it('should return empty merchants fallback on AI failure', async () => {
            mockGenerateContent.mockRejectedValue(new Error('AI error'));
            
            const result = await findMerchantsForPlan(mockItems, mockLocation);

            expect(result).toEqual(FALLBACK_DATA.EMPTY_MERCHANTS);
        });
    });

    describe('fetchExpenseReport', () => {
        it('should return a valid report from AI', async () => {
            const aiResponse = FALLBACK_DATA.EXPENSE_REPORT;
            mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify(aiResponse) });
            
            const result = await fetchExpenseReport();

            expect(result).toEqual(aiResponse);
        });

        it('should return fallback data on AI failure', async () => {
            mockGenerateContent.mockRejectedValue(new Error('AI error'));
            
            const result = await fetchExpenseReport();
            
            expect(result).toEqual(FALLBACK_DATA.EXPENSE_REPORT);
        });
    });
});