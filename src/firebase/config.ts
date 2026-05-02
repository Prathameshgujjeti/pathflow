import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBj1TlJzjDuCBZPUUw9sQxb0dpONXw5EWU",
  authDomain: "doctorapp-9e24c.firebaseapp.com",
  projectId: "doctorapp-9e24c",
  storageBucket: "doctorapp-9e24c.firebasestorage.app",
  messagingSenderId: "439506057024",
  appId: "1:439506057024:android:b866d7c29f79f04171eca5"
};

let db: any;

try {
  // Initialize Firebase
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.log("Firebase initialization failed. Operating in Offline Mode.", error);
  // We export a dummy object that will fail gracefully in the API layer
  db = {};
}

export { db };
