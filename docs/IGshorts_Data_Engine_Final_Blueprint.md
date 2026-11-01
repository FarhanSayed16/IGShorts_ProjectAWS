# IGshorts — Data Engine Final Blueprint

**Status:** Definitive reference document  
**Prepared:** 1 November 2026  
**Supersedes:** This document consolidates and confirms the decisions across `IGshorts_Refresh_Engine_Design.md` and `IGshorts_Profile_Data_Engine_System_Design.md`. Those documents remain valid as detailed references; this one answers "what exactly do we do, what does Meta give us, and what is the right track."

---

## 1. The One-Line Answer

**Yes, Meta gives you an official API to look up public professional Instagram accounts one handle at a time. No, Meta does not give you a directory of all Instagram users, a search engine, or a bulk export.** Your system is therefore a multi-source index, not a crawler, and that is the correct architecture.

---

## 2. Where Follower Counts Come From — Confirmed Sources

Your system has exactly **three approved data pipelines** today, plus one future expansion path. Nothing else is turned on. Nothing else should be turned on until the gates described below are passed.

### Source 1: FastSocial Top Charts (FREE — already working)

| Attribute | Detail |
|---|---|
| **What it is** | A CC BY 4.0 open dataset of ~2,000 of the most-followed Instagram accounts, maintained from Wikidata + a curated list |
| **What it gives** | Username, display name, follower count, category, country, entity type, observation date |
| **How to get it** | Download `latest.csv` from [github.com/FastSocialCo/instagram-top-accounts](https://github.com/FastSocialCo/instagram-top-accounts) |
| **Daily history** | `daily.csv.gz` from [fastsocial.co/instagram-stats/data/daily.csv.gz](https://fastsocial.co/instagram-stats/data/daily.csv.gz) |
| **Refresh cadence** | Their top 500 are observed daily; the rest every ~5 days |
| **Our import cadence** | Every 3 days — one file download, zero API calls |
| **Cost** | Free. Attribution required: "Data: FastSocial Top Charts, CC BY 4.0" |
| **Current state** | ✅ **Working.** 11,993 rows imported. `save-fastsocial.ts` and `import-open-datasets.ts` are production-ready. Idempotent, append-only snapshots. |
| **What it cannot do** | It is not a census of all Instagram. It does not cover creators under ~500K. It is not a live counter. |

**This is your primary bulk data source for the foreseeable future.** It keeps ~12,000 notable profiles current without spending a single API credit. Calling Meta for the same 12,000 people the file already covers would waste your entire daily quota on redundant data.

### Source 2: Meta Business Discovery API (OFFICIAL — not yet activated)

| Attribute | Detail |
|---|---|
| **What it is** | Meta's official Instagram Graph API endpoint for looking up **one public professional account** by exact username |
| **What it gives** | `username`, `name`, `biography`, `profile_picture_url`, `followers_count`, `follows_count`, `media_count`, `website` |
| **What it requires** | A Meta developer app → a Facebook Page you own → an Instagram Business/Creator account linked to that Page → a long-lived access token → App Review for the `instagram_basic` + `pages_show_list` + `pages_read_engagement` permissions (confirm exact set in current docs) |
| **API call** | `GET https://graph.facebook.com/v{VERSION}/{YOUR_IG_ACCOUNT_ID}?fields=business_discovery.username({TARGET_USERNAME}){username,name,biography,followers_count,...}&access_token={TOKEN}` |
| **Rate limit** | App/account-specific; Meta documentation describes limits per endpoint. Our internal throttle: **200 calls/hour** to start. |
| **Cost** | Free (no per-call charge from Meta). Cost is operational: maintaining the app, token renewal, App Review. |
| **Current state** | ❌ **Stub.** `meta-graph.adapter.ts` returns `null` on purpose. No app ID, no token, no App Review submitted. |

#### What Meta Business Discovery CAN do

- ✅ Look up the follower count for **one exact username** you provide
- ✅ Return basic public profile fields for **Business** and **Creator** accounts
- ✅ Confirm whether a specific professional account exists
- ✅ Give you a real, Meta-authorized number you can display

#### What Meta Business Discovery CANNOT do

- ❌ **List all Instagram users** — there is no directory/enumeration endpoint
- ❌ **Search by partial name** — you send an exact handle, not a query
- ❌ **Return personal/consumer accounts** — these come back empty, not zero
- ❌ **Return private accounts** — not accessible
- ❌ **Provide engagement/reach/audience data for someone else's account** — only the account owner can authorize that
- ❌ **Notify you when a new account is created** — no webhook for new users
- ❌ **Give you historical follower data** from before you started collecting
- ❌ **Provide a "rank" among all Instagram users** — that concept does not exist in Meta's API

#### The Five Mandatory Proof Tests Before Going Live

Before you write a single line of production Meta integration code, you must run and document these tests:

| # | Test | Expected result |
|---|---|---|
| 1 | Call your own IGshorts Business account | Returns your own profile fields and follower count |
| 2 | Call a known public **Creator** account (e.g., a celebrity you don't control) | Returns their public fields |
| 3 | Call a known public **Business** account | Returns their public fields |
| 4 | Call a known **personal/consumer** account | Returns empty/error — **must NOT be treated as zero followers** |
| 5 | Record the exact fields returned, permissions granted, rate limit headers, token lifetime, and App Review status | Written benchmark document |

**Current status of these tests:** NOT RUN. Provider mode is `seed`. No Meta app exists.

### Source 3: Wikidata (FREE — for candidate discovery only)

| Attribute | Detail |
|---|---|
| **What it is** | Structured knowledge base with Instagram usernames recorded as Wikidata Property P2003 |
| **What it gives** | Candidate handles for notable people, organizations, and public entities |
| **What it does NOT give** | Follower counts, profile pictures, verification status, or everyday creators |
| **Our use** | Generate candidate handles → resolve through Source 1 or Source 2 → never display a Wikidata entry as a "profile" without resolution |

### Source 4: Licensed Creator Database (FUTURE — not activated)

| Candidate | Starting price | What it offers |
|---|---|---|
| **Influencers Club** | ~$208/month + credits | Discovery search, handle enrichment (0.03–1.0 credits/profile), monitoring |
| **Modash** | ~$16,200/year (commercial) | Large index, weekly basic refresh, monthly deeper analytics |

**Current status:** No API key. No trial. No contract. `CREATOR_PROVIDER_MONTHLY_BUDGET_CREDITS = 0`.

**Gate before purchasing:** A 100-handle benchmark test (see Section 9) with written permission to store, display, rank, and retain historical data.

---

## 3. The Complete Data You Can Display Per Profile

This is what your profile page and rankings can realistically show, with the source of each field:

| Field | Source | Availability |
|---|---|---|
| Instagram handle | All sources | Always (it's the primary key) |
| Instagram profile link | Built from handle | Always: `https://www.instagram.com/{handle}/` |
| Display name | FastSocial, Meta, or seed list | Almost always |
| Follower count | FastSocial (bulk), Meta (per-handle), or licensed provider | When a source has returned a count |
| Follower count observation date | Stored per snapshot | Always accompanies a count |
| Audience group | Computed from follower count | When a valid count exists and is ≥ 10,000 |
| Chart position (India/Global) | Computed from curated chart scopes | Only for profiles in those scopes |
| Rank delta / movement | Computed from consecutive ranking rebuilds | After two successful ranking rebuilds |
| Category (Sports, Music, etc.) | FastSocial or editorial assignment | When the source provides it |
| Country/region | FastSocial or editorial assignment | When the source provides it |
| Biography | Meta Business Discovery | Only when Meta lookup succeeds |
| Profile picture | Meta or Wikipedia (with name validation) | When available from an approved source |
| Verification badge | Unknown until a source states it | Tri-state: true / false / unknown |
| Engagement rate | NOT AVAILABLE in v1 | Requires licensed provider or creator opt-in |
| Audience demographics | NOT AVAILABLE in v1 | Requires the account owner's authorization |
| Reach / impressions | NOT AVAILABLE in v1 | First-party Insights only |

---

## 4. Tiered Refresh Schedule — The Final Design

The core insight: **not every profile needs the same refresh frequency.** Famous people can gain millions of followers in days; someone with 50K followers might gain 500 in a month. Your budget (API calls and money) should follow the volatility.

### Tier Definitions

| Tier | Cohort | Follower range | Refresh interval | Rationale |
|---|---|---|---|---|
| **P0 — Flagship** | Chart members + 10M+ accounts | 10,000,000+ or on India/Global chart | **Every 2–3 days** | These rows ARE the product. High absolute movement. Chart-sensitive. |
| **P1 — Major** | Large notable accounts | 1,000,000 – 9,999,999 | **Every 5 days** | Meaningful ranking changes. Still volatile. |
| **P2 — Established** | Mid-tier creators | 100,000 – 999,999 | **Every 7 days** | Weekly freshness without excessive cost. |
| **P3 — Community** | Emerging creators | 10,000 – 99,999 | **Every 14 days** | Lower absolute movement. Cost-efficient. |
| **P4 — Emerging** | Small / long-tail | Under 10,000 | **Every 30 days or on-demand** | Not grouped yet. Minimal product value from frequent checking. |
| **Not measured** | No count ever recorded | — | **No automatic schedule** | One attempt, then wait for a source |

### How Profiles Move Between Tiers

When a new follower count crosses a tier boundary by **≥ 15%**, the profile moves to the new tier on the next scheduler pass. This 15% buffer prevents flickering when a count sits right on a boundary (e.g., 99,500 → 100,200 → 99,800 would not bounce between tiers).

First measurement goes directly into the tier containing that count — no buffer needed for initial placement.

### Priority Overrides

| Condition | Effect |
|---|---|
| Profile is on the India or Global chart | Force P0 regardless of follower count |
| User explicitly clicked "Track this creator" | Refresh at the shorter of their tier interval and 3 days |
| High search demand detected | Temporarily raise priority |
| Large sudden growth/decline (>20% week-over-week) | Temporarily refresh more frequently to confirm |
| Repeated API failures (5+ consecutive) | Pause and fall back to 14-day retry |
| Account went private or personal | Suspend automatic refresh |

### What This Costs — Call Volume Model

The key optimization: **FastSocial covers ~12,000 profiles for free.** Meta API calls are only for the gap.

| Job | Frequency | Profiles touched | Live API calls |
|---|---|---|---|
| FastSocial file import | Every 3 days | ~12,000 rows | 0 (one file download) |
| Chart confirmation (Meta) | Every 2 days | ~100–200 chart rows whose file reading is stale | ~100–150/day |
| Exact handle lookup | On demand (user types a new handle) | 1 per search miss | 1 per request |
| Tracked profiles refresh | Per tier schedule | Only explicitly tracked profiles | Bounded by tracking list |
| Blank-count proof | One-time | 94 seed names with no count | 94 calls total |
| Ranking rebuild | Every 7 days | All chart-scoped profiles | 0 (uses stored snapshots) |

**Total daily Meta calls at launch: ~100–200.** Well within the 200/hour self-imposed cap.

---

## 5. System Architecture — What Needs to Be Built

### 5.1 What Already Exists ✅

| Component | Status | Location |
|---|---|---|
| FastSocial CSV importer | ✅ Working | `apps/api/src/ingestion/creator-index/save-fastsocial.ts` |
| Open dataset parser | ✅ Working | `apps/api/src/ingestion/creator-index/import-open-datasets.ts` |
| Audience group classifier | ✅ Working | `apps/api/src/ingestion/creator-index/audience.ts` |
| Handle normalization | ✅ Working | `apps/api/src/ingestion/creator-index/normalize-handle.ts` |
| Meta Graph adapter (stub) | ✅ Stub ready | `apps/api/src/ingestion/adapters/meta-graph.adapter.ts` |
| Adapter interface | ✅ Defined | `apps/api/src/ingestion/adapters/adapter.interface.ts` |
| Wikipedia enrichment | ✅ Working | `apps/api/src/ingestion/wikipedia.enrichment.ts` |
| Ingestion service + module | ✅ Working | `apps/api/src/ingestion/ingestion.service.ts` |
| Snapshot append-only storage | ✅ Working | `metricSnapshot` table with `rawPayloadRef` dedup |
| Job run logging | ✅ Working | `jobRun` table |
| Audit logging | ✅ Working | `auditLog` table |
| Admin dashboard (basic) | ✅ Working | `apps/web/app/admin/` |
| Chart system (India + Global) | ✅ Working | Chart scopes, ranking API |
| Null-handling (never coerce to zero) | ✅ Enforced | Throughout ingestion pipeline |

### 5.2 What Needs to Be Built 🔨

| Component | Priority | Description |
|---|---|---|
| **Meta developer app + App Review** | 🔴 Critical | Create the app, link your own IG Business account, submit for `instagram_basic` permissions, run the five proof tests |
| **Live Meta adapter** | 🔴 Critical | Implement `fetchProfileData` in `meta-graph.adapter.ts` with actual Graph API calls, token management, rate limiting |
| **Token renewal job** | 🔴 Critical | Long-lived tokens expire. A background job must refresh them before expiry. Store securely server-side. |
| **`profile_refresh` queue table** | 🟡 High | Stores band, interval, `next_check_at`, last attempt/success, consecutive failures, paused flag per profile |
| **Refresh scheduler** | 🟡 High | Selects due profiles by priority, respects daily budget cap, enqueues Meta calls |
| **FastSocial auto-import cron** | 🟡 High | Automate the 3-day file download (currently manual CLI) |
| **Provider cost dashboard** | 🟡 High | Show calls used, budget remaining, failures, stale profiles in admin panel |
| **Exact-handle search (new handles)** | 🟡 High | When a user searches a handle we don't have, queue one Meta lookup (after proof tests pass) |
| **Ranking rebuild cron** | 🟡 High | Weekly rebuild of India/Global chart order from stored snapshots |
| **Profile detail page (public)** | 🟡 High | Show follower count, audience group, chart position, freshness, category, country for each profile |
| **Follower history chart** | 🟢 Medium | Line graph showing follower count over time from stored snapshots |
| **Analytics dashboard for creators** | 🟢 Medium | Where they stand, their group, their rank trajectory, nearby competitors |
| **Creator opt-in / "Track me"** | 🟢 Medium | Let a creator submit their handle for tracking |
| **User registration + watchlists** | 🟢 Medium | Email/Google sign-in, saved profiles, group-change alerts |
| **Licensed provider integration** | 🔵 Future | Only after 100-handle trial passes and contract is signed |
| **Country/category cohort rankings** | 🔵 Future | Only with defensible country provenance |

---

## 6. Database Tables — What to Add

### `profile_refresh` (new)

```sql
CREATE TABLE profile_refresh (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES creator_profile(id),
  band            TEXT NOT NULL DEFAULT 'ungrouped',
  -- 'chart' | 'major' | 'public' | 'established' | 'community' | 'ungrouped' | 'unmeasured'
  interval_days   INTEGER NOT NULL DEFAULT 30,
  next_check_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT,
  is_paused       BOOLEAN NOT NULL DEFAULT false,
  pause_reason    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);

CREATE INDEX idx_profile_refresh_due ON profile_refresh (next_check_at)
  WHERE NOT is_paused;
CREATE INDEX idx_profile_refresh_band ON profile_refresh (band);
```

### `refresh_jobs` (new — or extend existing `job_run`)

```sql
CREATE TABLE refresh_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name          TEXT NOT NULL,
  -- 'fastsocial_import' | 'chart_confirm' | 'exact_lookup' | 'track_refresh' | 'blank_proof' | 'ranking_rebuild'
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at       TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'running',
  profiles_considered INTEGER DEFAULT 0,
  snapshots_added   INTEGER DEFAULT 0,
  api_calls_used    INTEGER DEFAULT 0,
  misses            INTEGER DEFAULT 0,
  failures          INTEGER DEFAULT 0,
  credits_used      DECIMAL(10,4) DEFAULT 0,
  error_summary     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. The Refresh Engine — One Pass Algorithm

```text
Every scheduled run:

1. IF FastSocial import is due (every 3 days):
   → Download latest.csv
   → Upsert snapshots via existing save-fastsocial pipeline
   → Recompute audience groups for any changed counts
   → Update profile_refresh.next_check_at for all affected profiles

2. SELECT profiles WHERE:
   → next_check_at <= NOW()
   → is_paused = false
   → A FastSocial reading inside the band interval does NOT already exist
   ORDER BY:
     a) band = 'chart' first
     b) user-tracked profiles
     c) highest staleness ratio (days_overdue / interval_days)
   LIMIT remaining_daily_budget

3. FOR EACH selected profile:
   → Call Meta Business Discovery for that exact username
   → Wait between calls (respect rate limit)
   → On HTTP 429: stop batch, retry next hour

4. ON SUCCESS:
   → Append new metric_snapshot (never overwrite)
   → Update profile_refresh: reset failures, advance next_check_at
   → Recompute audience group if count crosses a tier boundary

5. ON FAILURE:
   → Keep last valid count
   → Increment consecutive_failures
   → Push next_check_at out: 1d → 2d → 4d → 7d → 14d cap
   → After 5 failures: pause profile, record reason

6. WEEKLY (every 7 days):
   → Rebuild India and Global chart rankings from stored snapshots
   → Movers/deltas appear only after 2+ successful rebuilds
   → Do NOT add the full FastSocial index to charts (charts stay curated)

7. NEVER:
   → Call Meta during a page render (page reads database only)
   → Treat a failed lookup as zero followers
   → Scrape Instagram directly
```

---

## 8. What the Public Site Should Show

### Profile Freshness States

| State | When | Display |
|---|---|---|
| **Recently checked** | Newest count is within the tier interval | ✅ Checked {date} · Source: {source} |
| **Update overdue** | Count exists but tier interval has passed | ⚠️ Last checked {date} · Update overdue |
| **Not measured yet** | No count has ever been stored | ℹ️ Not measured yet |
| **Could not verify** | We tried, got nothing, and have no older count | ❌ Could not verify |

### Analytics & Charts We Can Build Now

| Feature | Data source | Feasibility |
|---|---|---|
| **Follower count leaderboard** | Stored snapshots | ✅ Ready now |
| **Follower growth over time** | Historical snapshots (append-only) | ✅ Ready now (grows richer with each import) |
| **Audience group badge** | Computed from latest count | ✅ Ready now |
| **Group transition history** | Computed from snapshot history | ✅ Ready now |
| **Rank movement (movers)** | Computed from consecutive ranking rebuilds | ✅ After 2+ ranking runs |
| **"Where you stand" positioning** | Percentile within IGshorts-indexed cohort | ✅ When cohort is well-defined |
| **Country leaderboard** | Country from FastSocial/editorial | ⚠️ Partial (depends on source coverage) |
| **Category breakdown** | Category from FastSocial/editorial | ⚠️ Partial (not all profiles have a category) |
| **Engagement rate** | ❌ Not available from current sources | 🔵 Requires licensed provider |
| **Audience demographics** | ❌ Requires account owner's auth | 🔵 Future creator opt-in |

### Honest Labeling Rules

Every ranking output must state:

- **What the cohort is:** "Among IGshorts-indexed creators" — NOT "on all of Instagram"
- **The sample size:** "Ranked among 12,107 tracked profiles"
- **The observation window:** "Based on observations collected through {date}"
- **The attribution:** "Data: FastSocial Top Charts, CC BY 4.0" where applicable

---

## 9. The Right Track — Step-by-Step Execution Order

### Phase 0: Foundation (Week 1–2)

- [ ] Schedule FastSocial file auto-import every 3 days (currently manual)
- [ ] Deploy API and web so published pages use the imported data
- [ ] Create a Meta developer app at [developers.facebook.com](https://developers.facebook.com)
- [ ] Link an Instagram Business account you own to a Facebook Page
- [ ] Submit App Review for Business Discovery permissions

### Phase 1: Meta Proof-of-Concept (Week 2–3)

- [ ] Run the five mandatory proof tests (Section 2, Source 2)
- [ ] Record results in `docs/IGshorts_Provider_Benchmark.md`
- [ ] If a personal account returns a count → STOP and fix the request
- [ ] Implement live `fetchProfileData` in `meta-graph.adapter.ts`
- [ ] Implement token renewal job
- [ ] Build `profile_refresh` queue table

### Phase 2: Activate Chart Confirmation (Week 3–4)

- [ ] Turn on chart confirmation every 2 days, capped at 200 calls/day
- [ ] Run the one-time pass over 94 blank-count seed profiles
- [ ] Build provider cost/health dashboard in admin panel
- [ ] Implement exact-handle search (queue one Meta call for new handles)

### Phase 3: Ranking & Analytics (Week 4–6)

- [ ] Turn on weekly ranking rebuild
- [ ] Build follower history charts per profile
- [ ] Build "where you stand" audience group positioning
- [ ] Build mover/climber/decliner visualizations
- [ ] Add creator registration / "Track this creator"

### Phase 4: Scale & Enrich (Month 2+)

- [ ] Run 100-handle benchmark against Influencers Club trial
- [ ] Evaluate Modash if budget allows
- [ ] Only then: purchase a licensed provider for gap coverage
- [ ] Add country cohort rankings (with provenance disclaimer)
- [ ] Add category-based leaderboards
- [ ] Consider engagement/analytics enrichment

### Phase 5: Creator Accounts & Premium (Month 3+)

- [ ] Add email/Google sign-in for users
- [ ] Saved creator watchlists and group-change alerts
- [ ] Comparison reports and advanced analytics
- [ ] Optional premium tier for detailed reports

---

## 10. What This System Will NOT Promise

These are deliberate product boundaries, not limitations to apologize for:

1. **Not a directory of every Instagram profile.** We index what our sources can measure.
2. **Not a live follower counter.** Counts are point-in-time observations, dated honestly.
3. **Not a search engine like Instagram's.** We search our own index by exact handle and name.
4. **Not a "world rank."** We rank within our measured cohort and say so.
5. **Not a scraper.** Every number has a licensed/approved source.
6. **Not an engagement analytics platform (yet).** That requires either a licensed provider or creator opt-in.
7. **Not a replacement for Instagram Insights.** Only the account owner can see their own reach/demographics.

---

## 11. Environment Variables Required

```env
# ── Meta Business Discovery ──
META_APP_ID=                          # From developers.facebook.com
META_APP_SECRET=                      # From developers.facebook.com
META_GRAPH_API_VERSION=v21.0          # Check current version
META_IG_CALLER_ACCOUNT_ID=            # Your own IG Business account ID
META_ACCESS_TOKEN=                    # Long-lived token (server-side only!)
META_ACCESS_TOKEN_EXPIRES_AT=         # ISO 8601 expiry datetime

# ── Refresh Engine ──
CRON_ENABLED=false                    # Keep OFF until queue + budget exist
PROVIDER=seed                         # Change to 'meta' only after proof tests
META_DAILY_CALL_BUDGET=200            # Self-imposed daily ceiling
META_HOURLY_CALL_BUDGET=200           # Self-imposed hourly ceiling

# ── Licensed Provider (future) ──
CREATOR_DATA_PROVIDER=none            # 'influencers_club' | 'modash' | 'none'
CREATOR_DATA_API_KEY=
CREATOR_REFRESH_DAILY_BUDGET_CREDITS=0
CREATOR_REFRESH_MONTHLY_BUDGET_CREDITS=0

# ── Infrastructure ──
REDIS_URL=                            # For BullMQ job queue (when ready)
FASTSOCIAL_AUTO_IMPORT=false          # Enable after deploy
FASTSOCIAL_IMPORT_INTERVAL_DAYS=3
```

> [!CAUTION]
> **Never commit tokens, API keys, or secrets to Git.** Store in `.env` (git-ignored), AWS Secrets Manager, or equivalent. The web frontend must NEVER see the Meta access token.

---

## 12. Cost Summary

| Item | Monthly cost | Notes |
|---|---|---|
| FastSocial file import | **$0** | CC BY 4.0 open data |
| Meta Business Discovery | **$0** | No per-call charge; operational cost is developer time |
| Wikidata queries | **$0** | Free query service |
| AWS infrastructure | **~$20–50** | RDS PostgreSQL, EC2/Lambda, S3 |
| Influencers Club (if approved) | **~$208+** | Only after 100-handle trial |
| Modash (if needed) | **~$1,350/mo** | Only if Influencers Club doesn't cover the gap |

**Total at launch: approximately $20–50/month** — the engine can be fully operational with zero data-provider costs because FastSocial + Meta Business Discovery are both free.

---

## 13. Reference Links

### Meta / Instagram API

- [Business Discovery endpoint](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery/)
- [Instagram API with Facebook Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/)
- [Permissions reference](https://developers.facebook.com/docs/permissions/)
- [App Review](https://developers.facebook.com/docs/app-review/)
- [Graph API rate limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)
- [Meta Postman collection](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)

### Open Data

- [FastSocial GitHub](https://github.com/FastSocialCo/instagram-top-accounts) — CC BY 4.0
- [FastSocial latest.csv](https://raw.githubusercontent.com/FastSocialCo/instagram-top-accounts/main/data/latest.csv)
- [Wikidata P2003 (Instagram usernames)](https://www.wikidata.org/wiki/Property:P2003)

### Licensed Providers (to evaluate)

- [Influencers Club](https://influencers.club/pricing/) — [API docs](https://docs.influencers.club/)
- [Modash](https://www.modash.io/) — [API docs](https://docs.modash.io/) — [refresh rates](https://help.modash.io/en/articles/5467354-profile-updates-how-often-data-refreshes)

### Legal

- [Meta Automated Data Collection Terms](https://www.facebook.com/legal/automated_data_collection_terms)
- [MeitY Data Protection Framework (India)](https://www.meity.gov.in/data-protection-framework)

---

## 14. Final Confirmation

| Question | Answer |
|---|---|
| Does Meta give APIs to fetch public profile details? | **Yes.** Business Discovery returns profile fields and follower count for public professional (Business/Creator) accounts, one handle at a time. |
| Can we get ALL Instagram users? | **No.** No directory/enumeration endpoint exists. You build your index from curated sources. |
| Can we get personal accounts? | **No.** Only professional accounts are eligible. Personal accounts return empty. |
| What is the cheapest way to keep our data fresh? | **FastSocial import every 3 days (free)** + Meta calls only for the gap (~100–200/day). |
| Do we need to pay for a licensed provider right now? | **No.** FastSocial + Meta covers your launch. Evaluate Influencers Club when you need broader coverage. |
| Is our tiered refresh design (2d/5d/7d/14d/30d) correct? | **Yes.** It matches the volatility of each cohort and stays within budget. |
| What is the first thing to do? | **Create a Meta developer app, run the five proof tests, and automate the FastSocial import.** |

---

*This document is the single source of truth for how IGshorts acquires, refreshes, stores, and displays Instagram creator data. Every number on the site should have a source, a date, and a tier. That is the engine.*

