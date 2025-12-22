import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, applicationDefault } from "firebase-admin/app";

export const firebaseApp = initializeApp({
    projectId: "empdata-bf69b"
})

export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
