import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPtH_r2gqCKTwWFLYddSMKVEmt3eEe5co",
  authDomain: "anureet-private-limited.firebaseapp.com",
  projectId: "anureet-private-limited",
  storageBucket: "anureet-private-limited.firebasestorage.app",
  messagingSenderId: "953917617172",
  appId: "1:953917617172:web:9d42bf0394b0abc4a86301",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
