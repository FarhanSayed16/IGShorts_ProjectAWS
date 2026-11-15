# IGShorts REA Master Documents Index

> **Folder Location:** `D:\IGShortsREA\IGShorts_REA_Documents`  
> **Created:** 2026-11-15  
> **Purpose:** Consolidated, unmixed repository of all project status handoffs, master execution plans, architectural teardowns, and reverse-engineering research for IGshorts.

---

## Document Directory & Roadmap

| # | Document | Scope & Contents |
| :-: | :--- | :--- |
| **1** | [AI_HANDOFF_PROJECT_STATUS.md](file:///d:/IGShortsREA/IGShorts_REA_Documents/AI_HANDOFF_PROJECT_STATUS.md) | **Current Project State & Constraints**<br>• Core product vision (Billboard × Bloomberg observatory).<br>• Monorepo architecture (`apps/web`, `apps/api`, `packages/db`).<br>• The 8 locked product rules.<br>• Prisma models & backend controller catalog. |
| **2** | [IGSHORTS_COMPREHENSIVE_SYSTEM_MASTER_PLAN.md](file:///d:/IGShortsREA/IGShorts_REA_Documents/IGSHORTS_COMPREHENSIVE_SYSTEM_MASTER_PLAN.md) | **Master Phased Execution Roadmap**<br>• Build order Phases 0 through 10.<br>• **Hotfix 0.5**: Live honesty and trust bugfixes.<br>• Music Alive hardening & brand honesty cleanup.<br>• Route inventory, accept criteria, and explicit out-of-scope boundaries. |
| **3** | [INFLACT_COMPLETE_ARCHITECTURE_AND_SYSTEM_DESIGN.md](file:///d:/IGShortsREA/IGShorts_REA_Documents/INFLACT_COMPLETE_ARCHITECTURE_AND_SYSTEM_DESIGN.md) | **Inflact Deep Teardown & Implementation Blueprint**<br>• Complete reverse-engineering of `inflact.com/instagram-profile-viewer/`.<br>• Legal posture, Terms of Service disclaimers, and *hiQ v. LinkedIn* precedent.<br>• The 13 core analytical parameters (Engagement Rate ER%, posting frequency, account health score).<br>• Internal endpoint targeting (`web_profile_info`), residential proxies, and session pools.<br>• Ready-to-use Prisma schema and TypeScript calculation service. |
| **4** | [INFLACT_AND_FASTVIDEOSAVE_ANALYSIS.md](file:///d:/IGShortsREA/IGShorts_REA_Documents/INFLACT_AND_FASTVIDEOSAVE_ANALYSIS.md) | **Comparative Matrix: Inflact vs. FastVideoSave**<br>• In-depth comparison of Inflact, FastVideoSave, and AnonyIG.<br>• FastVideoSave client analysis: Astro frontend, hardcoded AES-CBC 128-bit key (`"qwertyuioplkjhgf"`), and API aggregator (`api.getrequest.dev`).<br>• Media proxying via `cdn.turbosave.app`.<br>• Blueprint for building an Inflact-grade viewer on your stack. |
| **5** | [ANONYIG_OPERATIONAL_WORKFLOW_BREAKDOWN.md](file:///d:/IGShortsREA/IGShorts_REA_Documents/ANONYIG_OPERATIONAL_WORKFLOW_BREAKDOWN.md) | **AnonyIG End-to-End Operational Pipeline**<br>• Step-by-step technical breakdown from user search to DOM rendering.<br>• Dynamic request signing via Webpack chunk 54 (`link.chunk.js`, hash `_s`).<br>• Cloudflare Turnstile bot deterrence (`wh-cf-token`).<br>• Private Worker Hub API contracts (`api-wh.anonyig.com`).<br>• Media proxying and CDN URL rewriting via `media.anonyig.com`. |
| **6** | [ANONYIG_REVERSE_ENGINEERING_FINDINGS.md](file:///d:/IGShortsREA/IGShorts_REA_Documents/ANONYIG_REVERSE_ENGINEERING_FINDINGS.md) | **AnonyIG Initial Analysis & Architecture Diagram**<br>• Mermaid sequence workflow diagram.<br>• Core discovered API contracts (`userInfo`, `stories`, `posts`, `highlights`).<br>• Direct architectural comparison between AnonyIG and IGshorts rules. |
| **7** | [SCRAPER_FEASIBILITY_AND_SEARCH_ARCHITECTURE.md](file:///d:/IGShortsREA/IGShorts_REA_Documents/SCRAPER_FEASIBILITY_AND_SEARCH_ARCHITECTURE.md) | **Feasibility Assessment & Compliant Search Architecture**<br>• The 4 operational pitfalls of building a custom scraper fleet ($5–$15/GB residential proxies, burner account churn, weekly endpoint breakage, Meta ToS liability).<br>• Why master plan Rule #6 forbids scraping.<br>• Recommended compliant 3-tier search & intake queue architecture (SQL schema & workflow). |
| **8** | [CEO_EASY_EXPLAINER_COMPETITORS.md](./CEO_EASY_EXPLAINER_COMPETITORS.md) | **CEO Easy Explainer (start here)**<br>• Plain-language explanation of AnonyIG, Inflact, FastVideoSave.<br>• Clear comparison tables and business meaning for IGshorts. |
| **8b** | [CEO_TECHNICAL_ARCHITECTURE_BRIEF.md](./CEO_TECHNICAL_ARCHITECTURE_BRIEF.md) | **CEO / Technical Brief (deeper)**<br>• Pure technical prose: how the three systems obtain and serve data.<br>• No diagrams embedded; use `plantuml/` separately. |
| **9** | [plantuml/01_anonyig_architecture.puml](./plantuml/01_anonyig_architecture.puml) | PlantUML — AnonyIG sequence architecture |
| **10** | [plantuml/02_inflact_architecture.puml](./plantuml/02_inflact_architecture.puml) | PlantUML — Inflact component/data-flow architecture |
| **11** | [plantuml/03_fastvideosave_architecture.puml](./plantuml/03_fastvideosave_architecture.puml) | PlantUML — FastVideoSave sequence architecture |

---

## Raw Extracted Evidence Folders

All scraped client-side source scripts, bundles, and reverse-engineered assets are preserved in:
- [experiments/anonyig-analysis/](file:///d:/IGShortsREA/experiments/anonyig-analysis) (`index.html`, `app.js` 593KB, `link.chunk.js` 90KB)
- [experiments/fastvideosave-analysis/](file:///d:/IGShortsREA/experiments/fastvideosave-analysis) (`index.html` 81KB, `tool.js` 17KB)
- [experiments/inflact-analysis/](file:///d:/IGShortsREA/experiments/inflact-analysis) (`index.html` Cloudflare challenge dump)
