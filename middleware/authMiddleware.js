
const admin = require('firebase-admin');

/**
 * Middleware to authenticate requests by verifying a Firebase ID token.
 * The token is expected in the 'Authorization: Bearer <token>' header.
 * If valid, it attaches the decoded token (containing user UID) to `req.user`.
 * Throws an error if the token is missing, malformed, or invalid.
 */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Decoded token contains uid, email, etc.
        next();
    } catch (error) {
        console.error("Firebase Auth Error:", error.message);
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' });
    }
}

module.exports = authenticateToken;
