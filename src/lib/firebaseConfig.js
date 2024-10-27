// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCui1HNpifqidrwfjOMIsm5lbBzti6n0qY",
  authDomain: "locatorgabrielle.firebaseapp.com",
  projectId: "locatorgabrielle",
  storageBucket: "locatorgabrielle.appspot.com",
  messagingSenderId: "4516827654",
  appId: "1:4516827654:web:6095ad3f13fe64e958e987",
  measurementId: "G-2VH3YZ0T0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics if in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };
