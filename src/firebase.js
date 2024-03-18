import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "ethers-app.firebaseapp.com",
  projectId: "ethers-app",
  storageBucket: "ethers-app.appspot.com",
  messagingSenderId: "831025822223",
  appId: "1:831025822223:web:a9ce2104975e45cadfc17a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);