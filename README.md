# SmartTask

A modern, full-featured task management web app built with React, TypeScript, Firebase, and Tailwind CSS. Manage your tasks efficiently with real-time sync, priority levels, due dates, categories, and a beautiful UI.

🌐 **Live Demo:** [https://smartask-a61bc.web.app](https://smartask-a61bc.web.app)

---

## Screenshots

| Login | Home | Task Form | Profile |
|-------|------|-----------|---------|
| Google & email auth with password strength | Gradient header, stats, task list | Priority, due date, category, suggestions | Stats grid, progress bar, dark mode |

---

## Features

### Authentication
- Email & password registration with full password security
- Google Sign-In (one tap)
- Forgot password with email reset link
- In-app password reset screen with strength meter
- Persistent login session via Firebase Auth

### Password Security
- Live strength meter (Weak → Fair → Good → Strong → Very Strong)
- 5-rule requirements checklist (length, uppercase, lowercase, number, special char)
- Confirm password field with live match indicator
- Blocks submission until all requirements are met

### Task Management
- Create, edit, delete tasks
- Mark tasks complete / incomplete
- Priority levels — High, Medium, Low with color-coded badges and left stripe
- Due dates with smart labels (Today, Tomorrow, Overdue)
- Categories / tags for grouping
- AI-like task suggestions based on keywords (no API key needed)
- Swipe left to delete on mobile

### Home Screen
- Personalized greeting (Good morning / afternoon / evening)
- Stats row — Total, Done, Today's streak
- Animated progress bar
- High priority alert banner
- Search tasks by title or description
- Filter by priority and category
- Active and Completed sections with count badges
- Optimistic UI updates (instant feedback)

### Profile Screen
- Google profile photo or avatar initial
- 4-stat grid — Total, Completed, Active, Done Today
- Overall progress bar with gradient
- "All tasks done" trophy badge at 100%
- Dark mode toggle with animated switch
- One-tap logout (no confirm dialog)

### UX & Design
- Gradient blue/indigo header throughout
- Dark mode support (persisted across sessions)
- Skeleton shimmer loading cards
- Toast notifications (replaces all browser alerts)
- Smooth animations via Framer Motion
- Fully responsive — works on mobile and desktop
- Offline support via Firestore local cache

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| Build Tool | Vite |

---

## Project Structure

```
smarttask/
├── src/
│   ├── components/
│   │   ├── Button.tsx          # Reusable button with variants
│   │   ├── Header.tsx          # Sticky header with back button
│   │   ├── Skeleton.tsx        # Shimmer loading cards
│   │   └── TaskCard.tsx        # Task card with swipe-to-delete
│   ├── screens/
│   │   ├── LoginScreen.tsx     # Login + Register + Google auth
│   │   ├── HomeScreen.tsx      # Main task list with search/filter
│   │   ├── TaskScreen.tsx      # Create / edit task form
│   │   ├── ProfileScreen.tsx   # User profile and settings
│   │   └── ResetPasswordScreen.tsx  # In-app password reset
│   ├── AuthContext.tsx         # Firebase auth state provider
│   ├── Toast.tsx               # Toast notification system
│   ├── db.ts                   # Firestore CRUD + offline cache
│   ├── firebase.ts             # Firebase app initialization
│   ├── storage.ts              # localStorage (theme)
│   ├── suggestions.ts          # Local task suggestion engine
│   ├── types.ts                # TypeScript interfaces
│   ├── App.tsx                 # Root component + routing
│   └── main.tsx                # Entry point
├── .env.local                  # Firebase config (not committed)
├── .env.example                # Env var template
├── firebase.json               # Firebase Hosting config
├── .firebaserc                 # Firebase project binding
├── index.html                  # HTML entry with favicon
├── vite.config.ts              # Vite config
└── tsconfig.json               # TypeScript config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with **Authentication** and **Firestore** enabled

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smarttask.git
cd smarttask
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project
2. Enable **Authentication** → Sign-in methods → **Email/Password** and **Google**
3. Enable **Firestore Database** → Start in test mode
4. Go to Project Settings → Web app → copy your config

### 4. Configure environment variables

Create a `.env.local` file in the root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Set Firestore security rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

Your app will be live at `https://your-project-id.web.app`

> After deploying, go to **Firebase Console → Authentication → Settings → Authorized domains** and add your live domain.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

> ⚠️ Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | TypeScript type check |

---

## License

MIT
