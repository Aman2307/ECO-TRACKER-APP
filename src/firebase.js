import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBI49_cD5xHWbbhX3dQm6vaAoTjRdhOLWQ",
  authDomain: "eco-tracker-app-5df03.firebaseapp.com",
  projectId: "eco-tracker-app-5df03",
  storageBucket: "eco-tracker-app-5df03.firebasestorage.app",
  messagingSenderId: "350546247017",
  appId: "1:350546247017:web:68bd28057c5e8ad16a51f8",
  //measurementId: "G-3QTN683Z51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
