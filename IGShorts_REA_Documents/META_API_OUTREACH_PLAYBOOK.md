# Meta API Outreach Playbook — What to Ask, Where, and How

> **Purpose:** Formal, low-risk steps to contact Meta about official Instagram Graph / Business Discovery access for IGshorts.  
> **Date:** 2026-11-20  
> **Rule:** Do **not** discuss scrapers, AnonyIG, Inflact, or unofficial acquisition. Ask only about **official** APIs.

---

## 1. Reality check before you write Meta

### What you can reasonably ask for (official path)

Via **Instagram Graph API → Business Discovery** (for other **Business/Creator** accounts, not every personal account):

| Field / capability | Likely available? | Notes |
|---|---|---|
| `followers_count` | Yes | Core for IGshorts charts |
| `follows_count` | Yes | Useful context |
| `media_count` | Yes | Useful context |
| Profile basics (`biography`, `website`, `name`, `profile_picture_url`, `ig_id`) | Yes | Identity enrichment |
| Recent public media + `like_count` / `comments_count` | Often yes | On discovered professional accounts |
| Media `view_count` (where exposed) | Sometimes | Not guaranteed for all media types |
| **Impressions / reach / profile activity for arbitrary third-party accounts** | **No (do not ask as a requirement)** | Insights are for accounts you own/manage, not world-wide third parties |
| Search “any Instagram user by partial name like the IG app” | **No** | Not an official product capability |

**Bottom line for your Sir:** Ask Meta to confirm Business Discovery fields + App Review permissions for a **curated professional-account ranking/observatory**. Do **not** ask for “impressions of any user on Instagram.”

---

## 2. Exact links (use in this order)

| Step | What | Link |
|---|---|---|
| A | Meta for Developers home | https://developers.facebook.com/ |
| B | Create / open your App | https://developers.facebook.com/apps/ |
| C | Instagram Platform docs | https://developers.facebook.com/docs/instagram-platform/ |
| D | **Business Discovery reference (most important)** | https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery/ |
| E | Developer Support hub | https://developers.facebook.com/support/ |
| F | Bug / platform issues tool | https://developers.facebook.com/support/bugs/ |
| G | Create bug report (may say “support unavailable” for some IG products) | https://developers.facebook.com/support/bugs/create/ |
| H | **Developer Community Forum (often the real channel now)** | https://developers.facebook.com/community/ |
| I | Platform status | https://developers.facebook.com/status/ |
| J | Meta Business Suite (business verification) | https://business.facebook.com/ |
| K | Legacy email (secondary only) | `platform@support.facebook.com` |

**Practical truth:** Meta has shifted away from email. Best path = **App Dashboard → App Review / permissions**, then **Community Forum** if blocked. Bug tool is for broken platform behavior, not “please approve our business idea.”

---

## 3. Clever framing (what to say / not say)

### Say
- We operate a **public creator ranking / analytics observatory**.
- We only need **public professional-account metrics** for accounts on a **curated tracked list**.
- Primary need: **follower count**, media count, basic profile fields, optional public media engagement fields.
- We want to use **official Instagram Graph API / Business Discovery**.
- We will respect rate limits, App Review, and professional-account limitations.

### Do not say
- We reverse-engineered AnonyIG / Inflact / anonymous viewers.
- We need impressions/reach for every Instagram user.
- We need to bypass private accounts.
- Full competitive strategy, scrape architecture, or proxy plans.
- “Give us API keys so we can scrape Instagram.”

### Disclosure level
Enough for Meta to classify the use case (**business discovery for professional public metrics**).  
Not enough to hand them your full product roadmap or competitor research.

---

## 4. Step-by-step actions (do these in order)

### Step 1 — Create the Meta developer footprint (same day)
1. Go to https://developers.facebook.com/ and log in with the company Facebook account (not a random personal throwaway if avoidable).  
2. Open https://developers.facebook.com/apps/ → **Create App**.  
3. Choose a use case that includes Instagram / Business tools (wording in UI changes; pick the closest Instagram Graph / Business option).  
4. Save:
   - App ID  
   - App Secret (store in password manager / secrets vault only)  
5. In App Dashboard, add the **Instagram** product / Instagram Graph capability.

### Step 2 — Attach a professional Instagram + Facebook Page (required for Business Discovery)
Business Discovery is queried **through an Instagram Business/Creator account you control**, linked to a Facebook Page.

1. Ensure you have:
   - A Facebook Page owned by your business  
   - An Instagram **Professional** account (Business or Creator) linked to that Page  
2. Connect them in Meta Business Suite: https://business.facebook.com/  
3. In the app, generate a User access token with (as documented today):
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_read_engagement`  
   (If Page role is via Business Manager, docs may also require `ads_management` or `ads_read`.)

### Step 3 — Prove the call works in Development mode (before App Review)
In Graph API Explorer / your server, test one known professional handle:

```http
GET /{YOUR_IG_USER_ID}?fields=business_discovery.username(TARGET_USERNAME){followers_count,media_count,biography,website,name,profile_picture_url}
```

If this returns data for tester/owned contexts, your plumbing is correct.

### Step 4 — Business verification (often required for live access)
In Meta Business Suite / Business settings, complete **Business Verification** for the company entity.  
Without verification, many apps stay stuck in limited mode.

### Step 5 — App Review (this is the real “ask Meta” gate)
In App Dashboard → **App Review** / **Permissions and Features**, request the Instagram-related permissions needed for Business Discovery.

Provide:
- short use-case description (draft below)
- screencast of the product flow (charts / profile page showing sourced follower counts)
- privacy policy URL
- clear explanation that you query **exact professional usernames** on a tracked list

### Step 6 — Where to raise a ticket / ask questions

Use channels in this priority:

1. **App Dashboard help / App Review notes** (first)  
2. **Developer Community Forum** — https://developers.facebook.com/community/  
   Post under Instagram Graph / Business Discovery topics.  
3. **Bug tool** — https://developers.facebook.com/support/bugs/create/  
   Only if an API call fails contrary to docs (not for “please approve us”).  
4. **Email fallback** — `platform@support.facebook.com`  
   Short, formal, point them to App ID + forum/bug link. Expect slow / no reply.

---

## 5. Copy-paste: App Review / Forum message (recommended)

Use this almost as-is. It is intentional and limited.

**Subject:** Guidance on Instagram Graph API Business Discovery for public professional profile metrics

Hello Meta Developer Support / Community,

We are building a public web product that publishes curated rankings of notable Instagram **professional** accounts (Business/Creator), based on attributable public metrics.

We intend to use the official Instagram Graph API **Business Discovery** endpoint only.

**What we need confirmed / approved**
1. Permission to call Business Discovery for exact professional usernames on our tracked list.  
2. Access to public fields such as:
   - `followers_count`
   - `follows_count`
   - `media_count`
   - basic profile fields (`name`, `biography`, `website`, `profile_picture_url`)
   - where available, public media fields such as `like_count` / `comments_count` on recent media
3. Clarification of rate-limit / App Review expectations for scheduled refresh of a curated list (not open-ended crawling of all Instagram users).

**What we are not requesting**
- Insights/impressions/reach for accounts we do not own or manage  
- Access to private accounts  
- Instagram’s consumer search index / partial-name global search  

**Current status**
- App ID: `[PASTE APP ID]`
- Business portfolio / verification status: `[Pending / Completed]`
- We have reviewed: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery/

Please advise:
1. Which permissions we must submit in App Review for this use case.  
2. Whether Business Verification is mandatory before live Business Discovery outside Development mode.  
3. Any policy constraints we should design for (refresh frequency, allowed fields, professional-account-only limitation).

Thank you,
`[Name]`  
`[Company]`  
`[Role]`  
`[Work email]`  
`[App ID]`  
`[Privacy Policy URL]`  
`[Product URL if live]`

---

## 6. Raise ticket / email FIRST (no App ID required yet)

You can contact Meta **before** creating an application. The goal of this first message is only:

> “Tell us the official requirements, permissions, and limits for our use case.”

Create the Meta app later, after they (or the docs) confirm the path.

### Where to raise the ticket

| Channel | Link | Use when |
|---|---|---|
| **Developer Support hub** | https://developers.facebook.com/support/ | Start here; choose the closest Instagram / Graph API option |
| **Bug / support form** | https://developers.facebook.com/support/bugs/create/ | If the hub routes you here. If it says “support unavailable for this product,” use Community instead |
| **Developer Community (recommended if form blocks Instagram)** | https://developers.facebook.com/community/ | Post as a question: Instagram Graph API / Business Discovery |
| **Email** | `platform@support.facebook.com` | Formal fallback in parallel |

### Ticket / forum title
`Guidance request: Instagram Graph API Business Discovery for curated public professional metrics`

### Ticket / forum body (copy-paste)

```text
Hello Meta Developer Support,

We are planning a public web product that publishes curated rankings of notable Instagram professional accounts (Business/Creator). We want to use only official Meta APIs.

Before we create/configure a production application, please confirm what is required and what is allowed.

Use case (high level):
- Track a curated list of public professional Instagram accounts
- Refresh and display attributable public metrics on our website
- Metrics of interest: followers_count, follows_count, media_count, basic profile fields
- Optional if available: public media like_count / comments_count
- We do NOT need impressions/reach/insights for accounts we do not own
- We do NOT need private-account access
- We do NOT need Instagram consumer global search

Please advise:
1) Which official API/product covers this (confirm if Business Discovery is correct)
2) What account setup is required (Facebook Page, Instagram professional account, Business Verification, etc.)
3) Which permissions/features must be requested in App Review
4) Field-level availability and known limitations for third-party professional accounts
5) Rate-limit / policy constraints for scheduled refresh of a curated list
6) Exact next steps and links we should follow

Docs we already reviewed:
https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery/

Company: [COMPANY NAME]
Contact name: [YOUR NAME]
Role: [YOUR ROLE]
Work email: [YOUR EMAIL]
Website (if any): [URL]
Country: [COUNTRY]

Thank you.
```

### Email (copy-paste)

**To:** `platform@support.facebook.com`  
**Cc:** your Sir / company email (optional)  
**Subject:** Guidance request — Instagram Graph API access requirements (no App ID yet)

```text
Hello Meta Platform Support,

We would like formal guidance on the official Instagram Graph API requirements for our product before we create a production Meta application.

We are building a curated public ranking/observatory website for notable Instagram professional accounts. We only want official API access.

Required direction from your side:
1) Confirm whether Instagram Graph API Business Discovery is the correct product for reading public professional-account metrics such as followers_count, media_count, and basic profile fields.
2) Tell us all prerequisites (developer account, app creation, Facebook Page, Instagram professional account, Business Verification, App Review permissions).
3) Confirm what is NOT available for third-party accounts (especially impressions/reach/insights for accounts we do not manage).
4) Share the correct support/App Review process and documentation links we should follow.

We are not requesting unofficial access, private-account access, or global Instagram consumer search.

Company: [COMPANY NAME]
Contact: [YOUR NAME], [ROLE]
Email: [WORK EMAIL]
Phone (optional): [PHONE]
Website: [URL]

Thank you for your guidance.
[YOUR NAME]
```

---

## 7. What success looks like

| Milestone | Meaning |
|---|---|
| Dev-mode Business Discovery works for tester accounts | Integration plumbing OK |
| Business Verification complete | Company trusted by Meta |
| App Review approved for required permissions | Can query broader professional usernames |
| Scheduled refresh of watchlist follower counts | IGshorts Phase 10 Meta live path unlocked |

---

## 8. What to tell your Sir in one paragraph

Meta will not give us a special “API key for all Instagram impressions.” The official path is Instagram Graph **Business Discovery**, which can return **follower/media/profile (and some public media engagement) for professional accounts**, after we create an app, connect a professional IG + Page, verify the business, and pass App Review. We should ask Meta for confirmation of those fields and permissions only — and explicitly not ask for arbitrary impressions or global Instagram search.
