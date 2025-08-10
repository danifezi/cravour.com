import axios from 'axios';
import { 
    ShoppingPlan, PlanItem, DashboardReport, AdCopy
} from './types';
import { getIdToken } from 'firebase/auth';
import { auth } from './utils';

const API_BASE_URL = '/api';

// ==================================================================
// Backend API Client
// ==================================================================

// --- Helper for Authenticated Routes ---

async function getAuthHeaders() {
  if (!auth) throw new Error('Authentication service is not configured.');
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication token not found. Please log in.');
  const token = await getIdToken(user);
  return { Authorization: `Bearer ${token}` };
}

// --- Public (Unauthenticated) Routes ---

export async function generateShoppingPlanDemo(description: string): Promise<ShoppingPlan> {
    const response = await axios.post(`${API_BASE_URL}/plans/generate`, { description });
    return response.data;
}

export async function joinWaitlist(email: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/waitlist/join`, { email });
    return response.data;
}


// --- Authenticated Routes ---

// Plans
export async function savePlan(planData: ShoppingPlan & { description: string }): Promise<PlanItem> {
    const response = await axios.post<PlanItem>(
      `${API_BASE_URL}/plans`,
      planData,
      { headers: await getAuthHeaders() }
    );
    return response.data;
}

export async function getPlans(): Promise<PlanItem[]> {
    const response = await axios.get<PlanItem[]>(`${API_BASE_URL}/plans`, { headers: await getAuthHeaders() });
    return response.data;
}

export async function updatePlanStatus(planId: string, status: 'active' | 'paused') {
    return axios.patch(
        `${API_BASE_URL}/plans/${planId}`,
        { status },
        { headers: await getAuthHeaders() }
    );
}

export async function deletePlan(planId: string) {
    return axios.delete(`${API_BASE_URL}/plans/${planId}`, { headers: await getAuthHeaders() });
}

// Dashboard
export async function getDashboardData(): Promise<DashboardReport> {
    const response = await axios.post<DashboardReport>(
      `${API_BASE_URL}/dashboard`,
      {},
      { headers: await getAuthHeaders() }
    );
    return response.data;
}

// Transactions
export async function addTransaction(transactionData: any) {
    const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData, {
        headers: await getAuthHeaders(),
    });
    return response.data;
}

export async function categorizeTransaction(description: string): Promise<{ category: string }> {
    const response = await axios.post(`${API_BASE_URL}/transactions/categorize`, { description }, {
        headers: await getAuthHeaders(),
    });
    return response.data;
}

// Ads
export async function generateAdCreative(description: string): Promise<AdCopy> {
    const response = await axios.post<AdCopy>(`${API_BASE_URL}/ads/generate`, { description }, {
        headers: await getAuthHeaders(),
    });
    return response.data;
}

// Payments
export async function verifyPayment(reference: string): Promise<{ message: string }> {
    const response = await axios.post(`${API_BASE_URL}/payments/verify`, { reference }, {
        headers: await getAuthHeaders(),
    });
    return response.data;
}