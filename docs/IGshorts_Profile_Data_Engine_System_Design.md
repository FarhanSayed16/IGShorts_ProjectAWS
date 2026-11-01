# IGshorts — Profile Data Engine & Creator Ranking System Design

**Document type:** Product + technical system-design specification  
**Status:** Proposed architecture; not yet implemented  
**Prepared:** 1 November 2026  
**Primary objective:** Build a reliable, affordable, searchable index of Instagram public creator profiles, maintain measured profile data on an appropriate refresh schedule, and provide honest audience-group and cohort-ranking visualizations.

---

## 1. Executive recommendation

IGshorts should be built as a **multi-source creator data platform**, not as a crawler that attempts to collect every Instagram account.

The system should have five independent but connected capabilities:

1. **Candidate discovery:** obtain candidate Instagram handles from permitted datasets, creator directories, approved discovery APIs, and user-submitted searches.
2. **Profile resolution:** resolve an exact handle to a real profile through a permitted source and record what fields that source actually returned.
3. **Measurement history:** store each valid follower-count observation with its source and observation time. Never overwrite history or convert a failed lookup into zero.
4. **Refresh orchestration:** refresh high-priority profiles more frequently, while respecting the provider's actual refresh cadence, quotas, terms, and budget.
5. **Ranking and presentation:** calculate audience groups and rankings only within a clearly defined and measured cohort. Never call a partial database a complete worldwide ranking.

### Recommended launch strategy

- Keep the existing India and Global famous-account charts operational and separate.
- Import the existing IGshorts seed list and the current FastSocial public dataset with attribution.
- Build exact-handle search and audience grouping on top of saved records.
- Run a small provider accuracy and data-rights evaluation before purchasing bulk access.
- Prototype Meta Business Discovery separately. It is useful for eligible professional accounts, but it is not a universal account directory.
- Add a configurable refresh scheduler. Start with the cadence in Section 8, but only use short intervals when the provider can actually return a newly observed reading.
- Add cohort rankings, account registration, creator watchlists and advanced reports in later phases.

**Core product promise:** “See where you stand among the creators IGshorts can reliably measure.” Do not promise “your exact rank on Instagram worldwide” unless IGshorts can prove the population and completeness behind that claim.

---

## 2. What data can realistically be obtained?

There is no documented Meta API endpoint that returns every Instagram account, every personal account, or a complete list of users above a follower threshold. Public creator databases are also provider-specific indexes; they are not necessarily complete, current, or equally strong in every country or follower range.

Treat each source as a provider with its own coverage, fields, refresh policy, rate limits, cost, and data-use rights.

### 2.1 Source categories

| Source type | What it is useful for | What it cannot guarantee | IGshorts role |
|---|---|---|---|
| Existing IGshorts seed lists | Famous and known accounts already researched | Current counts or broad local coverage | Initial seed and chart continuity |
| Open datasets | Candidate handles, historical/count snapshots, categories where provided | Complete Instagram coverage or live accuracy | Low-cost bootstrapping |
| Wikidata and other documented directories | Candidate usernames for notable people, organizations and public entities | Normal/local creators or reliable follower counts | Candidate generation only |
| Licensed creator discovery APIs | Search by follower range, location, niche, keywords and handle; profile enrichment | Every account, every field, or unrestricted re-use | Main scale-up option, subject to contract |
| Meta Instagram APIs | Data about the authenticated professional account and eligible outward-looking Business Discovery targets | Personal-account coverage or a global directory | Official proof-of-concept and authorized data source |
| Creator-submitted handles / opt-in connection | Account ownership and first-party insights when a creator authorizes access | Accounts that never submit or authorize | First-party verified creator layer |
| Web search / public references | Candidate discovery and source validation | Structured, stable, continuously refreshed follower counts | Manual/editorial candidate sourcing only |

### 2.2 Open dataset: FastSocial Top Accounts

**Repository:** https://github.com/FastSocialCo/instagram-top-accounts  
**Latest CSV:** https://raw.githubusercontent.com/FastSocialCo/instagram-top-accounts/main/data/latest.csv  
**Daily history CSV (compressed):** https://fastsocial.co/instagram-stats/data/daily.csv.gz  
**Manifest:** https://github.com/FastSocialCo/instagram-top-accounts/blob/main/data/manifest.json  
**Dataset description/method:** https://fastsocial.co/instagram-stats  
**License:** CC BY 4.0, as declared by the repository.

The current repository describes a dataset of the **2,000 most-followed Instagram accounts**. It includes fields such as date, username, followers, display name, category, country, account type, rank among tracked accounts, and additional category/country labels. Its documented method says the top 500 are read daily and the remaining accounts every five days; candidates come from Wikidata Instagram usernames plus a manually maintained list. Private accounts are excluded. The dataset is therefore a valuable seed and example of a refresh process, but it is not a complete creator database.

**Important:** use the repository manifest to read the actual account and row counts at import time. Do not hardcode counts from an old report or assume every account has a daily reading. Preserve the upstream date and attribution. A current rank in the file is not necessarily a historical rank for each past row.

Required attribution for reused data (follow the repository's current instructions):

> Data: FastSocial Top Charts, CC BY 4.0 — https://fastsocial.co/instagram-stats

Check the repository's license and method again at every major import or release.

### 2.3 Candidate seed source: Wikidata

**Instagram username property:** https://www.wikidata.org/wiki/Property:P2003  
**Wikidata Query Service:** https://query.wikidata.org/

Wikidata can identify known people, organizations and entities that have an Instagram username recorded. It is useful for discovering candidate handles, not for obtaining a current follower count or discovering every local creator.

Example SPARQL query for candidate handles:

```sparql
SELECT ?item ?itemLabel ?instagramUsername WHERE {
  ?item wdt:P2003 ?instagramUsername.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5000
```

Use pagination or incremental query strategies for larger runs. Respect the Query Service usage policy and rate limits. Store the Wikidata entity URI as candidate provenance. Do not assume the listed handle still exists or belongs to the expected person; resolve and validate it through an approved source.

### 2.4 Commercial creator-data providers to evaluate

These are candidates for a controlled trial, not automatic endorsements. Provider claims, prices, indexed-profile totals, refresh policies and rights can change. Obtain written confirmation for IGshorts' exact use case: storing data, displaying profile fields, creating derivative audience groups, ranking users, caching results, retaining historical snapshots, and offering paid reports.

#### Influencers Club

- Website/pricing: https://influencers.club/pricing/
- API documentation: https://docs.influencers.club/
- Usage and limits: https://docs.influencers.club/guides/usage-limits
- FAQ: https://docs.influencers.club/guides/faq
- API base URL shown in docs: `https://api-dashboard.influencers.club`

Its documentation describes creator discovery by market and enrichment by handle. The published API credit table currently lists:

| Operation | Published credit usage |
|---|---:|
| Discovery search | 0.01 credits per creator returned |
| Enrich by handle — Raw | 0.03 credits per returned record |
| Enrich by handle — Profile | 0.2 credits per returned record |
| Enrich by handle — Analytics | 0.8 credits per returned record |
| Enrich by handle — Full | 1 credit per returned record |
| Monitoring | 0.3 credits per creator per day |

The pricing page currently advertises API access in its Pro plan starting from **US$208/month**, with credit prices and limits depending on the plan. The documentation also states 300 requests/minute, daily Discovery limits, and a unique-creator fair-use cap. Free-trial details shown on provider pages may differ; confirm the actual allowance in the account dashboard before planning against it.

**Important cost implication:** continuous provider monitoring at 0.3 credits per creator per day can become expensive. Do not enable it for the entire index by default. Prefer low-cost basic handle enrichment for follower-count updates, cache results, and reserve analytics/full enrichment for profiles where users request a detailed report.

#### Modash

- Website: https://www.modash.io/
- Discovery API overview: https://help.modash.io/en/articles/14035513-api-overview-and-getting-started
- API onboarding/best practices: https://help.modash.io/en/articles/14035533-discovery-api-best-practices-and-onboarding
- Data refresh rates: https://help.modash.io/en/articles/5467354-profile-updates-how-often-data-refreshes
- API rate limits and refresh cheat sheet: https://help.modash.io/en/articles/14035619-api-cheat-sheet-limits-filters-metrics
- API docs: https://docs.modash.io/

Modash documents creator search and detailed profile-report endpoints. Its help material currently describes basic follower/name/username data as refreshed at least weekly, engagement and recent content approximately twice per month, and deeper audience analysis around monthly. It recommends caching profile reports for at least 30 days to reduce credit consumption. The provider's public pages describe very large profile-index totals, but different pages use different totals; do not treat those marketing figures as a guaranteed count of unique, searchable Instagram accounts.

Modash is a strong benchmark for creator discovery and data freshness architecture. Its API pricing and minimum commercial commitment should be confirmed directly with sales before considering it for an early-stage budget.

#### Other providers / profile lookup services

Any profile lookup service (including crawler or scraping API vendors) must pass the same due-diligence process. A working endpoint does not prove that the vendor has the right to collect, sublicense, or authorize public redistribution of the data. Do not build the system around undocumented endpoints or a vendor's marketing claim alone.

**Provider acceptance requirements:** written source/method description; permitted commercial display and derivative ranking; field-level provenance; refresh timestamp; deletion/opt-out handling; country coverage; small-account coverage; request quotas; cost per successful result; cache/retention conditions; and a tested API contract.

---

## 3. Meta API: what to request and what not to assume

### 3.1 Should IGshorts apply for Meta API access?

**Yes, build a proof-of-concept, but do not make Meta the only source or assume it will supply every creator.**

Meta's Instagram API with Facebook Login documents access for Instagram professional accounts (Business and Creator), including basic metadata and metrics about other Instagram Businesses and Creators through eligible endpoints. The documented API cannot access ordinary consumer/personal Instagram accounts. The Business Discovery feature is handle-based; it does not enumerate the whole Instagram population.

Official/Meta-maintained references:

- Meta Instagram API collection on Postman: https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- Business Discovery reference: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery/
- Instagram API with Facebook Login: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/
- Permissions reference: https://developers.facebook.com/docs/permissions/
- App Review: https://developers.facebook.com/docs/app-review/
- Graph API rate limiting: https://developers.facebook.com/docs/graph-api/overview/rate-limiting/

### 3.2 Expected Business Discovery workflow

The documented pattern is conceptually:

1. Create a Meta developer app.
2. Configure the relevant Instagram API product and login flow.
3. Connect an Instagram **Business** account controlled by IGshorts to the required Facebook Page (for the Facebook Login flow).
4. Obtain the correct access token for that caller account and grant only the permissions required by the selected endpoint.
5. Complete App Review and obtain Advanced Access where Meta requires it for external users/use cases; complete Business Verification where required.
6. Call Business Discovery for a supplied target username, using the authenticated caller's Instagram professional account ID.
7. Validate the response, store the returned fields and timestamp, and monitor API usage/expiry.

Example endpoint shape (check the current Graph API version and fields in Meta's reference before implementation):

```http
GET https://graph.facebook.com/v{version}/{IG_BUSINESS_ACCOUNT_ID}
  ?fields=business_discovery.username({TARGET_USERNAME}){username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url}
  &access_token={ACCESS_TOKEN}
```

The exact fields and availability can change. Use the official reference for the supported schema; do not copy an endpoint/version from a tutorial without checking the current docs.

### 3.3 What Meta can and cannot do for this product

| Requirement | Meta Business Discovery expectation |
|---|---|
| Look up a supplied exact handle | Possible for eligible targets |
| Return follower count and basic profile fields | Possible for supported fields/eligible profiles |
| Look up public Business/Creator accounts | This is the intended outward-looking use case |
| Look up ordinary personal accounts | Not supported by the documented professional-account API coverage |
| Return every account in a country | No directory/enumeration endpoint documented |
| Search every account between 10K and 100K | No universal global follower-range directory from Meta |
| Return complete blue-tick/verified search | Do not assume this; Business Discovery does not provide a dependable verified-only index field |
| Provide creator Insights such as reach, impressions, saves and audience demographics for another arbitrary creator | No; private Insights are available to the account owner/authorized app use, not arbitrary third parties |
| Provide a historic follower time series from before IGshorts starts collecting | No; IGshorts must build its own snapshots |

### 3.4 Permissions and review

Use the least-privilege permission set required by the exact product/endpoint. The Facebook Login Instagram API commonly uses `instagram_basic`, together with Page-related permissions such as `pages_show_list` and `pages_read_engagement` in the documented setup. Do not request publishing, comments, messaging or Insights permissions unless IGshorts actually implements those features and the endpoint requires them.

Meta's permission reference explains App Review for data outside assets the app owns/manages and Advanced Access requirements. The exact permission dependencies can change by API product and login method. Confirm them in the current App Dashboard and current Business Discovery docs before applying.

**Do not confuse the two Instagram login products:** Instagram Login is designed for professional accounts that authorize an app to manage/access their own presence. The Facebook Login Business Discovery path is the relevant outward-looking route described for querying other professional accounts. Do not assume a token from one login product can call the other product's endpoints.

### 3.5 Five mandatory Meta proof tests

Before building the live integration, test and record:

1. The IGshorts-owned Business account can authenticate and call its own supported profile endpoint.
2. A known public Creator account that IGshorts does not own can be queried by exact username.
3. A known public Business account can be queried by exact username.
4. A known personal/consumer account returns the expected unsupported/no-result behavior (do not treat it as zero followers).
5. Record exact returned fields, permissions, App Review status, limits, token lifetime, errors, and observed API usage headers.

Do not proceed to a product promise for new-handle lookup until test 2 or 3 succeeds under the approved production app configuration.

### 3.6 Tokens and security

- Store tokens only on the server in a secret manager or encrypted environment configuration.
- Never send tokens to the browser, frontend bundle, logs or Git repository.
- Store token expiry and permission metadata; alert before expiry and reauthorize/renew through the supported flow.
- Handle revoked access and permission changes without breaking existing saved data.
- Use the API's returned usage headers and documented rate-limit signals. Do not assume a universal fixed requests-per-hour value; Instagram Platform limits are app/account-context dependent.

---

## 4. Product data scope: what to store

Separate profile identity from observations. A creator's current username can change; a follower count changes over time; a country/category may be uncertain. Do not put all of these into one mutable row with no history.

### 4.1 Minimum profile fields

| Field | Purpose | Notes |
|---|---|---|
| `id` | Internal stable ID | UUID or database ID |
| `platform` | Platform identifier | `instagram` initially; future-proof schema |
| `username_normalized` | Exact search key | Lowercase normalized handle, unique per platform where possible |
| `username_display` | Display handle | Keep original casing if useful |
| `instagram_user_id` | Platform ID | Store only when the provider supplies a stable ID and terms permit |
| `display_name` | Public profile name | Nullable |
| `biography` | Public bio | Optional; respect provider licence and retention terms |
| `profile_picture_url` | Public avatar reference | URLs may expire; cache only if permitted |
| `profile_url` | Link to Instagram profile | Build only from normalized exact handle |
| `account_type` | Business / Creator / Personal / Unknown | Keep `unknown` when not provided |
| `is_verified` | Verified badge state | Tri-state: true / false / unknown; require field provenance and freshness |
| `country_code` | Country attribution | Nullable; do not infer nationality from audience location |
| `country_source` | Provenance | Provider / creator-confirmed / editorial / unknown |
| `category` | Optional classification | Defer final taxonomy until product decision |
| `first_seen_at` | First indexed by IGshorts | Internal time |
| `last_successful_observation_at` | Last valid measurement | Separate from last attempted fetch |
| `data_status` | Operational state | active / stale / unresolved / unavailable / removed |

### 4.2 Measurement history

Create an append-only `profile_metric_snapshots` table. At minimum:

- `creator_id`
- `metric_name` (followers, following, media_count, etc.)
- `metric_value`
- `observed_at` (when the source says the number was measured)
- `fetched_at` (when IGshorts received the response)
- `source_id` and `source_record_id`
- `source_updated_at` (if supplied)
- `precision` (exact, rounded, bucketed, estimated)
- `quality_status` (accepted, suspect, rejected)
- `raw_response_hash` or a limited audit pointer, where permitted

**Critical distinction:** `fetched_at` is not automatically `observed_at`. A provider can return a value that it cached last week. A successful HTTP response does not prove the underlying follower count was measured just now.

Never overwrite the previous accepted count. Failed lookups create fetch-attempt records, not zero-valued metric snapshots.

### 4.3 Operational tables

Recommended logical entities (adapt to the existing database instead of blindly creating duplicates):

- `creators`
- `creator_aliases` / username history
- `profile_metric_snapshots`
- `data_sources`
- `provider_fetch_attempts`
- `refresh_jobs`
- `ranking_cohorts`
- `ranking_snapshots`
- `tracked_creators`
- `users`
- `saved_creators`
- `lookup_events` (minimal, privacy-conscious analytics)
- `takedown_requests` / `data_removal_events`

Add indexes for normalized username, platform ID, follower count, country code where reliable, category, next refresh time and snapshot observation time. Use a unique constraint on `(platform, username_normalized)` but make room for username changes and historical aliases.

---

## 5. Search engine design

### 5.1 Search behavior

The first version should prioritize exact handle search. Name search can be added over the local indexed database.

1. Accept a handle, profile URL or display-name query.
2. Normalize the input: remove leading `@`, extract the handle from a supported Instagram profile URL, lowercase for comparison, trim whitespace, and validate allowed username characters. Do not remove periods or underscores.
3. Search local records by exact normalized handle.
4. If a recent valid snapshot exists, return it immediately.
5. If no record exists or the snapshot is stale, queue a provider lookup if the configured provider and terms allow it.
6. Return the result with a clear status: recently checked, update overdue, lookup pending, not measured yet, could not verify, or unavailable.
7. Deduplicate concurrent searches for the same handle so 100 simultaneous visitors do not trigger 100 paid lookups.
8. Cache successful and negative results for an explicit period; negative results must expire so a newly created or newly indexed account can be found later.

### 5.2 Exact handle vs fuzzy name search

- Exact handle match must always rank above display-name similarity.
- Display-name search can return multiple accounts; show the handle and profile URL for disambiguation.
- Do not merge two accounts solely because they have the same display name or photo.
- When a username changes, use a stable platform ID when available to link the new username to the existing creator record.
- If stable IDs are unavailable, keep the old handle as an alias only after validation; never assume a renamed handle belongs to the same person based only on name similarity.

### 5.3 Search should not automatically create a tracked profile

A lookup may be ephemeral. Save a permanent creator record only when:

- a valid source returns enough identity data and the product's retention terms permit it; or
- a visitor explicitly chooses “Track this creator”; or
- an admin adds the creator to an approved watchlist.

Separate a low-cost query cache from the long-term tracked-creator list.

---

## 6. Profile acquisition and seed expansion algorithms

Do not generate usernames by combining random names, numbers or words and then probing Instagram at scale. That produces low-quality guesses, high failure rates, and can become automated enumeration. Instead, use transparent candidate sources and resolve candidates only through permitted methods.

### 6.1 Candidate acquisition pipeline

**Input sources:**

- Existing India and Global IGshorts seed lists.
- FastSocial public CSV, with CC BY 4.0 attribution.
- Wikidata property P2003 candidate handles.
- Licensed provider discovery results, if its contract permits local storage and indexing.
- Creator-submitted handles and creator opt-in connections.
- Admin-reviewed submissions from reputable public directories.

**Pipeline:**

1. Import source rows into a staging table; do not write directly into the production creator table.
2. Preserve the original source name, source URL, source licence/terms reference, source row ID and import timestamp.
3. Normalize handle and platform; reject invalid or empty usernames.
4. Deduplicate by stable platform ID first, then exact normalized handle.
5. Resolve the handle using an approved data source.
6. Validate identity consistency, data types, follower count, account type, and observation timestamp.
7. Store accepted profile fields and append metric snapshots.
8. Keep rejected, unresolved and duplicate candidate records for audit, with a reason code.
9. Publish only records meeting the minimum quality and rights policy.

### 6.2 Validation rules

- Handle exists and response matches requested handle (or a validated alias).
- Follower count is numeric and non-negative; zero is accepted only if source explicitly means zero, not if the field is missing.
- Do not interpret `null`, missing, inaccessible, private or unsupported as zero.
- Flag large unexplained jumps or drops for a second-source check or manual review.
- Validate timestamps and source freshness before changing the displayed status.
- Verification is true/false/unknown; unknown must never be converted to false.
- Country is separate from nationality, residence and audience geography. Store only a sourced attribution.
- Detect suspicious duplicate accounts, renamed accounts and impersonation; do not automatically merge uncertain identities.
- Keep confidence / provenance per field rather than assigning one vague quality flag to the whole profile.

### 6.3 Provider fallback policy

Use a provider router with an explicit priority order, e.g.:

1. Fresh accepted observation from local database.
2. Primary licensed profile provider.
3. Secondary licensed provider, only if configured and permitted.
4. Meta Business Discovery for eligible professional targets and approved app configuration.
5. Creator-authorized account connection for first-party insights.
6. Otherwise return “Not measured yet” or “Could not verify.”

Do not call every provider for every search. Use fallback only when the first provider returns a defined recoverable result (not found, not covered, temporary outage) and budget/rate-limit rules allow it. Do not use fallback to bypass an access restriction or contractual limit.

---

## 7. Refresh architecture

The refresh engine must separate **profile importance**, **data freshness**, **provider capability** and **budget**.

### 7.1 Do not refresh every field at the same frequency

Follower counts are the main input to audience groups and rankings. Profile metadata, engagement analysis, audience demographics and post analytics have different costs and source refresh policies.

| Data class | Examples | Recommended treatment |
|---|---|---|
| Core identity | Username, display name, profile URL, account type | Update when changed or on a longer interval |
| Core audience metric | Followers count | Highest refresh priority; this powers groups and follower ranking |
| Secondary public metrics | Following count, media count | Refresh less often unless used in a visible feature |
| Content/engagement | Recent media, likes/comments/views, engagement rate | Refresh only if product uses it; often more costly and provider-dependent |
| Audience analytics | Audience age, gender, geography, authenticity estimates | Expensive/derived; on-demand or low frequency, and only when licensed/available |
| First-party Insights | Reach, impressions, saves, shares, profile visits | Only from creator-authorized account access; never claim for arbitrary profiles |

### 7.2 Proposed refresh tiers

The following is a **starting policy to test**, not a promise that every provider can return newly observed data at these intervals.

| Tier | Suggested cohort | Target follower-count refresh | Rationale |
|---|---|---:|---|
| P0 — flagship | Current India/Global chart leaders, ~10M+, top editorial accounts, unusually volatile profiles | Every 2–3 days | High visibility and high absolute movement; chart-sensitive |
| P1 — major | 1M to under 10M | Every 5 days | Large audience and meaningful ranking changes |
| P2 — established | 100K to under 1M | Every 7 days | Useful weekly freshness without excessive calls |
| P3 — community | 10K to under 100K | Every 14 days | Lower absolute movement; reduce cost |
| P4 — emerging / under 10K | Under 10K, low-demand long tail, or profiles not on a chart | Every 30 days or on-demand | Not currently eligible for an audience group; do not spend heavily on low-demand accounts |

**Overrides:**

- User explicitly tracks a creator: may raise the refresh priority, within a fair-use cap.
- High search demand: temporarily raise priority while the profile is actively requested.
- Large detected growth/decline: temporarily refresh more frequently to confirm the change.
- Chart-critical account: maintain the P0/P1 cadence even if the account has few user searches.
- Inactive, removed, private, unavailable or repeatedly failing profile: reduce frequency or suspend retries.

The tier should be recalculated when follower count changes, not treated as permanent. A creator who moves from 95K to 120K can move to the next schedule on the following policy evaluation.

### 7.3 Adaptive priority algorithm

Do not use follower count alone. A smaller creator with rapidly rising search demand may need a fresher observation than a stable celebrity.

For each profile calculate:

- `base_interval_days` from its current refresh tier;
- `age_ratio = days_since_last_valid_observation / base_interval_days`;
- `volatility_score` from recent percentage changes, with safeguards against noisy data;
- `demand_score` from recent unique search activity;
- `tracking_weight` from explicit user watchlists;
- `chart_weight` for editorial/leaderboard-critical profiles;
- `provider_available_at` / next permitted refresh time;
- remaining provider credits and global refresh budget.

A simple, explainable scheduler:

1. Exclude profiles that are not due, suspended, removed or in a retry cooldown.
2. Calculate `age_ratio`.
3. Sort overdue work by: chart-critical first, then explicit tracking, then high search demand, then high volatility, then longest overdue ratio.
4. Enforce provider concurrency, requests-per-minute, daily quota and monthly credit budget.
5. Fetch only the minimum field set needed for the current product action.
6. Recalculate next refresh date after a successful result using the policy tier and source freshness.
7. On failure, preserve the last valid snapshot, record error and retry using exponential backoff with jitter.

This scheduler is easier to tune than an opaque AI score and supports an auditable reason for every refresh.

### 7.4 Provider freshness is not the same as our refresh frequency

This is a critical design constraint. A provider may refresh its own index weekly or monthly. Calling the provider every two days may simply return the same cached value, consume credits and create the false impression that the account was measured every two days.

Store and display separately:

- `last_fetched_at`: when IGshorts called the provider;
- `source_observed_at`: when the source says it measured the count;
- `source_updated_at`: when the provider says its record was updated;
- `next_eligible_refresh_at`: when another meaningful check is allowed/recommended.

If the provider does not expose a source timestamp, mark the observation's freshness as provider-reported/unknown. Do not label it “live.”

Modash's current help documentation, for example, says basic follower/name/username data is refreshed at least weekly, engagement/recent content about twice per month, and deeper analysis around monthly; individual profiles run on separate cycles. This is why the IGshorts 2–3 day P0 target should only be used with a source that actually provides newly measured counts at that cadence.

### 7.5 Monthly call-volume and cost model

Calculate expected volume before enabling a schedule:

```text
monthly_refreshes ≈ Σ (profiles_in_tier × 30 / refresh_interval_days)
monthly_provider_cost = Σ (refreshes × cost_per_operation)
```

Illustrative distribution for a 10,000-profile tracked index (not a prediction of IGshorts' actual distribution):

| Tier | Profiles | Interval | Approx. monthly refreshes |
|---|---:|---:|---:|
| P0 | 200 | 3 days | 2,000 |
| P1 | 800 | 5 days | 4,800 |
| P2 | 2,000 | 7 days | 8,571 |
| P3 | 4,000 | 14 days | 8,571 |
| P4 | 3,000 | 30 days | 3,000 |
| **Total** | **10,000** | — | **~26,942** |

If using the currently published Influencers Club credit rates solely as an arithmetic example:

- Raw enrichment at 0.03 credits per successful profile: ~808 credits/month.
- Profile enrichment at 0.2 credits: ~5,388 credits/month.
- Analytics enrichment at 0.8 credits: ~21,554 credits/month.
- Full enrichment at 1 credit: ~26,942 credits/month.

These estimates exclude discovery calls, failed/retried calls, plan minimums, fair-use caps, provider-side limits and any pricing changes. Confirm the current commercial quote and billing interpretation before using them for budgeting.

At 100,000 profiles with the same distribution, multiply the volume by approximately ten. This makes it essential to use the cheapest sufficient endpoint, avoid re-fetching unchanged data, and prioritize based on demand and importance.

### 7.6 Recommended starting policy

For launch, do **not** immediately refresh all records on the proposed cadence. Start with:

- P0: 2–3 days only if source freshness supports it;
- P1: 5–7 days;
- P2: 7–10 days;
- P3: 14–21 days;
- P4: on-demand or 30–45 days.

Run the schedule for 30 days, inspect actual volatility and cost, then tighten or relax intervals using evidence.

---

## 8. Queue, cache and reliability design

A recurring cron alone is insufficient for large-scale refresh. Build a queue with concurrency control and retry handling.

### Components

1. **Scheduler:** selects due profiles and creates refresh jobs.
2. **Queue:** holds provider-specific jobs; supports prioritization and delayed retries.
3. **Workers:** process jobs with per-provider concurrency and rate limits.
4. **Provider adapters:** one adapter per vendor/API; translate external responses into a common internal schema.
5. **Validator:** checks identity, fields, timestamps and anomalies.
6. **Snapshot writer:** appends accepted observations; never overwrites earlier snapshots.
7. **Ranking builder:** recalculates affected cohorts after accepted changes.
8. **Admin dashboard:** shows queue depth, provider health, spend, failed jobs, stale profiles and manual retry controls.

### Operational rules

- Use idempotency keys such as `(creator_id, source_id, requested_metric_set, scheduled_window)` to prevent duplicate jobs.
- Use exponential backoff plus jitter for transient failures.
- Respect `Retry-After` and provider quota responses.
- Separate permanent errors (unsupported account, invalid handle, access denied) from transient errors (timeout, 5xx, rate limit).
- Put repeated failures into a dead-letter/review queue rather than retrying forever.
- Use stale-while-revalidate: show a valid saved result while a refresh is pending, with an overdue state if necessary.
- Deduplicate simultaneous on-demand lookups for the same handle.
- Cache normalized search results and provider response summaries where contractually allowed.
- Never expose provider API keys or Meta access tokens to frontend code.
- Monitor usage before the provider quota is exhausted; stop low-priority refreshes when the budget threshold is reached.

### Suggested existing-stack fit

Given the existing IGshorts development direction, a reasonable starting stack is:

- Frontend: current SvelteKit application.
- Backend: current Node.js server/API layer.
- Database: existing PostgreSQL database via Prisma.
- Queue/cache: Redis + BullMQ if a queue is not already present; otherwise use the project's current job runner.
- Scheduler: one scheduled process that enqueues work, rather than one long-running cron process making all provider calls itself.
- Monitoring: structured logs, error tracking and a simple admin operations page.

Do not add Elasticsearch, Kafka, Kubernetes or another database just for appearance. Add infrastructure only when measured search volume, queue throughput or data size justifies it.

---

## 9. Ranking and visualization rules

### 9.1 Keep ranking types distinct

| Product output | What it means | Required evidence |
|---|---|---|
| India/Global famous chart rank | Position among the accounts in that named chart | Consistent saved measurements for that chart |
| Audience group | Community / Established / Public / Major | One accepted follower-count observation and the configured transition rule |
| Indexed-cohort rank | Rank among IGshorts profiles matching a defined cohort | Known denominator, comparable snapshots, valid cohort filters |
| Country cohort rank | Rank among profiles reliably attributed to a country | Defensible country provenance and cohort coverage statement |
| Worldwide Instagram rank | Position among all Instagram accounts | Not supportable from a partial data provider index; do not display as a fact |

### 9.2 Audience groups

Use the agreed IGshorts boundaries:

- Community: 10,000 to under 100,000
- Established: 100,000 to under 1,000,000
- Public: 1,000,000 to under 10,000,000
- Major: 10,000,000 and above
- Under 10,000 or no reliable count: Not grouped yet

First accepted observation goes directly into the group containing that value. The configurable 15% transition buffer applies only to subsequent changes, not first placement. Test both upward and downward transitions at every boundary.

### 9.3 Cohort ranking and percentile

Only enable a cohort rank or percentile when the cohort definition is explicit. Every output must include:

- cohort name (e.g., “IGshorts-indexed Indian creators”);
- sample size / number of profiles with usable observations;
- observation window and freshness date;
- country/category attribution method;
- whether the ranking is complete or a partial index;
- tie handling and missing-data handling.

Example of acceptable wording:

> “Top 8% among 24,500 IGshorts-indexed creators in this cohort, based on observations collected during October 2026.”

Do not use the phrase “top 8% in India” unless the denominator really covers the defined Indian creator population. For a partial provider index, say “among IGshorts-indexed creators.”

### 9.4 Country and category accuracy

Do not conflate:

- creator nationality;
- creator's current residence;
- declared profile location;
- provider-attributed country;
- location of the account's audience.

Store the type and source of country attribution. A country ranking should exclude unknown/ambiguous cases or place them in an explicit unknown cohort.

Category-wise ranking can be added later. First design category as a many-to-many taxonomy, not a single hardcoded column, so creators can belong to more than one category. Add editorial/admin confidence and source provenance. Do not auto-publish uncertain classifications.

---

## 10. Public profile page and user accounts

### 10.1 Public creator page

Suggested first version:

- Display name, @handle and public Instagram link.
- Audience group and its range.
- Last checked / update overdue / not measured yet / could not verify status.
- Source/freshness explanation.
- Position on India/Global chart only if already included in those charts.
- “Track this creator” action for registered users.
- A note explaining that IGshorts ranks only within its indexed/defined cohorts.

Do not present a stored count as a live Instagram counter. If exact counts are retained internally, display only when the source and product policy explicitly support showing them.

### 10.2 Sign-up and login

Keep basic search public. Registration should unlock genuine additional value, such as:

- watchlists and saved profiles;
- alerts when a creator changes audience group;
- saved comparison reports;
- longer historical group movement;
- optional downloads and advanced analysis.

Start with verified email and/or Google sign-in. Add mobile OTP only if there is a clear need and budget for SMS delivery and abuse prevention.

An IGshorts user account is not proof that the person owns an Instagram handle. Use a supported authorization or a separate verification method to prove account ownership. Never request Instagram passwords.

A blurred preview can be tested for optional premium reports, but do not hide the basic audience group behind sign-up. The public lookup is the core value proposition.

---

## 11. Privacy, legal and data-rights requirements

Before production, create a data-source register with the exact terms/licence for every dataset and API. A profile being publicly viewable does not automatically mean IGshorts may bulk collect, retain, republish or sell derived datasets from it.

### Required controls

- Do not use automated scraping of Instagram unless Meta has expressly authorized the activity in writing and IGshorts complies with the applicable Automated Data Collection Terms and other platform terms.
- Do not bypass login, CAPTCHA, rate limits, privacy settings or access controls; do not rotate proxies or accounts to evade restrictions.
- Use licensed APIs and openly licensed datasets only within their stated commercial display, caching, retention and redistribution permissions.
- Display attribution where a dataset license requires it (e.g., FastSocial CC BY 4.0).
- Provide a correction/removal/opt-out route and process source/provider deletion signals.
- Minimize personal data; do not collect private contact information unless there is a documented, lawful and necessary feature requiring it.
- Maintain a privacy notice, terms of service, retention schedule, security controls and incident process.
- Keep authentication data separate from public creator profile data.
- Do not use follower data to infer sensitive personal characteristics.
- Obtain Indian privacy/legal advice for the Digital Personal Data Protection Act and rules that apply to IGshorts' processing, user accounts, public profile data, notices and retention.

Meta Automated Data Collection Terms: https://www.facebook.com/legal/automated_data_collection_terms  
Meta Platform Terms: https://www.facebook.com/terms.php  
Meta Developer Policies: https://developers.facebook.com/terms/  
India DPDP Act portal / official materials: https://www.meity.gov.in/data-protection-framework

---

## 12. Admin dashboard and operational controls

An internal admin dashboard is required before scaling data collection. It should show:

- Total candidate profiles, resolved profiles and published profiles.
- Profiles by source and source licence.
- Coverage by follower band, country and account type.
- Count of fresh, overdue, unknown, failed and removed profiles.
- Last successful source observation vs last fetch attempt.
- Queue size, due jobs, retries, dead-letter jobs and provider 429/5xx errors.
- Provider credits/requests consumed, remaining balance and projected monthly spend.
- Cost per successful profile refresh and cost per new discovered profile.
- Duplicate and handle-change detection.
- Outlier follower changes requiring review.
- Opt-out/takedown queue and completion status.

Admin actions should include requeue, suspend, mark unavailable, merge records after review, correct provenance, remove profile, and inspect source history. Every manual action should be auditable.

---

## 13. Accuracy and provider evaluation plan

Do not purchase a large plan based only on marketing claims. Run a repeatable 100–200 profile benchmark.

### Sample design

Include a balanced set of:

- 20–30 very large accounts;
- 20 accounts between 1M and 10M;
- 20 accounts between 100K and 1M;
- 20 accounts between 10K and 100K;
- 20 accounts below 10K if the provider claims to cover them;
- Indian local/regional creators and global accounts;
- Business, Creator and Personal accounts where their type is known;
- Verified and non-verified accounts;
- usernames with dots/underscores and recently changed handles.

Use only checks that can be performed lawfully and without bypassing access controls. For a fair follower-count comparison, capture the public display at approximately the same time as the provider measurement and account for rounded display counts.

### Scorecard

| Test | Metric |
|---|---|
| Exact-handle resolution | Successful correct matches / valid test handles |
| False match rate | Wrong profile returned / successful matches |
| Small creator coverage | Resolution rate per follower band |
| Follower agreement | Exact or expected rounded-value agreement |
| Freshness | Difference between source observation time and IGshorts fetch time |
| Verified field quality | Known true/false/unknown agreement; missingness rate |
| Country coverage | Share with sourced country and accuracy of tested examples |
| Stability | Username-change, deletion, private/unsupported handling |
| Cost | Credit and currency cost per successful accepted observation |
| Rights | Written confirmation of display, storage, historical snapshots and derived ranking use |
| Support | Response time and process for data disputes/deletions |

Suggested initial gates (adjust after seeing the test):

- 98%+ correct exact-handle matches among records the provider says it can resolve;
- under 1% false matches;
- 90%+ of accepted follower readings within the agreed tolerance for contemporaneous public display;
- source timestamp or clearly disclosed freshness uncertainty for every accepted value;
- written commercial rights for IGshorts' intended use;
- measured monthly cost fits the approved budget.

Do not include unsupported personal/private accounts in the success denominator as if the provider had promised to resolve them. Report coverage by account type and size, not just one overall success rate.

---

## 14. Phased implementation roadmap

### Phase 0 — source and policy validation

- Freeze the initial data requirements and fields.
- Review current source licenses and provider contracts.
- Import FastSocial with attribution; import existing IGshorts lists.
- Generate Wikidata candidate handles in a staging dataset.
- Select a representative benchmark sample.
- Request provider trial keys and written answers on data rights.
- Run the five Meta Business Discovery proof tests.

**Exit criteria:** source register exists; no source is used without documented terms; Meta capability and failure cases are known; provider benchmark has results.

### Phase 1 — reliable local index

- Normalize handles and deduplicate seed records.
- Implement creator profile, aliases, source and metric snapshot tables.
- Implement exact-handle local search.
- Implement the audience-group classification and first-placement/transition-buffer tests.
- Implement freshness and error states.
- Preserve the current India and Global charts.

**Exit criteria:** all existing chart profiles still work; seed imports are repeatable/idempotent; search results show provenance/freshness; no failed lookup becomes zero.

### Phase 2 — provider adapter and lookup

- Implement provider interface and first approved provider adapter.
- Add exact-handle enrichment and discovery search, according to the plan's terms.
- Add response validation, cache, request deduplication and provider quota control.
- Store source observation timestamps and fetch timestamps separately.
- Add provider cost and error dashboard.

**Exit criteria:** accepted benchmark accuracy, costs known, source rights confirmed, provider failures handled correctly.

### Phase 3 — scheduled refresh engine

- Add queue and scheduler.
- Implement the P0–P4 configurable tiers.
- Add adaptive prioritization from due age, chart criticality, tracking, search demand and volatility.
- Add provider-specific rate limits, retry/backoff, daily budget and pause controls.
- Run a 30-day cost/freshness pilot before increasing index size.

**Exit criteria:** refresh job success/failure measured; no runaway provider spend; observed freshness matches the public status.

### Phase 4 — ranking cohorts and advanced visualizations

- Add indexed-cohort ranks and percentiles only when sample/coverage rules pass.
- Add distribution pyramid, group population chart and group history.
- Add country ranking only with country provenance and documented cohort scope.
- Add categories later through a controlled taxonomy.

**Exit criteria:** each visualization states its denominator, data date and coverage limitations.

### Phase 5 — login, watchlists and reports

- Add email/Google authentication.
- Add saved creators and opt-in tracking.
- Add group-change notifications and comparison reports.
- Add optional downloads/paid reports only if source licenses allow the fields and derived results to be redistributed.
- Add mobile OTP only if product demand justifies its cost and abuse controls.

---

## 15. Required environment configuration

Never commit secrets. Use server-side environment variables or a secret manager. Suggested names (exact names can be adjusted to the current codebase):

```env
# Primary creator-data provider
CREATOR_DATA_PROVIDER=none
CREATOR_DATA_API_BASE_URL=
CREATOR_DATA_API_KEY=

# Secondary provider (optional)
CREATOR_DATA_SECONDARY_PROVIDER=none
CREATOR_DATA_SECONDARY_API_KEY=

# Meta / Instagram Business Discovery proof-of-concept
META_APP_ID=
META_APP_SECRET=
META_GRAPH_API_VERSION=
META_IG_CALLER_ACCOUNT_ID=
META_ACCESS_TOKEN=
META_ACCESS_TOKEN_EXPIRES_AT=

# Refresh engine
CREATOR_REFRESH_ENABLED=false
CREATOR_REFRESH_DAILY_BUDGET_CREDITS=0
CREATOR_REFRESH_MONTHLY_BUDGET_CREDITS=0
CREATOR_REFRESH_MAX_CONCURRENCY=2
CREATOR_REFRESH_DRY_RUN=true

# Optional queue/cache
REDIS_URL=
```

Start with `CREATOR_DATA_PROVIDER=none` and `CREATOR_REFRESH_ENABLED=false`. Enable live integrations only after keys, contracts, tests and budget controls are in place.

---

## 16. Monitoring and service-level indicators

Track these metrics from the first real import:

- `profile_lookup_success_rate` by source, country and follower tier;
- `false_match_rate` from reviewed samples;
- `freshness_age_hours` by data field and provider;
- `% profiles within freshness target` by P0–P4;
- provider request/credit consumption and remaining quota;
- cost per valid new profile and cost per successful refresh;
- queue wait time and refresh duration;
- retry, timeout, 429 and 5xx rates;
- number of stale, unsupported, private, removed and not-found profiles;
- opt-out/deletion processing time;
- ranking cohort size and percentage with usable observations.

Do not set a 100% data-freshness target if the provider only refreshes weekly. Set targets that reflect provider reality and explain them in the UI.

---

## 17. Cursor implementation instructions

Paste the following into Cursor after placing this document in the project root:

> Read `IGshorts_Profile_Data_Engine_System_Design.md` completely. Inspect the existing IGshorts repository, database schema, search implementation, chart data pipeline, refresh jobs and deployment configuration before editing anything.
>
> Do not rewrite the existing India and Global charts. First produce a short audit of the current architecture and map the existing models/files to the design in this document. Identify any existing components that should be reused rather than duplicated.
>
> Implement only Phase 1 initially: source-aware creator profiles, username normalization and aliases, append-only metric snapshots, idempotent FastSocial/seed imports, exact-handle local search, audience-group classification, freshness states and tests. Keep all live APIs disabled by default. Do not scrape Instagram, invent follower counts, or expose any API key in the frontend.
>
> The import must read the current FastSocial manifest and CSV schema dynamically; do not hardcode an account count. Preserve CC BY 4.0 attribution. Treat the dataset as a top-account seed, not a complete creator directory. Make imports idempotent and produce an import summary with rows read, accepted, duplicate, rejected and updated.
>
> Add boundary tests for 10K, 100K, 1M and 10M; first measurement; the 15% transition buffer in both directions; missing count; stale count; failed lookup; username changes; duplicate profiles; and provider timestamp older than fetch timestamp.
>
> Before modifying schema, explain the migration plan. After implementation, run tests and lint/type checks, list changed files, show the import/test summary, and explain what remains for Phase 2. Do not start paid provider integration or enable the Meta API without explicit configuration and approval.

---

## 18. Decisions that must be made before scaling

| Decision | Recommended default |
|---|---|
| Primary first dataset | FastSocial CSV + existing IGshorts seed lists |
| Candidate expansion | Wikidata P2003 and admin/creator submissions |
| Meta role | Proof-of-concept and eligible-professional lookup, not global discovery |
| Paid provider | Trial Influencers Club and benchmark against Modash before commitment |
| Main refresh metric | Follower count only |
| Refresh policy | P0 2–3d, P1 5d, P2 7d, P3 14d, P4 30d/on-demand, subject to source freshness |
| Other analytics | On-demand or lower frequency |
| Search behavior | Exact handle first; local database before provider lookup |
| Public ranking | Cohort-scoped only, with denominator and freshness disclosed |
| User signup | Optional for basic search; required for watchlists and saved reports |
| Categories | Add after core creator coverage and country provenance are stable |
| Live integrations | Disabled until source rights, keys, quota and costs are validated |

---

## 19. Reference links and verification notes

The following were reviewed for this design. Product documentation and prices change; re-check them before implementation or purchase. **Review date: 1 November 2026.**

### Meta / Instagram

- [Meta Instagram API collection (Postman)](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)
- [Meta Business Discovery endpoint](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery/)
- [Instagram API with Facebook Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/)
- [Meta Permissions Reference](https://developers.facebook.com/docs/permissions/)
- [Meta App Review](https://developers.facebook.com/docs/app-review/)
- [Graph API rate limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)
- [Meta Automated Data Collection Terms](https://www.facebook.com/legal/automated_data_collection_terms)
- [Meta Developer Policies](https://developers.facebook.com/terms/)

### Open datasets / candidate seeds

- [FastSocial GitHub dataset](https://github.com/FastSocialCo/instagram-top-accounts)
- [FastSocial latest CSV](https://raw.githubusercontent.com/FastSocialCo/instagram-top-accounts/main/data/latest.csv)
- [FastSocial daily CSV archive](https://fastsocial.co/instagram-stats/data/daily.csv.gz)
- [FastSocial manifest](https://github.com/FastSocialCo/instagram-top-accounts/blob/main/data/manifest.json)
- [FastSocial method and charts](https://fastsocial.co/instagram-stats)
- [Wikidata Instagram username property P2003](https://www.wikidata.org/wiki/Property:P2003)
- [Wikidata Query Service](https://query.wikidata.org/)

### Creator-data providers

- [Influencers Club pricing](https://influencers.club/pricing/)
- [Influencers Club API docs](https://docs.influencers.club/)
- [Influencers Club usage/limits](https://docs.influencers.club/guides/usage-limits)
- [Influencers Club API FAQ](https://docs.influencers.club/guides/faq)
- [Modash API overview](https://help.modash.io/en/articles/14035513-api-overview-and-getting-started)
- [Modash API best practices](https://help.modash.io/en/articles/14035533-discovery-api-best-practices-and-onboarding)
- [Modash profile refresh cycles](https://help.modash.io/en/articles/5467354-profile-updates-how-often-data-refreshes)
- [Modash rate limits and metrics](https://help.modash.io/en/articles/14035619-api-cheat-sheet-limits-filters-metrics)
- [Modash API docs](https://docs.modash.io/)

### Privacy / India

- [MeitY Data Protection Framework](https://www.meity.gov.in/data-protection-framework)
- [Digital Personal Data Protection Act and Rules — official materials](https://www.meity.gov.in/)

---

## 20. Final conclusion

The strongest IGshorts engine will not be the one that makes the most requests. It will be the one that knows **which profiles it can resolve, where every field came from, when it was genuinely observed, how much it costs to refresh, and exactly which population each ranking represents**.

Start with a verified seed index, build the source-aware profile and snapshot pipeline, and benchmark a licensed discovery API. Run Meta Business Discovery as a separate proof because it can add coverage for eligible professional accounts but cannot supply a complete directory of Instagram users. Use adaptive P0–P4 refresh scheduling and measure cost/freshness for 30 days before scaling.

That gives IGshorts a defensible path from a famous-account chart to a searchable creator index and, eventually, country/category/cohort rankings—without promising data coverage or precision that the sources cannot support.
