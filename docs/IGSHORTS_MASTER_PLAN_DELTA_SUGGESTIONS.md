# IGshorts Master Plan — Delta Suggestions

> **Reviewer:** Antigravity (Claude Opus 4.6)  
> **Date:** 2026-11-14  
> **Status:** Accepted and merged into `docs/IGSHORTS_COMPREHENSIVE_SYSTEM_MASTER_PLAN.md` (FINAL)  
> **Scope:** Additive enhancements, risks, missing acceptance criteria, phase-order fixes only

---

## Verdict

The 10-phase plan is structurally sound. Critical live bugs (seeded cheers, 404 gold gradient, admin jobs always-green) were elevated into **Hotfix 0.5**. Remaining deltas (PREVIEW BED badge, stream onerror, carousel editorial labels, loading.tsx, maintenance mode, consent stub, 5-event analytics set, claim pending + rate-limit, etc.) were folded into Phases 1–10.

---

## Must-fix before Phase 1 coding → Hotfix 0.5

- Showdown cheers 1428/1382 → 0 + “(your cheer)”
- 404 gold gradient → Billboard accent only
- Admin jobs status colors by status
- `global-error.tsx` with own html/fonts
- Footer Help/Support stubs
- Pulse reactions explicitly local

---

## Suggested plan deltas by phase

Merged into FINAL master plan. Highlights:

| Phase | Key deltas merged |
|-------|-------------------|
| 0 | Live bugs appendix + route inventory |
| 0.5 | New hotfix phase |
| 1 | PREVIEW BED badge; stream unavailable dock; SoundHelix fallback CTA |
| 2 | FOLLOWER SHARE; watchlist snapshot; carousel editorial labels |
| 3 | loading.tsx; maintenance; consent stub; route hygiene |
| 4 | FAQ → Help; watchlist explainer article |
| 5 | CRON_ENABLED on overview; explicit future admin routes |
| 6 | Playable previewAudioUrl in admin |
| 7 | Run Now concurrency lock; env vs operator disable |
| 8 | Consent gates all non-essential storage; 5 core events; no admin beacon |
| 9 | Teaching empty state; visit-diff arrows |
| 10 | Claim pending + timeline; rate-limit |

---

## Explicitly rejected ideas

- Soften brand green to teal/sage  
- Instagram Reels embedding  
- Spotify Web Playback SDK (Premium required)  
- WebSocket admin job monitoring  
- Fabricated engagement rates  
- Full CRM / messaging  
- Admin light mode  
- Premature country/category charts  

---

## Ready-to-paste prompt for Cursor

```
Implement Hotfix 0.5 then Phases 1–10 per docs/IGSHORTS_COMPREHENSIVE_SYSTEM_MASTER_PLAN.md.
Do not invent IG metrics. Do not rip Spotify/YouTube. Billboard tokens only.
Build must pass: pnpm --filter @igshorts/shared build && pnpm --filter @igshorts/web build
```

---

*Archived for audit trail. Do not treat this file as the live plan — use `IGSHORTS_COMPREHENSIVE_SYSTEM_MASTER_PLAN.md`.*
