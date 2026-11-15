# Technical Architecture Brief — AnonyIG, Inflact, FastVideoSave

> **Audience:** CEO + technical leadership  
> **Date:** 2026-11-15  
> **Type:** Pure technical findings summary (no diagrams in this file)  
> **PlantUML diagrams (separate):**  
> - `plantuml/01_anonyig_architecture.puml`  
> - `plantuml/02_inflact_architecture.puml`  
> - `plantuml/03_fastvideosave_architecture.puml`  
> **IGshorts product rule:** This document explains competitor systems only. It is not a build guide for unofficial Instagram scraping inside IGshorts.

---

## 0. Shared technical model (all three companies)

Across AnonyIG, Inflact, and FastVideoSave, the same architectural pattern appears:

1. The end-user browser **does not** become a first-class Instagram client for the full data path.
2. A **company-owned middle layer** (private API, worker fleet, or third-party aggregator) talks to Instagram-side surfaces.
3. That middle layer typically needs:
   - **Network egress that looks non-datacenter** (residential/mobile proxies), because Meta blocks many cloud IP ranges.
   - **Session material** (cookies / tokens) for deeper feeds (stories, pagination, some media).
   - **Response normalization** into a stable JSON schema for the UI.
   - **Media URL rewriting** through a proxy CDN, because Instagram CDN links expire and often reject hotlinking.
4. The company also protects *its own* backend from free-riding by third parties using captchas, request signing, rate limits, or light client encryption.

**Business implication:** “Search any Instagram user” UX is really “search via our paid/fragile ingestion fleet,” not “Instagram gave us an official anonymous search API.”

---

## 1. AnonyIG — Technical system description

### 1.1 Product function
AnonyIG (`https://anonyig.com/en2/`) is an anonymous Instagram viewer. A visitor can look up a public username or paste profile/story/post URLs and view profile metadata, stories, posts, and highlights without logging into Instagram in their own browser.

### 1.2 Frontend stack and control plane
- Client is a **Vue.js SPA**.
- Core orchestration object observed in bundled JS: a media/search controller (documented as `$mediaSearchController`).
- Input is normalized by a query parser that classifies:
  - username / profile lookup
  - story URL
  - post / reel URL (“convert” / media extract)
  - avatar / profile-image extraction variants
- Normalization strips `@`, trailing path noise, and tracking query params.

### 1.3 How a lookup request is formed (client)
Before calling AnonyIG’s backend, the client prepares an anti-abuse envelope:

1. Lazily loads an obfuscated signer bundle (Webpack chunk commonly referenced as `link.chunk.js` / chunk 54).
2. Collects client environment signals used in signing (timestamp plus browser/device facts).
3. Builds:
   - `ts` — request timestamp
   - `_s` — dynamic request signature derived from obfuscated client logic
4. Attaches tokens from browser storage:
   - session-style API token header (documented as `x-token` / `whToken` in localStorage)
   - Cloudflare Turnstile token header when present (documented as `wh-cf-token` / sessionStorage)

**Technical meaning for leadership:** AnonyIG treats its Worker Hub as a scarce resource. Signing + captcha exist so outsiders cannot trivially turn AnonyIG into a free public Instagram API.

### 1.4 Backend: Worker Hub
All Instagram work is delegated to a private service commonly documented as:

`https://api-wh.anonyig.com`

Observed functional endpoint families (conceptually):

| Capability | Role |
|---|---|
| username suggestions | autocomplete while typing |
| userInfo | resolve username → user id, bio, avatar, follower counts, profile header |
| stories | active 24h stories for a public account |
| posts | paginated public feed (`maxId` cursor style) |
| highlights / highlightStories | highlight covers and nested media |
| convert | direct media URL extraction / transcoding path |

The browser POSTs signed JSON to these Worker Hub routes. The Worker Hub validates signature/captcha, then runs server-side acquisition.

### 1.5 How AnonyIG obtains Instagram data (server side)
Worker Hub does **not** rely on Meta’s official public product Graph API for this anonymous viewer flow. Operationally it behaves like a scrape/proxy orchestrator:

1. **Scraper orchestrator** chooses the Instagram-side surface needed for the query type.
2. **Session pool** supplies authenticated-looking cookie/session material when unauthenticated access is insufficient (especially stories/highlights/deep pagination).
3. **Residential/mobile proxy pool** egresses requests so Meta’s datacenter IP blocks and aggressive 429/login redirects are reduced.
4. Instagram returns raw JSON / media references.
5. Worker Hub **normalizes** fields into a stable client schema.
6. Media URLs are rewritten to AnonyIG’s media proxy host (documented as `media.anonyig.com`) so the browser can stream images/videos without broken Instagram CDN hotlinks.

### 1.6 Failure / bot path
If Worker Hub returns abuse signals (commonly 422/429 class responses), the frontend opens a Cloudflare Turnstile challenge, stores a fresh captcha token, and retries the signed request.

### 1.7 AnonyIG technical summary sentence
**Vue client → signed/captcha-gated private Worker Hub → proxy+session scrape of Instagram → normalize JSON → media CDN rewrite → render UI.**

---

## 2. Inflact — Technical system description

### 2.1 Product function
Inflact (`inflact.com`, Instagram Profile Viewer / Analyzer; formerly Ingramer; commercial operator often listed as Wiseway SIA) is a freemium **profile intelligence** product. Free lookups acquire users; paid SaaS unlocks deeper history and unlimited usage.

Unlike AnonyIG’s “anonymous story stalker” positioning, Inflact’s differentiator is **derived analytics** on top of profile/post signals.

### 2.2 Edge protection and freemium gate
- Frontend sits behind **Cloudflare** bot management / Turnstile-style challenges.
- Anonymous users get a small daily free quota (order of a few searches per IP).
- Heavy use forces registration or paid plan.
- Inflact also protects its own aggregated dataset from being scraped by competitors.

### 2.3 Cache-first data path (core cost control)
Inflact’s most important technical design choice is **not live-scraping every page view**:

1. User searches `@username`.
2. Application checks internal cache DB (PostgreSQL/Redis class store).
3. **Cache hit (fresh TTL, often ~12–24h):** return stored profile + analytics in tens of milliseconds.
4. **Cache miss / stale:** enqueue an ingestion job; workers fetch Instagram; compute analytics; write snapshot; then serve.

**Leadership implication:** If 1,000 people search the same celebrity in one day, Instagram may be hit roughly once (plus refresh cadence), not 1,000 times. That is how freemium analytics becomes economically possible.

### 2.4 Ingestion / worker architecture
On miss, Inflact-style systems run:

1. Job queue (RabbitMQ/BullMQ-class pattern).
2. Worker fleet:
   - direct HTTP clients against Instagram web/mobile-style endpoints, and/or
   - headless browser workers when needed.
3. Session pool of synthetic accounts for restricted surfaces.
4. Rotating residential/mobile proxies for egress.
5. Optional dual path: where eligible, official Meta Graph `business_discovery` for professional accounts; unofficial public endpoints for broader coverage.

### 2.5 What raw fields are typically pulled
Public profile payloads commonly expose (field names vary by Instagram surface):

- identity: username, full name, biography, external URL, verification flag, privacy flag
- graph counts: followers, following, media count
- recent media edges: shortcodes, captions, like/comment counts, timestamps, media type

Private accounts are rejected (“account is private”) — these systems generally do **not** break Instagram privacy ACLs.

### 2.6 Analytics computation layer (why Inflact feels “smarter”)
Raw JSON is transformed into calculated parameters. Documented Inflact-style metrics include:

1. Follower count  
2. Following count  
3. Post count  
4. **Engagement Rate (ER%)** = ((avg likes + avg comments) / followers) × 100 over last N posts (often N = 12–24)  
5. Average likes per post  
6. Average comments per post  
7. Publishing frequency (posts per day/week over observed window)  
8. Most active posting time (hour/day histogram)  
9. Account health-style composite score (ER + consistency + comment/like mix)  
10. Top hashtags from captions  
11. Top keywords / caption themes  
12. Top-performing outlier posts  
13. Historical follower delta across snapshots  

These calculated values are what get sold as “analysis,” not merely a raw Instagram mirror.

### 2.7 Inflact technical summary sentence
**Cloudflare-gated freemium UI → cache DB first → async proxy/session workers on miss → compute ER% and related analytics → store snapshot → upsell SaaS.**

---

## 3. FastVideoSave — Technical system description

### 3.1 Product function
FastVideoSave (`fastvideosave.net`) is a high-throughput **media download utility**. User pastes an Instagram video/reel URL; site returns a downloadable stream. Monetization is primarily advertising (AdSense-class), not deep analytics SaaS.

### 3.2 Frontend characteristics
- Lightweight static/frontend stack (Astro + Tailwind style in observations).
- Small client script (`tool.js` class module) handles submit, request packaging, and download handoff.
- No large “Worker Hub + story browser” product surface like AnonyIG.

### 3.3 How the client talks to the backend
Observed pattern:

1. User pastes Instagram media URL.
2. Client applies **client-side symmetric encryption** (AES-CBC via Web Crypto) to the URL before transport.
3. Encrypted value is sent to a **third-party aggregator API** (documented host family: `api.getrequest.dev`, route style `/allinone`) via a custom header carrying the ciphertext.
4. Aggregator decrypts/resolves and returns JSON containing media stream locations.
5. Browser then fetches through a **download/proxy CDN** (documented family: `cdn.turbosave.app`, plus audio helper hosts) which retrieves bytes from Instagram media sources and streams to the user.

**Technical meaning:** FastVideoSave often does **not** operate a full first-party Instagram scrape fleet. It outsources resolution to an aggregator and focuses on UX + ads + CDN relay.

### 3.4 Why encryption/obfuscation appears on a simple downloader
The encryption is not “Instagram security.” It is **anti-leech protection** for the aggregator: casual scrapers copying the site cannot trivially replay cleartext URLs against the paid upstream API without reversing the client script.

### 3.5 FastVideoSave technical summary sentence
**Thin ad-funded site → client obfuscates URL → third-party media resolver API → proxy CDN streams file to user.**

---

## 4. Side-by-side technical comparison

| Technical dimension | AnonyIG | Inflact | FastVideoSave |
|---|---|---|---|
| Primary data product | Profile + stories + posts + highlights viewer | Profile analytics + cached intelligence | Single-media download |
| Who hits Instagram | Their Worker Hub workers | Their ingestion workers (cache-first) | Aggregator partner (mostly) |
| Client complexity | High (signer chunk, captcha, multi-endpoint controller) | Medium (search + render; edge CF) | Low (encrypt URL + call aggregator) |
| Server complexity | High (sessions, proxies, multi-resource APIs, media proxy) | Highest (queue, workers, analytics, TTL cache, SaaS) | Low first-party; depends on aggregator |
| Persistence | More on-demand / session UX | Strong snapshot DB + historical analytics | Minimal; ephemeral resolve |
| Media strategy | First-party media proxy host | Thumbnail/media cache + proxy patterns | Dedicated download CDN |
| Abuse controls | Dynamic signature + Turnstile + tokens | Cloudflare + freemium quotas | Client crypto obfuscation |
| Cost driver | Continuous proxy/session burn on lookups | Proxy/session burn amortized by cache | Aggregator + CDN bandwidth |
| Failure mode | Endpoint/signature/proxy breakage | Worker/cache freshness + IG blocks | Aggregator outage or key/script change |

---

## 5. Data-acquisition mechanics (plain technical English)

### 5.1 What “getting the data” actually means
Instagram does not publish a sanctioned “anonymous full-profile search API” for arbitrary public users at product scale. These companies therefore assemble data by one or more of:

1. **Calling Instagram web/mobile-style internal JSON surfaces** from servers that mimic browsers/apps.  
2. **Replaying session cookies** from managed account pools for restricted resources.  
3. **Routing via residential proxies** to avoid datacenter bans.  
4. **Caching aggressively** so repeat demand does not multiply Instagram calls.  
5. **Proxying media** so browsers can display/download content despite CDN referrer/expiry rules.  
6. **(Where available)** using official Meta Graph business discovery for eligible professional accounts — more common in analytics SaaS positioning than in pure anonymous story viewers.

### 5.2 What they generally cannot do (even technically aggressive operators)
- Open **private** accounts without an authorized follower relationship.
- Guarantee 100% uptime against Meta anti-bot changes.
- Avoid ongoing proxy/account maintenance cost if they stay on unofficial paths.

---

## 6. Risk register (technical + commercial)

1. **Platform ToS / enforcement risk** — unofficial automated access conflicts with Meta commercial terms.  
2. **IP reputation risk** — cloud hosts get blocked; residential bandwidth becomes a recurring bill.  
3. **Account churn risk** — session pools get challenged (SMS/email) and burned.  
4. **Schema breakage risk** — Instagram query IDs / headers / app IDs change; products fail until reverse-fixed.  
5. **Dependency risk (FastVideoSave class)** — if aggregator dies, the product dies.  
6. **Brand risk** — “anonymous stalker / downloader” positioning conflicts with an observatory/charts brand.

---

## 7. IGshorts decision frame (non-negotiable)

IGshorts locked product direction remains:

- Curated watchlist charts (Global / India), competition ranking 1224, honest nulls.
- Search against **our database**; intake/claim/admin/Meta-official enrichment for expansion.
- **No** AnonyIG-style unofficial scrape integration as a product backbone.

Use this brief to explain to leadership **what competitors technically do**. Use IGshorts master plan / handoff docs to decide **what we build**.

---

## 8. How to generate the UML diagrams

PlantUML sources are separate files (not embedded here):

```text
IGShorts_REA_Documents/plantuml/01_anonyig_architecture.puml
IGShorts_REA_Documents/plantuml/02_inflact_architecture.puml
IGShorts_REA_Documents/plantuml/03_fastvideosave_architecture.puml
```

Generate with PlantUML CLI or any PlantUML-compatible renderer (VS Code PlantUML extension, plantuml.com server, etc.):

```bash
plantuml IGShorts_REA_Documents/plantuml/*.puml
```

---

*End of technical brief.*
