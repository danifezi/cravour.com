
import * as api from './ai';
import { showToast } from './utils';
import { AdCopy } from './types';

export function setupCravourAdsPage() {
    document.getElementById('cravourAdsForm')?.addEventListener('submit', handleGenerateAd);
}

async function handleGenerateAd(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const description = (form.querySelector('#adDescription') as HTMLTextAreaElement).value;
    const resultsContainer = document.getElementById('adResultsContainer')!;
    const button = form.querySelector('button') as HTMLButtonElement;
    
    if (description.trim().length < 15) {
        return showToast('Please provide a more detailed description.', 'error');
    }
    
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    resultsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Generating text & image...</p></div>';
    
    try {
        const adCreative = await api.generateAdCopy(description);
        renderAdCopy(adCreative, resultsContainer);
    } catch (error: any) {
        showToast(error.response?.data?.error || 'Failed to generate ad creative.', 'error');
        resultsContainer.innerHTML = `<div class="empty-state">${error.response?.data?.error || 'Failed to generate ad creative.'}</div>`;
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
                    <div class="ad-copy-section"><h5>Headline</h5><div class="copy-content">${copy.headline}</div><button class="copy-button" title="Copy Headline"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section"><h5>Body</h5><div class="copy-content">${copy.body}</div><button class="copy-button" title="Copy Body"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section"><h5>Call to Action</h5><div class="copy-content">${copy.callToAction}</div><button class="copy-button" title="Copy Call to Action"><i class="far fa-copy"></i></button></div>
                    <div class="ad-copy-section ad-hashtags"><h5>Hashtags</h5><div class="copy-content">${copy.hashtags.map(tag => `<span>${tag}</span>`).join('')}</div><button class="copy-button" title="Copy Hashtags"><i class="far fa-copy"></i></button></div>
                </div>
            </div>
        </div>`;
    
    // Attach copy-to-clipboard functionality
    container.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const textToCopy = (button.parentElement!.querySelector('.copy-content') as HTMLElement).innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Copied to clipboard!', 'success', 2000);
            }).catch(err => console.error('Copy failed', err));
        });
    });
}
