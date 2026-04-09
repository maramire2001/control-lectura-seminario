import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_api_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock_auth_domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock_project_id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock_bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock_sender_id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock_app_id"
};

// Singleton Firebase initialization
let app;
let db;
const isMock = firebaseConfig.apiKey === "mock_api_key";

if (!isMock) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
}

// Fallback arrays to mock Database logic if Firebase is not properly configured yet
let mockDatabase = [];

export const saveEvaluation = async (nombre, score, logs) => {
    if (isMock) {
        console.warn("Using Local Mock Data. Ensure you configure your NEXT_PUBLIC_FIREBASE_ keys in production.");
        mockDatabase.push({
            nombre,
            score,
            logs,
            createdAt: new Date(),
            id: Math.random().toString(36).substr(2, 9)
        });
        return true;
    }
    
    try {
        await addDoc(collection(db, "evaluations"), {
            nombre,
            score,
            logs,
            createdAt: serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        return false;
    }
};

export const getLeaderboard = async () => {
    if (isMock) {
        return [...mockDatabase].sort((a, b) => b.createdAt - a.createdAt);
    }
    
    try {
        const q = query(collection(db, "evaluations"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return data;
    } catch (e) {
        console.error("Error getting documents: ", e);
        return [];
    }
};
