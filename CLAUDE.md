# Paceland v2 — Project Context

## Project location
/Users/txnixh/Documents/Strava But Better/PacelandApp
(parent folder has spaces — always quote in bash)

## What this is
Clean rebuild of Paceland — India's first running game with GPS-based 
territory conquest. Built on Expo SDK 54 + Firebase.

## Why we rebuilt
v1 had architectural issues that were faster to redo than untangle. 
v2 is ruthlessly scoped.

## In scope (only these features for MVP)
- Email auth (sign up, log in, log out)
- Map screen with live GPS
- Run tracking (start, pause auto, stop, distance, time, pace)
- Territory polygon save when run forms a closed loop
- Leaderboard ordered by total km
- Profile screen
- Google Fit integration (Android only)

## What's been built so far
- Day 1: Auth screen (email/password signup + login), Firestore user document creation, AsyncStorage persistence — merged to main
- Day 2: Bottom tab navigation (Home + Profile), Profile screen fetching user from Firestore, friendly auth error messages — merged to main
- Day 3: Map screen with live GPS — IN PROGRESS on day-3-map branch

## Out of scope (do NOT build, even if seems easy)
- Run clubs
- Weekly challenges
- Events / tickets
- Push notifications
- Apple Health (iOS not in MVP demo)
- Garmin Connect
- Onboarding flow (use sensible defaults)
- Wearables connect screen UI
- Anti-cheat
- Seasonal resets
- Hardware band

## Stack
- Expo SDK 54 (managed workflow)
- Firebase 12.x (modular SDK, never compat)
- Firestore with experimentalForceLongPolling: true
- AsyncStorage for auth persistence
- react-native-maps with Google provider
- expo-location for GPS
- expo-sensors for pedometer
- @react-navigation/native + bottom-tabs

## Firebase project
- Project ID: paceland-v2 (or whatever the new project is named)
- Region: asia-south1 (Mumbai)
- Auth: Email/Password enabled
- Firestore: production mode, in asia-south1

## How I (Tanish) work
- I read code but don't write it. Explain WHY before changes.
- Show me a diff before applying any edit.
- Tell me explicitly when I need to do manual steps (Firebase Console, EAS, USB phone connect).
- 4-6 focused hours per day. Demo to Jai Daga sir in 12 days (Day 3 of 14 today).
- I commit to: understanding every file, testing each step in real life, ruthless scope.

## Code conventions
- Functional React components only
- Hooks (useState, useEffect, etc.)
- All screens in src/screens/
- All configs in src/config/
- All shared components in src/components/
- Firebase modular SDK: import { getDoc, setDoc } from 'firebase/firestore'

## Don't do
- Don't add new dependencies without asking me first
- Don't push to main without testing
- Don't commit google-services.json, .env files, or any keys
- Don't write to package.json directly (use npm install)
- Don't add features that are out of scope above, even if "it's just one more thing"

## Branching workflow
- main = tested working code only
- Each day's work goes on a feature branch (e.g. day-2-navigation)
- Do NOT commit directly to main
- Do NOT merge to main until I (Tanish) test on my phone and approve
- Always verify current branch with `git branch` before any work