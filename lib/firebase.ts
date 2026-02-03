import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };