
const { z } = require('zod');

const registerSchema = z.object({
  profile: z.object({
    incomeSource: z.string().optional(),
    monthlyIncome: z.string().optional(), // Comes from form as string
    goals: z.string().optional()
  }).optional()
});

const descriptionSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long."),
});

const addTransactionSchema = z.object({
    description: z.string().min(3, "Description must be at least 3 characters."),
    amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: "Amount must be a positive number."}),
    category: z.string().min(3),
    planId: z.string().optional().or(z.literal('')),
});

const updatePlanStatusSchema = z.object({
    status: z.enum(['active', 'paused']),
});

const verifyPaymentSchema = z.object({
    reference: z.string().min(5),
});

module.exports = {
    registerSchema,
    descriptionSchema,
    addTransactionSchema,
    updatePlanStatusSchema,
    verifyPaymentSchema,
};
