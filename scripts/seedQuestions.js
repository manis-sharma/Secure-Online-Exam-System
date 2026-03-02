/**
 * Seed Script for Firestore
 * 
 * This script uploads sample questions to Firestore.
 * 
 * Prerequisites:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 
 * Usage:
 * node scripts/seedQuestions.js
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const sampleQuestions = require('./sampleQuestions');

function loadServiceAccountFromPath(credentialsPath) {
  if (!credentialsPath || !fs.existsSync(credentialsPath)) {
    return null;
  }

  try {
    const json = fs.readFileSync(credentialsPath, 'utf8');
    return JSON.parse(json);
  } catch (error) {
    throw new Error(`Unable to read service account file at ${credentialsPath}: ${error.message}`);
  }
}

function loadProjectIdFromEnvFiles() {
  const projectRoot = path.resolve(__dirname, '..');
  const envFiles = ['.env', '.env.local', '.env.example'];

  for (const envFile of envFiles) {
    const envPath = path.join(projectRoot, envFile);
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^REACT_APP_FIREBASE_PROJECT_ID\s*=\s*(.+)$/m);
    if (match && match[1]) {
      const rawValue = match[1].trim();
      return rawValue.replace(/^['"]|['"]$/g, '');
    }
  }

  return null;
}

function initializeAdmin() {
  const explicitCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const fallbackCredentialsPath = path.join(__dirname, 'serviceAccountKey.json');
  const credentialsPath = explicitCredentialsPath || fallbackCredentialsPath;
  const serviceAccount = loadServiceAccountFromPath(credentialsPath);

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.REACT_APP_FIREBASE_PROJECT_ID ||
    loadProjectIdFromEnvFiles() ||
    serviceAccount?.project_id;

  if (!projectId) {
    throw new Error(
      'Missing Firebase project ID. Set FIREBASE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT), or provide a service account key with project_id.'
    );
  }

  const initOptions = { projectId };

  if (serviceAccount) {
    initOptions.credential = admin.credential.cert(serviceAccount);
    console.log(`Using service account credentials from: ${credentialsPath}`);
  } else {
    initOptions.credential = admin.credential.applicationDefault();
    console.log('Using Application Default Credentials (ADC).');
  }

  admin.initializeApp(initOptions);
  console.log(`Using Firebase project: ${projectId}`);
}

initializeAdmin();

const db = admin.firestore();

/**
 * Seed questions to Firestore
 */
async function seedQuestions() {
  console.log('Starting to seed questions...');
  
  const questionsRef = db.collection('questions');
  const batch = db.batch();
  
  let count = 0;
  
  for (const question of sampleQuestions) {
    const docRef = questionsRef.doc();
    batch.set(docRef, {
      ...question,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    count++;
  }
  
  try {
    await batch.commit();
    console.log(`Successfully seeded ${count} questions!`);
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
}

/**
 * Clear existing questions
 */
async function clearQuestions() {
  console.log('Clearing existing questions...');
  
  const questionsRef = db.collection('questions');
  const snapshot = await questionsRef.get();
  
  if (snapshot.empty) {
    console.log('No existing questions to clear.');
    return;
  }
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`Cleared ${snapshot.size} existing questions.`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--clear')) {
      await clearQuestions();
    }
    
    await seedQuestions();
    
    console.log('\nDone! Questions are ready in Firestore.');
    process.exit(0);
  } catch (error) {
    if (error && typeof error.message === 'string' && error.message.includes('Could not load the default credentials')) {
      console.error('\nAuthentication setup required:');
      console.error('1) Download Firebase service account JSON to scripts/serviceAccountKey.json');
      console.error('   OR set GOOGLE_APPLICATION_CREDENTIALS to your key path in the same terminal session.');
      console.error('2) Re-run: node scripts/seedQuestions.js');
    }
    console.error('Seed script failed:', error);
    process.exit(1);
  }
}

main();
