// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getAuth } from "firebase/auth"; // Autenticación

const firebaseConfig = {
    apiKey: "AIzaSyBLeh03XAdHW0c_ETW_sp0vJgMfk5MFo0E",
    authDomain: "movird-740aa.firebaseapp.com",
    projectId: "movird-740aa",
    storageBucket: "movird-740aa.appspot.com",
    messagingSenderId: "153582626699",
    appId: "1:153582626699:web:005f59b3cfe9b5cc0f718e"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás
export const db = getFirestore(app);
export const auth = getAuth(app);