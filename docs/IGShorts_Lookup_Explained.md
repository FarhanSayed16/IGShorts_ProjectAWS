# IGshorts — How a local creator gets a place on the chart

**Working note only.** The one-page decision to share is “IGshorts — Where a local creator stands.” This file is the background behind that decision.

**Status:** not built yet. The India and Global charts of famous people keep working without it.

---

## The idea in one minute

Today IGshorts is a chart of famous people we already listed: Ronaldo, Kohli, and the rest of that research list.

The next step is a search for everyone else. A local creator types their Instagram handle. If we have measured that account, we do **not** show a precise follower total. We show which **audience group** they belong to.

A precise total such as 101,000 next to 100,000 looks like a live reading. Our count is a saved measurement, refreshed about once a week, not a live Instagram counter. A small gap would look like a mistake on the page. The group is wide enough that a small gap does not change what the person sees.

We still do not invent a worldwide rank. Instagram does not publish a full list of accounts, so “you are number 48,221 on Instagram” would be a guess.

---

## Why a group, not a calculation

An average, a middle value, or “you are above 60% of this band” all sound exact. They are not, for three reasons.

- We do not have every creator. A place inside a handful of saved accounts is not a real standing.
- The saved count is rounded public information, or a weekly reading. It is not the number on the creator’s phone right now.
- Follower counts grow by steps people already recognise: about 10 thousand, about 100 thousand, about 1 million, about 10 million. Splitting those into 200K, 250K, and 500K draws lines that a normal week of growth can cross, which makes the page flicker.

So the page shows a named group. It does not show the raw follower total, and it does not show a score inside the group.

---

## The four groups

These cuts follow the way audience size is actually talked about. Each group is about ten times the one below it. Someone at 100K and someone at 101K are in the same group. Someone at 200K and someone at 750K are in the same group too. The page stays stable.

| Group | Audience size | Who this is |
|---|---|---|
| Community | about 10K, up to 100K | A local audience |
| Established | about 100K, up to 1 million | A working creator: 100K, 200K, 750K |
| Public | about 1 million, up to 10 million | A widely known account: 1M, 3M, 5M |
| Major | about 10 million and above | The scale of the famous chart |

An account under about 10K is saved if someone asks, and the page says **not grouped yet**. We do not draw them on the same ladder as a 10 million account. A missing count is also not grouped. We never treat “unknown” as zero.

The blue tick does not decide the group. The handle and the saved audience size do.

---

## How a person is placed

We keep the exact count in our records, so the next weekly check has something to compare. The public page does not print it.

1. Take the latest saved follower count.
2. If there is no count, show “Not measured yet.”
3. If the count is under about 10K, show “Not grouped yet.”
4. Otherwise place them in the group that contains the count. A first reading of 105K is Established. 100K and 101K are both Established.
5. On a later check, keep that group unless the new count is clearly inside the next group. The margin starts at about 15% and is a setting, not a fixed number in the page. The same rule works on the way down.

A creator first measured at 98K stays in Community if the next reading is 103K. They move to Established only when a later reading is clearly past 100K, around 115K or more. A small or stale difference cannot flip the label. The page can say **near the next group** without showing a number.

---

## What the page shows

For a saved account that is not on the famous chart:

- The group name, for example **Established**
- The range in words: “about 100K, up to 1 million”
- One state: **Recently checked**, **Update overdue**, **Not measured yet**, or **Could not verify**
- If they are close to a line: “Near the next group”

The exact count, the source, the time, and the previous group stay in our records. A failed lookup does not erase the last good reading, and it is never stored as zero.

For an account we have never measured:

- “Not measured yet.”
- No group, no zero, no estimated total

For someone who is also on the India or Global chart:

- Their chart place stays on that chart, because that list is an order among people we track, not a live follower counter
- The published chart figure stays the rounded public number we already show, labelled as the latest chart, not as a live total
- Their lookup result still uses the group. Major is the usual group at that scale

We do not show a point-by-point follower change such as “+1,200 since last week” on this lookup. The only movement we show is a **group change**: still in Established, or moved from Community to Established. That is the change a weekly reading can support.

---

## How it looks

Three pictures, all of the group, none of them a precise dot.

**1. A ladder**

Four rungs, bottom to top: Community, Established, Public, Major. Their rung is filled. The others stay as outlines. If they are near the next group, the fill leans toward that next rung. It does not jump.

**2. A scale with four marks**

One horizontal bar, marked only at about 10K, about 100K, about 1 million, and about 10 million. Their whole group is highlighted as a block. There is no pin at 750,000. A block cannot be “wrong” by a thousand followers.

**3. A step line over time**

After two weekly checks, a simple line that stays flat while they remain in the group and steps up or down only when the group changes. It is not a graph of the raw follower total.

We do not draw a chart of exact peer totals. Listing neighbours as 610,000 and 810,000 would publish the precise numbers we are refusing to treat as live.

---

## Two examples

**Priya, about 750K, not on the famous chart**

She is Established: about 100K, up to 1 million. She is not near a line. The ladder fills Established. The scale highlights that whole block. She does not see 750,000, and she does not see a rank inside the group.

**Two creators at about 100K and about 101K**

Both are Established on the first reading. The page does not show 100,000 beside 101,000. The 15% margin applies only on a later reading, so a small change does not flip the label.

---

## How the system works today

The famous chart is a closed list. We do not ask Instagram “who is popular?” We already know the handles.

| Piece | What it is | What it does |
|---|---|---|
| Research list | The spreadsheet of famous accounts we already imported | Names, handles, and one public follower figure |
| Profile record | One saved account per handle | Name, handle, category, and country |
| Follower history | A new saved count each time we measure | Used to choose the group. A missing count stays empty |
| Chart | A fresh sorting of the famous accounts | Highest known audience is rank 1, then 2, then 3, among that list only |
| Search | The search box on the site | Finds a name or handle only among accounts we have already saved |
| Live Instagram connection | Built, and switched off | It does not call Instagram yet. The charts run on the research list |

The public site reads our server. The server reads our database. Wikipedia supplies a photo and a short bio only for well-known people already on the list. It is not a source of follower counts.

---

## What we add for someone who is not famous

No new database. No new website host. The same records we already keep.

Search and tracking stay separate.

1. The person types an exact handle.
2. We look for that handle among accounts we have saved.
3. If we have a real count, we place the group using the rules above. The exact count stays in the record and off the page.
4. If they are on the current India or Global chart, that chart still shows their place on the list.
5. If we have never saved them, and an approved source can resolve the handle, we try one lookup. Unknown or unsupported accounts get a clear message, not a guess.
6. A successful measurement can be kept. A random search is not tracked forever unless someone chooses “Track this creator.”

### Weekly update

A refresh job already exists. It updates tracked accounts, then builds the India and Global charts again.

Today that job reads the same research numbers again, because the live Instagram connection is off. When a provider is proven, the same job asks it for each **tracked** handle, stores the new count beside the old one, and updates the group only when the margin says so. A failed check leaves the previous count in place.

We keep those lookups to about **200 an hour**, so Instagram does not block the connection. A few hundred saved accounts can refresh in a week. Collecting every local creator cannot.

---

## What we need, and where it comes from

### Already with us — nothing new to buy or open

| We already have | What that means |
|---|---|
| The famous-people chart, search inside that list, saved profiles, and a history of counts | Running on the site and the database we already use |
| A place to store a later live count | Each new measurement is kept. The old one is not overwritten. The page still shows the group, not the raw total |
| The live Instagram connection, switched off | The charts stay on the research list until we deliberately turn the connection on |
| Empty places for Meta’s app keys | Ready on the server. Unused until Meta approves us |
| A weekly-style refresh | An admin can run it, or a scheduled job can run it |
| Photo and short bio for famous people | Wikipedia. It does not know a creator with a local audience |

The first step — groups for people **already saved** — needs no new account, no new data vendor, and no new key. We already have a count for them. We only change what the page is willing to show.

### Required only when a brand-new handle must show a group

Meta is one possible source, not a guaranteed one. Its official lookup can return a follower count for another public professional account. It does not open every creator. Personal accounts and age-restricted accounts return nothing. A public product needs App Review and Advanced Access, not only an app and a key.

Prove that with five checks before promising it: a professional account we control, a public creator we do not control, a personal account, the fields and limits that come back, and which permissions review will grant. If the public-creator check fails, the group ladder for people we already have still stands, and the lookup stays ready for another legitimate source. Do not promise a blue-tick search.

Until a source is proven, a handle that is not on the research list stays “Not measured yet.”

| What | Where it comes from | Why |
|---|---|---|
| A Meta developer app | We create it on Meta for Developers (the Facebook developer site) | Instagram only answers an app Meta knows |
| One Instagram professional account that **we** control, linked to a Facebook Page | Our own account, set up in Meta Business Suite | The lookup is asked by this account. It is our caller. It is not the creator being searched |
| Meta’s approval of that app, for looking up other public professional accounts | Meta’s App Review, inside the same developer app | Without approval, Instagram refuses accounts that have not connected to our app |
| A long-lived access key | Meta, after our app and our caller account are connected | Our server sends this key with each lookup. It expires and has to be renewed |
| The creator’s exact handle | The person who searches, or an admin who types it in | Meta will not give us a list of creators. The handle is the input |
| That creator’s account must be a professional account (Business or Creator) | The creator’s own Instagram settings | A personal account returns nothing. We do not guess a number |

For one handle, Instagram’s official lookup can return the public name, username, bio, profile photo, and follower count. We save that count. The page turns it into a group.

That lookup does not return a list of blue-tick accounts, a list of people in a city, or everyone between 100K and 10M. The blue tick is not something we can search by. We can mark an account verified only if a real response says so. The product is not filtered on the tick.

### Not required

| We do not need this | Why |
|---|---|
| A public download of all influencers | No complete list exists that updates every week |
| Wikidata, for a local creator’s followers | It covers famous people, and the numbers are often years old |
| A paid influencer database, or a tool that copies Instagram pages | Those are not Instagram’s official numbers. We do not collect accounts that way |
| A new database, a cache service, or a new server | Groups and search use the site, the server, and the database we already run |
| The creator’s password, or a login through their Instagram | We only need the public handle |
| A median, an average, or a percentile | Those imply a precision this data does not have |

---

## Who supplies what

| Question | Answer |
|---|---|
| Where do the famous-chart numbers come from today? | The research list we already imported |
| Where does a new local creator’s group come from? | From one saved follower count, turned into Community, Established, Public, or Major |
| Where does a brand-new count come from? | A proven provider, one handle at a time. Meta is the first to test, not a promise. |
| Where does the handle come from? | The person searching, or an admin adding them to the watchlist |
| Where do photos of famous people come from? | Wikipedia |
| Where does a photo of a new local creator come from? | The profile photo on Instagram’s official response, once lookup is approved |
| Where does the weekly refresh come from? | Our existing refresh job, asking Instagram only for handles we have already saved |
| What do we need from the creator besides the handle? | Nothing. If the account is personal, they change it to a professional account in Instagram, or we cannot read the count |

---

## Order to build

1. **Now, with nothing new.** For handles we have already saved, show the group and the ladder. Hide the raw follower total. Do not rank them inside the group.
2. **Test the rules.** First count at each boundary, including 105K, and a later count just over a line.
3. **Prove a provider.** Meta first, with the five checks above. Do not turn it on for the public site until the public-creator check works.
4. **New-handle lookup.** Fresh lookup when a provider can resolve it. Keep the last good count when a check fails.
5. **Track on purpose.** Weekly refresh only for accounts we successfully measured, or that someone asked to track.
6. **The step line.** After two valid readings, draw the history of their group. Still no graph of the raw total.
