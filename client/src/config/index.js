// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCe5xZ3RNK_MpNW53Mckt3OzuhSxkqD8lU",
  authDomain: "ashokenterprises-bd559.firebaseapp.com",
  projectId: "ashokenterprises-bd559",
  storageBucket: "ashokenterprises-bd559.appspot.com",
  messagingSenderId: "978340330798",
  appId: "1:978340330798:web:109f20b139138115084ebf",
  measurementId: "G-WEDT5YCTR9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


const db = getFirestore(app);
// const auth = app.auth();
// const storage = app.storage();

export { db };
