import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  updateDoc,
  setLogLevel,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence verbose connection warnings and 10s offline timeout warnings
try {
  setLogLevel('silent');
} catch {
  // Graceful fallback
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);

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
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test Firestore connection on boot with quick timeout to prevent 10s hanging and offline warnings
export async function testFirestoreConnection(): Promise<boolean> {
  // If browser is currently offline, skip immediately
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  // Pre-probe the Firestore REST API to avoid triggering the 10-second backend timeout
  // warning if the database is not provisioned or not reachable
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const dbName = firebaseConfig.firestoreDatabaseId || '(default)';
    const endpoint = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${dbName}/documents`;
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    // If endpoint returns 404 (database does not exist) or anything not valid JSON,
    // do not attempt Firestore SDK connection
    if (res.status === 404) {
      return false;
    }
  } catch {
    return false;
  }

  try {
    const testRef = doc(db, 'test', 'connection');
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2000)
    );
    await Promise.race([getDocFromServer(testRef), timeoutPromise]);
    return true;
  } catch {
    // Graceful fallback: app functions seamlessly offline/locally
    return false;
  }
}


