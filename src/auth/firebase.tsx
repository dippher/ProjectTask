import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCYb9ixAod15mTotZUWXlx0HQMfHc7GGtg",
    authDomain: "projecttask-c073c.firebaseapp.com",
    projectId: "projecttask-c073c",
    storageBucket: "projecttask-c073c.firebasestorage.app",
    messagingSenderId: "472736915808",
    appId: "1:472736915808:web:8e9f76e7fd853863b0be05"
};

// Inicializer Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inicializer Firestore
const auth = getAuth(app);

export { db, auth }; // Exporter l'instance de Firestore
