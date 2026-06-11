import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

console.log("PROJECT:", process.env.FIREBASE_PROJECT_ID);
console.log("EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("PRIVATE KEY:", !!process.env.FIREBASE_PRIVATE_KEY);

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export { getAuth };