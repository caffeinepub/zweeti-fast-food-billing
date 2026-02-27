# Specification

## Summary
**Goal:** Pre-populate the Firebase OTP login screen with test credentials so they are ready to use on load.

**Planned changes:**
- Set the phone number input field's initial React state value to `+911234567890`
- Set the OTP input field's initial React state value to `123456`

**User-visible outcome:** When the login screen loads, both the phone number and OTP fields are already filled with test credentials, allowing immediate use of the Send OTP and Verify buttons without any manual input.
