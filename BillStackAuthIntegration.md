# BillStack API Authentication Integration

## Overview
This document describes the steps taken to integrate BillStack API authentication (register and login) into the project, including handling npm dependency conflicts and adding demo usage.

---

## Steps

### 1. Created BillStack API Authentication Utility
- Added a new file: `src/lib/billstackApi.ts`
- Implemented two functions using axios:
  - `registerUser(payload)` for user registration
  - `loginUser(payload)` for user login
- Defined TypeScript interfaces for request payloads.

### 2. Installed Axios Dependency
- Attempted to install axios with `npm install axios`.
- Encountered npm dependency conflict (ERESOLVE) due to peer dependencies with eslint-plugin-react-hooks.
- Resolved by running:
  - `npm install axios --legacy-peer-deps`

### 3. Added Demo Usage in a Page
- Updated `src/pages/dashboard/ReferAndEarn.tsx`:
  - Imported `registerUser` and `loginUser`.
  - Created a `BillstackAuthDemo` component with forms for registration and login.
  - Handles API calls and displays results.

---

## Troubleshooting
- If npm install fails due to dependency conflicts, use `--legacy-peer-deps`.
- Review npm audit output for vulnerabilities and address as needed.

---

## Next Steps
- Integrate authentication demo into main UI as needed.
- Proceed with other BillStack API features (e.g., airtime, data, utilities).

---

## References
- BillStack API Docs: https://billstack.apps.fuspay.finance/v1/docs#/
- Axios Docs: https://axios-http.com/

---

_Last updated: February 23, 2026_
