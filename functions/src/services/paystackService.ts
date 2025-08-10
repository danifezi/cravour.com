import axios from 'axios';
import { ApiError } from '../middleware/errorMiddleware';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_BASE_URL = 'https://api.paystack.co';

function ensurePaystackReady() {
    if (!PAYSTACK_SECRET_KEY) {
        throw new ApiError("Payment service is not configured on the server. Please contact support.", 503);
    }
}

export const paystackService = {
    verifyTransaction: async (reference: string): Promise<{ amount: number }> => {
        ensurePaystackReady();
        try {
            const response = await axios.get(`${PAYSTACK_API_BASE_URL}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
            });
            
            const { data } = response.data;
    
            if (data.status !== 'success') {
                throw new ApiError(`Transaction was not successful: ${data.gateway_response}`, 400);
            }
    
            return { amount: data.amount }; // amount is in kobo
    
        } catch (error: any) {
            console.error(`Paystack verification failed for ref ${reference}:`, error.response?.data?.message || error.message);
            throw new ApiError(error.response?.data?.message || "Could not verify payment with Paystack.", error.response?.status || 500);
        }
    }
};
