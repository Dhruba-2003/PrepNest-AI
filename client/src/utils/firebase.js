import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interview-agent-5faba.firebaseapp.com",
  projectId: "interview-agent-5faba",
  storageBucket: "interview-agent-5faba.firebasestorage.app",
  messagingSenderId: "869093737286",
  appId: "1:869093737286:web:c78d40b5e1c14710905b47",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };
