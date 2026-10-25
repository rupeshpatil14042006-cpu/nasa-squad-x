import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// Firebase configuration from environment or fallback template
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoAgriSmartKey1234567890",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agrismart-fieldshift.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agrismart-fieldshift",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agrismart-fieldshift.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo123456789"
};

// Check if valid user-provided Firebase key exists
const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDemoAgriSmartKey1234567890"
);

// Initialize Firebase App
let app;
let auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase initialization warning (using local fallback auth):", error);
}

const LOCAL_STORAGE_USER_KEY = 'agrismart_logged_user';

// Helper to get cached user
export function getSavedUser() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// 1. Sign In with Email & Password
export async function loginWithEmail(email, password) {
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        photoURL: userCredential.user.photoURL || '/avatar.jpg',
        provider: 'firebase'
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback demo auth for local development
  await new Promise(r => setTimeout(r, 600));
  const user = {
    uid: 'demo-' + Date.now(),
    email: email,
    displayName: email.split('@')[0] || 'John Doe',
    photoURL: '/avatar.jpg',
    role: 'Farm Manager',
    provider: 'firebase-mock'
  };
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

// 2. Sign Up with Email & Password
export async function signupWithEmail(email, password, displayName = 'Farmer') {
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || email.split('@')[0],
        photoURL: '/avatar.jpg',
        provider: 'firebase'
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Fallback local auth
  await new Promise(r => setTimeout(r, 600));
  const user = {
    uid: 'demo-' + Date.now(),
    email: email,
    displayName: displayName || email.split('@')[0],
    photoURL: '/avatar.jpg',
    role: 'Farm Manager',
    provider: 'firebase-mock'
  };
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

// 3. Sign In with Google
export async function loginWithGoogle() {
  if (isFirebaseConfigured && auth) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL || '/avatar.jpg',
        provider: 'google'
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // 1-click Google Demo auth
  await new Promise(r => setTimeout(r, 500));
  const user = {
    uid: 'google-demo-123',
    email: 'farmer.johndoe@gmail.com',
    displayName: 'John Doe',
    photoURL: '/avatar.jpg',
    role: 'Farm Manager',
    provider: 'google-mock'
  };
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

// 4. Guest / Demo Farmer Quick Access
export function loginAsDemoFarmer() {
  const user = {
    uid: 'guest-farmer-001',
    email: 'demo.farmer@agrismart.io',
    displayName: 'John Doe',
    photoURL: '/avatar.jpg',
    role: 'Farm Manager',
    provider: 'guest'
  };
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  return user;
}

// 5. Sign Out
export async function logoutUser() {
  try {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
  } catch (err) {
    console.warn("Logout error:", err);
  } finally {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }
}

// 6. Listen to auth changes
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const user = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Farmer',
          photoURL: fbUser.photoURL || '/avatar.jpg',
          provider: 'firebase'
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
        callback(user);
      } else {
        const local = getSavedUser();
        callback(local);
      }
    });
  }

  // If local, check localStorage
  const saved = getSavedUser();
  callback(saved || loginAsDemoFarmer());
  return () => {};
}
