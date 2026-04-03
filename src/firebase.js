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
  apiKey: "AIzaSyCftbOoXABypO-HzXqa1k06m1Pkm_eqo1k",
  authDomain: "hisaab-app2.firebaseapp.com",
  projectId: "hisaab-app2",
  storageBucket: "hisaab-app2.firebasestorage.app",
  messagingSenderId: "224939184411",
  appId: "1:224939184411:web:2f15805e91417fbc5843be",
  measurementId: "G-5G08LZRLX8"
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
