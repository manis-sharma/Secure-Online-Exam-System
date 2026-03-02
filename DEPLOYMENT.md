# Deployment Guide

Complete guide to deploy the Secure Online Exam System to Firebase.

## Prerequisites

1. **Node.js** (v18+) installed
2. **Firebase CLI** installed: `npm install -g firebase-tools`
3. **Firebase Project** created at [Firebase Console](https://console.firebase.google.com)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name (e.g., "school-exam-system")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click **Google** provider
3. Enable it and configure:
   - Project support email: your email
   - Web SDK configuration: auto-generated
4. Click **Save**

### 1.3 Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose a location (closest to your users)
5. Click **Enable**

### 1.4 Register Web App

1. Go to **Project Settings** (gear icon)
2. Under "Your apps", click web icon (</>)
3. Enter app nickname (e.g., "exam-web")
4. Check "Also set up Firebase Hosting"
5. Click **Register app**
6. Copy the Firebase config values

## Step 2: Local Configuration

### 2.1 Clone and Install

```bash
cd "online assignment"
npm install
```

### 2.2 Configure Environment

Create `.env` file in project root:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123

# Optional: Restrict to school domain
REACT_APP_ALLOWED_DOMAIN=myschool.edu

# Exam settings
REACT_APP_QUESTION_TIME_LIMIT=30
REACT_APP_TAB_SWITCH_PENALTY_TIME=10
```

### 2.3 Update Firebase Project ID

Edit `.firebaserc`:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

## Step 3: Deploy Security Rules

### 3.1 Login to Firebase

```bash
firebase login
```

### 3.2 Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3.3 Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

## Step 4: Seed Questions

### 4.1 Get Service Account Key

1. Firebase Console > Project Settings > Service accounts
2. Click "Generate new private key"
3. Save as `scripts/serviceAccountKey.json`

### 4.2 Run Seed Script

```bash
# Install admin SDK
npm install firebase-admin

# Set credentials (Windows PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="scripts/serviceAccountKey.json"

# Optional but recommended if your service account is not auto-detected
$env:FIREBASE_PROJECT_ID="your-project-id"

# Verify key file exists
Test-Path $env:GOOGLE_APPLICATION_CREDENTIALS

# Run seed script
node scripts/seedQuestions.js
```

**Important:** Delete `serviceAccountKey.json` after seeding for security!

## Step 5: Build and Deploy

### 5.1 Build Production Bundle

```bash
npm run build
```

### 5.2 Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### 5.3 Full Deploy (Rules + Hosting)

```bash
firebase deploy
```

## Step 6: Verify Deployment

1. Visit your deployed URL: `https://your-project.web.app`
2. Test the complete flow:
   - Google Sign-In
   - Student registration
   - Exam completion
   - Result display

## Domain Restriction (Optional)

To restrict login to school domain only:

1. In `.env`, set:
   ```
   REACT_APP_ALLOWED_DOMAIN=myschool.edu
   ```

2. In Google Cloud Console:
   - Go to APIs & Services > Credentials
   - Edit your OAuth client
   - Add authorized domains

## Monitoring & Analytics

### View Firestore Data

1. Firebase Console > Firestore Database
2. Browse collections:
   - `users` - Registered users
   - `students` - Student details
   - `examSessions` - Active/completed sessions
   - `examResults` - Final results
   - `activityLogs` - Anti-cheat logs

### View Authentication Users

1. Firebase Console > Authentication > Users
2. See all signed-in users

## Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build
```

### Firebase Deploy Errors

```bash
# Re-authenticate
firebase logout
firebase login

# Check project
firebase projects:list
firebase use your-project-id
```

### CORS Issues

Ensure your domain is added to:
1. Firebase Console > Authentication > Settings > Authorized domains

### Questions Not Loading

1. Check if questions are seeded in Firestore
2. Verify Firestore security rules are deployed
3. Check browser console for errors

## Security Checklist

Before going live:

- [ ] Remove `serviceAccountKey.json`
- [ ] Enable domain restriction if needed
- [ ] Test all anti-cheat features
- [ ] Verify Firestore rules are restrictive
- [ ] Test with multiple students simultaneously
- [ ] Review activity logs for suspicious patterns

## Scaling for 500+ Students

The architecture supports 500+ concurrent users:

1. **Firestore** auto-scales
2. **Firebase Hosting** uses global CDN
3. **Client-side rendering** minimizes server load
4. **Efficient queries** with proper indexes

For higher loads:
- Enable Firestore caching
- Use Firebase Performance Monitoring
- Consider Cloud Functions for heavy operations

## Support

For issues:
1. Check browser console for errors
2. Review Firestore security rules
3. Verify environment variables
4. Check Firebase project quotas
