# IGshorts — Ultimate Plan: Admin Control Center + Tracking Schedules + LinkedIn-Style Interaction Analytics

> **Status:** Planning only (do not implement until this plan is approved)  
> **Audience:** CEO / product + engineering  
> **Live stack today:** Vercel (web) + Render (API) + Supabase (Postgres)  
> **Brand lock:** Billboard black / white / green — admin can be denser/report-like, same tokens  
> **Honesty lock:** Never invent Instagram impressions, engagement rates, or “who viewed you” for people we cannot observe

---

## 0. What your CEO is asking for (translated into product)

Three products that must work together:

| # | Ask (plain language) | Product name in this plan |
|---|---|---|
| 1 | A proper **admin / adventure-control page** so operators can run and fix the system without chaos | **Operator Control Center (OCC)** |
| 2 | **Tracking schedules** — when profiles, charts, discovery, and pulse refresh; what’s live; what’s stale | **Refresh & Schedule Command Deck** |
| 3 | **User counts, interactions, and summaries** inspired by how LinkedIn shows activity and people insights — adapted honestly for IGshorts | **Interaction Intelligence (I²)** |

This is **not** “copy LinkedIn’s entire social network.”  
It **is** adopt LinkedIn’s *information design* for:

- clear operator control surfaces  
- activity timelines  
- profile interaction summaries  
- “what happened since last visit”  
- trustworthy ranking explanations  

…while keeping IGshorts as a **public charts + discovery observatory**, not a messaging/social graph clone.

---

## 1. What already exists (baseline — do not rebuild blindly)

### 1.1 Operator Admin (thin v1 — already live under `/admin`)

| Area | Today | Quality |
|---|---|---|
| Login | JWT in `localStorage`, bootstrap admin | Works; no MFA, no revoke |
| Overview | Tracked / ranked / unranked / stale (>36h) | Basic |
| Watchlist | Add/edit/hide, limit 100 UI | Incomplete pagination |
| Import | Seed Excel upload/import | Works |
| Sync / Pipeline | Run sync + daily pipeline | Raw JSON output |
| Rankings | Rebuild charts; last 20 runs | No notes/diff view |
| Jobs | Last 20 `JobRun` rows | **Bug:** failed jobs still look green; errors hidden |
| Audit | Last 50 `AuditLog` rows | No filters/export |
| Discovery jobs | API exists (`/admin/jobs/discovery`) | **No UI button** |
| Editorial metric override | API exists | **No UI** |
| Wikipedia enrichment | API exists | **No UI** |
| Trends / Music / Pulse curation | Public APIs only | **No admin CRUD** |
| Member support | None | Cannot list/search members |

### 1.2 Tracking / analytics today

| Signal | Where | Server? |
|---|---|---|
| Follower snapshots | `MetricSnapshot` | Yes |
| Rank deltas | `RankingEntry` | Yes |
| Pipeline / discovery jobs | `JobRun` | Yes |
| Visit diff (content since last visit) | `/visit-diff` + localStorage / `Member.lastVisitedAt` | Partial |
| Pulse reactions (hype/gem/viral) | `localStorage` only | **No** |
| Creator showdown cheers | `localStorage` (seeded fake-looking numbers) | **No** |
| Profile page views | None | **No** |
| Search / chart interactions | None | **No** |
| LinkedIn-like “who viewed your profile” | None | **No** |
| Claim ownership of IG handle | `/claim` coming soon | **No** |

### 1.3 Refresh schedule reality

- Nest crons exist (`daily_ranking_pipeline` 02:00, discovery 03:30) but **`CRON_ENABLED=false`** on current deploy.  
- Design intent already documented in `docs/IGshorts_Refresh_Engine_Design.md` (bands, budgets, Meta track) — **schema for `profile_refresh` / `refresh_jobs` not built yet**.  
- Meta adapter still stub; live counts depend on seed / existing snapshots.

---

## 2. North-star architecture (one diagram)

```text
┌──────────────────────────────────────────────────────────────────┐
│                     OPERATOR CONTROL CENTER (/admin)              │
│  Overview · Watchlist · Content · Schedules · Jobs · Members ·    │
│  Analytics · Audit · Settings                                     │
└───────────────┬──────────────────────────┬────────────────────────┘
                │                          │
                ▼                          ▼
     Refresh & Schedule Deck      Interaction Intelligence
     (jobs, bands, budgets,       (events → rollups → insights)
      discovery/pulse/ranking)
                │                          │
                └──────────┬───────────────┘
                           ▼
                    Postgres (Supabase)
         CreatorProfile · MetricSnapshot · Ranking*
         JobRun · AuditLog · Member · NEW event/rollup tables
                           │
                           ▼
              Public site (Vercel) + Member insights panels
```

---

## 3. Pillar A — Operator Control Center (Admin / “Adventure” Panel)

### 3.1 Goal

One authenticated console where an operator can:

1. See system health in 10 seconds  
2. Control watchlist, rankings, discovery content, and jobs  
3. See schedules and freshness without opening Render/AWS/Supabase  
4. Support members and audit every sensitive action  
5. Never need to SSH or guess which script to run  

### 3.2 Information architecture (final nav)

```text
/admin
├── Overview (Command Dashboard)
├── Watchlist
│   ├── Directory (paginated)
│   └── Profile detail (operator view)
├── Content Studio
│   ├── Trends (feature / hide / edit editorial)
│   ├── Music
│   └── Daily Pulse (CLI → UI)
├── Refresh & Schedules
│   ├── Pipeline calendar
│   ├── Profile refresh bands
│   └── Discovery / Pulse jobs
├── Rankings
│   ├── Runs & diffs
│   └── Rebuild controls
├── Jobs Console
│   ├── Run history (correct status colors + errors)
│   └── Run now (pipeline / discovery / enrichment)
├── Members & Support
├── Interaction Analytics (I² ops view)
├── Audit Trail (filterable + export)
└── Settings (admins, roles, feature flags, secrets status)
```

### 3.3 Overview dashboard widgets (P0)

| Widget | Data source | Purpose |
|---|---|---|
| System pulse | API health + last job success | Green / amber / red (not hard-coded “healthy”) |
| Census | listed / ranked / unranked / hidden | Watchlist truth |
| Freshness | last ranking finish + oldest tracked `lastSyncedAt` | Stale alert |
| Pipeline strip | last 7 `JobRun` statuses | Failure visibility |
| Discovery strip | last discovery + pulse assembly | Editorial freshness |
| Interaction strip | event counts last 24h (after I² ships) | Product pulse |
| Quick actions | Run pipeline / discovery / rebuild / open audit | Operator speed |

### 3.4 Roles & security (must ship with OCC expansion)

| Role | Can do |
|---|---|
| `viewer` (new) | Read overview, jobs, audit, analytics |
| `editor` | Watchlist edits, content studio, pulse curation |
| `admin` | Jobs run, rebuild, import, enrichment, settings |
| `owner` (optional later) | Invite admins, rotate secrets |

Hard requirements:

- Token validation on every admin page (not “token exists”)  
- Logout + server-side revoke list (or short-lived JWT + refresh)  
- MFA for `admin`/`owner` (Phase B+)  
- Every mutating action → `AuditLog` with actor id, IP, before/after  
- Fix jobs UI: failed = red, show `error` column  

### 3.5 Content Studio (missing today — required)

Operators must control discovery without re-seeding:

- Feature / unfeature `TrendTopic`  
- Edit summary, image, source label, region, status  
- Upsert `MusicTrack` editorial rows (still no fake usage counts)  
- Assemble / override Daily Pulse slots for a date  
- Preview public page cards before publish  

CLI remains for emergencies; UI becomes default.

### 3.6 Members & Support

- Search members by email  
- See tracked profiles, last visit, signup date  
- Revoke session / delete account (GDPR)  
- Export member data package  
- **Never** show passwords; audit every support action  

---

## 4. Pillar B — Refresh & Schedule Command Deck

### 4.1 Goal

Make “when does the system update?” answerable on one screen — LinkedIn-like clarity for **system cadence**, not vanity metrics.

### 4.2 Schedule catalog (visible in admin)

| Job | Cadence (target) | Depends on | Status today |
|---|---|---|---|
| `daily_ranking_pipeline` | Nightly or after refresh band | Ingestion + ranking | Code yes; cron often off |
| `discovery_refresh` | Daily | Adapters + env flags | Code yes; UI missing |
| `daily_pulse_assembly` | Daily after discovery | Trends/music/movers | Code yes |
| `profile_refresh_band_*` | Banded (2–3d / 5d / 7d / 14–30d) | Meta or licensed source | **Designed, not built** |
| `fastsocial_import` | Weekly/manual | CSV/API terms | Script only |
| `wikipedia_enrichment` | Manual/weekly | Wikimedia | API only |

### 4.3 New control surfaces

1. **Schedule board** — next run, last run, enabled?, budget remaining  
2. **Band map** — Apex / Mega / Established / Community / Micro (align with follower pyramid)  
3. **Run now** with confirmation + concurrency lock (prevent double pipeline)  
4. **Pause flag** per job and per profile (`do_not_refresh`)  
5. **Budget meter** — API call ceiling for Meta (when live)  

### 4.4 Schema additions (from refresh-engine doc — implement here)

```text
ProfileRefreshState
  profileId, band, nextCheckAt, lastCheckedAt, failCount, paused, reason

RefreshJob
  id, jobName, band, status, scheduledFor, startedAt, finishedAt, stats, error

SystemSchedule
  jobName, cronExpr, enabled, timezone, lastSuccessAt, nextRunAt
```

### 4.5 Operator UX rule

Every schedule row must answer:

- What runs?  
- When last succeeded?  
- When next?  
- Is it enabled?  
- What breaks if I press Run Now?  

---

## 5. Pillar C — Interaction Intelligence (LinkedIn-inspired, IGshorts-honest)

### 5.1 What we borrow from LinkedIn (patterns)

| LinkedIn pattern | IGshorts adaptation |
|---|---|
| Profile views | **Profile view events** for public chart profiles (member + anonymous hashed) |
| Post impressions / reactions | **Content interactions** on Trends / Music / Pulse / Charts (not fake IG impressions) |
| “Who viewed your profile” | Only for **claimed** profiles OR operator analytics — never invent viewers |
| Activity / notifications | Member activity feed: tracks, rank moves, new trends since last visit |
| People ranking / SSI-like scores | **Do not copy SSI**. Keep `followers_v1` competition rank. Add optional **Interaction Interest Score** for *site* engagement only, clearly labeled |
| Creator analytics summary | Member dashboard: views on tracked profiles, chart appearances, movers alerts |

### 5.2 What we must NOT copy blindly

- Do not claim Meta Explore impressions we don’t have  
- Do not show fabricated “18.4M views” style social proof  
- Do not build full LinkedIn messaging / connection graph in v1  
- Do not sell “engagement rate” without a proven source  

### 5.3 Event taxonomy (server-side, first-class)

All public-site meaningful actions become append-only events:

| Event name | When | Properties (examples) |
|---|---|---|
| `page_view` | Route change | path, referrer, viewport |
| `profile_view` | `/profiles/[username]` | profileId, username, dwellMs |
| `chart_view` | Global/India charts | chartKey, page, filters |
| `chart_row_click` | Billboard row | profileId, rank |
| `trend_open` | Trend card / featured | trendId, category |
| `music_preview` | Ambient preview play | trackId |
| `music_outbound` | Spotify/YouTube click | trackId, destination |
| `pulse_react` | Hype/Gem/Viral | pulseKind, reaction |
| `showdown_cheer` | Creator showdown | profileId |
| `search` | Profiles/charts search | query length, resultCount |
| `member_track` | Track/untrack | profileId, action |
| `visit_diff_open` | Since last visit panel | — |
| `auth_signup` / `auth_login` | Account | — |

**Identity model**

- `memberId` if logged in  
- else `anonymousId` = durable cookie / localStorage UUID hashed at rest  
- never store raw IP in analytics rollups (optional short-lived in audit only)  

### 5.4 New schema (Interaction Intelligence)

```text
AnalyticsEvent
  id, occurredAt, eventName, memberId?, anonymousIdHash?,
  profileId?, trendId?, musicTrackId?, chartKey?,
  path, propsJson, sessionIdHash

DailyEntityRollup
  date, entityType (profile|trend|track|chart|site), entityId,
  views, uniqueViewers, clicks, reactions, outboundClicks

MemberInsightSnapshot
  memberId, asOf, profilesTracked, profileViewsOnTracked,
  rankAlerts, topCategories[], summaryJson

ProfileOwnerInsight  (only if claimed)
  profileId, asOf, views7d, uniqueViewers7d, chartAppearances,
  searchAppearances, topReferrers[]
```

### 5.5 LinkedIn-like surfaces for users

#### A) Member Insights (`/account` → Insights tab)

- Activity this week (views you made, tracks, reactions)  
- Tracked creators: rank changes since last visit  
- “Your IGshorts summary” card (honest site activity, not IG vanity)  
- Notification preferences (email later)  

#### B) Profile public page enhancements

- Keep follower + rank first (CEO/report clarity)  
- Add **Site interest** strip (optional): “Viewed on IGshorts N times this week” — only from our events  
- Claim CTA: “Is this you? Claim to unlock owner insights”  

#### C) Claimed creator dashboard (`/account/creator` after claim)

Closest LinkedIn analytics analogue:

- Who viewed (aggregated tiers if privacy requires: Member / Anonymous)  
- Views over time  
- Chart appearances & mover alerts  
- Top discovery referrers (Home, Charts, Trending, Search)  

**Gate:** Claim verification must exist before showing individual viewer identities. Until then, show aggregates only.

### 5.6 Operator Analytics (`/admin` → Interaction Analytics)

- Live event rate (last 15 min / 24h)  
- Top profiles by site views  
- Top trends/tracks by opens  
- Conversion: view → track → account signup  
- Funnel: Home → Charts → Profile  
- Integrity panel: flag anomalous fake-looking spikes  

### 5.7 Ranking vs Interaction (critical separation)

| System | Purpose | Algorithm |
|---|---|---|
| **Public Charts** | Who is famous on the tracked IG watchlist | `followers_v1` competition rank — **unchanged** |
| **Site Interaction Interest** | What people engage with *on IGshorts* | Event rollups — labeled “IGshorts interest”, never sold as IG rank |

Never merge these into one number without explicit labeling.

---

## 6. Privacy, consent, and trust (non-negotiable)

1. Update Privacy / Terms when events are collected.  
2. Cookie / storage notice for anonymous analytics ID.  
3. Member settings: opt out of personalized insights (still allow aggregate ops metrics).  
4. Retention: raw events 90 days → rollups kept longer; configurable.  
5. GDPR: export + delete cascades events for that member.  
6. No selling of interaction data.  
7. Admin analytics PII minimized (hash anonymous IDs).  

---

## 7. Phased delivery plan (build order)

### Phase 0 — Stabilize current admin (1–3 days) — **do first**

- Fix Jobs status colors + show `error`  
- Validate admin JWT on shell load; add Logout  
- Wire missing buttons: Discovery job, Wikipedia enrichment, editorial metric  
- Paginate watchlist  
- Overview: real health (last job + API ready), not hard-coded healthy  

**Exit:** Operators trust the existing panel.

### Phase 1 — OCC foundation (1–2 weeks)

- Nav restructure + Overview command dashboard  
- Audit filters (actor/action/date) + CSV export  
- Admin roles enforcement audit pass  
- Content Studio v1 (Trends feature/hide + Pulse date editor)  
- Concurrency lock for pipeline runs  

**Exit:** One console controls ranking + editorial content.

### Phase 2 — Refresh & Schedule Deck (1–2 weeks)

- `SystemSchedule` + `ProfileRefreshState` tables  
- Admin schedule board UI  
- Band assignment from follower tiers  
- Run-now + enable/disable per job  
- Align with `IGshorts_Refresh_Engine_Design.md` (Meta remains gated)  

**Exit:** CEO can see *when* data updates and *why* something is stale.

### Phase 3 — Interaction Intelligence ingestion (1–2 weeks)

- `AnalyticsEvent` table + `POST /analytics/events` (batched beacon)  
- Web client event helper (privacy-aware)  
- Move pulse reactions + showdown cheers from local-only → optional server sync  
- Daily rollup job  

**Exit:** We stop guessing; we measure real site behavior.

### Phase 4 — Member & LinkedIn-style summaries (1–2 weeks)

- `/account` Insights tab  
- Visit-diff upgraded with interaction-aware lines  
- Tracked-profile mover alerts  
- Operator analytics dashboard  

**Exit:** Users feel “LinkedIn summary” clarity for *their IGshorts activity*.

### Phase 5 — Claim + Owner insights (2–4 weeks, parallel Meta track)

- Real `/claim` verification path (docs already separate Meta App Review)  
- Owner dashboard aggregates  
- Only then consider individual “viewers” list with privacy tiers  

**Exit:** Creators who claim get LinkedIn-like analytics **without lying about IG reach**.

### Phase 6 — Hardening

- MFA, anomaly detection, retention jobs, load tests on event ingest  
- Admin settings for feature flags (`DISCOVERY_*`, analytics on/off)  
- Runbooks updated (`IGShorts_Ops_Runbook.md`)  

---

## 8. API surface sketch (new / extended)

```text
# Admin OCC
GET  /admin/overview                 (enhanced health)
GET  /admin/schedules
PATCH /admin/schedules/:jobName
POST /admin/jobs/discovery           (wire UI)
POST /admin/content/trends/:id/feature
PUT  /admin/content/pulse/:date
GET  /admin/members?q=
POST /admin/members/:id/revoke
GET  /admin/analytics/overview
GET  /admin/analytics/top-profiles

# Interaction Intelligence
POST /analytics/events               (public, rate-limited, batched)
GET  /members/me/insights
GET  /members/me/activity
GET  /profiles/:username/site-stats  (aggregate only)
GET  /creators/me/insights           (claimed only)
```

---

## 9. UI/UX principles for these new surfaces

- Same Billboard tokens; admin may use denser tables and mono labels  
- Every metric labeled with **source** (Site event / Ranking pipeline / Editorial / Meta)  
- Empty states teach the schedule (“Next ranking rebuild scheduled…”)  
- Dangerous actions use confirm modals + audit  
- Mobile: admin is desktop-first but readable on tablet  

---

## 10. Success criteria (CEO checklist)

- [ ] Operator can run and monitor pipeline/discovery/pulse without engineering  
- [ ] Schedule page shows last/next/enabled for every critical job  
- [ ] Stale data has a clear reason and a one-click remediation path  
- [ ] Site interactions are stored server-side (not only localStorage)  
- [ ] Members see a LinkedIn-like **activity summary** of *their* IGshorts use  
- [ ] Public charts still rank by followers — interaction never silently replaces rank  
- [ ] No fabricated Instagram reach metrics anywhere in admin or public UI  
- [ ] Audit trail can answer “who changed what, when”  
- [ ] Privacy policy matches actual tracking  

---

## 11. Explicit out of scope for v1 of this program

- Full LinkedIn social graph / messaging / endorsements  
- Replacing `followers_v1` with an engagement score  
- Meta Business Discovery before App Review (keep separate track)  
- Selling third-party ads from interaction data  
- Real-time WebSocket ops terminal (nice later; polling is enough)  

---

## 12. Recommended immediate next step

1. **Approve this plan** (CEO + eng).  
2. Execute **Phase 0** immediately (fix admin jobs UI + wire missing controls).  
3. Then Phase 1 → 2 → 3 in order (Control → Schedules → Events).  
4. Only after events exist, build LinkedIn-style member summaries (Phase 4).  
5. Claim/owner insights last (Phase 5), gated on verification.

---

## 13. Related documents

- `docs/IGshorts_Refresh_Engine_Design.md` — refresh bands & Meta track  
- `docs/IGshorts_Data_Engine_For_Review.md` — Meta App Review  
- `docs/IGShorts_Ops_Runbook.md` — current operator steps  
- `docs/uiux_implementation_plan.md` — public UI polish track (parallel)  
- `docs/ANTIGRAVITY_UIUX_AUDIT_AND_ENHANCEMENT_PROMPT.md` — UI audit brief  

---

**End of plan.**  
When approved, implementation should start at **Phase 0** and open a Cursor plan / tickets per phase with file-level checklists.
