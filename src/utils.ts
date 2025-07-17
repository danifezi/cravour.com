/**
 * Shows a status message inside a specific container, ideal for form feedback.
 * @param container The HTML element where the message should be displayed.
 * @param message The text message to show.
 * @param type The type of message which determines its appearance.
 * @param withSpinner Show a spinner alongside the message.
 */
export function showStatusMessage(container: HTMLElement | null, message: string, type: 'success' | 'error' | 'info', withSpinner = false) {
    if (!container) return;
    container.classList.remove('hidden');
    container.className = 'status-area'; // Reset classes
    
    let spinnerHtml = withSpinner ? '<div class="loading-spinner"></div>' : '';
    
    container.className = `status-area ${type}-message`;
    container.innerHTML = `<div class="loading-state">${spinnerHtml}<p>${message}</p></div>`;
}

/**
 * Hides a status message container, optionally after a delay.
 * @param container The HTML element to hide.
 * @param delay The delay in milliseconds before hiding.
 */
export function hideStatusMessage(container: HTMLElement | null, delay?: number) {
    if (!container) return;
    if (delay) {
        setTimeout(() => {
            container.classList.add('hidden');
            container.innerHTML = '';
        }, delay);
    } else {
        container.classList.add('hidden');
        container.innerHTML = '';
    }
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
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `<i class="fas ${toastIcons[type]}"></i><p>${message}</p>`;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Set timeout to remove the toast
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}
