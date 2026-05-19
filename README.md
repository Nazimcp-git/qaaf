# QAF – Quranic Art Fest

> A prestigious Islamic arts festival management platform built with vanilla HTML, CSS, and JavaScript.

## 🌟 Overview

QAF is a complete event management platform for organizing inter-institutional Quranic art competitions. It features a public landing website, institution registration, student management, topic submissions, live results, and a full admin dashboard.

## 🏗️ Architecture

```
qaf/
├── index.html                  # Landing page
├── firebase.json               # Firebase hosting config
├── firebase-rules.json         # Security rules
├── config/
│   ├── firebase.js             # Firebase initialization
│   └── imagekit.js             # ImageKit upload service
├── css/
│   ├── variables.css           # Design tokens
│   ├── base.css                # Reset & typography
│   ├── components.css          # UI components
│   ├── animations.css          # Animation library
│   ├── layout.css              # Navbar, sidebar, footer
│   └── pages/
│       └── landing.css         # Landing page styles
├── js/
│   ├── utils/
│   │   ├── helpers.js          # Utilities (toast, validation, etc.)
│   │   └── seed-data.js        # Sample data seeder
│   └── services/
│       ├── auth.js             # Authentication service
│       ├── database.js         # Firebase CRUD service
│       └── pdf.js              # PDF/CSV export service
└── pages/
    ├── register.html           # Institution registration
    ├── team-login.html         # Team login
    ├── team-dashboard.html     # Team dashboard
    ├── topic-registration.html # Topic submissions
    ├── results.html            # Public results portal
    ├── admin-login.html        # Admin login
    ├── admin-dashboard.html    # Admin panel
    └── admin.js                # Admin logic
```

## 🚀 Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g., `qaf-2026`)
3. Enable **Authentication** → Email/Password sign-in
4. Enable **Realtime Database**
5. Copy your config to `config/firebase.js`

### 2. Configure Firebase Credentials

Edit `config/firebase.js` and replace placeholders:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Set Security Rules

Copy the contents of `firebase-rules.json` to your Firebase Console → Realtime Database → Rules.

### 4. Create Admin Account

1. In Firebase Console → Authentication → Add User
2. Create user: `admin@qaf.org` with a secure password
3. Copy the UID
4. In Realtime Database, create:
   ```json
   users/YOUR_ADMIN_UID: {
     "role": "admin",
     "email": "admin@qaf.org"
   }
   ```

### 5. ImageKit Setup (Optional)

1. Create account at [imagekit.io](https://imagekit.io)
2. Get your public key and URL endpoint
3. Update `config/imagekit.js`
4. Set up server-side auth endpoint for secure uploads

### 6. Seed Sample Data

Open `index.html` in browser, open DevTools console, and run:
```javascript
// Load the seed script first
const script = document.createElement('script');
script.src = 'js/utils/seed-data.js';
document.head.appendChild(script);

// Then run:
seedSampleData();
```

### 7. Deploy

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Hosting + Database)
firebase init

# Deploy
firebase deploy
```

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Public homepage with festival info |
| Register | `/pages/register.html` | Institution registration |
| Team Login | `/pages/team-login.html` | Team authentication |
| Dashboard | `/pages/team-dashboard.html` | Team management portal |
| Topics | `/pages/topic-registration.html` | Topic submission |
| Results | `/pages/results.html` | Live scoreboard |
| Admin Login | `/pages/admin-login.html` | Admin authentication |
| Admin | `/pages/admin-dashboard.html` | Full admin panel |

## 🎨 Design System

- **Theme**: Vintage Islamic Heritage
- **Colors**: Forest green, antique gold, warm ivory, dark brown
- **Fonts**: Playfair Display (headings), Source Sans 3 (body), Amiri (Arabic)
- **Features**: Dark/light mode, scroll reveals, skeleton loaders, toast notifications

## 🔒 Security

- Firebase Authentication with role-based access
- Database security rules (admin vs team permissions)
- Input sanitization (XSS prevention)
- Client-side validation
- Secure file upload via ImageKit

## 📊 Database Structure

```
├── teams/           # Registered institutions
├── students/        # Registered students
├── programs/        # Competition programs
├── categories/      # Program categories
├── topicSubmissions/ # Topic entries
├── results/         # Competition marks
├── leaderboard/     # Team rankings
├── announcements/   # Public announcements
├── notifications/   # Team notifications
├── settings/        # System configuration
├── users/           # Auth user mappings
└── auditLogs/       # Admin activity logs
```

## 📦 Tech Stack

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Backend**: Firebase Realtime Database
- **Auth**: Firebase Authentication
- **Storage**: ImageKit.io (images)
- **PDF Export**: jsPDF + html2canvas
- **Hosting**: Firebase Hosting

## 📄 License

All rights reserved © 2026 Quranic Art Fest
