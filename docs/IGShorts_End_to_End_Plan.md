# IGshorts — Project Brief, Feasibility & End-to-End Build Plan

**Source brief:** `docs/IGshorts_brief.pdf` (Saurabh Suman, March 2023)  
**Domain (planned):** IGshorts.com  
**Document purpose:** Explain the idea, judge whether it is doable, and define a proper way to build it end-to-end.

---

## 1. What is the idea?

**IGshorts is a public Instagram discovery + ranking website** — not another social network to post on.

Think of it as:

| Inspiration | What IGshorts borrows |
|---|---|
| **Billboard Top 100** | Countdown-style Top 10 / Top N charts |
| **CoinMarketCap** | Dense ranking tables, filters, “trending / movers” feel |
| **Medium** | Clean reading / browsing UX |

### One-line pitch

> A free, public aggregator that ranks and showcases the best Instagram profiles, trends, hashtags, reels, and news — especially by **region / country** (starting with India and Indian states) — with news tickers and a dashboard-style UI.

### Who it is for

- Casual users who want “what’s hot on Instagram in India / my state”
- Creators / marketers scanning rising profiles and hashtags
- Media / content teams that need a curated “best of IG” surface

### What it is *not*

- Not an Instagram clone
- Not (initially) a place to upload your own Reels
- Not a full social graph / messaging product

---

## 2. What exactly is the project? (Scope from the brief)

From the PDF slides, the product asks for:

### Core product

1. **Public website** (later: login / sign-on)
2. **Ranking modules / tables** for:
   - Top profiles
   - Trending topics / news
   - Hashtags (`#`)
   - Groups / communities (as defined editorially)
   - Reels / short-form highlights
3. **Regional lens** — Top 10 by India, state, or region
4. **News tickers + dashboard**
5. **Hashtag ticker** on landings so every page feels “full”
6. **Content team** to fill gaps where automated data is thin
7. **Non-functionals:** seamless, **secure**, **scalable**

### Original timeline in the brief (historical)

| Phase | Intent | Original date |
|---|---|---|
| Concept | Insta news / profile / trends aggregator | March 2023 |
| Domain + UI | IGshorts.com, Billboard-like UI | — |
| IG integration | Extract profiles / trends / news into ranking tables | — |
| Content broadbase | Editorial team + hashtag tickers | — |
| Go live & improve | Traffic assessment + continuous improvement | 1 May 2023 |

That original window (~6–8 weeks) was **aspirational marketing timing**, not a realistic engineering estimate for a production-grade IG aggregator. A proper plan below replaces it.

### Ranking signal stated in the brief

The brief says rankings should be based on **“number of impressions on social media.”**

That sentence is the **hardest technical constraint** in the whole project (see feasibility below). A buildable product must redefine “impressions” into **proxies that you can legally and reliably obtain**.

---

## 3. Is it doable?

### Short answer

**Yes — the product idea is doable and commercially sensible.**  
**No — not exactly as written if “impressions for any IG profile / reel / hashtag, country-wide, automated, real-time” is a hard requirement.**

You can ship a strong MVP and scale it. You cannot ship a perfect Billboard-of-all-of-Instagram using only official Meta APIs with zero editorial process.

### Verdict matrix

| Claim from brief | Doable? | Reality |
|---|---|---|
| Public ranking website (Billboard + CMC + Medium UI) | **Yes** | Straightforward web product |
| Top 10 profiles / trends / hashtags | **Yes** | With curated watchlists + scoring |
| India / state / region filters | **Partial → Yes** | Needs **geo tagging** (editorial, creator location, or city hashtags) — IG does not give clean “top profiles in Maharashtra” |
| News tickers + dashboard | **Yes** | Standard frontend + CMS / feed |
| Content team to fill gaps | **Yes** | Required for quality |
| Secure + scalable on cloud (AWS) | **Yes** | Standard architecture |
| Auto-extract *all* IG profiles / trends / news | **No (officially)** | Official API is narrow |
| Rank by true **impressions** for third-party content | **No (officially)** | Impressions are Insights for **owned** accounts, not global public charts |
| Mar–May 2023 style 2-month full launch | **Unrealistic** | Expect **10–16 weeks** for a credible MVP |

### Instagram data reality (critical)

**Official Instagram Graph API (Meta) today:**

- Works for **Business / Creator** accounts you manage or discover under limited surfaces
- Useful surfaces: own media + insights, **Business Discovery**, **Hashtag Search** (with App Review + rate limits)
- Does **not** give: open public feed of the whole platform, personal accounts at scale, competitor impression charts, follower lists, or reliable “Top 10 India” charts

**Scraping / unofficial APIs:**

- Technically used by many analytics products
- Against Instagram ToS, fragile, ban-prone, legally/reputationally risky for a client-facing brand product
- **Not recommended as the primary architecture** for IGshorts.com

### Feasible product definition (recommended)

> **IGshorts = curated + semi-automated Instagram charts for India (and regions), with editorial news, hashtag tickers, and a Billboard/CMC-style public UI — powered by Meta’s allowed APIs where possible, scored with transparent proxy metrics, and enriched by a content team.**

That version is **clearly doable**.

---

## 4. Recommended product model (build this, not the fantasy version)

### Ranking metric redesign (must agree with stakeholders)

Replace vague “impressions” with a **transparent Score**:

```text
IGshorts Score =
  w1 * follower_count_norm
+ w2 * avg_engagement_rate_7d
+ w3 * growth_rate_30d
+ w4 * reel_velocity (likes/comments per hour on recent reels)
+ w5 * editorial_boost (0–1)
+ w6 * region_relevance
```

Document the formula publicly (CoinMarketCap-style credibility).  
Call it **“IGshorts Score”**, not “impressions”, unless Meta Insights for owned accounts are used in a separate “Verified Creator” lane.

### Data sources (layered)

1. **Watchlist registry** — seed 500–5,000 India-relevant creator accounts (tagged by niche + state/region)
2. **Meta Graph API** — Business Discovery / Hashtag Search for those accounts & tags (compliant path)
3. **Editorial CMS** — news, featured charts, gap-fill content, region overrides
4. **Optional later** — creator self-claim (“Claim profile” OAuth) for true Insights / impressions on *their* account
5. **Optional later** — licensed data vendors (if budget exists) instead of scraping

### Chart types for MVP

1. Top Profiles — India  
2. Top Profiles — by state / metro (Mumbai, Delhi, Bangalore, …)  
3. Top Hashtags — India  
4. Trending Reels (from watchlist)  
5. News / Stories ticker (editorial)  
6. Category tabs (Entertainment, Food, Fashion, Tech, Sports, …)

---

## 5. End-to-end architecture (AWS-oriented)

```text
                    ┌──────────────────────────────┐
                    │         Users (Public)       │
                    └──────────────┬───────────────┘
                                   │
                           CloudFront + WAF
                                   │
                          ┌────────▼────────┐
                          │  Next.js (SSR)  │  ← Billboard/CMC/Medium UI
                          │  on Amplify or  │
                          │  ECS / Lambda   │
                          └────────┬────────┘
                                   │
                          API Gateway / ALB
                                   │
                    ┌──────────────▼──────────────┐
                    │     NestJS / FastAPI API     │
                    │  rankings · search · auth     │
                    └──────┬───────────────┬──────┘
                           │               │
                    ┌──────▼──────┐ ┌──────▼──────────────┐
                    │  Aurora     │ │  Redis (ElastiCache) │
                    │  Postgres   │ │  hot charts / ticker │
                    └──────▲──────┘ └─────────────────────┘
                           │
              ┌────────────┴────────────┐
              │   Ingestion workers     │
              │   (ECS Fargate / Lambda │
              │    + EventBridge cron)  │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   Meta Graph API    Editorial CMS     Object Storage
   (IG Business)     (Admin UI)        (S3 media cache)
```

### Suggested stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js + TypeScript | SSR for SEO (charts must rank in Google) |
| UI | Tailwind + custom charts tables | CMC/Billboard density without ugliness |
| API | NestJS (Node) or FastAPI (Python) | Clear domain modules, auth later |
| DB | Aurora PostgreSQL | Rankings history, profiles, geo tags |
| Cache | Redis | Hot Top 10, tickers |
| Jobs | EventBridge + ECS/Lambda | Scheduled IG pulls |
| Auth (phase 2) | Cognito or Auth.js | Public → login transition |
| Admin/CMS | Simple admin app or Payload/Strapi | Content team workflows |
| Observability | CloudWatch + OpenTelemetry | Scale safely |
| Secrets | Secrets Manager | Meta tokens |

---

## 6. Information architecture & UX

### Public pages

1. **Home** — hero charts strip + ticker + “India Top 10 today”
2. **Charts** — tabs: Profiles / Hashtags / Reels / News
3. **Region explorer** — India → State → City
4. **Profile detail** — snapshot, score history sparkline, recent reels (embedded/oEmbed where allowed)
5. **Hashtag detail** — related profiles + ticker
6. **News** — Medium-like reading list
7. **About / Methodology** — how scoring works (trust)

### UI principles (from brief)

- Billboard: big ranks `#1 … #10`, up/down arrows, “this week”
- CoinMarketCap: filterable table, sparklines, % change
- Medium: typography, calm article pages for news

### Access model

- **Phase 1:** fully public browse  
- **Phase 2:** optional accounts (save charts, claim profile, alerts)  
- Never block core discovery behind login in v1

---

## 7. Data model (core entities)

```text
CreatorProfile
  id, ig_username, ig_user_id, display_name
  niche[], regions[], country
  follower_count, following_count
  is_business_or_creator, claim_status
  last_synced_at

MetricSnapshot
  profile_id, captured_at
  followers, media_count
  engagement_rate, growth_rate
  score, rank_india, rank_region

Hashtag
  tag, region_scope, score, rank

ReelItem
  ig_media_id, profile_id, caption, permalink
  like_count, comment_count, posted_at, velocity

NewsItem
  title, body, source, regions[], published_at, editor_id

Chart
  type, region, category, as_of, entries[]

EditorialBoost
  entity_type, entity_id, boost, reason, expires_at
```

Keep **full history** of snapshots so ranks can show “↑3 this week”.

---

## 8. Build plan — phases, deliverables, timeline

Realistic calendar for a small team (**1–2 engineers + 1 designer/content lead**):

### Phase 0 — Alignment (1 week)

**Goal:** Lock a doable definition with stakeholders.

Deliverables:

- [ ] Signed product definition (proxy score, not raw impressions)
- [ ] India-first scope + 8–12 niches + 10–15 regions/metros
- [ ] Legal note: official API only for MVP
- [ ] Domain / branding (IGshorts.com)
- [ ] Success metrics: DAU, chart page SEO, time-on-site, returning visitors

**Exit criteria:** Written PRD + scoring methodology approved.

---

### Phase 1 — Foundation (2–3 weeks)

**Goal:** Empty but production-shaped platform.

Deliverables:

- [ ] AWS account structure (prod/staging), IaC (CDK/Terraform)
- [ ] Next.js app shell + design system (rank table, ticker, filters)
- [ ] Postgres schema + Redis
- [ ] Admin login for editors
- [ ] CI/CD (GitHub Actions → Amplify/ECS)

**Exit criteria:** Deploy “Hello IGshorts” with empty charts to staging URL.

---

### Phase 2 — Content & ranking MVP (3–4 weeks)

**Goal:** Real Top 10 pages people can browse.

Deliverables:

- [ ] Seed **watchlist** of ≥500 India creators (CSV → DB), region-tagged
- [ ] Meta app + App Review plan for needed permissions
- [ ] Ingestion job: sync profile metrics on schedule (e.g. every 6–12h)
- [ ] Score computation + India / region charts
- [ ] Hashtag watchlist + ticker component
- [ ] Editorial news CRUD + home ticker
- [ ] Profile detail pages
- [ ] Methodology page

**Exit criteria:** Public staging site shows live-updating India Top 10 Profiles + news ticker.

---

### Phase 3 — Polish, security, scale basics (2 weeks)

**Goal:** Go-live quality.

Deliverables:

- [ ] CloudFront + WAF, HTTPS, security headers
- [ ] Rate limiting on APIs
- [ ] SEO (SSR titles, sitemap, Open Graph)
- [ ] Caching strategy for hot charts
- [ ] Error budgets, alerts, backups
- [ ] Content ops runbook (how editors publish)
- [ ] Soft launch to a small audience

**Exit criteria:** Production cutover checklist green.

---

### Phase 4 — Go live & improvise (ongoing)

**Goal:** Exactly what the brief asked after launch.

Deliverables:

- [ ] Analytics (GA4 / Amplitude)
- [ ] Weekly chart quality review with content team
- [ ] Expand watchlist, niches, states
- [ ] A/B test home layout
- [ ] Backlog: login, claim-profile Insights, alerts, mobile PWA

**Exit criteria:** Continuous improvement loop running (weekly).

---

### Optional Phase 5 — Differentiation

- Creator **Claim Profile** → real Insights / impressions for claimed accounts
- Email / WhatsApp digests: “India Top Movers”
- Embeddable widgets for media sites
- Multi-country expansion (same engine, new region packs)

---

## 9. Team & operating model

| Role | Responsibility |
|---|---|
| Product owner | Scope, scoring rules, go/no-go |
| Full-stack engineer | Web + API + AWS |
| Data / integration engineer (can be same person early) | Meta API, jobs, scoring |
| Designer | Billboard/CMC/Medium hybrid UI |
| Content / editorial (critical) | Watchlist quality, news, gap fill, hashtag tickers |
| Legal / compliance (advisor) | Meta ToS, privacy policy, copyright of embeds |

Without a **content function**, automated charts will look empty or wrong. The brief correctly calls this out as “Content Broadbase”.

---

## 10. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Meta App Review delay / rejection | Blocks automated sync | Start review early; ship editorial-only charts first |
| Rate limits | Stale data | Watchlists, batching, Redis, prioritize Top N |
| “Impressions” expectation mismatch | Stakeholder disappointment | Agree proxy score in Phase 0 in writing |
| Region accuracy | Wrong state charts | Human tagging + city hashtags + claim flow later |
| Scraping temptation | Legal / ban / outage | Ban scraping from architecture; use vendors only if contracted |
| Thin content at launch | Poor first impression | Seed watchlist + editorial calendar before public launch |
| Copyright / embedding | Takedowns | Prefer official embeds / links; cache metadata not media files when unsure |

---

## 11. MVP definition of done (ship checklist)

Ship when **all** are true:

1. Public site on custom domain with HTTPS  
2. India Top 10 Profiles chart updates at least daily  
3. At least 3 region charts live  
4. Hashtag ticker on home + chart pages  
5. ≥10 editorial news items and a working news section  
6. Methodology page explaining the score  
7. Admin tools for editors to boost / correct / publish  
8. Basic analytics + uptime monitoring  
9. Privacy policy + terms referencing third-party IG content  

If stakeholders insist on “true impressions for everyone,” mark that as **Phase 5 Claimed Creators only** — not MVP.

---

## 12. Rough cost & effort (order of magnitude)

| Item | Early monthly (approx.) |
|---|---|
| AWS (small) | $50–250 |
| Domain / email | low |
| Meta API | $0 (within limits) |
| Optional data vendor | $100–1000+ if used |
| People | dominant cost (eng + editor) |

Engineering effort to credible MVP: **~10–16 weeks** calendar time for a small team, not 6 weeks.

---

## 13. Final recommendation

| Question | Answer |
|---|---|
| What is the idea? | Billboard + CoinMarketCap for Instagram discovery, India/regional first |
| What is the project? | Public ranking + news aggregator website with IG-derived charts and editorial tickers |
| Is it doable? | **Yes**, as a curated + API-assisted charting product |
| Is the brief literally doable? | **No** for global automated impression rankings |
| How to build properly? | Phased AWS web platform, proxy scoring, watchlists, Meta-compliant ingestion, strong editorial ops |

### Stakeholder one-liner you can use

> “IGshorts is doable and worth building if we treat it as India’s public Instagram charts site — not as a full scrape of Instagram. We ship Top profiles/hashtags/reels with a transparent score, regional filters, and a content team, then add creator-claimed true Insights later.”

---

## 14. Suggested next actions (this week)

1. Confirm scoring definition with the client (proxy vs impressions)  
2. Confirm India-first niches + region list  
3. Register / verify Meta developer app path  
4. Sketch Figma of Home + Charts table (Billboard × CMC)  
5. Stand up AWS staging + empty Next.js shell  
6. Build seed watchlist spreadsheet (usernames + state + niche)

---

*This plan is derived from `IGshorts_brief.pdf` (title, agenda, introduction, tasks, timeline) and updated for current Instagram platform constraints so the delivery plan is buildable in production.*
