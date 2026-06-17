// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALQhYiFu1DlLPEXj1g5CRHix9YfRQsuHo",
  authDomain: "vybrr-55d3b.firebaseapp.com",
  projectId: "vybrr-55d3b",
  storageBucket: "vybrr-55d3b.appspot.com",
  messagingSenderId: "392329562244",
  appId: "1:392329562244:web:b7f617fb29df826a105ad1",
  measurementId: "G-6B95ZGYF1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
 
export const googleProvider = new GoogleAuthProvider();
 
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');
githubProvider.setCustomParameters({ 'allow_signup': 'true' });
export const db = getFirestore(app)
export const storage = getStorage(app)