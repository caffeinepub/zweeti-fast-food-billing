# Specification

## Summary
**Goal:** Add auto-login from localStorage, a logout button, and improved mobile number validation to the Zweeti Pro login screen.

**Planned changes:**
- On component mount, check if `zweetiUser` exists in localStorage; if so, skip the login screen and show the billing UI directly (using a `useEffect` hook).
- Add a logout function that removes `zweetiUser` from localStorage and reloads the page; show a "Logout" button in the billing UI that is hidden during print.
- Update login validation so that if the entered mobile number is not exactly 10 digits, an alert shows `'Enter valid 10 digit mobile number'` and login is aborted; if valid, store the number in localStorage under `zweetiUser` and show the billing screen.

**User-visible outcome:** Users who have previously logged in are taken directly to the billing UI on page load. Users can log out via a button that returns them to the login screen. The login form enforces a 10-digit mobile number with an alert for invalid input.
