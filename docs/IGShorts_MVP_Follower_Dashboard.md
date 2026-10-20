# IGshorts MVP — Top Followed Instagram Dashboard

**Updated after discussion with Saurabh sir.**  
His vision for v1 is simpler than the original brief. This is our take and working plan.

---

## Our take

**Yes — this is doable, and this is the right place to start.**

v1 is **not** impressions, not engagement, not “all of Instagram,” not every state.

v1 is:

> A public dashboard of the **most followed / famous Instagram people**, ranked by **public follower count**, like a Billboard / CoinMarketCap table.

That is a real MVP. We can ship it. We should build this first, then add more later.

---

## What v1 is

| We show | We do **not** show yet |
|---|---|
| Famous IG accounts (seeded list) | All of Instagram auto-discovered |
| Follower count (public) | Impressions / reach |
| Rank #1, #2, #3… | Likes, comments, engagement |
| Rank change (↑↓ vs last sync) | Reels / hashtags / news tickers |
| Profile name, handle, photo, link | Login, claim profile, regions |

**Ranking rule for MVP:** highest public follower count = higher rank. Simple and honest.

---

## How this can actually be done

Instagram does **not** give an API like “give me the top 100 most followed accounts.”  
So we do it in 3 steps:

### 1. We make the list (our job)

We start with a **watchlist of famous public accounts** — the people everyone already knows are at the top:

- Global: Cristiano Ronaldo, Lionel Messi, Selena Gomez, Kylie Jenner, etc.
- Plus India-famous names if sir wants that flavour early (Virat Kohli, Alia Bhatt, …)

Start with **~50–100 accounts**. Not 2000. Quality over size.

Sources for the seed list: public knowledge, Wikipedia “most-followed Instagram accounts,” SocialBlade-style public charts. We type usernames into our database. We do **not** scrape Instagram.

### 2. We fetch public follower counts

For each username on our list, we pull **publicly available** profile facts:

- display name
- username
- profile picture
- follower count
- (optional) following count, post count, bio

**Preferred path:** Meta Instagram Graph API — **Business Discovery** for public professional accounts.

**Until API access is approved:** we can still ship a working demo with a **manual / CSV seed** of last-known public follower counts, then switch the same dashboard to live API numbers.

### 3. We rank and show a dashboard

Every sync:

1. Save today’s follower count  
2. Sort by followers  
3. Assign rank 1…N  
4. Compare with previous snapshot → show ↑ ↓ –  
5. Render a clean ranking table (Billboard + CoinMarketCap look)

That **is** the MVP.

---

## What we should focus on now (only this)

1. **Dashboard UI** — rank, photo, name, @handle, followers, change  
2. **Seed list** of 50–100 famous accounts  
3. **Store snapshots** so ranks can move over time  
4. **Sync job** — refresh follower counts daily (or every few hours)  
5. **Honest label** — “Ranked by public follower count from our tracked list”

Do **not** spend time now on: impressions, engagement, hashtags, news tickers, state filters, login, scraping.

---

## What is still required from outside

| Need | Why |
|---|---|
| Meta App + API approval | Live official follower numbers |
| Sir’s sign-off on seed list | Which 50–100 names to track first (global / India / both) |
| Domain later | IGshorts.com when we go public |

Until Meta approval, we can still build the **full dashboard** on sample/public known numbers.

---

## Suggested build order

| Step | What | Outcome |
|---|---|---|
| 1 | Agree 50–100 names + dashboard layout | Scope locked |
| 2 | Next.js ranking dashboard (static/sample data) | Something visible in days |
| 3 | Postgres: profiles + daily follower snapshots | History / movers |
| 4 | Connect Meta API (or staged public numbers) | Live ranks |
| 5 | AWS hosting, polish, share with sir | Real MVP demo |

---

## One line we can tell sir

> We will first track the most followed famous Instagram accounts, fetch their public follower counts, and show a live ranking dashboard. Engagement and deeper Instagram data can come in the next version.
