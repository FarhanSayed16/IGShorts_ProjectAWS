# IGshorts — Stakeholder Demo Kit & Operational Guide

**Platform Version:** 1.0.0-rc  
**Target Environment:** Local / AWS `ap-south-1` staging (URL pending first CDK deploy)  
**Primary Stakeholder Review:** Saurabh Sir & Product Leadership  

---

## 1. Executive Summary

**IGshorts** is a discovery, ranking, and benchmarking platform for public Instagram personalities ("Billboard × CoinMarketCap for Instagram").

### Core Value Proposition
- **Objective Ground Truth:** Ranks creators exclusively on verified, public follower counts. No opaque algorithmic "reach scores" or fabricated impressions.
- **Twin Scopes:** Dedicated **Global** and **India** leaderboards updated with transparent competition-rank deltas ($\uparrow / \downarrow / =$).
- **Editorial Separation:** Pure **Person** leaderboards (actors, athletes, musicians, creators, comedians). Brands (Nike, Zomato, Apple) and teams (Real Madrid, RCB, IPL) are cleanly tracked in the database but strictly isolated from people charts.
- **Editorial Control:** Comprehensive, audited admin workspace allowing non-technical operators to add, hide, or edit profiles without redeploying code.

---

## 2. Five-Minute Stakeholder Walkthrough Script

This script allows any stakeholder to evaluate the platform unassisted within 5 minutes.

```
[0:00 - 1:00] Public Homepage (/)
  • Observe the gold & navy aesthetic ("Billboard / Bloomberg" terminal vibe).
  • Review the Global Podium (#1–#3: Cristiano Ronaldo, Lionel Messi, Selena Gomez).
  • Compare Twin Top 10 tables: Global vs India.
  • Notice the trust ribbon: as-of timestamp, algorithm version (followers_v1), and watchlist size.

[1:00 - 2:00] Leaderboards & Filtering (/charts/global & /charts/india)
  • Navigate to /charts/global.
  • Filter by Category: click "Sports & Athletes" or "Actors & Cinema".
  • Type in the search box: filter by handle or display name.
  • Toggle between Global and India tabs seamlessly.
  • Check the footer disclaimer: transparent note that rankings reflect a curated watchlist, not all of Instagram.

[2:00 - 3:00] Profile Deep-Dive (/profiles/:username)
  • Click any profile row (e.g., @virat.kohli or @cristiano).
  • Review verified profile header, category, and observed follower count.
  • Test the outbound button: "View on Instagram" opens the genuine https://instagram.com/handle in a new tab.
  • Review snapshot history and nearby ranks.

[3:00 - 4:00] Transparency & Methodology (/methodology & /faq)
  • Open /methodology: read the 6-pillar transparency charter (Follower metric, Standard competition ranking, Weekly movers, Deduplication, Brand separation, and Cadence).
  • Open /faq: test keyboard accessibility on the interactive accordion.

[4:00 - 5:00] Admin Workspace (/admin)
  • Visit /admin/login (JWT in localStorage after login; admin routes are noindex).
  • Enter credentials and open /admin/watchlist.
  • Locate any profile (e.g. toggle "Hide" on an account).
  • Run /admin/rankings -> "Rebuild Rankings Now".
  • Return to /charts: verify the hidden account is instantly and cleanly removed from the public leaderboard.
```

---

## 3. Data Integrity & Verification Audit (Phase 11.1)

A full automated audit of the 332 imported profiles was executed via `pnpm seed:audit`:

| Entity Type | Count | Public Leaderboard Policy |
| :--- | :---: | :--- |
| **Person** | **287** | Eligible for Global Persons & India Persons public charts. Includes actors, athletes, musicians, digital creators, and comedians. |
| **Brand** | **16** | Corporate brands (Zomato, Swiggy, Nike, Apple, Samsung, BMW, boAt, Tata Group, Reliance, etc.). **Permanently isolated from People charts.** |
| **Team / League** | **21** | Sports teams, leagues, and music groups (Team India, Real Madrid, FC Barcelona, Mumbai Indians, CSK, IPL, Premier League, BTS, Coldplay). **Permanently isolated from People charts.** |
| **Other / Media** | **7** | Media channels and agencies (ICC, Filmy Gyan, NatGeo, NASA, 433, Instant Bollywood, Bhajan Marg Official). **Permanently isolated from People charts.** |
| **Platform** | **1** | `@instagram` official platform account. **Isolated from People charts.** |
| **Total** | **332** | **100% classified with zero unhandled types.** |

### Verified Follower Coverage
- **147 accounts** have verified initial ground-truth follower counts.
- **185 accounts** are listed in the watchlist and displayed with honest unranked status (`"Listed, not yet ranked"`), awaiting automated ingestion refreshes. Missing numbers remain `null` and are **never coerced to 0**.

---

## 4. Operational Runbook

All platform operations are runnable via CLI or the Admin UI:

### 1. Run Data Quality Audit
```bash
pnpm seed:audit
```
*Validates all usernames, entity types, category distribution, and follower count presence.*

### 2. Re-import Seed Data (Idempotent)
```bash
pnpm seed:import
```
*Parses Excel workbook, deduplicates handles across Global and India sheets, appends metric snapshots without destructive overwrites, and logs to `audit_logs`.*

### 3. Run Pipeline (Ingestion + Ranking Recomputation)
```bash
pnpm job:pipeline
```
*Executes daily synchronization sequence: iterates due profiles, checks active providers, computes standard competition rankings for `global_persons` and `india_persons`, calculates rank and follower deltas, and logs job completion.*

### 4. Admin Watchlist Moderation
- Access `/admin/watchlist`.
- **Hide Account:** Click the toggle under "Status". Updates `isListed = false`. Running the ranking engine permanently excludes hidden accounts from public views.
- **Override Metric:** In cases where an Instagram profile has broken public counts, admins can submit an audited editorial follower count with mandatory reasoning.

---

## 5. v1 Known Limitations & Roadmap

| Feature / Area | v1 Baseline State | v2 / Production Roadmap |
| :--- | :--- | :--- |
| **Data Ingestion** | Initial counts seeded from verified research dataset; automated ingestion pipeline runs daily via `seed_xlsx` adapter. | Direct Meta Graph API token integration once App Review permissions (`instagram_basic`, `instagram_manage_insights`) are granted. |
| **Watchlist Coverage** | Curated catalog of 332 prominent global and Indian personalities. | Scalable expansion to 5,000+ creators with community nomination workflows. |
| **Ranking Algorithm** | `followers_v1`: Standard competition ranking ($1, 2, 2, 4\dots$) with alphabetical tie-breaks. | `scoring_v2`: Multi-dimensional score blending short-form video engagement velocity, reel views, and follower growth. |
| **Entity Leaderboards** | `global_persons` and `india_persons` active. | Dedicated `global_brands`, `india_brands`, and `sports_teams` sub-charts. |
