# IGshorts — Legal Pages, Support/Help Center & System UX States Plan

> **Status:** Planning only (implement after approval)  
> **Related plans:** `ADMIN_CONTROL_AND_INTERACTION_ANALYTICS_PLAN.md`, Privacy/Terms already live  
> **Brand lock:** Billboard black / white / green — no gold/purple gradients on system pages  
> **Honesty lock:** Legal copy must match real tracking (today: light; after Interaction Intelligence: update Privacy + Cookies)

---

## 0. Short answer: do we need *all* of these?

**Not all at the same depth on day one.**  
Treat them as three layers:

| Layer | Items | Need for IGshorts now? |
|---|---|---|
| **Legal / trust** | Cookie Policy, Cookie Preferences, DPA, Privacy*, Terms* | Privacy & Terms exist (thin). Cookie Policy + Preferences become **required when analytics events / anonymous IDs ship**. DPA is **conditional** (B2B / college / processor relationships). |
| **Support** | Support, Help Center | **Yes**, but can start as Help Center = expanded FAQ + contact; Support as a thin ticket/email route. |
| **UX states** | 404, 403, 500, Maintenance, No Search Results, Loading, Error, Success, Session Expired | **Yes for product quality** — several already partially exist; need a consistent system, not one-off pages. |

\*Privacy (`/privacy`) and Terms (`/terms`) already exist — they must be **updated**, not reinvented.

---

## 1. What exists today (baseline)

| Surface | Path / component | Status |
|---|---|---|
| Privacy | `apps/web/app/privacy/page.tsx` | Live — short sections; cookies mentioned briefly |
| Terms | `apps/web/app/terms/page.tsx` | Live |
| FAQ | `apps/web/app/faq/page.tsx` | Live — closest thing to Help Center |
| About / Methodology | `/about`, `/methodology` | Live |
| Footer links | `public-footer.tsx` | Privacy, Terms, FAQ, Operators — **no Cookies / Support / Help** |
| 404 | `apps/web/app/not-found.tsx` | Exists — uses gold gradient (off-brand; fix) |
| Route error (≈500 UI) | `apps/web/app/error.tsx` | Exists — client error boundary |
| Empty / no results | `components/feedback/empty-state.tsx` | Exists — used in charts |
| Loading skeleton | `components/feedback/table-skeleton.tsx` | Exists |
| Inline error | `components/feedback/error-banner.tsx` | Exists |
| Coming soon | `components/feedback/coming-soon.tsx` | Exists |
| 403 Forbidden page | — | **Missing** |
| Maintenance page | — | **Missing** |
| Success toast/banner system | — | **Partial / ad hoc** |
| Session expired UI | — | **Missing** (admin/member JWT silent fail) |
| Cookie Policy page | — | **Missing** |
| Cookie Preferences UI | — | **Missing** |
| DPA page | — | **Missing** |
| Support / Help Center | — | **Missing** (FAQ only) |
| `global-error.tsx` | — | **Missing** (root layout crash) |
| `forbidden.tsx` (Next 15) | — | **Missing** |

---

## 2. How everything fits in the IGshorts information architecture

```text
Public site footer / legal strip
├── Privacy Policy          (/privacy)           [exists → expand]
├── Terms of Use            (/terms)             [exists → expand]
├── Cookie Policy           (/cookies)           [new]
├── Cookie Preferences      (modal + /cookies#preferences)
├── Data Processing         (/legal/dpa)         [new — conditional]
├── Help Center             (/help)              [new — FAQ hub]
└── Support                 (/support)           [new — contact]

System UX (not always in nav)
├── 404                     app/not-found.tsx
├── 403                     app/forbidden.tsx (+ admin/member guards)
├── 500 / crash              app/error.tsx + app/global-error.tsx
├── Maintenance             app/maintenance/page.tsx + edge flag
├── No search results       EmptyState variants
├── Loading                 skeletons / spinners / route loading.tsx
├── Inline Error            ErrorBanner / toast
├── Success                 SuccessBanner / toast
└── Session expired         modal + redirect to login
```

**Admin** (`/admin`) uses the same UX state components, with denser copy (“Operator session expired”).

---

## 3. Legal & trust pages — what, where, data content

### 3.1 Cookie Policy — `/cookies` — **Required (Phase A with analytics; Phase 0 stub OK)**

**Why:** Privacy already claims “no third-party tracking cookies.” As soon as Interaction Intelligence / anonymous IDs / theme / session storage expand, you need a dedicated Cookie Policy or the Privacy page becomes inaccurate.

**Where it fits:** Footer → Legal · linked from Cookie Preferences · linked from Privacy.

**Must contain:**

| Section | Content for IGshorts |
|---|---|
| What we mean by cookies / storage | HTTP cookies, `localStorage`, `sessionStorage` |
| Strictly necessary | Theme preference, member JWT key name, admin JWT key name, CSRF if added |
| Functional | e.g. `igshorts-last-visit`, ticker pause prefs, cookie consent record |
| Analytics (if enabled) | Anonymous ID hash, event batching — **site analytics only**, not Meta ads |
| Marketing | Default **Off / none** unless you later add a vendor |
| Third parties | List none today; if Vercel Analytics / similar added, name them |
| Retention | How long consent + IDs kept |
| How to change preferences | Link to Cookie Preferences |
| Contact | privacy@ / editorial@ |

**How it works:** Static Next.js page + `lastUpdated` date. When preferences change, update a `igshorts_cookie_consent` record (localStorage + optional server later).

---

### 3.2 Cookie Preferences — modal + deep link `/cookies#preferences` — **Required before analytics on**

**Why:** Legal/UX best practice when any non-essential storage exists. Also required for many EU/UK scenarios.

**Where it fits:** First visit banner (optional), footer “Cookie preferences”, settings inside `/account` later.

**Categories (IGshorts-specific):**

| Toggle | Default | Controls |
|---|---|---|
| Essential | Always on | Auth session keys, security, consent log |
| Preferences | On (recommended) | Theme, last-visit timestamp, UI prefs |
| Analytics | Off until user opts in (or Off until product enables) | `AnalyticsEvent` anonymous beacon |
| Marketing | Off / hidden | None today |

**Must contain UI copy:**

- Short plain-language explanation per category  
- Save / Accept all / Reject non-essential  
- Link to full Cookie Policy  
- “Last saved” timestamp  

**How it works:**

1. On first visit (if analytics planned): show banner.  
2. Store consent JSON: `{ essential: true, preferences: bool, analytics: bool, updatedAt }`.  
3. Event beacon **must check** analytics flag before firing.  
4. Admin overview can show “consent required” feature flag.

**Phase note:** Until Interaction Intelligence ships, Preferences can be a **simple page** that only manages theme + “remember last visit” without a scary banner.

---

### 3.3 Data Processing Agreement (DPA) — `/legal/dpa` — **Conditional (Phase B+)**

**Do you need it now for a public charts site?**  
**Not strictly** for anonymous public visitors.  
**Yes** when any of these become true:

- Colleges / agencies / brands ask IGshorts to process personal data **on their behalf**  
- You offer a B2B API, white-label, or “managed watchlist” service  
- You process member PII as a processor for a customer org  

**Where it fits:** Footer Legal (small), linked from Terms, used in sales/college review packets.

**Must contain (standard DPA outline adapted to IGshorts):**

| Clause | IGshorts angle |
|---|---|
| Parties & roles | Controller vs Processor definitions |
| Subject matter | Public IG watchlist metrics + optional member accounts |
| Duration | Term of services |
| Nature/purpose | Ranking, discovery, optional analytics |
| Types of data | Handles, public follower counts, emails (members), event logs |
| Data subjects | Public figures on watchlist; site members; visitors |
| Sub-processors | Supabase, Vercel, Render, (future Meta) — maintain a live list |
| Security | Encryption in transit, access control, admin audit |
| Breach notice | Timeline commitment |
| International transfers | If applicable |
| Deletion / return | On contract end |
| Audit rights | Reasonable |

**How it works:** Mostly static legal markdown/MDX. Sub-processor list should be a maintainable section (update when infra changes). **Lawyer review recommended** before calling it binding.

**Until then:** Footer can omit DPA; Terms can say “enterprise DPA available on request.”

---

### 3.4 Support — `/support` — **Yes (thin v1)**

**Why:** Users and operators need a clear path when charts look stale, account delete fails, or claim questions arise.

**Where it fits:** Footer · Help Center · Account page · Admin “contact eng” later.

**Must contain:**

| Block | Data |
|---|---|
| What Support covers | Account, privacy requests, watchlist corrections, bug reports |
| What it doesn’t | “Make me #1”, Instagram password reset, Meta ads |
| Channels | Email (`support@` / `editorial@`), optional form |
| Response expectation | e.g. “We aim to reply within 2 business days” |
| Privacy requests | Link to Privacy + deletion via `/account` |
| Operator path | Link to `/admin/login` for staff only |

**How it works (v1):** Static page + `mailto:` or simple form posting to email / admin ticket table later.  
**v2:** `SupportTicket` model + admin inbox (ties to OCC plan).

---

### 3.5 Help Center — `/help` — **Yes (expand FAQ into hub)**

**Why:** FAQ alone doesn’t scale once discovery, music, pulse, insights, and claim exist.

**Where it fits:** Footer primary “Help”; FAQ redirects or becomes `/help` sections.

**Structure:**

```text
/help
├── Getting started
├── Charts & rankings (followers_v1, ties, movers, freshness)
├── Discovery (Trending, Music, Daily Pulse, editorial labels)
├── Accounts & tracking
├── Privacy, cookies & data
├── Creators / claim (when live)
└── Troubleshooting (API sleeping, empty movers, 404 profiles)
```

**Must contain per article:**

- Title, short answer, detailed steps  
- Last updated  
- Related links (Methodology, Charts, Account)  
- “Was this helpful?” optional later (analytics event)

**How it works:** Start as MDX/static sections in Next.js (no CMS required). Later: admin-editable help articles if needed.

**Migration:** Keep `/faq` as redirect → `/help` or embed FAQ as first section.

---

### 3.6 Privacy & Terms updates (not new products, but required)

When cookies/analytics/support ship, **update**:

- `/privacy` — accurate cookie categories, event retention, DPA pointer  
- `/terms` — acceptable use, API abuse, editorial content disclaimer, limitation of liability  

---

## 4. UX states — what, where, how, required content

Use one **shared visual language** (Oswald/Inter, black/white/green, sharp borders).  
Replace gold gradient on current 404.

### 4.1 Matrix: required vs nice-to-have

| State | Required? | Priority | Primary implementation |
|---|---|---|---|
| 404 Not Found | **Yes** | P0 | `app/not-found.tsx` (rebrand) |
| 403 Forbidden | **Yes** | P0 | `app/forbidden.tsx` + guard redirects |
| 500 / App Error | **Yes** | P0 | `app/error.tsx` + `app/global-error.tsx` |
| Maintenance | **Yes** | P1 | `/maintenance` + `MAINTENANCE_MODE` env / Edge Config |
| No Search Results | **Yes** | P0 | Enhance `EmptyState` variants |
| Loading | **Yes** | P0 | `loading.tsx` per route group + skeletons |
| Inline Error | **Yes** | P0 | `ErrorBanner` + optional toast |
| Success | **Yes** | P1 | `SuccessBanner` / toast for admin + account |
| Session Expired | **Yes** | P0 | Modal + redirect for member/admin JWT |

### 4.2 404 — Not Found

**When:** Unknown routes, unknown profile usernames, retired pages.

**Where:** `apps/web/app/not-found.tsx` (and profile-level notFound()).

**Must show:**

- Code label `404`  
- Title: “Page not on the watchlist” / “Profile not found”  
- Short reason (not monitored / moved / mistyped)  
- CTAs: Home, Global 100, Search profiles, Help  
- Optional: search box  

**Data:** No personal data. Optional suggested links from static list.

---

### 4.3 403 — Forbidden

**When:**

- Logged-out user hits `/admin/*`  
- Member hits claimed-creator dashboard without claim  
- Role `editor` hits admin-only rebuild  

**Where:** `app/forbidden.tsx` (Next.js) + client guard fallback.

**Must show:**

- `403`  
- “You don’t have access”  
- If session missing → Sign in  
- If wrong role → “Ask an operator” + Support link  
- Never leak whether a resource exists when that would be a security issue (admin paths can be generic)

---

### 4.4 500 — Server / render failure

**When:** Uncaught render errors, API hard failures at page level.

**Where:**

- `app/error.tsx` — segment errors (exists)  
- `app/global-error.tsx` — root layout failures (**add**)  

**Must show:**

- Calm “Something went wrong” (avoid scary “500” alone on public marketing pages; admin can show `500`)  
- Retry button (`reset()`)  
- Home link  
- Support link with optional `digest` / request id  
- Do **not** dump stack traces to users  

**Data logged server-side:** error digest, path, request id (already partly via logging interceptor).

---

### 4.5 Maintenance

**When:** Migrations, Render/API downtime windows, emergency pause.

**Where:**

- `apps/web/app/maintenance/page.tsx`  
- Middleware or layout gate when `MAINTENANCE_MODE=true`  
- Optional bypass for `/admin` with operator secret  

**Must show:**

- “IGshorts is briefly offline for maintenance”  
- Expected return window (editable copy or env `MAINTENANCE_MESSAGE`)  
- Status link (optional)  
- Charts honesty note: rankings not updating during window  

**How it works:** Env flag on Vercel + API returns `503` with `Retry-After` for JSON clients.

---

### 4.6 No Search Results

**When:** Charts/profiles search or filters return zero rows.

**Where:** Reuse/extend `EmptyState` in `chart-view`, profiles directory, trending explorer, admin watchlist.

**Variants / copy bank:**

| Context | Title | Description | CTA |
|---|---|---|---|
| Charts search | No ranked people matched | Try clearing filters | View Global 100 |
| Profiles | No profiles found | Handle may be outside watchlist | Browse charts |
| Trending | No topics right now | Editorial set empty | All trending |
| Admin watchlist | No creators | Adjust query | Add creator |

---

### 4.7 Loading State

**When:** Route transitions, chart fetch, admin tables, discovery client fetches.

**Where:**

- `loading.tsx` under major route groups (`charts`, `profiles`, `trending`, `admin`)  
- `TableSkeleton`, card skeletons for discovery  
- Button spinners for mutations  

**Rules:**

- Prefer **skeletons that match layout** over generic spinners on charts  
- Ticker/carousel: don’t flash empty if cached  
- Admin: show “Running pipeline…” with job id when sync is long  

---

### 4.8 Error State (inline)

**When:** Section fails but page shell survives (homepage discovery vs charts split).

**Where:** `ErrorBanner` on home, movers, chart-view; discovery sections should fail soft.

**Must show:**

- What failed (Charts API / Discovery API)  
- Retry if possible  
- No fake placeholder ranks  

---

### 4.9 Success State

**When:** Admin save, import complete, account deleted, track added, cookie prefs saved, pulse published.

**Where:** Toast or inline `SuccessBanner` (new shared component).

**Must show:**

- One-line confirmation  
- Optional “View audit / View chart” link  
- Auto-dismiss for toasts (4–6s), persistent for critical admin results  

---

### 4.10 Session Expired

**When:** Member or admin JWT invalid/expired; API returns 401.

**Where:**

- Global fetch wrapper (`admin-client`, `memberFetch`)  
- Modal component `SessionExpiredDialog`  

**Must show:**

- “Your session expired”  
- Sign in again  
- Preserve return URL (`?next=/admin/watchlist`)  
- Clear invalid tokens from `localStorage`  

**How it works:** On 401 from guarded API → clear token → show modal → redirect to `/account` or `/admin/login`.

---

## 5. Shared component system (implementation shape)

```text
apps/web/
├── app/
│   ├── not-found.tsx              # rebrand 404
│   ├── forbidden.tsx              # new 403
│   ├── error.tsx                  # polish 500 segment
│   ├── global-error.tsx           # new
│   ├── maintenance/page.tsx       # new
│   ├── cookies/page.tsx           # Cookie Policy + prefs anchor
│   ├── support/page.tsx           # new
│   ├── help/page.tsx              # Help Center hub
│   ├── help/[slug]/page.tsx       # articles (optional phase)
│   └── legal/dpa/page.tsx         # conditional
├── components/
│   ├── feedback/
│   │   ├── empty-state.tsx        # variants
│   │   ├── error-banner.tsx
│   │   ├── success-banner.tsx     # new
│   │   ├── table-skeleton.tsx
│   │   └── session-expired-dialog.tsx  # new
│   ├── legal/
│   │   ├── cookie-banner.tsx      # new (when analytics on)
│   │   └── cookie-preferences.tsx # new
│   └── chrome/public-footer.tsx   # add Help, Support, Cookies
└── messages/en.json               # centralized copy for states
```

Centralize user-facing strings in `messages/en.json` under keys like `states.404_title`, `legal.cookies_*`, `help.*`.

---

## 6. Footer / nav placement (product fit)

**Public footer — Legal column:**

- Privacy  
- Terms  
- Cookies  
- Cookie preferences (button)  
- DPA (only if published)  

**Public footer — Help column:**

- Help Center  
- Support  
- FAQ (or merge)  
- Methodology  

**Account page:** link to Support + Privacy + Cookie preferences  

**Admin shell:** link to Ops runbook + Support (internal) + Session handling  

---

## 7. Data & content checklist (what must be written)

### Legal copy owners

| Doc | Owner | Needs lawyer? |
|---|---|---|
| Privacy (update) | Product + eng facts | Recommended |
| Terms (update) | Product | Recommended |
| Cookie Policy | Eng facts + product | Recommended if EU users |
| Cookie Preferences UI microcopy | Product/UX | No |
| DPA | Legal counsel | **Yes** before enterprise use |
| Help articles | Product/eng | No |
| Support SLAs | Ops | No |

### Minimum factual inputs eng must supply for legal accuracy

- Exact storage keys used (`localStorage` / cookies)  
- Whether analytics events are on  
- Sub-processors: Vercel, Render, Supabase (+ future Meta)  
- Retention periods  
- Contact emails that actually inbox  

---

## 8. Phased delivery (aligned with other plans)

### Phase L0 — Quick trust & state hygiene (2–4 days)

1. Rebrand 404 to black/white/green (remove gold gradient)  
2. Add `global-error.tsx`  
3. Add `forbidden.tsx` + wire admin/member 403 paths  
4. Add Session Expired dialog for admin + member 401  
5. Footer links: Help (can point to FAQ), Support mailto page stub  
6. Success banner component for admin save/import  

**Exit:** System feels professional when things fail.

### Phase L1 — Help + Support hub (3–5 days)

1. `/help` hub with Getting started + Charts + Account + Troubleshooting  
2. `/support` contact page  
3. Redirect `/faq` → `/help#faq` or nest FAQ  
4. Expand Privacy cookie section with accurate key list  

### Phase L2 — Cookies package (with Interaction Intelligence Phase 3)

1. `/cookies` Cookie Policy  
2. Cookie Preferences modal + storage  
3. Gate analytics beacon on consent  
4. Update Privacy/Terms  

### Phase L3 — Maintenance mode

1. `MAINTENANCE_MODE` flag  
2. `/maintenance` page  
3. API 503 behavior  
4. Admin bypass  

### Phase L4 — DPA (when B2B/college processor need appears)

1. Draft `/legal/dpa`  
2. Sub-processor register  
3. Counsel review  
4. Footer link  

---

## 9. Acceptance criteria

- [ ] Every listed UX state has a single canonical component or page  
- [ ] 404/403/500/Maintenance share Billboard visual language  
- [ ] Session expiry never leaves users on a broken admin shell  
- [ ] Cookie Policy matches real storage + analytics flags  
- [ ] Preferences can disable analytics before events fire  
- [ ] Help Center answers “why is my profile missing?” and “what is editorial?”  
- [ ] Support path is obvious from footer and account  
- [ ] DPA only published when legally reviewed  
- [ ] No fake legal claims (“we never store anything”) if events exist  

---

## 10. Decision summary for CEO / product

| Item | Decision |
|---|---|
| Cookie Policy | **Yes** — publish before/with analytics; stub OK earlier |
| Cookie Preferences | **Yes** — required when non-essential analytics exist |
| DPA | **Only when** acting as processor for orgs; else “on request” |
| Support | **Yes** — start email/form page |
| Help Center | **Yes** — upgrade FAQ into `/help` |
| All UX states listed | **Yes** as a **system**, prioritized P0→P4 above |

---

## 11. Immediate next step after approval

Start **Phase L0** (404 rebrand, forbidden, global-error, session expired, Support stub, footer links).  
Then L1 Help Center.  
Couple **L2 Cookies** with the Interaction Intelligence event work in `ADMIN_CONTROL_AND_INTERACTION_ANALYTICS_PLAN.md` so legal copy never lies.

---

**End of plan.**
