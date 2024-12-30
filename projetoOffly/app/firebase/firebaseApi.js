// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDuWmRnlOQzw1hhMuRHnERQ72svedYQwsw",
  authDomain: "offly-d2f45.firebaseapp.com",
  projectId: "offly-d2f45",
  storageBucket: "offly-d2f45.appspot.com", // Certifique-se de que o domínio termina em "appspot.com"
  messagingSenderId: "886163597877",
  appId: "1:886163597877:web:405b758af07a00e4901f7c"
};

// Inicializar o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
