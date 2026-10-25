# IGshorts — Local creator lookup

**Superseded.** The decision to use is “IGshorts — Where a local creator stands.” This file is an earlier draft.

**Status:** idea only. Not built.  
**Current product stays as it is:** famous people on the India and Global charts, ranked from public follower snapshots we already store.

This note is the plan for the next audience: a verified or professional creator with 100K, 750K, 3M, or 10M followers who is not on the top chart and wants to search themselves.

---

## What this is

A person types a name or `@handle`.

| If we have measured them | What they see |
|---|---|
| They are on the India or Global people chart | Exact rank, last rank, follower count, and change since the last chart |
| They are stored, but outside that chart | Their follower count, the date we measured it, and a **band** (for example 500K–1M) |
| We have never measured them | “Not on this chart yet.” No rank and no guessed number |

A band is a group of follower counts, not a fake worldwide place. Example for someone at 750K:

- Followers: 750,000, with the measurement date
- Band: 500K–1M
- Place in that band: “Among accounts IGshorts has measured in this band, you are above 60%.”
- The median of that band sits next to their count
- A bar of the bands, with their band marked
- After two real weekly counts exist, a line of their own follower change

The label on every estimate is **among accounts IGshorts has measured**. It is not “your rank on all of Instagram.”

Mean and median of a band are the numbers worth showing. A single worldwide rank such as “#48,221 on Instagram” needs every account on the platform. Meta does not give us that list, so that number would be invented.

---

## What data we can use

Instagram does not publish a file of every account, every blue tick, or every creator between 100K and 10M.

| Source | What it gives | What it does not give |
|---|---|---|
| Seed sheet already in the app | One public snapshot for the famous watchlist | Local creators, a second week, a blue-tick directory |
| Wikipedia / Wikidata | Portraits and bios for notable people | A current Instagram count for a 200K local creator |
| Old public dumps | A stale, incomplete snapshot | A weekly refresh we can stand behind |
| Paid influencer databases | Someone else’s scraped or partner index | An official Instagram feed. This project does not scrape |
| Meta Business Discovery | The public follower count for **one** professional account, when we already know the `@handle` | “Everyone with a blue tick,” or “everyone from 100K to 5M” |

Meta is the only legitimate live source. It stays off until App Review approves the app. The adapter in this repo is still a stub on purpose.

Rules for that lookup:

- One handle at a time.
- Professional accounts only (Instagram Business or Creator). Personal accounts return nothing.
- The blue tick is not a search filter. The thing we can look up is the handle.
- A weekly job refreshes **accounts already stored**. It cannot discover the rest of Instagram.

---

## How a local creator gets in

1. They search an `@handle`.
2. If that handle is already stored, we show the chart rank or the band.
3. If Meta is approved and the account is professional, we fetch that one profile, store the count, and keep the source as Meta.
4. If Meta is not approved, the handle can sit on a watchlist and stay unranked until a real count exists.
5. Once a week, the pipeline refreshes stored handles only, then rebuilds the chart and the bands from those snapshots.

The top chart stays the famous tracked people. Everyone else lives in bands beside it. A 750K creator does not have to pass Ronaldo to see a place.

Suggested bands, once we have real counts:

- Under 100K
- 100K–250K
- 250K–500K
- 500K–1M
- 1M–5M
- 5M–10M
- 10M and above

---

## What to do now

Nothing in this idea has to be built for the current system to keep working.

Already in place:

- India and Global people charts from the seed list
- Missing counts stay empty. They are never stored as zero
- Last rank vs this rank, after a second ranking run on that database
- Follower change only when the previous count exists and is different
- Web on Vercel, API on Render, charts in the separate `igshorts` database

Do these only if the live site should match what you see locally:

1. Deploy the latest commit to Vercel and Render if production is still on an older build.
2. Run one ranking rebuild on the **cloud** database. The Last / No change numbers were rebuilt on the local database only. Production still shows Debut until that same rebuild runs there.
3. Leave Meta off. Leave scraping off.

Housekeeping when you have a quiet moment, not a feature:

- Rotate the database password, Supabase service key, and any other secret that was pasted into chat.
- Change the seeded admin password on the cloud database before sharing the admin URL.
- Tighten Render CORS from open to the Vercel site origin.

---

## What to build next, in order

Do these one at a time. Each one is useful before the next exists.

1. **Bands for people already stored.** Search stays inside the current watchlist. If they are on the chart, show rank. If they are stored and outside the top chart, show the band, the median, and the percentile among measured accounts. No Meta, no new data.
2. **Meta App Review.** Turn on Business Discovery for a single professional handle. Store the snapshot. This is the gate for a creator who is not on the seed list.
3. **Watchlist form.** “Track my account” saves a handle. It stays unranked until step 2 returns a real count.
4. **Weekly refresh of stored handles only.** The daily pipeline already exists. Point it at Meta for accounts we have, then rebuild ranks and bands. Do not crawl Instagram.
5. **Graphs.** A band bar with their group marked, then a weekly line of their own count after two real snapshots exist.

Search today only finds people imported from the seed list. A new `@handle` returns nothing until step 2 is approved.
