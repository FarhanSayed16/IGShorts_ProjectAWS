# IGshorts — How the data engine works

1 November 2026

This note explains where profile data comes from, what Instagram’s official API actually returns, and what is left to do. It is the plan for keeping saved public profiles current. It does not collect every Instagram account.

Saved list on 27 October 2026: **12,107 profiles**. Major 1,156. Public 3,675. Established 4,377. Community 2,119. Not grouped yet 686. Not measured yet 94. Global chart: 125 ranked. India chart: 69 ranked.

---

## 1. What Instagram actually offers

Meta owns Instagram. Their official API for this job is called **Business Discovery**.

One request asks about **one exact username**, and only if that account is a public Business or Creator account. A successful answer can include:

- username
- display name
- biography
- profile photo
- follower count
- following count
- post count
- website

There is no official API that downloads every public profile, searches by a partial name, or returns a normal personal account. Private accounts come back empty. Account-owner insights, such as reach and audience cities, stay with the account owner.

Instagram’s own search uses Instagram’s private index. No outside product receives that index.

---

## 2. What a Meta app is

A Meta app is a free registration for our own software at [developers.facebook.com](https://developers.facebook.com/apps). It tells Meta which server is asking.

Creating it gives two values:

| Item | What it is |
|---|---|
| App ID | The public name of our software |
| App Secret | The password for that software. It stays on the server |

Those two values do nothing by themselves. Meta also requires:

1. A Facebook Page we own.
2. An Instagram account we own, switched to Business or Creator and linked to that Page. This account is the caller. Every lookup is made as this account.
3. An access token, a temporary pass for that caller. A long-lived token lasts about 60 days, then it has to be renewed.
4. App Review. Until Meta approves the app, lookups only work for accounts added as testers on our app. After approval, we can look up other public professional accounts, one username at a time. Meta may also ask for business verification. The permission names are copied from Meta’s Business Discovery docs on the day we apply.

This setup is free. It is permission to ask. It is not a database.

---

## 3. The three ways a follower count can enter the site

| Source | What it is | Status |
|---|---|---|
| FastSocial file | A public spreadsheet of about 12,000 famous accounts: handle, name, follower count, category, country, and the date. The page must credit “FastSocial Top Charts, CC BY 4.0”. | Already imported. This is the directory today. |
| Meta Business Discovery | The official one-username lookup in section 1. | Not connected. The code that would call it still returns an empty count on purpose. |
| A paid creator database | Companies such as Influencers Club (about $208 a month plus credits) or Modash (about $16,200 a year) sell a larger index. | Not required to go live. No key, no trial, and no written permission to publish their numbers. |

Wikipedia, which we already use, supplies a portrait and a short bio only when the page clearly matches the person. It never supplies a follower count.

The 94 seed names saved with a blank count stay blank until FastSocial or Meta returns a number for that exact handle. A missing count is never stored as zero.

---

## 4. How often each profile is checked

Famous accounts move fast, so they are checked more often. Smaller ones are checked less often, so the limited Meta calls are spent where the number actually changes.

| Who | Check every |
|---|---|
| People on the India or Global chart, and anyone with 10 million followers or more | 2 days |
| 1 million to under 10 million | 3 days |
| 100 thousand to under 1 million | 7 days |
| 10 thousand to under 100 thousand | 14 days |
| A known count under 10 thousand | 30 days |
| No count at all | Do not keep asking |
| A profile a member has pressed Track on | At least every 3 days |

The practical schedule:

1. Every 3 days, download the FastSocial file again. One download refreshes the famous list.
2. Every 2 days, ask Meta only for chart rows whose saved date is already too old. Start at 200 calls a day.
3. When a visitor types an exact `@handle` we have never saved, ask Meta once for that handle.
4. Once a week, recompute the India and Global order from the counts we stored.

The date on a row and the rank order are two separate clocks. A new count updates the date immediately. The chart order changes only on the weekly rebuild.

Each check is saved as a new reading. The old reading stays. A failed check does not erase the last good count.

Calling Meta for all 12,107 profiles on these bands would be about 2,600 calls a day. The FastSocial file already covers that notable set, so those calls would mostly repeat data we can read for free.

---

## 5. What a visitor can do

| They do this | They get this |
|---|---|
| Open a person we already saved | Name, handle, Instagram link, audience group, stored count, check date, and source |
| Search a name inside our list | Matches from the saved profiles only |
| Type an exact `@handle` we have never saved | One lookup, after Meta is approved. If nothing comes back, the page says the account could not be verified |
| Open the India or Global chart | A ranking of the people on that list, with the newest stored count on each row |

A group is an audience size, not a place in the world. Under 10 thousand followers is “Not grouped yet”. The India and Global charts rank those curated lists only.

---

## 6. What is already done

- The database, the public site, audience groups, and member sign-in.
- The FastSocial import: 11,993 rows read, 11,779 new profiles, 214 existing profiles given a newer count.
- Wikipedia portraits and short bios where the page matches the person.
- Chart pages that show the date of the newest stored count. On the local site that date is 26 October 2026, from the FastSocial file.

The published Vercel site still shows the older date until this API and the site are deployed.

---

## 7. What we still need

Do these in order.

| Step | What | Who | Cost |
|---|---|---|---|
| 1 | Create the Meta app and keep the App ID and App Secret on the server | Us, at developers.facebook.com | Free |
| 2 | Create a Facebook Page we own, if we do not already have one | Us | Free |
| 3 | Switch an Instagram account we own to Business or Creator and link it to that Page | Us | Free |
| 4 | Get the caller account id and a long-lived access token | Us, in Meta’s tools | Free |
| 5 | Submit App Review, using the permission names in the current Business Discovery docs | Us. Meta reviews it | Free |
| 6 | Run five proof lookups before any schedule is turned on: our own professional account, one public creator, one personal account that must come back empty, the field list, and the permissions Meta actually granted | Us | Free |
| 7 | Write the live API call, the refresh queue, the 3-day file download, the 2-day chart check, and the token renewal | Development | Already in this codebase as the next build |
| 8 | One Meta pass over the 94 names that still have no count. Misses stay blank | Development, after step 6 | Free, about 94 calls |
| 9 | Deploy the API and the site | Us | Existing hosting |

Leave the provider switch on `seed` until step 6 passes. The existing cron is a different job: it walks listed profiles and rebuilds charts. It does not download the FastSocial file, and it should stay off until step 7 exists.

A paid Influencers Club or Modash key is only for later, and only if Meta cannot see accounts we still want to publish. Before any payment we need a 100-handle trial and written permission to store the readings and show them on a public page.

---

## 8. What this will not promise

- A directory of every public Instagram profile.
- A search box that behaves like Instagram’s.
- A live follower total on every page view.
- A world rank, or a country rank, computed from a partial list.
- Counts for personal accounts.
- Engagement, reach, or audience demographics for accounts we do not own.

The engine is in good shape when every number on the page has a source and a date, and when the famous rows are never more than two days behind that source.
