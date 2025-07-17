import { JWTToken } from "./types";

/**
 * Displays a loading message in a given container.
 * @param container The HTML element to show the spinner in.
 * @param message The message to display.
 */
export function showLoading(container: HTMLElement, message: string = "Loading..."): void {
    container.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>${message}</p></div>`;
    container.className = 'status-area';
    container.classList.remove('hidden');
}

/**
 * Displays a status message in a given container.
 * @param container The HTML element to show the message in.
 * @param message The message to display.
 * @param type The type of message ('success', 'error', 'info').
 */
export function showMessage(container: HTMLElement, message: string, type: 'success' | 'error' | 'info'): void {
    container.className = `status-area ${type}-message`;
    container.innerHTML = `<p>${message}</p>`;
    container.classList.remove('hidden');
}

/**
 * Hides a status message container.
 * @param container The HTML element to hide.
 */
export function hideMessage(container: HTMLElement): void {
    container.classList.add('hidden');
    container.innerHTML = '';
}

/**
 * Decodes a JWT token to extract its payload without verifying the signature.
 * @param token The JWT string.
 * @returns The decoded payload object or null if decoding fails.
 */
export function decodeJwt(token: string): JWTToken | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
}
