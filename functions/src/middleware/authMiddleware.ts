
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

/**
 * Middleware to authenticate requests by verifying a Firebase ID token.
 * The token is expected in the 'Authorization: Bearer <token>' header.
 * If valid, it attaches the decoded token (containing user UID) to `req.user`.
 * Throws an error if the token is missing, malformed, or invalid.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
    }
}
