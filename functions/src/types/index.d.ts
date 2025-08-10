

// This file is for augmenting global types.

// Augment the Express Request type to include a 'user' property.
// This is used by the authMiddleware to pass user data to controllers.
declare global {
  namespace Express {
    export interface Request {
      user: {
        uid: string;
        email?: string;
      };
    }
  }
}

// This export makes the file a module, which is required for global augmentation.
export {};
