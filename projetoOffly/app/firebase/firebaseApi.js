import {initializeApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDuWmRnlOQzw1hhMuRHnERQ72svedYQwsw",
  authDomain: "offly-d2f45.firebaseapp.com",
  projectId: "offly-d2f45",
  storageBucket: "offly-d2f45.firebasestorage.app",
  messagingSenderId: "886163597877",
  appId: "1:886163597877:web:405b758af07a00e4901f7c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inicializar a autenticação
const auth = getAuth(app);

export { db, auth };
