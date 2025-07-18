
import * as api from './ai';
import { showToast, showStatusMessage } from './utils';
import { PaystackInlineSuccessResponse } from './types';
import PaystackPop from '@paystack/inline-js';
import { getAuth } from 'firebase/auth';

export function setupFundWalletPage() {
    document.getElementById('fundWalletForm')?.addEventListener('submit', handleFundWallet);
}

function handleFundWallet(e: Event) {
    e.preventDefault();
    
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || !process.env.PAYSTACK_PUBLIC_KEY) {
        return showToast("Payment service is not configured.", 'error');
    }

    const amountInput = document.getElementById('amount') as HTMLInputElement;
    const amount = Number(amountInput.value);
    const statusEl = document.getElementById('paymentStatus')!;

    if (isNaN(amount) || amount < 100) {
        showStatusMessage(statusEl, 'Please enter a valid amount (minimum ₦100).', 'error');
        return;
    }

    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: process.env.PAYSTACK_PUBLIC_KEY,
        email: currentUser.email!,
        amount: amount * 100,
        onSuccess: async (transaction: PaystackInlineSuccessResponse) => {
            showStatusMessage(statusEl, 'Verifying payment...', 'info', true);
            try {
                const result = await api.verifyPayment(transaction.reference);
                showStatusMessage(statusEl, result.message, 'success');
                showToast(result.message, 'success');
                amountInput.value = '';
            } catch (error: any) {
                const message = error.response?.data?.message || 'Verification failed.';
                showStatusMessage(statusEl, message, 'error');
            }
        },
        onCancel: () => showStatusMessage(statusEl, 'Payment was cancelled.', 'info'),
    });
}
