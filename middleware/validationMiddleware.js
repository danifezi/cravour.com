
const { processRequestBody } = require('zod-express-middleware');

/**
 * Creates a validation middleware using a Zod schema.
 * It processes the request body and returns a 400 Bad Request error
 * if the validation fails, with details about the validation errors.
 *
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 * @returns Express middleware function.
 */
const validate = (schema) => processRequestBody(schema);

module.exports = validate;
