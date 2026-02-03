
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, initializeFirestore, Firestore, terminate } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQhmtGfLT-6OpSXAVqaS3U2te6SCqLSxo",
  authDomain: "furayuk.firebaseapp.com",
  projectId: "furayuk",
  storageBucket: "furayuk.firebasestorage.app",
  messagingSenderId: "1090555023573",
  appId: "1:1090555023573:web:fbcb1c1575c617bb13125c",
  measurementId: "G-KGZ2RR4598"
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: Firestore;
try {
    // initializeFirestore should only be called once.
    // Use ignoreUndefinedProperties to prevent errors when saving incomplete data.
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
    });
} catch (e) {
    // If already initialized, get the existing instance
    db = getFirestore(app);
}

const auth: Auth = getAuth(app);

export { app, db, auth };
 