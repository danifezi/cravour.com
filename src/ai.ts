import axios from 'axios';
import { ShoppingPlan, DashboardReport, HistoricalPricePoint, PaystackVerificationResponse, PlanItem } from './types';

const API_BASE_URL = '/api';

// Helper to get authenticated headers
function getAuthHeaders() {
  const token = localStorage.getItem('cravour_token');
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Registers a new user via the backend.
 * @param userData The user's registration details.
 * @returns A promise that resolves to the server's response (token and user info).
 */
export async function registerUser(userData: any) {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
}

/**
 * Logs in a user via the backend.
 * @param credentials The user's email and password.
 * @returns A promise that resolves to the server's response (token and user info).
 */
export async function loginUser(credentials: any) {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
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
      { headers: getAuthHeaders() }
    );
    return response.data;
}

/**
 * Fetches all financial plans for the authenticated user.
 * @returns A promise that resolves to an array of PlanItem objects.
 */
export async function getPlans(): Promise<PlanItem[]> {
    const response = await axios.get<PlanItem[]>(`${API_BASE_URL}/plans`, { headers: getAuthHeaders() });
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
        { headers: getAuthHeaders() }
    );
    return response.data;
}

/**
 * Deletes a specific plan.
 * @param planId The ID of the plan to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export async function deletePlan(planId: string): Promise<any> {
    const response = await axios.delete(`${API_BASE_URL}/plans/${planId}`, { headers: getAuthHeaders() });
    return response.data;
}


/**
 * Generates a financial dashboard report by calling the backend service.
 * @returns A promise that resolves to a DashboardReport object.
 */
export async function generateDashboardReport(): Promise<DashboardReport> {
    const response = await axios.post<DashboardReport>(
      `${API_BASE_URL}/generateDashboard`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
}

/**
 * Adds a new transaction for the user.
 * @param transactionData The data for the new transaction.
 * @returns A promise that resolves with the server's confirmation message.
 */
export async function addTransaction(transactionData: any) {
    const response = await axios.post(`${API_BASE_URL}/addTransaction`, transactionData, {
        headers: getAuthHeaders(),
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
        `${API_BASE_URL}/categorizeTransaction`,
        { description },
        { headers: getAuthHeaders() }
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
        `/api/verifyPayment`,
        { reference },
        { headers: getAuthHeaders() }
    );
    return response.data;
}