const { z } = require('zod');

const descriptionSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters long."),
});

const waitlistSchema = z.object({
    email: z.string().email("A valid email address is required."),
});


module.exports = {
    descriptionSchema,
    waitlistSchema,
};
