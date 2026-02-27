# Specification

## Summary
**Goal:** Update the Firebase `authDomain` configuration value to `yourdomain.com` in the frontend Firebase setup file.

**Planned changes:**
- In `frontend/src/firebase.ts`, update the `authDomain` field in the `firebaseConfig` object to `'yourdomain.com'`

**User-visible outcome:** The Firebase configuration uses the updated `authDomain` value while all other configuration fields and exports remain unchanged.
