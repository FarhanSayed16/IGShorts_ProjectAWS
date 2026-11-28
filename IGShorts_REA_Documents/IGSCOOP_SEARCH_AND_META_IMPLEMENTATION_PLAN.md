# IG Scoop / IGshorts — Is Search Live? Status + Implementation Plan

> Date: 2026-11-28  
> Honest status for leadership and build planning.

---

## 1. Direct answer (read this first)

### Can any person on Instagram be searched on our website right now?
**No.**

### What works right now?
| Capability | Status | Where |
|---|---|---|
| Official Meta Business Discovery lookup (exact professional username) | **Working** | API smoke test: `pnpm --filter @igshorts/api meta:lookup instagram` |
| Website search of people already in our DB/watchlist | **Partial / existing** | Charts/profiles search against PostgreSQL |
| Type any global Instagram user → full live profile served on site | **Not built** | Missing product + API route + UI |
| Followers / following / posts / stories for arbitrary users like AnonyIG | **Not available via official Meta** | Out of product scope for unofficial scrape |
| Public launch for all internet visitors using Meta API | **Blocked** until App Review + Business Verification | Meta app still Development mode |

### What Meta officially allows
Business Discovery can look up **one exact username at a time**, and mainly for **Instagram Professional accounts** (Business/Creator).  
It is **not** Instagram’s consumer “search anyone / similar names” engine.

So the correct product promise is:

> “Search our curated tracked creators. If missing, request/track exact professional handles via official Meta.”

Not:

> “Search every Instagram account on Earth live.”

---

## 2. Current system layers

```text
[Website UI]
   ├─ Search box / command palette
   │     today → queries OUR database only
   │     missing → no Meta live fallback yet
   │
[API]
   ├─ /profiles?q=...     → DB search
   ├─ /profiles/:username → DB profile
   ├─ Meta adapter        → LIVE for scripts / sync when PROVIDER=meta
   │
[Meta Graph Business Discovery]
   └─ works with your Page token + IG Business ID (dev mode)
```

**Bottom line:** Meta pipe is live in backend testing. Website “search any person and show full IG profile” is **not** live yet.

---

## 3. What you can test right now

### A. Meta API (backend) — YES, test now
```powershell
cd D:\IGShorts_ProjectAWS
pnpm --filter @igshorts/api build
pnpm --filter @igshorts/api meta:lookup instagram
pnpm --filter @igshorts/api meta:lookup cristiano
```
If followers come back, Meta credentials + adapter are good.

### B. Website “any global person” — NO, not yet
Opening localhost/Vercel and typing a random Instagram username will **not** reliably fetch a brand-new Meta profile into the UI until Phase 2–3 below are built.

### C. Website tracked people — YES, if DB has them
If a creator is already seeded/imported in Postgres, `/profiles` and charts search can show them.

---

## 4. Implementation plan (phased)

### Phase 0 — Stabilize Meta foundation (1–2 days) ✅ mostly done
**Goal:** Official lookup works in backend.

- [x] Meta app + Page + IG business linked  
- [x] Env vars stored locally  
- [x] Live Business Discovery adapter  
- [x] `meta:lookup` smoke test passed (`@instagram`)  
- [ ] Rotate exposed secrets  
- [ ] Re-test lookup after rotation  

**Exit criteria:** `meta:lookup` returns followers for 3 known professional handles.

---

### Phase 1 — Watchlist Meta refresh (3–5 days)
**Goal:** People already in our DB get fresh official follower counts.

1. Finalize seed list of professional usernames (Global / India).  
2. Ensure each is in `CreatorProfile` (+ scopes).  
3. Run Meta sync for watchlist (`PROVIDER=meta`).  
4. Rebuild rankings from snapshots.  
5. Show source label on profile (“Meta Business Discovery”, observed time).

**Exit criteria:** Chart profiles show non-null Meta snapshots; missing handles stay null (honest).

**Your input needed:** seed username CSV/list.

---

### Phase 2 — Website search UX (exact handle) (4–7 days)
**Goal:** User can type `@username` on the website and get a clear result path.

1. Search parser: `@handle` / profile URL / display name.  
2. Tier A: search local DB first (<20ms).  
3. Tier B: if exact handle not in DB → call Meta Business Discovery once.  
4. If Meta success → upsert profile + snapshot → open profile page.  
5. If Meta fail → Billboard empty state:  
   - “Not a tracked/verified professional account (or not found).”  
   - Button: **Request to track** → `SearchIntakeQueue` / `ClaimRequest`.  
6. Never show fabricated followers/impressions/stories.

**Exit criteria:**  
- Known pro handle not in DB can be fetched once and shown.  
- Random personal/private handle fails cleanly.

---

### Phase 3 — Profile detail completeness (official fields only) (3–5 days)
**Goal:** Profile page shows what Meta allows.

Show when available:
- username, name, biography, website  
- followers_count, follows_count, media_count  
- profile picture  
- last observed timestamp + source  

Do **not** promise:
- stories viewer  
- private account unlock  
- impressions/reach for third-party accounts  
- “accounts who viewed you”

**Exit criteria:** Profile page renders Meta-backed fields with honest empty states.

---

### Phase 4 — Intake queue + admin ops (3–5 days)
**Goal:** Untracked searches become an ops workflow.

1. `SearchIntakeQueue` table (handle, search_count, status).  
2. Admin OCC page: pending requests.  
3. One-click “Fetch via Meta” / approve / reject.  
4. Rate-limit public Meta lookups (protect quota).

**Exit criteria:** Admin can process requested handles without engineering help.

---

### Phase 5 — Public Meta launch readiness (1–3 weeks, gated)
**Goal:** Real public users can use Meta-backed features.

1. Privacy / Terms / Data Deletion pages live + linked in Meta app.  
2. Business Verification.  
3. App Review / Advanced Access.  
4. Production secrets in AWS Secrets Manager / host env.  
5. Monitoring: Meta errors, quota, failed lookups.

**Exit criteria:** App leaves Development-only mode for approved permissions.

---

## 5. What is still required from YOU

| # | Item | Why |
|---|---|---|
| 1 | Rotate Meta App Secret + Page token | Secrets were exposed in chat |
| 2 | Confirm seed list of pro creators | Charts/search need a curated universe |
| 3 | Decide brand: IGshorts vs IG Scoop UI | Naming consistency |
| 4 | Legal page content/URLs | Required for App Review |
| 5 | Business Verification + App Review submission | Needed for public Meta usage |
| 6 | Approve next build phase (1 or 2) | So engineering starts the right slice |

---

## 6. Recommended next build order (practical)

**This week**
1. You rotate secrets + re-run `meta:lookup`  
2. You send seed usernames (even 50–100 to start)  
3. Engineering executes **Phase 1** (watchlist Meta refresh)  
4. Engineering starts **Phase 2** search UX (DB first + Meta exact fallback)

**Then**
5. Phase 3 profile fields  
6. Phase 4 intake queue  
7. Phase 5 App Review for public

---

## 7. One-sentence truth

**Meta lookup works in our backend today for exact professional usernames; the website cannot yet search all global Instagram people live — that requires Phases 1–2 (product) plus App Review (public Meta access).**
