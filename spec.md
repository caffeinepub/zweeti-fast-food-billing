# Specification

## Summary
**Goal:** Allow the Firebase OTP authentication flow to work when the app is served from localhost or 127.0.0.1, without breaking existing functionality.

**Planned changes:**
- Update `frontend/src/firebase.ts` so that the Firebase mock/stub treats `localhost` and `127.0.0.1` as authorized domains, preventing `auth/unauthorized-domain` errors during local development.
- Ensure the mock `RecaptchaVerifier` and `signInWithPhoneNumber` behave permissively when called from localhost so the OTP flow can be tested locally.
- Preserve all real Firebase credentials and existing exports (`auth`, `RecaptchaVerifier`, `signInWithPhoneNumber`) in `firebase.ts` unchanged.

**User-visible outcome:** The app loads and displays the OTP login screen without errors when accessed via `http://localhost` or `http://127.0.0.1`, and the Send OTP button works without throwing unauthorized-domain errors. Existing auto-login via localStorage continues to work as before.
