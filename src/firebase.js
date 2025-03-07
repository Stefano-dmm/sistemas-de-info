import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFz-LkGp2yOeptbK0WMSqnsUD4TJfYfYQ",
  authDomain: "agrupamet-cab92.firebaseapp.com",
  projectId: "agrupamet-cab92",
  storageBucket: "agrupamet-cab92.firebasestorage.app",
  messagingSenderId: "341646564625",
  appId: "1:341646564625:web:ebd071b26fb5df5af4c0b0",
  measurementId: "G-9FKHLB7RG6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
