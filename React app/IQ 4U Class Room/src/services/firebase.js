import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  set,
  serverTimestamp,
} from "firebase/database";

/* ================= FIREBASE INIT ================= */

const firebaseConfig = {
  apiKey: "AIzaSyAIefVM1tBjWz35FRWRxmIdEJeO_vpHSKM",
  authDomain: "iq4u-chess-classroom.firebaseapp.com",
  databaseURL:
    "https://iq4u-chess-classroom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iq4u-chess-classroom",
  storageBucket: "iq4u-chess-classroom.firebasestorage.app",
  messagingSenderId: "833620718306",
  appId: "1:833620718306:web:b599bb693d0736fe0da4bb",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

/* ================= AUTH ================= */

/**
 * Listen to Firebase auth state.
 * Safe to use later when wiring UI.
 */
export function listenToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/* ================= PROGRESS ================= */

/**
 * Get all progress for a user.
 * Returns {} if user or data does not exist.
 */
export async function getUserProgress(uid) {
  if (!uid) return {};

  const snapshot = await get(ref(db, `users/${uid}/progress`));
  return snapshot.exists() ? snapshot.val() : {};
}

/**
 * Save lesson result.
 * Call ONLY after assessment completion.
 */
export async function saveLessonProgress({
  uid,
  levelId,
  lessonId,
  score,
  completed,
}) {
  if (!uid) return;

  await set(
    ref(db, `users/${uid}/progress/${levelId}/${lessonId}`),
    {
      completed,
      score,
      updatedAt: serverTimestamp(),
    }
  );
}

/* ================= LOCKS ================= */

/**
 * Get per-student lesson locks.
 */
export async function getUserLocks(uid) {
  if (!uid) return {};

  const snapshot = await get(ref(db, `users/${uid}/locks`));
  return snapshot.exists() ? snapshot.val() : {};
}
