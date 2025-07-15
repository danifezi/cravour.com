
/**
 * Displays a loading spinner in a given container.
 * @param container The HTML element to show the spinner in.
 */
export function showLoadingSpinner(container: HTMLElement) {
    container.innerHTML = '<div class="loading-spinner"></div>';
}

/**
 * Displays an error message in a given container.
 * @param container The HTML element to show the error in.
 * @param message The error message to display.
 */
export function showErrorMessage(container: HTMLElement, message: string) {
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}
