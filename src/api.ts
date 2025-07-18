import axios from 'axios';
import { ShoppingPlan } from './types';

const API_BASE_URL = '/api';

/**
 * Generates a shopping plan via the public AI demo endpoint.
 * @param description User's request for the shopping plan.
 * @returns A promise that resolves to a ShoppingPlan object.
 */
export async function generateShoppingPlan(description: string): Promise<ShoppingPlan> {
    const response = await axios.post<ShoppingPlan>(
      `${API_BASE_URL}/plans/generate`,
      { description }
    );
    return response.data;
}

/**
 * Submits an email to the waitlist.
 * @param email The user's email address.
 * @returns A promise that resolves with the server's confirmation message.
 */
export async function joinWaitlist(email: string): Promise<{ message: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/waitlist/join`,
      { email }
    );
    return response.data;
}
