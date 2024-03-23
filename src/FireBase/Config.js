// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAnREsIb6iIlVaF9Q6R7_wE8cuWGkQe30Q",
    authDomain: "vernal-store-414815.firebaseapp.com",
    projectId: "vernal-store-414815",
    storageBucket: "vernal-store-414815.appspot.com",
    messagingSenderId: "614716134369",
    appId: "1:614716134369:web:23b22693ec60fbb98278a0",
    measurementId: "G-Y36WGKVSNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const imageDb = getStorage()