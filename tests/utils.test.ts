import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { sanitizeInput, debounce, getCachedData, setCachedData, showToast } from '../src/utils';

// Mock localStorage
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

// Mock DOM elements
document.body.innerHTML = '<div id="toast-container"></div>';

// Mock timers
jest.useFakeTimers();

describe('Utility Functions', () => {

    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
        jest.clearAllTimers();
        document.getElementById('toast-container')!.innerHTML = '';
    });

    test('sanitizeInput should remove HTML tags', () => {
        const input = '<script>alert("xss")</script><b>Hello</b>';
        const expected = 'Hello';
        expect(sanitizeInput(input)).toBe(expected);
    });

    test('debounce should delay function execution', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, 100);

        debouncedFunc();
        debouncedFunc();
        expect(func).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);
        expect(func).toHaveBeenCalledTimes(1);
    });

    test('setCachedData and getCachedData should work correctly', () => {
        const key = 'test-key';
        const data = { value: 'test' };
        
        setCachedData(key, data);
        expect(localStorageMock.setItem).toHaveBeenCalled();
        
        const retrievedData = getCachedData(key);
        expect(retrievedData).toEqual(data);
    });

    test('getCachedData should return null for expired data', () => {
        const key = 'expired-key';
        const data = { value: 'old' };
        setCachedData(key, data);

        // Fast-forward time past the TTL
        jest.spyOn(Date, 'now').mockImplementation(() => new Date().getTime() + 2 * 60 * 60 * 1000);

        const retrievedData = getCachedData(key);
        expect(retrievedData).toBeNull();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(key);
        
        jest.spyOn(Date, 'now').mockRestore();
    });
    
    test('showToast should create and append a toast message', () => {
        showToast('Test message', 'success');
        const toastContainer = document.getElementById('toast-container');
        expect(toastContainer!.children.length).toBe(1);
        const toast = toastContainer!.firstChild as HTMLElement;
        expect(toast.textContent).toContain('Test message');
        expect(toast.classList.contains('success')).toBe(true);

        jest.advanceTimersByTime(3000);
        expect(toastContainer!.children.length).toBe(0);
    });
});