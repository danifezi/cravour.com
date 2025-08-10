
import { onRequest } from 'firebase-functions/v2/https';
import { onUserCreated } from 'firebase-functions/v2/auth';
import express, { Application, json } from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/errorMiddleware';
import apiRouter from './routes/api';
import { initializeFirebaseAdmin, firebaseService } from './services/firebaseService';

// The global Express Request type is now augmented only in `src/types/index.d.ts`
// to avoid declaration conflicts.

// Initialize services that need to start once
initializeFirebaseAdmin();

const app: Application = express();

// --- MIDDLEWARE ---
app.use(cors({ origin: true }));
app.use(json());

// --- API ROUTING ---
app.use('/', apiRouter);

// --- ERROR HANDLING ---
app.use(errorMiddleware);

// --- CLOUD FUNCTION EXPORT ---
// Cast to `any` to resolve type incompatibilities between Express and Firebase Functions v2
export const api = onRequest(app as any);

// --- Firebase Auth Trigger ---
export const createuserprofile = onUserCreated(async (event) => {
    const user = event.data;
    const { uid, email, displayName } = user;
    if (email && uid) {
        try {
            await firebaseService.createUserProfile(uid, email, displayName || 'New User');
            console.log(`Successfully created profile for UID: ${uid}`);
        } catch (error) {
            console.error(`Failed to create profile for UID: ${uid}`, error);
        }
    }
});
