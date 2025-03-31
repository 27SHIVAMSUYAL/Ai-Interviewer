import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ai-interviewer-ab969.firebaseapp.com",
  projectId: "ai-interviewer-ab969",
  storageBucket: "ai-interviewer-ab969.firebasestorage.app",
  messagingSenderId: "793087621521",
  appId: "1:793087621521:web:34c46421945061485c8230"
};

const app = initializeApp(firebaseConfig);  // Firebase App     
const auth = getAuth(app);                  // Firebase Auth    getAuth is imp function from firebase/auth


const provider = new GoogleAuthProvider();    // Google Auth Provider


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app); 

export { auth, provider, signInWithPopup ,db};       // Export Firebase Auth and Google Auth Provider
// Import the functions you need from the SDKs you need;