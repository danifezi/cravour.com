import axios from 'axios';
import { ShoppingPlan, DashboardReport, PaystackVerificationResponse, PlanItem, AdCopy } from './types';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';

const API_BASE_URL = '/api';

// Helper to get authenticated headers using Firebase ID token
async function getAuthHeaders() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication token not found. Please log in.');
  }
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * Registers a new user via Firebase Auth and our backend.
 * @param userData The user's registration details.
 * @returns A promise that resolves to the user credential.
 */
export async function registerUser(userData: any): Promise<UserCredential> {
    const auth = getAuth();
    const { email, password, ...profile } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Now register the user's profile on our backend
    await axios.post(`${API_BASE_URL}/auth/register`, 
        { profile }, 
        { headers: await getAuthHeaders() }
    );
    return userCredential;
}

/**
 * Logs in a user via Firebase Auth.
 * @param credentials The user's email and password.
 * @returns A promise that resolves to the user credential.
 */
export async function loginUser(credentials: any): Promise<UserCredential> {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password);
}


/**
 * Generates a shopping plan for the unauthenticated landing page demo.
 * @param description User's request for the shopping plan.
 * @returns A promise that resolves to a ShoppingPlan object.
 */
export async function generateShoppingPlanDemo(description: string): Promise<ShoppingPlan> {
    const response = await axios.post<ShoppingPlan>(
      `${API_BASE_URL}/plans/demo`,
      { description }
    );
    return response.data;
}

/**
 * Generates a shopping plan and saves it via the backend AI service.
 * @param description User's request for the shopping plan.
 * @returns A promise that resolves to a ShoppingPlan object.
 */
export async function generateShoppingPlan(description: string): Promise<ShoppingPlan> {
    const response = await axios.post<ShoppingPlan>(
      `${API_BASE_URL}/plans`,
      { description },
      { headers: await getAuthHeaders() }
    );
    return response.data;
}

/**
 * Fetches all financial plans for the authenticated user.
 * @returns A promise that resolves to an array of PlanItem objects.
 */
export async function getPlans(): Promise<PlanItem[]> {
    const response = await axios.get<PlanItem[]>(`${API_BASE_URL}/plans`, { headers: await getAuthHeaders() });
    return response.data;
}

/**
 * Updates the status of a specific plan.
 * @param planId The ID of the plan to update.
 * @param status The new status ('active' or 'paused').
 * @returns A promise that resolves when the update is successful.
 */
export async function updatePlanStatus(planId: string, status: 'active' | 'paused'): Promise<any> {
    const response = await axios.patch(
        `${API_BASE_URL}/plans/${planId}`,
        { status },
        { headers: await getAuthHeaders() }
    );
    return response.data;
}

/**
 * Deletes a specific plan.
 * @param planId The ID of the plan to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export async function deletePlan(planId: string): Promise<any> {
    const response = await axios.delete(`${API_BASE_URL}/plans/${planId}`, { headers: await getAuthHeaders() });
    return response.data;
}


/**
 * Generates a financial dashboard report by calling the backend service.
 * @returns A promise that resolves to a DashboardReport object.
 */
export async function generateDashboardReport(): Promise<DashboardReport> {
    const response = await axios.post<DashboardReport>(
      `${API_BASE_URL}/dashboard`,
      {},
      { headers: await getAuthHeaders() }
    );
    return response.data;
}

/**
 * Adds a new transaction for the user.
 * @param transactionData The data for the new transaction.
 * @returns A promise that resolves with the server's confirmation message.
 */
export async function addTransaction(transactionData: any) {
    const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData, {
        headers: await getAuthHeaders(),
    });
    return response.data;
}

/**
 * Asks the AI to categorize a transaction description.
 * @param description The transaction description text.
 * @returns A promise that resolves to an object with the suggested category.
 */
export async function categorizeTransaction(description: string): Promise<{ category: string }> {
    const response = await axios.post(
        `${API_BASE_URL}/transactions/categorize`,
        { description },
        { headers: await getAuthHeaders() }
    );
    return response.data;
}

/**
 * Verifies a Paystack payment by calling the secure backend endpoint.
 * @param reference The payment reference from Paystack.
 * @returns A promise that resolves to the verification result.
 */
export async function verifyPayment(reference: string): Promise<PaystackVerificationResponse> {
    const response = await axios.post<PaystackVerificationResponse>(
        `/api/payments/verify`,
        { reference },
        { headers: await getAuthHeaders() }
    );
    return response.data;
}

/**
 * Generates social media ad copy and a relevant image from a description.
 * @param description The description of the product or promotion.
 * @returns A promise that resolves to an AdCopy object, now including an imageUrl.
 */
export async function generateAdCopy(description: string): Promise<AdCopy> {
    const response = await axios.post<AdCopy>(
        `${API_BASE_URL}/ads/generate`,
        { description },
        { headers: await getAuthHeaders() }
    );
    return response.data;
}
