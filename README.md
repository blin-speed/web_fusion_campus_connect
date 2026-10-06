# Campus Circular

A peer-to-peer resource lending marketplace for university campuses.

## Quickstart

```bash
# 1. Start the database
docker compose up -d db

# 2. Run the Spring Boot backend
cd backend
./mvnw spring-boot:run

# 3. Install frontend dependencies (in a new terminal)
npm i

# 4. Start the frontend
npm run dev
```

The app will be available at http://localhost:5173. The DB will automatically seed with sample locations, users, categories, templates, items, and a historic exchange.

## 5-Minute Demo Script

This script covers the full lifecycle of a rental, including late fees, damage claims, and the admin resolution process.

### Scenario 1: Happy Path
1. **Login**: Click on the Account Switcher (top right) and sign in as **Rohan** (Borrower).
2. **Discover & Quote**: Browse available items, or use the Need-Based AI search ("I need a camera for a shoot"). Click on **Aisha's Sony Alpha A6400**.
3. **Request**: Pick dates for tomorrow. Review the auto-generated **Quote** and the **Agreement text**. Check the acceptance box and submit.
4. **Acceptance**: Switch user to **Aisha** (Owner). Go to the notifications/requests area and **Accept** Rohan's request. The exchange moves to `payment_pending`.
5. **Payment**: Switch back to **Rohan**. Pay the deposit and fees. The item is now ready for `handover`.
6. **Handover**: Switch to **Aisha**. Upload a "condition before" photo (or skip if testing without images) and confirm the item's condition. The item state becomes `borrowed`.
7. **Return**: Switch to **Rohan**. Hand the item back and confirm return. State becomes `returned`.
8. **Inspection & Settle**: Switch to **Aisha**. Inspect the item, report no damage. The exchange automatically settles. The platform holds the fee, and refunds Rohan's deposit.
9. **Rating**: Both users can rate each other. Aisha's trust score updates.

### Scenario 2: Late Return via Time Travel
1. Start a new exchange as above until the item is `borrowed`.
2. Login as **Admin** (password: `admin123`).
3. Go to Settings -> Advance Time, and add **+1 Day** to the clock.
4. Switch to **Rohan** (Borrower). The item now shows as **Overdue** (Red state) with a live-accruing late fee.
5. Rohan returns the item. Aisha inspects.
6. The system settles the transaction by deducting the late fee from Rohan's deposit and transferring it to Aisha.

### Scenario 3: Damage Dispute
1. Start a new exchange until it reaches the `returned` state.
2. Switch to **Aisha**. During inspection, claim ₹500 for a scratch on the lens. Attach a photo.
3. Switch to **Rohan**. Rohan receives the claim. Click **Contest** to disagree. The exchange locks into an `under_review` dispute.
4. Login as **Admin**.
5. Navigate to the **Disputes** tab. View the evidence from both sides.
6. Resolve the dispute by splitting the cost or favoring the owner. The platform executes the final deductions.

### Admin Dashboard
Explore the `/admin` route to view live platform metrics:
- Overall GMV, Deposits Held, and Platform Fees collected.
- Manage user suspensions (which block users from creating listings or requests).
- Toggle Global Settings like `platformFeePercent` and `requireListingApproval`.
