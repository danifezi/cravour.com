import { z } from 'zod';

export const descriptionSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long."),
});

export const waitlistSchema = z.object({
    email: z.string().email("A valid email address is required."),
});

export const addTransactionSchema = z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.preprocess((val) => Number(val), z.number().positive("Amount must be a positive number")),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    type: z.enum(['in', 'out']),
    category: z.string().min(1, "Category is required"),
    planId: z.string().optional().or(z.literal('')),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, "Payment reference is required."),
});

export const updatePlanSchema = z.object({
    status: z.enum(['active', 'paused']),
});
