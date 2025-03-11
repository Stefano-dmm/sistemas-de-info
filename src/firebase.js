import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importar Firestore

const firebaseConfig = {
  apiKey: "AIzaSyAwpYZoQboiXtkr3qNq9pcRDF-7RFD_Shs",
  authDomain: "avilametest.firebaseapp.com",
  projectId: "avilametest",
  storageBucket: "avilametest.firebasestorage.app",
  messagingSenderId: "954043017357",
  appId: "1:954043017357:web:90fa32b3977515666e9ac4",
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // Inicializa Firestore

export default app;
