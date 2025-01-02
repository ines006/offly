import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDuWmRnlOQzw1hhMuRHnERQ72svedYQwsw",
  authDomain: "offly-d2f45.firebaseapp.com",
  projectId: "offly-d2f45",
  storageBucket: "offly-d2f45.appspot.com", 
  messagingSenderId: "886163597877",
  appId: "1:886163597877:web:405b758af07a00e4901f7c",
};

// Inicializar o Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inicializar a autenticação
const auth = getAuth(app);

export { db, auth };
