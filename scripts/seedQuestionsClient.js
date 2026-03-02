/**
 * Seed Questions using Firebase Client SDK
 * 
 * This script uses the web client SDK (no service account needed).
 * Requires Firestore rules to temporarily allow question creation.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, writeBatch, deleteDoc, Timestamp } = require('firebase/firestore');
const sampleQuestions = require('./sampleQuestions');
const fs = require('fs');
const path = require('path');

// Load env from .env file
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found. Copy .env.example to .env and fill in values.');
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const vars = {};
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const [key, ...rest] = line.split('=');
    vars[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
  return vars;
}

async function main() {
  const env = loadEnv();

  const firebaseConfig = {
    apiKey: env.REACT_APP_FIREBASE_API_KEY,
    authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.REACT_APP_FIREBASE_APP_ID
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Missing Firebase config in .env file.');
  }

  console.log(`Connecting to Firebase project: ${firebaseConfig.projectId}`);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const args = process.argv.slice(2);

  // Clear existing questions if --clear flag
  if (args.includes('--clear')) {
    console.log('Clearing existing questions...');
    const snapshot = await getDocs(collection(db, 'questions'));
    if (snapshot.empty) {
      console.log('No existing questions to clear.');
    } else {
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'questions', docSnap.id));
      }
      console.log(`Cleared ${snapshot.size} existing questions.`);
    }
  }

  // Seed questions
  console.log('Starting to seed questions...');
  let count = 0;

  for (const question of sampleQuestions) {
    const docRef = doc(collection(db, 'questions'));
    await setDoc(docRef, {
      ...question,
      createdAt: Timestamp.now()
    });
    count++;
    process.stdout.write(`\r  Seeded ${count}/${sampleQuestions.length} questions`);
  }

  console.log(`\nSuccessfully seeded ${count} questions!`);
  console.log('\nDone! Questions are ready in Firestore.');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed script failed:', err.message || err);
  process.exit(1);
});
