// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1qPnqevJbFotZ0lmUjNWUyhRYIE5Yrz8",
  authDomain: "my-personal-app-launcher.firebaseapp.com",
  projectId: "my-personal-app-launcher",
  storageBucket: "my-personal-app-launcher.appspot.com",
  messagingSenderId: "917524574956",
  appId: "1:917524574956:web:6de68141a9d890e407ebc9",
  measurementId: "G-NJTRC79Z2L"
};

// Initialize Firebase
let app;
let auth;
let db;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Enable persistence
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase persistence enabled');
    })
    .catch((error) => {
      console.error('Error enabling persistence:', error);
    });

  // Initialize Analytics only in production
  if (process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { auth, db, analytics };
