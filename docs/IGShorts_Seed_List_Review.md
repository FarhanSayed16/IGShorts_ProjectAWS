# IGshorts — Seed List Review (India 200 + Global 200)

**Source file:** `docs/IGshorts_Instagram_Account_Research_and_Architecture.xlsx`  
**As-of:** 2026-10-20  
**Verdict:** **Usable as a research seed. Not ready as a live ranking.**

Sir asked for **top followed people**. This sheet is a good start, but it is a **watchlist**, not a verified Billboard chart.

---

## What is okay

| Check | India 200 | Global 200 |
|---|---|---|
| Row count | 200 | 200 |
| Unique usernames | 200 / 200 | 200 / 200 |
| Name + username + profile URL | Complete | Complete |
| Profile URLs look valid | Yes (`instagram.com/...`) | Yes |
| Rank order vs captured followers | Sorted correctly where counts exist | Sorted correctly where counts exist |
| Sources documented | Yes | Yes |

Top names look right: Kohli / Modi / actresses on India; Instagram / Ronaldo / Messi / Selena / Kylie on Global.

Sources used (hafi.pro, FastSocial, trendingpunjabi) are **public ranking pages**, not Meta. That is fine for seeding. It is **not** official Instagram data.

---

## What is not okay yet

| Issue | Detail |
|---|---|
| Missing follower counts | **India 127 / 200 blank.** Global **58 / 200 blank.** Blank ≠ zero. |
| Confidence | India: 73 Medium / 127 Low. Global: 30 Medium / 170 Low. |
| People vs brands | Sir asked for **people**. Sheet includes IPL teams, Zomato, Swiggy, Nike, Apple, @instagram, luxury brands. |
| Overlap | **68 usernames** sit in both India and Global (expected, but we must tag `scope`, not duplicate as two products). |
| Broken username | India #154 **MC Stan** is `@m cstan` (space). Must be `@mcstan`. |
| Unofficial / weak rows | India #91 “Ranbir Kapoor fan/official availability check”; #113 Danish Zehen legacy; Global #176 Avicii legacy. **Decision (v1):** keep the rows in the watchlist, set `is_listed = false` on first import, seed note explains why. They do not appear on people charts. An admin can list them later if the handle is verified as the real person. |
| Encoding | Global #171 `Sadio Mané`, #172 `Sergio Agüero` may show as `Man�` / `Ag�ero`. |
| Rounded millions | Counts are rounded public-page figures. Dashboard must store **exact integers** once we sync. |

---

## How we should use this list

1. Import **all 200 + 200** as a **watchlist** (with `scope = india | global`).
2. Split entities: `person` vs `brand` vs `team` vs `platform`. Brands/teams can stay for later tabs; **MVP default chart = persons only**.
3. Do **not** publish ranks until follower counts are filled (manual now, Meta API later).
4. Fix the few bad usernames before import.

We do **not** scrape Instagram to fill the blanks. Live counts come from Meta Graph (Business Discovery) or stay as seed-only until API access.

---

## Bottom line for sir / team

> The 200+200 list is a proper starting watchlist. We can plan and build on it. We cannot yet call it “the official top 200” because most rows still need live follower verification, and some rows are brands/teams, not people.
