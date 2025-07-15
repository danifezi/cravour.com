import sanitizeHtml from 'sanitize-html';
import { CacheEntry } from './types';
import { API_CONFIG } from './config/constants';

export function showToast(message: string, type: 'success' | 'error' = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${sanitizeInput(message)}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

export function showLoadingSpinner(container: HTMLElement, type: 'card' | 'text' | 'generic' = 'generic') {
    let content = '';
    if (type === 'card') {
        content = Array(3).fill('<div class="skeleton skeleton-card" style="margin-bottom: 15px;"></div>').join('');
    } else if (type === 'text') {
        content = `
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div class="skeleton skeleton-text" style="width: 90%;"></div>
            <div class="skeleton skeleton-text" style="width: 70%;"></div>
        `;
    } else {
        content = '<div class="loading-spinner" aria-label="Loading content"></div>';
    }
    requestAnimationFrame(() => { container.innerHTML = content; });
}

export function showErrorMessage(container: HTMLElement, message: string) {
    requestAnimationFrame(() => {
        container.innerHTML = `<div class="error-message"><p>${sanitizeInput(message)}</p></div>`;
    });
}

export function sanitizeInput(input: string): string {
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {}
    });
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function getCachedData<T>(key: string): T | null {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const entry: CacheEntry<T> = JSON.parse(cached);
        if (Date.now() - entry.timestamp > API_CONFIG.CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return entry.data;
    } catch (e) {
        console.error(`Error retrieving cache for key ${key}:`, e);
        localStorage.removeItem(key);
        return null;
    }
}

export function setCachedData<T>(key: string, data: T) {
    try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now() };
        localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
        console.error(`Error setting cache for key ${key}:`, e);
    }
}
