import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, type User, type IdTokenResult } from 'firebase/auth';

export const FIREBASE_PROJECT_ID =
  (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID ||
  '5e6776003cafad3b31f1ef1cadf6b32b39dcda69';

export const firebaseConfig = {
  projectId: FIREBASE_PROJECT_ID,
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyDemokeyPlaceholderForAuth365',
  authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
  storageBucket: `${FIREBASE_PROJECT_ID}.appspot.com`,
};

export function getClientFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function getClientFirebaseAuth(): Auth {
  const app = getClientFirebaseApp();
  return getAuth(app);
}

export type { User, IdTokenResult };
