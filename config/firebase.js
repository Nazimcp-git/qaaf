// ============================================================
// QAF – Quranic Art Fest | Firebase Configuration
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDK9Bic2PaYWV1q3xfvGeyhanrEae3U56s",
  authDomain: "cashcraft-5391c.firebaseapp.com",
  databaseURL: "https://cashcraft-5391c-default-rtdb.firebaseio.com",
  projectId: "cashcraft-5391c",
  storageBucket: "cashcraft-5391c.firebasestorage.app",
  messagingSenderId: "410262411361",
  appId: "1:410262411361:web:0c97fe73ae783b141fb220",
  measurementId: "G-2TWZXMEZD0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// db, auth, firebase are available globally
