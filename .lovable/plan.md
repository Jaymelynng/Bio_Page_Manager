
# Lock down the dashboard

Three changes, all behind the scenes. You won't notice anything different — but the dashboard will be properly secured.

## What I'm doing

**1. Make the admin flag actually work**
Right now the code has an "is admin" checkbox on each PIN, but it's ignored. I'll make it real:
- Only PINs marked as admin can reach the dashboard or any `/admin/*` page.
- If you ever hand a gym their own PIN, they'll be bounced out — they won't see other gyms.
- Today, only your "Jayme" PIN is admin, so nothing changes for you.

**2. Brute-force lockout on the PIN screen**
- After 5 wrong PIN attempts from the same browser, lock for 15 minutes.
- Stops bots from guessing 4-digit PINs.

**3. Fix Houston's missing short_code**
- Houston Gymnastics Academy has no short_code, so its campaign tracking links don't generate. I'll add one (`houstongym`) so it works like the other 9 gyms.

## What stays the same
- Your login flow — same PIN, same screen.
- The 🎁 secret access combo on gym pages.
- Every gym page stays public at `/biopage/:handle`.
- Drag-to-reorder, edit gym, analytics — all unchanged.

## Files touched (technical)
- `src/components/ProtectedRoute.tsx` — enforce the admin flag
- `src/hooks/usePinAuth.ts` — track failed attempts, enforce lockout
- `src/pages/AuthPage.tsx` — show lockout countdown if triggered
- New: `src/pages/NoAccess.tsx` — friendly "you don't have access" screen for non-admin PINs
- DB: one update to set Houston's short_code
