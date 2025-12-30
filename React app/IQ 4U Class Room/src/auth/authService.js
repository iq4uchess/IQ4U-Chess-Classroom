import { auth } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

/* ================= AUTH ACTIONS ================= */

/**
 * Login with email & password
 */
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logout current user
 */
export function logout() {
  return signOut(auth);
}

/**
 * Subscribe to auth state changes
 * @param {(user) => void} callback
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
