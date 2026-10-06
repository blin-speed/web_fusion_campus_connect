# Campus Circular — Implementation Plan

This is a high-granularity plan designed for rapid execution and parallelizing work where possible.

## Phase 0: Infrastructure & Scaffold
1. **Infra**: Create `docker-compose.yml` with MySQL 8.4.
2. **Spring Boot Init**: Use start.spring.io via curl to generate `backend/` with Web, Validation, Data JPA, MySQL Driver, and Flyway. Keep Java 21, Maven.
3. **Core Configurations**: Create `application.yml` (DB settings, secrets, default configurations) and `Clock` bean (for time-travel demo capability).
4. **Database Schema & Seed**: Add Flyway scripts: `V1__schema.sql` (12+ tables matching spec) and `V2__seed.sql` (seed data).
5. **Frontend Proxy**: Update `vite.config.js` with proxy rules for `/api` to `http://localhost:8080`.

## Phase 1: Core Backend (Users, Auth, Trust)
1. **Entities & JPA Repositories**: Create `User`, `Location` entities.
2. **Auth Layer**: Implement dummy JWT generation (`/auth/login`) and an `AuthInterceptor` (rejects suspended users on POST/PUT).
3. **Controllers**: `UserController` (Profile, listing users), `AuthController`.
4. **Trust Engine**: `TrustService` that calculates real-time rating average, successful exchanges, late returns, disputes lost, and outputs the `TrustBadge`.

## Phase 2: Listings, Photos & Search
1. **Entities**: `Post`, `Category`, `ItemType`, `Photo`.
2. **Uploads**: Implement `FileService` for disk storage and `Photo` database record creation. Magic-byte checking for png/jpeg/webp.
3. **Listings CRUD**: Endpoints to create, update, and unlist posts. Approvals bypass logic via `requireListingApproval` setting.
4. **Search/Discovery Engine**: Implement `GET /posts` search API. Must support filters, distance sorting (Haversine SQL formula), condition bounds, and `availableOnly` logic.

## Phase 3: Quotes, Payments & Requests
1. **Pricing Engine**: Build `PricingService` with unit tests (`unitHours`, `charge`, `fee`, `lateFee`, `depositRefund`).
2. **Agreement Generation**: Implement Quote API to generate `agreement_snapshot` on the fly for potential borrowers.
3. **Requests**: Endpoints for a borrower to submit a request and for an owner to accept (reserving the item) or reject. 

## Phase 4: State Machine (Handover to Settlement)
1. **Entities**: `Exchange`, `ExchangeEvent`, `Transaction`, `Dispute`.
2. **Handover & Borrowed**: Implement `pay` and `handover` flows. Capture condition lists and photo proofs.
3. **Return & Inspect**: Compute late fees upon return. Inspection phase with condition comparisons.
4. **Settlement**: If damage is claimed, open dispute. Otherwise, auto-settle. Finalize transactions into ledger.
5. **Ratings**: Borrower and owner rate each other, updating `TrustScore`.

## Phase 5: Need-Based AI Discovery
1. **Schema**: `NeedTemplate` definitions and `DemandRequest`.
2. **Interpreter Engine**: `NeedInterpreter` (Rules first, Anthropic JSON API fallback if `ANTHROPIC_API_KEY` is present). 
3. **Matching Engine**: Implement scoring: `0.30*suitability + 0.20*trust + 0.15*proximity + ...`
4. **Bundle Generation**: Suggest complementary items to fulfil a need. Add endpoints for community demand requests.

## Phase 6: Admin Controls & Impact
1. **Admin Dashboard APIs**: Total stats, GMV, total fees, listings queue, dispute queue.
2. **Settings Mutators**: Overriding `platformFeePercent`, `dueSoonHours`, and `Clock` offset (time travel).
3. **Impact API**: Aggregate stats for money saved, CO2 proxy, and resources reused.
4. **Demo Reset**: `/admin/reset-demo` endpoint that truncates dynamic tables and reapplies the base seed data.

## Phase 7: Frontend Overhaul
1. **Strip Legacy DB**: Delete `src/db/` and `src/logic/`. Remove `idb` and `fuse.js` dependencies.
2. **API Client**: Build `src/api/client.js` wrapping `fetch` and auth tokens.
3. **Context Wiring**: Refactor `CurrentUserContext` to use real API login and token storage.
4. **UI Adaptation - Forms**: Rewrite Create Post to include dynamic item conditions, rate units, and the new Multi-Photo uploader.
5. **UI Adaptation - Post Detail**: Hook up the new live Quote generation and Agreement modal.
6. **UI Adaptation - Exchanges**: Implement the StatusStepper logic to parse `allowedActions` and render appropriate Handover/Return/Inspect modals. ConditionCompare viewer.
7. **UI Adaptation - AI Search**: New need-based search bar and comparative UI.
8. **Admin Panel**: Rebuild the Admin UI to be tab-based, calling live APIs for disputes, settings, and time-travel.

## Phase 8: Hardening & Scripts
1. **Scripts**: Build `scripts/smoke.sh` executing curl commands traversing an entire exchange lifecycle.
2. **Final Polish**: `npm run lint` and CSS cleanup.
3. **Documentation**: Update `README.md` and export `docs/API.md`.
