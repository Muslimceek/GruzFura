import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQhmtGfLT-6OpSXAVqaS3U2te6SCqLSxo",
  authDomain: "furayuk.firebaseapp.com",
  projectId: "furayuk",
  storageBucket: "furayuk.firebasestorage.app",
  messagingSenderId: "1090555023573",
  appId: "1:1090555023573:web:fbcb1c1575c617bb13125c",
  measurementId: "G-KGZ2RR4598"
};

// Initialize Firebase only if not already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db;
try {
    // Attempt to initialize with long polling forced to avoid timeout errors
    // This addresses "Backend didn't respond within 10 seconds"
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
    });
} catch (e) {
    // If Firestore is already initialized (e.g. during development/fast refresh), 
    // retrieve the existing instance instead of re-initializing.
    console.warn("Firestore already initialized, using existing instance.");
    db = getFirestore(app);
}

const auth = getAuth(app);

export { app, db, auth };