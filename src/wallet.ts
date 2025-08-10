
import PaystackPop from '@paystack/inline-js';
import { auth, showToast } from './utils';
import * as api from './api';
import { loadAndRenderDashboard } from './dashboard';

export function setupFundWalletPage() {
    const form = document.getElementById('fundWalletForm');
    form?.addEventListener('submit', handleFundWallet);
}

function handleFundWallet(e: Event) {
    e.preventDefault();
    if (!auth || !auth.currentUser || !auth.currentUser.email) {
        showToast("You must be logged in to fund your wallet.", 'error');
        return;
    }

    if (!process.env.PAYSTACK_PUBLIC_KEY) {
        showToast("Payment service is not configured. Please contact support.", "error");
        return;
    }

    const form = e.target as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const amountInput = document.getElementById('fundAmount') as HTMLInputElement;
    const amount = Number(amountInput.value) * 100; // Paystack expects amount in kobo

    if (isNaN(amount) || amount < 10000) { // Min 100 NGN
        showToast("Please enter a valid amount (at least ₦100).", 'error');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing...';
    
    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: process.env.PAYSTACK_PUBLIC_KEY,
        email: auth.currentUser.email,
        amount: amount,
        ref: 'cravour_' + Math.floor((Math.random() * 1000000000) + 1), // Unique ref
        onSuccess: async (transaction: any) => {
            try {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
                showToast("Payment successful! Verifying...", 'info');
                await api.verifyPayment(transaction.reference);
                showToast("Wallet funded successfully!", 'success');
                await loadAndRenderDashboard(); // Refresh dashboard to show new balance
                form.reset();
            } catch (error: any) {
                const message = error.response?.data?.error || "Payment verification failed.";
                showToast(message, 'error');
            } finally {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-shield-alt"></i> Proceed to Pay';
            }
        },
        onCancel: () => {
            showToast("Payment cancelled.", 'info');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-shield-alt"></i> Proceed to Pay';
        },
    });
}
