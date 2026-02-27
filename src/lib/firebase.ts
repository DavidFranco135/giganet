import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDhvezaII8Q77ydkl97ggothgjcwCqVMRQ",
  authDomain: "giganet-1d32c.firebaseapp.com",
  projectId: "giganet-1d32c",
  storageBucket: "giganet-1d32c.firebasestorage.app",
  messagingSenderId: "56077285821",
  appId: "1:56077285821:web:fca406a59c0f5138937ad4",
  measurementId: "G-VD522S6N26"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
