// firebase.js — initializes Firebase services used across the app

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

// initializeFirestore lets us pass settings at creation time.
// getFirestore does not accept settings — that's why we use this instead.
import { initializeFirestore } from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB0QsmX5yNvXhFyiI8hSBB3LYJTGsQPCdU",
  authDomain: "paceland-v2.firebaseapp.com",
  projectId: "paceland-v2",
  storageBucket: "paceland-v2.firebasestorage.app",
  messagingSenderId: "929028678866",
  appId: "1:929028678866:web:a5dd088253d256c815b90b"
};

// Create the Firebase app instance. Must happen before anything else.
const app = initializeApp(firebaseConfig);

// Create the Auth instance with AsyncStorage persistence.
// We use initializeAuth (not getAuth) because we need to inject the
// persistence adapter — getAuth uses in-memory persistence by default,
// which would log the user out every time the app restarts.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Create the Firestore instance with React Native-compatible settings.
// experimentalForceLongPolling: true — required for React Native; the default
//   WebChannel transport is unreliable on mobile, this switches to long-polling.
// useFetchStreams: false — disables Fetch-based streaming which also breaks
//   on React Native. Both settings together make Firestore stable on device.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
