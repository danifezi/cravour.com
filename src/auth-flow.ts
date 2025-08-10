import { 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './utils';
import { UserCredentials, UserRegistrationData } from './types';

export async function registerUser(userData: UserRegistrationData) {
    if (!auth) throw new Error('Authentication service is not configured.');
    const { email, password, name } = userData;

    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Step 2: Update the user's display name in Firebase Auth.
    // The backend `onCreate` trigger will handle creating the Firestore profile.
    await updateProfile(userCredential.user, { displayName: name });
    
    return userCredential;
}

export async function loginUser(credentials: UserCredentials) {
    if (!auth) throw new Error('Authentication service is not configured.');
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password);
}
