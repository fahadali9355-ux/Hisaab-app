import { initializeApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace these placeholders with your actual Firebase config values
// Ye saari details aapko Firebase console > Project Settings > General > "Your apps" section mei milegi
const firebaseConfig = {
  apiKey: "AIzaSyCWgUhTdFiuuj0PmqnnYjl6eJADfeaWZog",
  authDomain: "hisaab-app-2ecd7.firebaseapp.com",
  projectId: "hisaab-app-2ecd7",
  storageBucket: "hisaab-app-2ecd7.firebasestorage.app",
  messagingSenderId: "421319735101",
  appId: "1:421319735101:web:fb8c063304b80139e63754",
  measurementId: "G-2EQZJCD71R"
};
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence enabled
// Ye enable karne se internet ke baghair bhi data add/view hoga, achanak net chala jaye to app crash nahi hogi
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Initialize Auth
const auth = getAuth(app);

export { db, auth };
