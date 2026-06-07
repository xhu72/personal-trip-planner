# Personal Trip Planner

A mobile app for planning, organizing, and remembering every personal trip — built with React Native, Expo, and Firebase.

## Features

#### Authentication
- **Welcome screen**: clean entry point with Get started and Sign in flows
- **Sign up screen**: create an account with name, email, and password; profile saved to Firestore
- **Login screen**: sign in with email and password; show/hide password toggle
- **Persistent session**: Firebase Auth remembers you across app restarts
- **Auto-redirect**: RouteGuard sends logged-in users straight to Home, logged-out users to Welcome

#### Trip management
- **Home screen**: lists all your trips with status badges (Upcoming / Active / Completed), and empty state
- **Create trip screen**: trip name, multi-destination adding, start/end dates with live day count, and total budget
- **Trip summary screen**: destination info, budget progress bar, per-day cost estimates broken down by category, over-budget warning

#### Security
- **User profiles**: read and write locked to the authenticated owner (`request.auth.uid == userId`)
- **Trips**: create requires the `userId` field to match the caller; read, update, and delete verify ownership against the stored `userId`
- **Activities**: create verifies the parent trip belongs to the caller; read, update, and delete look up the existing activity's trip and verify the same ownership chain
- No unauthenticated access is permitted to any collection


#### Itinerary management
- **Activities screen**: all activities grouped by day with Day N headers, category color-coded cards (Food, Transport, Attraction, Accommodation)
- **Add activity screen**: title, location, category picker, date (YYYY-MM-DD), time (HH:MM), duration in minutes with live human-readable preview
- **Edit activity screen**: update or delete any activity; mark as booked with confirmation number, provider name, and provider URL

## Screenshots

| Welcome | Login | Sign up |
|---------|-------|---------|
| <img src="assets/Welcome.PNG" width="200"/> | <img src="assets/Login.PNG" width="200"/> | <img src="assets/Signup.PNG" width="200"/> |
| Entry point with Get started and Sign in | Email + password with show/hide toggle | Name, email, password, confirm password |

| Home | Create trip | Trip summary |
|---------|-------|---------|
| <img src="assets/Home.PNG" width="200"/> | <img src="assets/Createtrip.PNG" width="200"/> | <img src="assets/TripSummary.PNG" width="200"/> |
| Trip cards with status badges | Destinations, date range, budget | Budget bar, cost per category |


| Activities | Add activity | Edit activity |
|---------|-------|---------|
| <img src="assets/Activities.PNG" width="200"/> | <img src="assets/Add-activity.PNG" width="200"/> | <img src="assets/Edit-activity.PNG" width="200"/> |
| Day-grouped list with category color dots | Title, location, category, date, time, duration | Update fields, mark as booked, and delete |

---

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React Native + Expo SDK 54 | Cross-platform iOS and Android |
| Language | TypeScript | Type-safe development |
| Routing | Expo Router v6 | File-based screen navigation |
| Auth | Firebase Authentication | Email/password login and session |
| Database | Cloud Firestore | Real-time trip data storage |
| Safe areas | react-native-safe-area-context | Notch and home bar handling |



## Getting started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone 

### 1. Clone and install

```bash
git clone https://github.com/xhu72/personal-trip-planner.git
cd personal-trip-planner
npm install
```

### 2. Set up environment variables

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

### 3. Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication → Email/Password**
3. Create a **Firestore** database in test mode
4. Deploy security rules: paste the contents of `firestore.rules` into **Firestore → Rules** and click Publish

### 4. Run

```bash
npx expo start --clear
```

Scan the QR code with Expo Go on your phone.


