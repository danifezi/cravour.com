import { JWTToken } from "./types";

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

/**
 * Shows a status message inside a specific container, ideal for form feedback.
 * @param container The HTML element where the message should be displayed.
 * @param message The text message to show.
 * @param type The type of message which determines its appearance.
 */
export function showStatusMessage(container: HTMLElement | null, message: string, type: 'success' | 'error' | 'info' | 'loading') {
    if (!container) return;
    container.classList.remove('hidden');
    container.className = 'status-area'; // Reset classes
    if (type === 'loading') {
        container.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>${message}</p></div>`;
    } else {
        container.className = `status-area ${type}-message`;
        container.innerHTML = `<p>${message}</p>`;
    }
}

/**
 * Hides a status message container.
 * @param container The HTML element to hide.
 */
export function hideStatusMessage(container: HTMLElement | null) {
    if (!container) return;
    container.classList.add('hidden');
    container.innerHTML = '';
}


// --- Global Toast Notification System ---
type ToastType = 'success' | 'error' | 'info';

const toastIcons: Record<ToastType, string> = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle'
};

/**
 * Displays a non-blocking toast notification.
 * @param message The message to display in the toast.
 * @param type The type of toast, controlling its color and icon.
 * @param duration How long the toast should be visible in milliseconds.
 */
export function showToast(message: string, type: ToastType = 'info', duration: number = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${toastIcons[type]}"></i><p>${message}</p>`;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Set timeout to remove the toast
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}