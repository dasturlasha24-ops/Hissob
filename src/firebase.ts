import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWRNgkj0vE4HY_nQx_k42YcpFQ4dlkkSg",
  authDomain: "hissob-75dbb.firebaseapp.com",
  projectId: "hissob-75dbb",
  storageBucket: "hissob-75dbb.firebasestorage.app",
  messagingSenderId: "996057134936",
  appId: "1:996057134936:web:464dc8dca63ad0956c172d"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Standard error types for diagnostics
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

/**
 * Handle Firestore errors gracefully and format them as readable JSON.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: "anonymous",
      email: "anonymous"
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
