# Specification

## Summary
**Goal:** Fix the billing screen visibility so it only appears after a successful login, controlled via React state in App.tsx.

**Planned changes:**
- Ensure the billing screen container is hidden (not rendered/visible) when the app first loads and only the login screen is shown.
- After the user enters a valid 10-digit mobile number and clicks "Continue", update React state to hide the login screen and show the billing screen.
- If the mobile number is invalid, keep the billing screen hidden and display an error message.
- Replace any direct DOM style manipulation (`display: none/block`) with React state-based conditional rendering/visibility, consistent with the existing App.tsx pattern.

**User-visible outcome:** Users see only the login screen on load. After entering a valid 10-digit mobile number and clicking "Continue", the full billing UI becomes visible. Invalid numbers keep the billing screen hidden with an error shown.
