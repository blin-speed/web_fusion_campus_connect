# API Contract (`/api/v1`)

All endpoints expect JSON unless noted, and require `Authorization: Bearer <jwt>` unless marked **public**.

## Errors
All endpoints return:
`{ "error": { "code": "STRING", "message": "human text", "details": {...} } }`
Status codes: 400 (Validation), 401 (Unauthenticated), 403 (Forbidden/Suspended), 404 (Not Found), 409 (Conflict).

## Auth & Users
- `POST /auth/login` (public) - Body: `{userId}` -> `{token, user}`
- `POST /auth/register` (public) - Body: `{name, department, year, locationId?}` -> `{token, user}`
- `POST /admin/login` (public) - Body: `{password}` -> `{token}` (role=admin)
- `GET /users` (public) - Returns list of users for UserSwitcher
- `GET /users/{id}` (public) - Profile data including trust and recent reviews
- `PATCH /users/me` - Body: `{department?, year?, bio?, locationId?}`
- `GET /locations` (public) - Returns list of campus locations

## Posts (Resources)
- `GET /posts` (public) - Discovery (filters: q, category, condition, maxDistanceM, fromLocationId, minOwnerRating, price, sort). Returns array of PostSummary
- `GET /posts/{id}` (public) - Full PostDetail
- `POST /posts` - Create listing (starts pending_approval). Returns PostDetail
- `PUT /posts/{id}` - Edit an available listing
- `DELETE /posts/{id}` - Unlist an available listing
- `GET /posts/mine` - Returns own listings
- `GET /posts/{id}/quote` - `?start=ISO&end=ISO` - Generates Quote with agreement text
- `GET /posts/{id}/history` (public) - Past exchange history

## Requests & Exchanges
- `POST /posts/{id}/requests` - Submit request (borrower). Body: `{start, end, message?, agreementAccepted, dropoffLocationId?}`
- `GET /requests/mine` - Borrower's requests
- `GET /posts/{id}/requests` - Owner's incoming requests
- `POST /requests/{id}/accept` - Owner accepts request (creates exchange)
- `POST /requests/{id}/reject` - Owner rejects request
- `POST /requests/{id}/cancel` - Borrower cancels request
- `GET /exchanges/mine?role=owner|borrower` - User's exchanges
- `GET /exchanges/{id}` - Full Exchange details
- `PATCH /exchanges/{id}/locations` - Update pickup/dropoff locations
- `POST /exchanges/{id}/pay` - Borrower pays (state -> handover)
- `POST /exchanges/{id}/handover` - Owner confirms handover. Body: `{conditionBefore, photoIds}`
- `POST /exchanges/{id}/return` - Borrower returns. Body: `{notes?, photoIds}`
- `POST /exchanges/{id}/inspect` - Owner inspects. Body: `{conditionAfter, photoIds, damage?:{amount, notes}}`
- `POST /exchanges/{id}/damage/accept` - Borrower accepts damage claim (settles)
- `POST /exchanges/{id}/damage/contest` - Borrower contests (opens dispute)
- `POST /exchanges/{id}/rate` - Submit rating. Body: `{rating, review?}`
- `GET /exchanges/{id}/condition` - Before/after comparison
- `GET /exchanges/{id}/transactions` - Financial ledger

## Photos
- `POST /photos` - Multipart form: `file`, `purpose`, `postId`/`exchangeId`/`disputeId`. Returns `{id, url}`
- `GET /files/{id}` (public) - Stream file
- `DELETE /photos/{id}` - Remove uploaded photo

## Disputes
- `GET /disputes/mine`
- `GET /disputes/{id}`
- `POST /disputes/{id}/evidence` - Add evidence photos
- `POST /exchanges/{id}/report` - Raise dispute manually

## AI Discovery
- `POST /discover/need` - `{"text", "fromLocationId", "needBy", "maxBudget"}`
- `POST /discover/compare` - Compare `postIds[]`
- `GET /demand-requests`
- `POST /demand-requests`
- `POST /demand-requests/{id}/fulfill`

## Admin
- `GET /admin/stats`, `/admin/users`, `/admin/posts`, `/admin/exchanges`, `/admin/disputes`, `/admin/transactions`
- `POST /admin/users/{id}/suspend`, `/unsuspend`, `/verify`
- `POST /admin/posts/{id}/approve`, `/reject`, `/flag`, `/unflag`
- `POST /admin/disputes/{id}/resolve` - `{resolution, finalDeduction, adminNote}`
- `GET /admin/settings`, `PUT /admin/settings`
- `POST /admin/clock` - Time travel offset
- `POST /admin/reset-demo` - Resets DB

## Impact
- `GET /impact` (public) - Campus impact statistics
