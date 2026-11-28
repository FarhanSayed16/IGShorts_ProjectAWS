# Meta Setup — Done in Code + What YOU Must Do

> Updated: 2026-11-28

## Done in this repo (by Cursor)

1. Stored Meta credentials in local gitignored `apps/api/.env` (not committed).
2. Implemented live **Instagram Graph Business Discovery** in `apps/api/src/ingestion/adapters/meta-graph.adapter.ts`.
3. Sync path now can write real follower snapshots + refresh display name / avatar from Meta.
4. Added smoke script: `pnpm --filter @igshorts/api meta:lookup`
5. Set local `PROVIDER=meta` so profile sync uses Meta when you run ingestion sync/jobs.
6. Updated `apps/api/.env.example` with Meta placeholders (no secrets).

Honest nulls remain: if Meta cannot resolve a handle, follower count stays `null` (never invents `0`).

---

## What YOU must do (manual / business)

### A. Security (do soon)
1. Because tokens/secret were pasted in chat, **rotate App Secret** in Meta App Settings → Basic.
2. Regenerate Page token (short user token → extend → `me/accounts`) and update `apps/api/.env`.
3. Never commit `.env` or paste tokens into chat/GitHub again.

### B. Verify Meta lookup on your machine
```powershell
cd D:\IGShorts_ProjectAWS
pnpm --filter @igshorts/api build
pnpm --filter @igshorts/api meta:lookup instagram
```
Expect a JSON block with a non-null `followers` number.

Optional second test:
```powershell
pnpm --filter @igshorts/api meta:lookup cristiano natgeo
```

### C. Legal pages required before App Review / public launch
Publish and paste URLs into Scoop Studio app settings:
- Privacy Policy
- Terms of Service
- Data Deletion instructions / callback URL
- App domain / site URL

### D. Meta Business / App Review (for public users, not just you)
1. Turn on **2FA** for the Business portfolio.
2. Complete **Business Verification** in Meta Business Suite.
3. Submit **App Review / Advanced Access** for the Instagram permissions you use.
4. Keep tracking Case `29697042746648693` (Data Handling) — useful, but don’t block local building.

### E. Product data you must provide
1. A **seed list of professional Instagram usernames** (Business/Creator) for Global / India boards.  
   Business Discovery looks up **one exact username at a time** and fails for many personal accounts.
2. Confirm brand naming for this codebase: keep **IGshorts** or rebrand UI copy to **IG Scoop**.

### F. Optional ops
1. When AWS account is ready: move secrets to AWS Secrets Manager (not plain chat/.env forever).
2. Keep Bedrock/GPU blocked; Meta path does not need them.

---

## What you do NOT need to do for local Meta testing
- Wait for Meta support email reply
- Build scrapers / AnonyIG-style systems
- Request impressions for arbitrary third-party accounts

---

## Suggested order this week
1. Run `meta:lookup instagram` (confirm green)  
2. Rotate secrets after confirmation  
3. Draft Privacy / Terms / Data Deletion pages  
4. Finalize seed username list  
5. Tell Cursor: “sync watchlist via Meta” once seed list exists  
