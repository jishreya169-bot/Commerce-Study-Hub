import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence is exported at runtime
import { getAuth, initializeAuth, getReactNativePersistence, inMemoryPersistence, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Real Webvibezzz Academy Firebase Project ────────────────────────────────
// Project: webvibez-ac7ce  |  Sender: 667479361405

const androidConfig = {
  apiKey: "AIzaSyBCzEQD080qAM5whg8uq9JBVf3AJSdVVho",
  authDomain: "webvibez-ac7ce.firebaseapp.com",
  projectId: "webvibez-ac7ce",
  storageBucket: "webvibez-ac7ce.firebasestorage.app",
  messagingSenderId: "667479361405",
  appId: "1:667479361405:android:d7ca9ebbd9813779b0ee14",
};

const iosConfig = {
  apiKey: "AIzaSyBCzEQD080qAM5whg8uq9JBVf3AJSdVVho",
  authDomain: "webvibez-ac7ce.firebaseapp.com",
  projectId: "webvibez-ac7ce",
  storageBucket: "webvibez-ac7ce.firebasestorage.app",
  messagingSenderId: "667479361405",
  appId: "1:667479361405:ios:placeholder", // Needs actual iOS app registration
};

const webConfig = {
  apiKey: "AIzaSyBCzEQD080qAM5whg8uq9JBVf3AJSdVVho",
  authDomain: "webvibez-ac7ce.firebaseapp.com",
  projectId: "webvibez-ac7ce",
  storageBucket: "webvibez-ac7ce.firebasestorage.app",
  messagingSenderId: "667479361405",
  appId: "1:667479361405:web:placeholder", // Needs actual Web app registration
};

// Auto-select correct config per platform
const firebaseConfig = Platform.select({
  ios: iosConfig,
  android: androidConfig,
  default: webConfig,
});

// Initialize Firebase app (safe singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig!) : getApp();

// Initialize Auth with persistent AsyncStorage on mobile, default on web
let auth: Auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
