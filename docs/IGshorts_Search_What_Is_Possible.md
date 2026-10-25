# IGshorts — Can search work like Instagram?

**Short answer:** No. Not for any username, any similar name, or a brand-new account.

Instagram’s own search uses Instagram’s private index. No official API gives us that index. We cannot type a partial name and get every matching profile, the way the Instagram app does.

What we can build is narrower, and it is still useful.

---

## What a visitor can do

| They type | What we can return |
|---|---|
| A name or handle we have already saved | That saved profile, its chart place if it has one, and its audience group |
| An exact `@handle` we have never saved | One lookup, only if a proven source accepts that handle |
| A partial name, a nickname, or a mix of spellings | Only matches inside our own saved list. Not the whole of Instagram |
| A personal account, or an account created yesterday | Usually nothing. Say so. Do not invent a profile |

A successful lookup can show the public name, the exact handle, the bio, the profile photo, and a follower count if the source returned one. That is not a full profile analysis. Engagement, reach, and “accounts with a similar name” are not part of this.

---

## The new account with about 510 followers

This case does not become a ranked profile on the next day.

- Instagram will not notify us that the account was created.
- A personal account returns no count.
- A professional account can return a count only after Meta’s lookup is proven, and only for the exact handle.
- About 510 followers is under 10 thousand, so the result is **Not grouped yet**. No chart rank. No audience group.
- We still do not print 510 as a live number. If a source did return it, we store it and show the state **Not grouped yet**, with when it was checked.

The India and Global charts stay the famous lists. A new account does not enter them by searching.

---

## How the possible version works

1. The visitor enters an exact handle.
2. We look in accounts we have already saved.
3. If it is there, we show the group or the chart place we already computed.
4. If it is not there, and Meta’s lookup has been proven, we ask once for that exact professional account.
5. If the answer is usable, we can keep it when someone chooses **Track this creator**.
6. A later weekly check updates that tracked account only.
7. If the lookup fails, the page says **Could not verify**. No guessed followers. No zero.

The 15% group rule and the four groups stay as already decided. They apply only when a real count is high enough to enter a group. A 510-follower account never reaches that step.

---

## What we should not build

- A copy of Instagram’s search across all users.
- Automatic profiles for every new signup.
- A rank such as “you are number 2 million on Instagram.”
- A follower total that pretends to be live.

Those need data Instagram does not give to outside products.
