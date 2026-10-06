# UI / Backend Integration Gaps

After completing the frontend overhaul and polish (Phase 6), a few minor gaps remain between the UI expectations and the backend API contracts.

1. **Authentication Scope for Demo Tools**: 
   - The UI Demo Dock makes calls to `POST /admin/clock` to advance time. By default, the `api/client.js` attaches a mock admin token, but the backend must ensure this endpoint does not strictly validate a real JWT if `VITE_DEMO=true` or it must accept the mock token.
2. **Dashboard Exchange Endpoints**: 
   - `Home.jsx` fetches `GET /requests/mine`, `GET /exchanges/mine?role=owner`, and `GET /exchanges/mine?role=borrower`. Ensure the backend distinguishes correctly between "requests" (not yet accepted) and "exchanges" (accepted and progressing).
3. **Skeleton Loading vs Backend Latency**: 
   - The UI implements skeleton loaders which look great, but if the Spring Boot server wakes up from sleep (e.g., if hosted on a free tier), the initial request may time out before loading. The frontend timeout in `api/client.js` may need to be extended.
4. **Photo Uploads (`FileService`)**:
   - If the backend strictly enforces magic-byte checking (PNG/JPEG/WEBP), some test browser uploads using mock `Blob` objects during UI testing might fail. 
5. **AI Need Discovery**:
   - `NeedDiscovery.jsx` relies on `POST /needs/analyze`. If `ANTHROPIC_API_KEY` is missing in the backend, the backend must return a valid fallback response (e.g., rule-based matching) so the UI doesn't crash.
