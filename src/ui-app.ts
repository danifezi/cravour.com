
import { auth } from './utils';
import type { User } from 'firebase/auth';

export function initAppUI(user: User) {
    setupLogout();
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', async () => {
        if (!auth) {
            console.error("Logout failed: Authentication service is not configured.");
            return;
        }
        try {
            await auth.signOut();
            // The onAuthStateChanged listener in app.ts will handle the redirect.
        } catch (error) {
            console.error("Logout failed:", error);
        }
    });
}
