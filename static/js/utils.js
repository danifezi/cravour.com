
/**
 * Displays a loading spinner in a given container.
 * @param {HTMLElement} container The HTML element to show the spinner in.
 */
export function showLoadingSpinner(container) {
    container.innerHTML = '<div class="loading-spinner"></div>';
}

/**
 * Displays an error message in a given container.
 * @param {HTMLElement} container The HTML element to show the error in.
 * @param {string} message The error message to display.
 */
export function showErrorMessage(container, message) {
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}