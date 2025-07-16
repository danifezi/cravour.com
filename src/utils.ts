
/**
 * Displays a loading spinner in a given container.
 * @param {HTMLElement} container The HTML element to show the spinner in.
 */
export function showLoadingSpinner(container: HTMLElement): void {
    container.innerHTML = '<div class="loading-spinner"></div>';
}

/**
 * Displays an error message in a given container.
 * @param {HTMLElement} container The HTML element to show the error in.
 * @param {string} message The error message to display.
 */
export function showErrorMessage(container: HTMLElement, message: string): void {
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}

/**
 * Retries a promise-based function with a delay.
 * @param {() => Promise<T>} fn The function to retry.
 * @param {number} retries The number of retries.
 * @param {number} delay The delay between retries in ms.
 * @returns {Promise<T>}
 */
export async function withRetry<T>(
    fn: () => Promise<T>, 
    retries: number = 2, 
    delay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < retries) {
                console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}
