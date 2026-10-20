# IGshorts — What We Can Do, What’s Hard, What Makes It Succeed

## What we can exactly do (realistic MVP)

We can build a **public website** that looks like Billboard + CoinMarketCap for Instagram (India-first):

| We can ship | Meaning |
|---|---|
| Top 10 / Top N charts | Profiles, hashtags, reels — ranked in tables with ↑↓ movers |
| Region filters | India → states / metros (using our own tags, not IG’s) |
| News + hashtag tickers | Editorial news + rotating `#` strip on every landing |
| Dashboard-style UI | Clean public browse first; login later |
| Secure + scalable site | Standard AWS web app (Next.js + API + DB + cache) |
| Daily/auto updates | Sync a **fixed watchlist** of creators via Meta’s allowed APIs |
| Content gap-fill | Editors publish featured lists, news, boosts |

**Bottom line:** We can fully build a curated Instagram charts site for India.

---

## What is a little difficult for us

| Hard part | Why |
|---|---|
| True “impressions” ranking | Meta only gives impressions for **accounts we own/manage**, not the whole of Instagram |
| “Top profiles in every state” automatically | Instagram has no official “top in Maharashtra” feed — we must tag regions ourselves |
| Full auto-extraction of all IG trends/news | Official API is limited; scraping is fragile and against ToS |
| App Review + rate limits | Meta approval takes time; we can’t refresh unlimited profiles |
| Chart quality at launch | Empty/wrong lists kill trust faster than a slow UI |

**Bottom line:** The website is easy for us. **Trusted, legal, regional Instagram data** is the hard part.

---

## What we need to make this much more successful

1. **Agree the score early** — use a clear “IGshorts Score” (followers + engagement + growth + editorial), not fake “impressions.”
2. **Strong seed watchlist** — 500–2000 India creators, tagged by niche + city/state, before go-live.
3. **A real content/editorial person** — news, hashtag tickers, corrections, featured charts. Automation alone won’t look premium.
4. **Stay Meta-compliant** — official API + embeds/links; we should not build the business on scrapers.
5. **Methodology page** — explain how ranks work (CoinMarketCap-style trust).
6. **India-first focus** — nail one country + few niches before going wide.
7. **Later: “Claim profile”** — creators connect their account → then we can show real Insights/impressions for *them*. That’s our upgrade path.
8. **SEO + daily freshness** — charts must update and rank on Google; that’s how a free public site grows.

---

## How we should decide as a team

| If the goal is… | Our answer |
|---|---|
| Billboard-style IG charts for India, public site | **Yes — we can do this** |
| Auto-rank all Instagram by real impressions | **No — we cannot do this properly** |
| Best path for us | **Curated charts now → creator-claimed Insights later** |
