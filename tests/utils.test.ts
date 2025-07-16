
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { showLoadingSpinner, showErrorMessage } from '../src/utils';

describe('UI Utility Functions', () => {
    let container: HTMLElement;

    beforeEach(() => {
        // Set up a DOM element as a container for our tests
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up the DOM
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('showLoadingSpinner', () => {
        test('should set the innerHTML to the loading spinner markup', () => {
            showLoadingSpinner(container);
            const spinner = container.querySelector('.loading-spinner');
            expect(spinner).not.toBeNull();
            expect(container.innerHTML).toBe('<div class="loading-spinner"></div>');
        });
    });

    describe('showErrorMessage', () => {
        test('should set the innerHTML to the error message markup with the provided message', () => {
            const message = "Something went wrong.";
            showErrorMessage(container, message);
            const errorDiv = container.querySelector('.error-message');
            const errorParagraph = container.querySelector('p');

            expect(errorDiv).not.toBeNull();
            expect(errorParagraph).not.toBeNull();
            expect(errorParagraph?.textContent).toBe(message);
            expect(container.innerHTML).toBe(`<div class="error-message"><p>${message}</p></div>`);
        });
    });
});
