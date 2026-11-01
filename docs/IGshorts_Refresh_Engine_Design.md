# IGshorts — Refresh engine design

1 November 2026

This is the plan for keeping saved public profiles current. It uses the index we already store, the sources we are allowed to call, and a slower check for people whose counts move less. It does not collect every Instagram account.

The numbers below are the saved list as measured on 27 October 2026: **12,107 profiles**. Major 1,156. Public 3,675. Established 4,377. Community 2,119. Not grouped yet 686. Not measured yet 94. Global chart: 125 ranked of 199 in scope. India chart: 69 ranked of 197 in scope.

## 1. What “complete” can mean

A visitor should be able to do four things, and each one has a hard edge.

| They want | What we can do | What we cannot do |
|---|---|---|
| Open a person we already saved | Show the stored name, handle, Instagram link, audience group, count, check date, and source | Pretend the count was read from Instagram in the last hour |
| Search a name inside our list | Match the saved name or the exact handle | Return every Instagram account with a similar name |
| Look up an exact `@handle` we have never saved | Ask one approved source, once, for that professional account | Invent a profile when the source returns nothing |
| See the India and Global charts | Rank the people on those lists, with the newest stored count on each row | Call either list a ranking of all of Instagram |

Instagram’s own search uses Instagram’s private index. No official API gives us that index. A personal account returns nothing from Meta. A failed check stays blank. It is never stored as zero, and it never erases the last good count.

## 2. Where a count is allowed to come from

Three sources can put a follower count on a profile. They are not interchangeable.

### 2.1 FastSocial Top Charts — the free base

- File: `latest.csv` from the FastSocial Top Charts repository, licence CC BY 4.0.
- What a row contains: observation date, username, follower count, name, category, country, person or organisation, and that project’s own list rank.
- What we already did: imported the file. 11,993 rows were read. 11,779 profiles were new. 214 already existed and received a newer integer. The public site must keep the attribution “FastSocial Top Charts, CC BY 4.0”.
- What it is: a top-heavy list of notable accounts, seeded from Wikidata plus a hand-maintained list. It is not a census of Instagram.
- How often we should take it: **every 3 days**. One file download updates the notable index. It does not spend a per-profile API call.
- Their list rank is not our rank and is not an all-Instagram rank.

This file is the right way to refresh the 12,000 notable profiles. Calling Meta once per row to rediscover the same people would spend the quota on data we can already read from the file.

### 2.2 Meta Business Discovery — one public professional account at a time

This is the official Instagram API path, and it is the one to use when we need a count the file does not have.

What it can return, for an eligible account: username, name, biography, profile picture, follower count, follows count, media count, and website.

What it requires before a single live call:

1. A Meta app, with an app id and app secret stored on the server.
2. A Facebook Page that we control, linked to an Instagram professional account that we control.
3. A long-lived access token for that account, also stored on the server. User tokens expire. The job that refreshes the token has to exist before the checker does.
4. App Review for the permissions Business Discovery needs. The exact permission set is read from the current Meta docs on the day we apply. We do not guess it.
5. The five-check proof, which has not been run. Live Meta is off. `PROVIDER` is `seed`. The adapter in `apps/api/src/ingestion/adapters/meta-graph.adapter.ts` returns an empty count on purpose.

What one call does: we send one exact username. Meta answers for that account or it does not.

What it will not do:

- It will not list “all public profiles”.
- It will not search by a partial name.
- It will not return a personal account. Those calls come back empty.
- It will not return a private account.
- It will not give us another account’s private insights, audience demographics, or reach. Those belong to the account owner.
- It will not notify us when a new account is created.

Our own adapter cap is **200 calls an hour**. That is our throttle, not a promise from Meta. Before the scheduler is turned on, the live limit is read from the Meta app dashboard and the lower of the two numbers is the one we obey.

### 2.3 A licensed creator database — only after a paid trial we have not started

Influencers Club is the first candidate if Meta cannot see the accounts we care about. Public pricing has been listed from about $208 a month, plus credits. Modash Discovery has been listed from about $16,200 a year and stays a benchmark, not a first buy. Crawlora is a proof-of-concept index only, and its terms do not by themselves allow us to publish a ranking.

None of these is turned on. There is no API key. `CREATOR_PROVIDER_MONTHLY_BUDGET_CREDITS` is 0.

A vendor is used only after all of these are true:

- A 100-handle trial, scored by us: exact handle, count, age of the reading, country, verification flag, cost.
- Written permission to store the reading, show it on a public page, keep a history, and delete it when the person or the vendor asks.
- A monthly credit ceiling that stops the job when the credits run out.

### 2.4 What is not a count source

Wikipedia gives a portrait and a short bio when the page title and the lead sentence match the person. It does not give a follower count. The 94 seed names saved with a blank count stay blank until FastSocial or Meta returns a number for that exact handle.

Scraping Instagram, unofficial viewers, and copying another ranking site are out. They break, they get blocked, and they are the wrong basis for a number a professor is asked to trust.

## 3. The refresh bands

Checking everyone every 3 days is the wrong default if each check is a live API call. A Major account can move by hundreds of thousands of followers in a few days. An account under 100 thousand usually does not. The band follows the audience group we already store. A person on the India chart or the Global chart is checked on the fastest band even when their group would be slower, because those are the pages people judge us by.

| Band | Who is in it | Check every | Why |
|---|---|---|---|
| Chart | Anyone on the current India or Global ranking | 2 days | These rows are the public product |
| Major | 10 million followers and above, even if they are not on a chart | 2 days | Large accounts move the most |
| Public | 1 million to under 10 million | 3 days | Still volatile, and this is most of the notable index |
| Established | 100 thousand to under 1 million | 7 days | Movement is slower |
| Community | 10 thousand to under 100 thousand | 14 days | A weekly-or-slower check is enough |
| Not grouped yet | A known count under 10 thousand | 30 days | The group label will not change often |
| Not measured | No usable count | No schedule | One attempt, then stop until a source exists |
| Tracked | A member pressed Track | The shorter of their band and 3 days | Someone is waiting on this row |

When a new count crosses a group boundary by about 15 percent, the profile moves band on the next schedule pass. The first reading uses the group that contains the count. Later readings wait for that 15 percent gap, which we already use so a count sitting on a boundary does not flicker.

### 3.1 What this costs if we called Meta for every row

| Band | Profiles | Interval | Calls per day |
|---|---:|---:|---:|
| Major | 1,156 | 2 days | 578 |
| Public | 3,675 | 3 days | 1,225 |
| Established | 4,377 | 7 days | 625 |
| Community | 2,119 | 14 days | 151 |
| Not grouped yet | 686 | 30 days | 23 |
| Not measured | 94 | none | 0 |
| **If every row were a live call** | | | **about 2,600** |

About 2,600 live calls a day fits under a 200-per-hour cap only if the token stays healthy all day and Meta accepts the accounts. Many of the 12,107 are organisations, and some will be personal accounts that return nothing. Spending the quota this way also ignores the file we can download for free.

### 3.2 The schedule that fits this system

| Job | Every | What it touches | Live calls |
|---|---|---|---|
| FastSocial file import | 3 days | The notable index, about 12,000 rows | One file download |
| Chart confirmation | 2 days | The India and Global rows whose file date is older than 2 days | About 100 Meta calls a day once the proof has passed |
| Exact lookup | When a visitor types a handle we do not have | That one professional account | 1 call, then we store it |
| Member track | 3 days, or the band if the band is sooner | Only profiles a member tracks | Bounded by the track list |
| Blank-count proof | Once | The 94 seed names with no count | 94 calls, then only the ones Meta actually answered |
| Ranking rebuild | 7 days | Order of the India and Global lists | No external call. Uses stored snapshots |
| Wikipedia portraits | When a listed person has no portrait | Portrait and short bio only | Wikipedia, slowly, with the name check we already use |

The chart confirmation is the part colleagues will notice. The file import is the part that keeps the directory honest. The ranking rebuild is separate so a one-day move in a count does not reshuffle the public order every morning.

A profile that already has a FastSocial reading inside its band does not also get a Meta call. Meta is for the gap: a chart row the file missed, a handle a visitor just typed, or a file date that has gone past the band.

## 4. How one check is stored

A check appends a snapshot. It does not overwrite history.

Each snapshot stores:

- the profile
- the source (`fastsocial`, `meta_graph`, or a later vendor code)
- the follower count, or null when the source had no count
- the time the source observed it
- the time we ingested it
- a raw reference so the same file row or the same API answer is not stored twice

The profile then shows the preferred snapshot. A FastSocial integer wins over an older rounded seed for the same handle. A newer Meta reading wins over both when Meta is the one that just checked that handle. The audience group is recomputed from that count with the 15 percent rule.

The public page already reads this preferred snapshot for the chart date. After a real check, “As of …” moves by itself. The red freshness warning appears only when the newest preferred reading on that chart is older than 14 days.

Two clocks stay different on purpose:

- **Count clock.** The date on the row. This moves every time a band is checked.
- **Rank clock.** The order of the India and Global lists. This moves when the weekly ranking rebuild runs. Until two successful rebuilds exist, a mover chip stays empty. We do not invent a previous rank.

## 5. Search and the profile page

### Search

1. Normalise the input. Strip `@`, accept a profile URL, reject spaces and characters outside a real handle.
2. Look in the saved profiles.
3. If the handle is there and the reading is inside its band, return it. Do not call out.
4. If the handle is there and the reading is past its band, return the saved profile immediately and put the handle on the next batch. A visitor does not wait on Meta.
5. If the handle is not there, and the Meta proof has passed, ask Meta once for that exact username.
6. A usable answer is saved. The group follows the count. Under 10 thousand is **Not grouped yet**.
7. An empty or failed answer is **Could not verify**. No profile is invented. A similar name is not attached.

Name search stays inside the saved list. Typing “Ronaldo” finds Cristiano because we stored him. It does not query Instagram.

### What a filled profile shows

| Field | Source |
|---|---|
| Handle and Instagram link | The handle itself. The link is `https://www.instagram.com/{handle}/` |
| Display name | FastSocial, or Meta when Meta answered |
| Follower count and the date | The preferred snapshot |
| Audience group and freshness | Computed by us from that count and that date |
| Category and country | Only when FastSocial or a vendor sent them |
| Biography | Meta, when the account is professional and the call succeeded |
| Portrait | Meta’s profile picture when we have it. Otherwise the Wikipedia portrait we already keep, and only when the page matches the person |
| Verification | Unknown, until a source states it |
| Chart place | Only if the person is on the India list or the Global list |

Engagement rate, audience cities, and “accounts like this” are a later product. They need a licence that allows them. They are not part of this engine.

### The 94 names with no count

They were saved from the seed lists with the count cell blank. FastSocial does not contain those exact handles. The right next step is one Meta pass over those 94 after the five-check proof, not a scrape and not a guessed number. Each answer is stored under `meta_graph`. Each miss stays **Not measured yet**, with the portrait and bio we already have from Wikipedia where those were valid.

## 6. The checker

The daily pipeline cron is off unless `CRON_ENABLED=true`. That stays off until the queue below exists. Turning on today’s pipeline would walk the whole list and rebuild charts without a band or a budget.

### Tables to add

`profile_refresh`

- profile id
- band (`chart`, `major`, `public`, `established`, `community`, `ungrouped`, `unmeasured`)
- interval in days
- next check time
- last attempt time
- last success time
- consecutive failures
- last error, kept internal
- paused flag, for opt-out and for accounts Meta has already said are personal

`refresh_jobs`

- job name (`fastsocial_import`, `chart_confirm`, `exact_lookup`, `track_refresh`, `blank_proof`, `ranking_rebuild`)
- started, finished, status
- profiles considered, snapshots added, misses, failures
- credits or Meta calls used

### One pass

1. Import the FastSocial file if it is due. Upsert snapshots. Recompute bands.
2. Select chart rows whose newest count is older than 2 days, capped by the remaining hourly budget.
3. Select tracked profiles that are due, same cap.
4. Call Meta one username at a time. Wait between calls. On HTTP 429, stop the batch and try the next hour.
5. Append snapshots. Advance `next_check_at` by the band interval.
6. On failure, keep the last count, increment the failure counter, and push the next attempt out: 1 day, then 2, then 4, then stop at 14 days. After five failures, pause the profile and show the last good date.
7. Once a week, rebuild the India and Global order from the stored snapshots. Do not add the wider FastSocial index to those charts. Those charts stay the curated lists.

A visitor request never calls Meta in the page render. The page reads the database. The checker is the only caller.

### Budget

- Meta: a daily ceiling, starting at **200 calls a day** until the five-check and a week of clean chart confirmation are done. Raise it only after the dashboard shows the miss rate.
- Vendor credits: stay at 0 until the trial is approved.
- When the ceiling is hit, the job stops. The page keeps the last good count and can show **Update overdue** once the band interval has passed. A stopped job is not shown as a fresh check.

### What the public freshness line should say

| State | When | Line on the profile |
|---|---|---|
| Recently checked | Newest count is inside the band interval | Checked {date} · {source} |
| Update overdue | A count exists and the band interval has passed | Last checked {date} · update overdue |
| Not measured yet | No count has ever been stored | Not measured yet |
| Could not verify | We asked and got nothing, and we have no older count | Could not verify |

The chart ribbon keeps one date: the newest preferred reading among the people on that chart, and the source that supplied most of those readings. It says “Seed list” only when the seed file is still the newest reading.

## 7. What we need before this runs

### Accounts and approvals

- A Meta app we own, plus App Review for Business Discovery.
- One Instagram professional account we own, linked to a Facebook Page we own.
- A server-side token and a job that renews it before it expires.
- The five-check, written down the same way as `docs/IGshorts_Provider_Benchmark.md`: our own professional account, one public creator we do not control, one personal account that must come back empty, the field list, and the permissions we were actually granted.
- Written vendor permission, only if the Meta proof shows a hole we cannot accept. The 100-handle sheet is the gate.

### Software

- The `profile_refresh` queue and the six jobs in section 6.
- A live `fetchProfileData` in the Meta adapter, behind `PROVIDER=meta` and a present token. Until both are set, it stays the stub.
- The FastSocial import on a 3-day timer, reusing the importer we already ran by hand.
- A small operator page: last job, calls used, misses, paused profiles, and the next check time. The public site does not need this page.
- Secrets only on the server. The web app never sees the Meta token.
- The same opt-out we already owe FastSocial: a removed handle is hidden and is not fetched again.

### What we already have and should keep

- Saved profiles, snapshots, sources, and the rule that a missing count is null.
- Audience groups and the 15 percent hold.
- FastSocial preferred over a rounded seed.
- The chart header reading the newest stored count, so a new snapshot moves “As of …” without a fake ranking run.
- Wikipedia portraits with the title-and-lead name check.
- Email accounts, Track, and history for a signed-in member. An IGshorts login does not prove the person owns the Instagram handle. We never ask for an Instagram password.

## 8. Order of work

1. Schedule the FastSocial file every 3 days. This makes the directory and the chart date move with no Meta cost. Deploy the API and the site so the published pages use that date.
2. Create the Meta app and run the five-check on five handles. If a personal account returns a count, stop and fix the request before any batch.
3. Turn on chart confirmation every 2 days, capped at 200 calls a day.
4. Run the one-time pass over the 94 blank counts. Store hits. Leave misses blank.
5. Turn on member-track refresh at 3 days.
6. Turn on the weekly ranking rebuild. Movers appear only after the second successful rebuild.
7. Only then consider a paid index, and only for the handles Meta cannot see that we have a reason to publish.

## 9. What this will not promise

- A directory of every public Instagram profile.
- A search box that behaves like Instagram’s.
- A live follower total on every page view.
- A world rank, or a rank inside a country, computed from a partial list.
- Counts for personal accounts.
- Engagement, reach, or audience demographics from Meta for accounts we do not own.
- A scraped backup “if the API is slow”.

The engine is strong when every number on the page has a source, a date, and a band, and when the famous rows are never more than two days behind that source. That is the system to build. A crawl of all of Instagram is not.
