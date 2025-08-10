
import * as api from './api';
import { showToast } from './utils';
import { AdCopy } from './types';

export function setupCravourAdsPage() {
    document.getElementById('cravourAdsForm')?.addEventListener('submit', handleGenerateAd);
}

async function handleGenerateAd(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const descriptionEl = form.querySelector('#adDescription') as HTMLTextAreaElement;
    const resultsContainer = document.getElementById('adResultsContainer');
    const button = form.querySelector('button');
    
    if (!descriptionEl || !resultsContainer || !button) {
        console.error("Ad generator form elements are missing from the DOM.");
        return;
    }
    
    const description = descriptionEl.value;
    if (description.trim().length < 15) {
        return showToast('Please provide a more detailed description.', 'error');
    }
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    resultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating text & image...</p></div>';
    
    try {
        const adCreative = await api.generateAdCreative(description);
        renderAdCopy(adCreative, resultsContainer);
    } catch (error: any) {
        const message = error.response?.data?.error || error.message || 'Failed to generate ad creative.';
        showToast(message, 'error');
        resultsContainer.innerHTML = `<div class="empty-state">${message}</div>`;
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-magic"></i> Generate Creative';
    }
}

function renderAdCopy(copy: AdCopy, container: HTMLElement) {
    container.innerHTML = `
        <div class="ad-result-card">
            <div class="ad-creative-grid">
                <div class="ad-image-column">
                     <img src="${copy.imageUrl}" alt="AI-generated image for: ${copy.headline}" />
                </div>
                <div class="ad-copy-column">
                    <div class="ad-copy-section"><h5>Headline</h5><div class="copy-content" data-copy-text="${copy.headline}">${copy.headline}</div><button class="copy-button" title="Copy Headline"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section"><h5>Body</h5><div class="copy-content" data-copy-text="${copy.body}">${copy.body}</div><button class="copy-button" title="Copy Body"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section"><h5>Call to Action</h5><div class="copy-content" data-copy-text="${copy.callToAction}">${copy.callToAction}</div><button class="copy-button" title="Copy Call to Action"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section ad-hashtags"><h5>Hashtags</h5><div class="copy-content" data-copy-text="${copy.hashtags.join(' ')}">${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}</div><button class="copy-button" title="Copy Hashtags"><i class="far fa-copy"></i></button></div>
                </div>
            </div>
        </div>`;
    
    container.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.closest('.ad-copy-section');
            if (!section) return;
            const content = section.querySelector('.copy-content') as HTMLElement;
            if (!content) return;
            const textToCopy = content.dataset.copyText || content.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Copied to clipboard!', 'success', 2000);
            }).catch(err => {
                console.error('Copy failed', err);
                showToast('Copy failed!', 'error');
            });
        });
    });
}
