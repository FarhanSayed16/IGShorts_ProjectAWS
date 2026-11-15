# Executive Brief — Competitor Systems (AnonyIG, Inflact, FastVideoSave)

> **Audience:** CEO / leadership (scan-friendly)  
> **Date:** 2026-11-15  
> **Depth:** Concise technical overview  
> **Full depth:** `CEO_TECHNICAL_ARCHITECTURE_BRIEF.md`  
> **Diagrams:** `plantuml/01_anonyig_architecture.puml`, `02_inflact_architecture.puml`, `03_fastvideosave_architecture.puml`

---

## Executive summary

| Item | Fact |
|---|---|
| **What these sites do** | Let users look up Instagram profiles/media **without** going through Instagram’s normal logged-in product UI |
| **How they work** | User → competitor website → competitor backend (or partner API) → Instagram-side data → result returned to user |
| **Critical point** | The browser is not the real Instagram client. Their servers/proxies perform acquisition |
| **IGshorts position** | Curated watchlist charts/observatory — **not** an anonymous any-user Instagram fetch product |

---

## Comparison matrix

| Dimension | AnonyIG | Inflact | FastVideoSave |
|---|---|---|---|
| **Product** | Anonymous profile / stories / posts viewer | Freemium profile analytics → paid SaaS | URL → video download utility |
| **Input** | `@username` or profile/story/post URL | Public `@handle` | Video / reel URL |
| **Output** | Profile + stories + posts + highlights + downloads | Profile + ER% / averages / activity metrics + recent posts | Downloadable media file |
| **Revenue** | Ads / affiliates | Subscriptions (~$54–$140+/mo) + free capped lookups | AdSense / page ads |
| **Backend model** | First-party Worker Hub + proxy/session fleet | Cache-first DB + async worker fleet + analytics engine | Thin site + third-party media aggregator + download CDN |
| **Ops intensity** | High | Highest | Lower (dependency shifted upstream) |
| **Primary failure mode** | IG blocks, session burn, endpoint change | Same + cache freshness / analytics trust | Aggregator or CDN outage |
| **Fit vs IGshorts** | Low | Partial (insight layer only) | Low |

---

## Common architecture (all three)

1. **Ingress:** user submits username or URL on competitor site.  
2. **Control plane:** competitor API validates/rate-limits/protects the request (captcha, tokens, quotas, or client obfuscation).  
3. **Acquisition:** competitor infrastructure (or partner) queries Instagram-side public/internal surfaces via proxies and, where needed, session cookies.  
4. **Normalize:** raw response mapped to competitor’s JSON schema.  
5. **Media path:** images/videos often served via competitor CDN/proxy because Instagram CDN links expire and restrict hotlinking.  
6. **Serve:** UI renders result; monetization layer (ads or upsell) attached.

**Constraint shared by all:** private Instagram accounts remain inaccessible without authorized follower context. These systems target **public** data paths.

---

## 1. AnonyIG — system in brief

**Role:** On-demand anonymous Instagram viewer.

**Flow**
1. Client classifies input (user / stories / posts / convert).  
2. Client signs request and attaches anti-abuse tokens (incl. Cloudflare Turnstile when challenged).  
3. Request goes to private **Worker Hub** (`api-wh.anonyig.com`), not to Meta official public APIs as the product path.  
4. Worker Hub fetches via residential/mobile proxies + session pool.  
5. Response normalized; media URLs rewritten through AnonyIG media proxy.  
6. UI renders profile/stories/posts/highlights.

**Technical implication:** high continuous cost (proxy + sessions) and high maintenance when Instagram changes internals.

---

## 2. Inflact — system in brief

**Role:** Freemium profile intelligence funnel into SaaS.

**Flow**
1. Edge layer (Cloudflare + freemium quota) gates abuse.  
2. **Cache check first** (TTL typically ~12–24h).  
3. **Hit:** return stored profile + computed analytics (low latency, low IG cost).  
4. **Miss:** enqueue workers → proxy/session fetch → compute metrics → write cache → return.  
5. Paid tier unlocks deeper history / higher limits.

**Core computed value (examples)**
- Engagement Rate: `(avg likes + avg comments) / followers × 100` over recent posts  
- Avg likes/comments, posting frequency, tag/keyword patterns, follower deltas

**Technical implication:** commercially stronger than pure viewers because caching amortizes fetch cost and analytics creates subscription value. Underlying acquisition risk remains.

---

## 3. FastVideoSave — system in brief

**Role:** High-throughput media download utility.

**Flow**
1. User pastes media URL.  
2. Client obfuscates/encrypts URL before calling a **third-party aggregator**.  
3. Aggregator resolves playable media locations from Instagram-side sources.  
4. Download/proxy CDN streams file to user.  
5. Page monetizes via ads.

**Technical implication:** simpler first-party stack; concentration risk on aggregator + CDN availability.

---

## Capability map

| Capability | AnonyIG | Inflact | FastVideoSave |
|---|---|---|---|
| Any public profile lookup | Strong | Strong | No |
| Stories / browse media | Strong | Limited (recent posts focus) | No |
| Engagement / analytics | Weak | Strong | None |
| Historical trend storage | Weak | Strong (paid) | None |
| Single-file download | Available in-viewer | Not primary | Strong |

---

## Risk register (decision-relevant)

| Risk | Impact |
|---|---|
| Meta ToS / enforcement | Unofficial automated access is commercially sensitive |
| Datacenter IP blocking | Forces residential proxy spend at scale |
| Session/account churn | Stories/deep feeds require rotatable sessions |
| Endpoint schema drift | Product outages until reverse-fixed |
| Vendor dependency (FastVideoSave class) | Upstream outage = full product failure |
| Brand mismatch | Viewer/downloader positioning ≠ trusted public ranking observatory |

---

## IGshorts decision

| Do not build as core | Build instead |
|---|---|
| AnonyIG-style any-user unofficial scrape fleet | Curated Global/India watchlist rankings |
| Anonymous story-stalker UX as product identity | Honest follower metrics, competition rank 1224, nulls kept honest |
| Dependency on unofficial proxy/session acquisition for search | DB search on tracked profiles + intake/claim queue + official Meta path when available |

**Positioning line:** Competitors operate as Instagram acquisition middle layers. IGshorts operates as a curated ranking observatory on owned, attributable data.

---

## Reading order

1. **This document** — executive scan  
2. `CEO_TECHNICAL_ARCHITECTURE_BRIEF.md` — in-depth technical  
3. `plantuml/*.puml` — architecture diagrams  
4. `SCRAPER_FEASIBILITY_AND_SEARCH_ARCHITECTURE.md` — why scrape-clone is rejected  
5. `AI_HANDOFF_PROJECT_STATUS.md` — current IGshorts status
