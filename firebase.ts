import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYwqk1U8Fc_bXM42jNWzfcNNsB0sITUWM",
    authDomain: "notion-clone-8ab21.firebaseapp.com",
    projectId: "notion-clone-8ab21",
    storageBucket: "notion-clone-8ab21.firebasestorage.app",
    messagingSenderId: "400999458426",
    appId: "1:400999458426:web:a6d7c42ec5fdb46132fdc3",
    measurementId: "G-XRW1PM598Z"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export{db};