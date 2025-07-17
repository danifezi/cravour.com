
const axios = require('axios');
const firebaseService = require('./firebaseService');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = 'https://api.paystack.co';

/**
 * Verifies a Paystack transaction and funds the user's wallet upon success.
 * @param {string} reference - The payment reference from Paystack.
 * @param {string} userId - The ID of the user to fund.
 * @returns {Promise<object>} An object containing the status and message of the verification.
 */
async function verifyPayment(reference, userId) {
    if (!PAYSTACK_SECRET_KEY) {
        console.error("Paystack secret key is not configured.");
        throw new Error("Payment verification service is not configured.");
    }
    try {
        const response = await axios.get(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
        });

        const { status, data } = response.data;
        if (status && data.status === 'success') {
            const amount = data.amount / 100; // Paystack amount is in kobo
            
            // TODO: A more robust implementation would check if the reference has been processed before
            // in the database to prevent re-funding from the same successful transaction.
            
            await firebaseService.addFundsToWallet(userId, amount, data.reference);
            
            return { status: 'success', message: `Payment of ₦${amount.toLocaleString()} was successful!` };
        } else {
            return { status: 'error', message: data.message || "Payment verification failed." };
        }
    } catch (error) {
        console.error("Paystack verification error:", error.response?.data || error.message);
        throw new Error("An error occurred during payment verification.");
    }
}

module.exports = { verifyPayment };
