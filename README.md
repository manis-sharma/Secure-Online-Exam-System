<div align="center">

# 🎓 Secure Online Exam System

**A production-ready, anti-cheat online examination platform built with React & Firebase**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

[Live Demo](#-deployment) · [Features](#-features) · [Getting Started](#-getting-started) · [Documentation](#-architecture)

</div>

---

## 📖 About

Secure Online Exam System is a full-featured web application designed for schools and institutions to conduct timed online examinations with robust anti-cheating measures. Built on React for the frontend and Firebase for backend services, it supports **500+ concurrent users** out of the box.

Students authenticate via Google OAuth, register with their roll number, take a timed MCQ exam with randomized questions and options, and receive instant results — all while the system monitors and logs suspicious activity in real time.

---

## ✨ Features

### 🔐 Authentication & Security
- Google OAuth 2.0 sign-in via Firebase Auth
- Optional domain-restricted login (e.g., `@school.edu` only)
- Protected routes with automatic redirects
- Session persistence across page refreshes
- Strict Firestore security rules — students cannot modify questions or results

### 🛡️ Anti-Cheating Engine

| Measure | Description |
|---|---|
| **Tab Switch Detection** | Detects when students leave the exam tab; logs every switch |
| **Time Penalty** | Configurable time deduction on each tab switch |
| **Copy / Paste Disabled** | Keyboard shortcuts and context menu blocked |
| **Right-Click Disabled** | Prevents "Inspect Element" access via context menu |
| **Console Tamper Detection** | Detects devtools opening attempts |
| **Auto-Submit** | Automatically submits exam on excessive violations |
| **Activity Logging** | Every suspicious event is recorded in Firestore |

### 📝 Exam Engine
- Per-question countdown timer (configurable, default 30 s)
- Automatic progression to next question on timeout
- No back-navigation — prevents revisiting answered questions
- Question order randomization per student
- Option order randomization per question
- Negative marking support
- Real-time score calculation
- Progress bar with question tracker

### 📊 Results & Analytics
- Instant result display after submission
- Detailed breakdown: correct, wrong, unanswered
- Time-spent tracking
- Tab-switch count per student
- Full activity log per exam session

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT  (React SPA)                      │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Login Page │ │ Register   │ │ Exam Page│ │ Result   │   │
│  └────────────┘ └────────────┘ └──────────┘ └──────────┘   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Anti-Cheat Service Layer                    │ │
│  │  Tab Detection · Copy Block · Console Tamper Guard    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                    FIREBASE SERVICES                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐    │
│  │  Auth         │  │  Firestore   │  │  Hosting (CDN) │    │
│  │  (Google SSO) │  │  (Database)  │  │  (Deployment)  │    │
│  └──────────────┘  └──────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
├── public/                  # Static HTML entry point
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ProtectedRoute.js
│   ├── config/
│   │   └── firebase.js      # Firebase initialization
│   ├── contexts/
│   │   ├── AuthContext.js    # Authentication state
│   │   └── ExamContext.js    # Exam session state
│   ├── pages/
│   │   ├── LoginPage.js     # Google sign-in
│   │   ├── RegisterPage.js  # Student registration
│   │   ├── ExamPage.js      # Exam interface
│   │   └── ResultPage.js    # Score & breakdown
│   └── services/
│       ├── antiCheat.js     # Anti-cheat monitoring
│       └── studentService.js# Student data operations
├── scripts/
│   ├── sampleQuestions.js   # Question bank
│   ├── seedQuestions.js     # Admin SDK seeder
│   └── seedQuestionsClient.js # Client SDK seeder
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Firestore indexes
├── firebase.json            # Firebase hosting config
└── DEPLOYMENT.md            # Detailed deployment guide
```

### Firestore Data Model

```
firestore/
├── users/{userId}           # Auth records & metadata
├── students/{rollNumber}    # Student profile & registration
├── questions/{questionId}   # MCQ question bank (read-only)
├── examSessions/{sessionId} # Live exam state & answers
├── examResults/{resultId}   # Final submitted results
└── activityLogs/{logId}     # Anti-cheat event log
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org/) | 18+ |
| [Firebase CLI](https://firebase.google.com/docs/cli) | 13+ |
| [Firebase Project](https://console.firebase.google.com) | — |

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/secure-online-exam-system.git
cd secure-online-exam-system
npm install
```

### 2. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Google Authentication** (Authentication → Sign-in method → Google)
3. Create a **Firestore Database** in production mode
4. Register a **Web App** and copy the config values

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Optional: restrict sign-in to a specific domain
REACT_APP_ALLOWED_DOMAIN=school.edu

# Exam settings
REACT_APP_QUESTION_TIME_LIMIT=30
REACT_APP_TAB_SWITCH_PENALTY_TIME=10
```

### 4. Initialize Firebase Locally

```bash
firebase login
firebase use --add       # Select your project
```

### 5. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 6. Seed Questions

**Option A — Client SDK** (no service account needed):

> Temporarily set `allow create: if true` in `firestore.rules` for the `questions` collection, deploy rules, seed, then revert.

```bash
node scripts/seedQuestionsClient.js --clear
```

**Option B — Admin SDK** (requires service account):

1. Download the service account key from Firebase Console → Project Settings → Service Accounts
2. Save it as `scripts/serviceAccountKey.json`

```bash
node scripts/seedQuestions.js --clear
```

### 7. Run Locally

```bash
npm start
```

The app will open at `http://localhost:3000`.

---

## 🌐 Deployment

```bash
npm run build
firebase deploy
```

Your app will be live at:

```
https://<your-project-id>.web.app
```

> See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete step-by-step deployment guide.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `REACT_APP_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `REACT_APP_ALLOWED_DOMAIN` | ❌ | Restrict login to this email domain |
| `REACT_APP_QUESTION_TIME_LIMIT` | ❌ | Seconds per question (default: `30`) |
| `REACT_APP_TAB_SWITCH_PENALTY_TIME` | ❌ | Time penalty per tab switch in seconds (default: `10`) |

### Customizing Questions

Edit `scripts/sampleQuestions.js` with your own questions:

```javascript
{
  questionText: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: 0,   // Index of correct option (0-3)
  timeLimit: 30,       // Seconds
  marks: 1,            // Points for correct answer
  order: 1             // Display order (randomized at runtime)
}
```

Then re-seed:

```bash
node scripts/seedQuestionsClient.js --clear
```

---

## 🔒 Security

- **Firestore Rules** enforce read-only access to questions and write-once semantics for exam results
- **Service account keys** are excluded via `.gitignore`
- **Environment files** (`.env`, `.env.local`, etc.) are never committed
- **`.firebaserc`** (contains project ID) is git-ignored
- All sensitive configuration is loaded exclusively through environment variables

> ⚠️ **Never commit** `.env`, `serviceAccountKey.json`, or `.firebaserc` to version control.

---

## 📈 Scalability

| Component | Strategy |
|---|---|
| **Firestore** | Auto-scales with demand; no provisioning needed |
| **Firebase Hosting** | Global CDN for static assets |
| **Client-Side Rendering** | Minimal server load — all logic runs in the browser |
| **Batch Writes** | Efficient activity logging with batched Firestore operations |
| **Indexed Queries** | Pre-configured indexes for fast reads |

Tested and designed for **500+ concurrent users**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, CSS3 |
| Authentication | Firebase Authentication (Google OAuth 2.0) |
| Database | Cloud Firestore (NoSQL) |
| Hosting | Firebase Hosting (Global CDN) |
| Tooling | Firebase CLI, Node.js |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---
## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=manis-sharma/Secure-Online-Exam-System&type=date&legend=top-left)](https://www.star-history.com/#manis-sharma/Secure-Online-Exam-System&Date)
---



<div align="center">

**Built with ❤️ for secure online examinations by Manish Sharma**
**⭐ If you found this project helpful, please give it a star!**

</div>
