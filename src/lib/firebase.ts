import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const metaEnv = (import.meta as any).env || {};

// Configure Firebase using environment variables with studysprint-ai-5b618 project defaults
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || '',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || 'studysprint-ai-5b618.firebaseapp.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || 'studysprint-ai-5b618',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || 'studysprint-ai-5b618.firebasestorage.app',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: metaEnv.VITE_FIREBASE_APP_ID || '',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

const databaseId = metaEnv.VITE_FIREBASE_DATABASE_ID;
const db = (databaseId && databaseId !== '(default)')
  ? getFirestore(app, databaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };

