# IGshorts — What You Need to Get (Checklist)

Everything required to make the data engine live, in one place.

---

## Why only these things?

Instagram does not offer a bulk export or a "get all users" API. No one does. What exists is:

1. **An open CSV file** (FastSocial) that already covers ~12,000 famous accounts — free, no key needed.
2. **Meta's official API** (Business Discovery) that lets you look up one public professional account at a time — free, but requires a developer app and approval.
3. **Licensed provider APIs** (Influencers Club, Modash) for broader coverage — paid, needed only later.

You already have #1 working. The table below is everything needed to activate #2 and eventually #3.

---

## What You Need

| # | What | Where to get it | Why you need it | Cost |
|---|---|---|---|---|
| 1 | **Meta Developer App** | [developers.facebook.com/apps](https://developers.facebook.com/apps) → Create App | This is the container that holds your API credentials and permissions | Free |
| 2 | **Meta App ID** | Created automatically when you make the app above | Identifies your app in every API call | Free |
| 3 | **Meta App Secret** | App Dashboard → Settings → Basic | Authenticates your server to Meta's API | Free |
| 4 | **A Facebook Page you own** | [facebook.com/pages/create](https://www.facebook.com/pages/create) | Required by Meta's login flow — your IG Business account must link to a Page | Free |
| 5 | **An Instagram Business or Creator account you own** | Instagram app → Settings → Switch to Professional Account, then link to the Facebook Page above | This is the "caller" account — Meta requires you to have one to query other accounts | Free |
| 6 | **Instagram Caller Account ID** | After linking, find it via the Graph API: `GET /me/accounts` → get Page ID → `GET /{page_id}?fields=instagram_business_account` | The numeric ID you pass in every Business Discovery call | Free |
| 7 | **Long-lived Access Token** | Generate via the [Graph API Explorer](https://developers.facebook.com/tools/explorer/) → exchange short-lived for long-lived via the token exchange endpoint | Authenticates each API call. Short-lived tokens last ~1 hour; long-lived last ~60 days. You need a renewal job. | Free |
| 8 | **App Review approval** | App Dashboard → App Review → submit for `instagram_basic`, `pages_show_list`, `pages_read_engagement` | Without review, you can only query your own account. After review, you can query any public professional account. | Free (takes 1–5 business days) |
| 9 | **Business Verification** (if Meta requires it) | App Dashboard → Settings → Business Verification | Meta may require this for Advanced Access. Submit business documents. | Free |
| 10 | **Influencers Club API Key** *(future)* | [influencers.club](https://influencers.club/pricing/) → Sign up for Pro plan | Broader creator discovery and enrichment beyond what Meta covers | ~$208/month |
| 11 | **Modash API Key** *(future, alternative)* | [modash.io](https://www.modash.io/) → Contact sales | Alternative to Influencers Club with larger index | ~$1,350/month |

---

## Environment Variables to Set

Once you have the items above, these go in your server `.env` file:

```env
# ── Items 2–3: From your Meta developer app ──
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here

# ── Item 6: Your IG Business account numeric ID ──
META_IG_CALLER_ACCOUNT_ID=17841400000000000

# ── Item 7: The long-lived token ──
META_ACCESS_TOKEN=EAAxxxxxxx...
META_ACCESS_TOKEN_EXPIRES_AT=2027-01-01T00:00:00Z

# ── API version (check current) ──
META_GRAPH_API_VERSION=v21.0

# ── Engine controls ──
PROVIDER=meta                    # Change from 'seed' to 'meta' after proof tests pass
META_DAILY_CALL_BUDGET=200       # Start conservative
CRON_ENABLED=true                # Turn on after queue is built

# ── Item 10 (future) ──
CREATOR_DATA_PROVIDER=none       # Change to 'influencers_club' after trial
CREATOR_DATA_API_KEY=
```

---

## The Exact API Call That Gets You a Profile

Once items 1–8 are done, this single call returns a public creator's data:

```
GET https://graph.facebook.com/v21.0/{YOUR_IG_ACCOUNT_ID}
  ?fields=business_discovery.username(cristiano){
    username,
    name,
    biography,
    followers_count,
    follows_count,
    media_count,
    profile_picture_url,
    website
  }
  &access_token={YOUR_TOKEN}
```

**Returns:** username, display name, bio, follower count, following count, post count, profile picture URL, website.

**Does NOT return:** personal accounts, private accounts, engagement metrics, audience demographics, or any kind of user search/directory.

---

## Step-by-step: Do These in Order

| Step | Action | Time needed |
|---|---|---|
| **1** | Create Meta developer app and get App ID + Secret | 10 minutes |
| **2** | Create a Facebook Page (if you don't have one) | 5 minutes |
| **3** | Switch your Instagram account to Business/Creator and link to the Page | 5 minutes |
| **4** | Get your Instagram Caller Account ID via the Graph API | 15 minutes |
| **5** | Generate a long-lived access token | 15 minutes |
| **6** | Submit App Review for `instagram_basic` permissions | 30 min to submit, 1–5 days for approval |
| **7** | Run the 5 proof tests (your account, a celebrity, a personal account, etc.) | 1 hour |
| **8** | Set environment variables and switch `PROVIDER=meta` | 5 minutes |
| **9** | Automate FastSocial CSV import every 3 days | Already built, just enable the cron |
| **10** | Build the refresh queue and activate chart confirmation | 2–3 days of dev work |

After step 10, your engine is live and self-updating.

---

## Summary

| Source | Keys/credentials needed | Profiles covered | Cost |
|---|---|---|---|
| **FastSocial** | None (open data) | ~12,000 famous accounts | Free |
| **Meta Business Discovery** | App ID, App Secret, Access Token, Caller Account ID, App Review | Any public professional account (one at a time) | Free |
| **Influencers Club** *(future)* | API Key + paid plan | Millions of creators | ~$208/mo |
| **Modash** *(future, alternative)* | API Key + paid plan | Large global index | ~$1,350/mo |

**Bottom line:** Items 1–8 in the table above are all you need to go live. Everything else is already built or is a future expansion.

