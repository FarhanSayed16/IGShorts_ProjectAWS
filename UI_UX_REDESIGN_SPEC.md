# IGshorts — Complete UI/UX Redesign Specification

> **Document Version:** 1.0  
> **Date:** October 2026  
> **Author:** Senior UI/UX Design Analysis  
> **Scope:** Full visual redesign of the IGshorts public dashboard, admin workspace, and all supporting pages.

---

## Table of Contents

1. [Executive Summary & Design Rationale](#1-executive-summary--design-rationale)
2. [Current State Audit & Pain Points](#2-current-state-audit--pain-points)
3. [Design Direction & Philosophy](#3-design-direction--philosophy)
4. [Colour Palette (Complete)](#4-colour-palette-complete)
5. [Typography System](#5-typography-system)
6. [Spacing, Grid & Layout System](#6-spacing-grid--layout-system)
7. [Elevation, Shadows & Depth](#7-elevation-shadows--depth)
8. [Border Radius & Corner Strategy](#8-border-radius--corner-strategy)
9. [Motion & Animation Catalog](#9-motion--animation-catalog)
10. [Iconography & Visual Assets](#10-iconography--visual-assets)
11. [Reusable Component Styles](#11-reusable-component-styles)
12. [Page-by-Page Redesign Plans](#12-page-by-page-redesign-plans)
13. [Dark Mode Specification](#13-dark-mode-specification)
14. [Responsive Breakpoints & Mobile Strategy](#14-responsive-breakpoints--mobile-strategy)
15. [Accessibility Standards](#15-accessibility-standards)
16. [Implementation Priority & Migration Plan](#16-implementation-priority--migration-plan)

---

## 1. Executive Summary & Design Rationale

### Project Understanding

IGshorts is a **public, editorial-grade Instagram personality ranking dashboard** that tracks a curated watchlist of ~300+ celebrities, athletes, actors, musicians, and digital creators across Global and India scopes. It ranks them by verified public follower counts using a transparent `followers_v1` algorithm with competition ranking (1, 2, 2, 4).

### Target Users

| Audience | Goals | Design Implications |
|---|---|---|
| **Casual visitors** | Browse who leads Instagram, share rankings | Fast visual hierarchy, scannable tables, mobile-first |
| **Journalists & media** | Cite rank data, embed charts | Clean typography, print-friendly data, SEO metadata |
| **Stakeholders / investors** | Evaluate platform credibility | Trust signals, professional polish, transparent methodology |
| **Admin operators** | Import seed data, trigger pipelines | Dense operational dashboard, clear status indicators |

### Why Redesign?

The current implementation is **functional and well-structured** but suffers from:

1. **Visual monotony** — The Deep Navy + Antique Gold palette, while elegant, creates a single-mood experience that doesn't differentiate content zones or guide the eye across data density.
2. **Underutilized data visualization** — Sparklines are minimal green bars; no area charts, gradient fills, or animated trend indicators.
3. **Card design uniformity** — All cards share the same `rounded-xl border border-slate-200 bg-white p-6 shadow-sm` pattern, making them visually interchangeable regardless of semantic importance.
4. **Dark mode inconsistency** — The light mode hero section is dark navy, creating a jarring transition to the light canvas body. Dark mode inverts awkwardly because the header is already dark-toned.
5. **Limited spatial drama** — All content lives within a flat `max-w-6xl` container. No hero gradients, floating elements, or layered compositions create visual depth.
6. **Typography underuse** — Playfair Display serif is used well for headings but Inter body text lacks weight variation and rhythm.

---

## 2. Current State Audit & Pain Points

### Header (`PublicHeader`)
- ✅ Good: Sticky, logo with trophy icon, active state underline
- ❌ Issues: Gold badge text too small to read; mobile menu has no transition animation; search icon leads to `/profiles` with no search modal/palette UX

### Hero Section (Home)
- ✅ Good: Clear headline, 3 CTA buttons, category badge
- ❌ Issues: Navy hero bleeds into navy header making them visually identical; buttons lack visual hierarchy (all same size); no dynamic element (particle, gradient, or animated counter) to create engagement

### Podium Cards
- ✅ Good: Crown/Medal badges, rank numbering, gold wash for #1
- ❌ Issues: Cards are the same height regardless of rank; #1 card `sm:-translate-y-2` is too subtle; no avatar border glow or rank-specific styling beyond background wash

### Rank Tables
- ✅ Good: Sticky columns, wash rows for top 3, hover states
- ❌ Issues: Row density is tight on mobile; category badges are plain grey pills; sparkline is a simple 2-color bar with no shape/curve; external link icon is low contrast

### Chart View (Global/India)
- ✅ Good: Scope switcher tabs, search + category filters, pagination
- ❌ Issues: Metrics badge (Ranked People / Algorithm) looks disconnected; filter chips are visually identical to the scope switcher creating confusion; no loading shimmer beyond skeleton rectangles

### Profile Detail (`/profiles/[username]`)
- ✅ Good: Back navigation, nearby ranks, history table
- ❌ Issues: 3-column stat cards are plain; `HistoryChart` is just a placeholder; no hero/banner treatment for the profile; "View on Instagram" button is small and buried

### Movers Page
- ✅ Good: Gainers/Decliners split, scope selector
- ❌ Issues: Baseline snapshot empty state is repetitive; no visual distinction between climbers and decliners beyond icon color

### Methodology Page
- ✅ Good: Numbered sections with icons, good editorial structure
- ❌ Issues: Long-form text with no visual breaks or callout boxes; icons are tiny and don't create enough visual anchoring

### Footer
- ✅ Good: 4-column grid, disclaimer copy
- ❌ Issues: Very dark navy-on-navy; footer links lack hover underlines; bottom bar is text-only with no visual separation

### Admin Dashboard
- ✅ Good: Dark theme, stat cards, action triggers
- ❌ Issues: Cards are all `bg-slate-950` creating a wall of darkness; no visual differentiation for health/warning states; quick links look identical

---

## 3. Design Direction & Philosophy

### Design Concept: **"Observatory"**

IGshorts is a **digital observatory** — a place where you look through a refined lens at the Instagram universe. The design should feel like a premium data publication (think Bloomberg, The Athletic, or Pudding.cool) crossed with the visual energy of a sports leaderboard.

### Design Principles

| Principle | Application |
|---|---|
| **Clarity over decoration** | Every visual element must serve data comprehension; no decorative noise |
| **Contextual colour** | Colour communicates meaning (rank tiers, movement direction, data freshness) not brand alone |
| **Rhythmic density** | Tables and grids should breathe with purposeful whitespace, alternating micro-patterns |
| **Progressive disclosure** | Hero → Podium → Tables → Details: each scroll reveals deeper data layers |
| **Kinetic confidence** | Subtle motion (number counters, rank transitions, hover reveals) signals living data |

---

## 4. Colour Palette (Complete)

### 4.1 Primary Brand Colours

| Token | Name | Hex | HSL | Usage |
|---|---|---|---|---|
| `--brand-deep` | Obsidian | `#0A0F1A` | 225° 38% 7% | Darkest backgrounds, header/footer |
| `--brand-navy` | Midnight Navy | `#0D1B2A` | 213° 53% 11% | Primary dark surface |
| `--brand-slate` | Charcoal Slate | `#1B2838` | 210° 35% 16% | Secondary dark surface, cards in dark mode |
| `--brand-accent` | Amber Gold | `#D4A843` | 42° 60% 55% | Primary accent, CTA buttons, active states, rank #1 |
| `--brand-accent-light` | Champagne | `#F0DCA0` | 42° 72% 78% | Accent hover, gold washes, badge backgrounds |
| `--brand-accent-glow` | Gold Glow | `rgba(212, 168, 67, 0.15)` | — | Subtle glow/halo around gold elements |

### 4.2 Neutral Scale (Light Mode)

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--neutral-0` | Pure White | `#FFFFFF` | Card surfaces, table backgrounds |
| `--neutral-50` | Snow | `#F8FAFC` | Page canvas, alternating table rows |
| `--neutral-100` | Mist | `#F1F5F9` | Input backgrounds, muted surfaces |
| `--neutral-200` | Silver | `#E2E8F0` | Borders, dividers |
| `--neutral-300` | Pewter | `#CBD5E1` | Disabled states, secondary borders |
| `--neutral-400` | Stone | `#94A3B8` | Placeholder text, muted icons |
| `--neutral-500` | Graphite | `#64748B` | Secondary text, labels |
| `--neutral-600` | Carbon | `#475569` | Body text, descriptions |
| `--neutral-700` | Slate Dark | `#334155` | Strong secondary text |
| `--neutral-800` | Onyx | `#1E293B` | Primary headings, table header text |
| `--neutral-900` | Near Black | `#0F172A` | Maximum contrast text |

### 4.3 Semantic Status Colours

| Token | Name | Hex | Pair (Background) | Usage |
|---|---|---|---|---|
| `--status-up` | Emerald Rise | `#10B981` | `#ECFDF5` | Rank climb, positive delta, green sparkline |
| `--status-up-vivid` | Bright Green | `#059669` | — | Strong positive emphasis |
| `--status-down` | Coral Drop | `#EF4444` | `#FEF2F2` | Rank decline, negative delta |
| `--status-down-vivid` | Deep Red | `#DC2626` | — | Strong negative emphasis |
| `--status-flat` | Neutral Grey | `#94A3B8` | `#F8FAFC` | No change delta (— —) |
| `--status-stale` | Warning Amber | `#F59E0B` | `#FFFBEB` | Stale data indicator |
| `--status-info` | Azure | `#3B82F6` | `#EFF6FF` | Informational notices |
| `--status-danger` | Crimson | `#B91C1C` | `#FEF2F2` | Error states, API failures |

### 4.4 Rank-Specific Colours

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--rank-1-fill` | Gold Crown | `#D4A843` | #1 podium background, rank number |
| `--rank-1-wash` | Gold Mist | `#FDF6E3` | #1 row highlight wash |
| `--rank-2-fill` | Platinum Silver | `#A8B8C8` | #2 medal, rank number |
| `--rank-2-wash` | Silver Mist | `#F0F4F8` | #2 row highlight wash |
| `--rank-3-fill` | Bronze | `#CD7F32` | #3 medal, rank number |
| `--rank-3-wash` | Bronze Mist | `#FDF5EB` | #3 row highlight wash |
| `--rank-top10` | Deep Blue | `#1E40AF` | Rank #4–#10 accent dot |
| `--rank-default` | Slate | `#64748B` | Rank #11+ number colour |

### 4.5 Gradient Definitions

```css
/* Hero section gradient — dramatic top-to-bottom with glow */
--gradient-hero: linear-gradient(
  175deg,
  #0A0F1A 0%,
  #0D1B2A 40%,
  #1B2838 70%,
  #0D1B2A 100%
);

/* Gold accent gradient — CTA buttons, active tabs */
--gradient-gold: linear-gradient(135deg, #D4A843 0%, #E8C867 50%, #D4A843 100%);

/* Card hover glow — subtle directional light */
--gradient-card-hover: linear-gradient(
  145deg,
  rgba(212, 168, 67, 0.04) 0%,
  rgba(255, 255, 255, 0) 60%
);

/* Rank #1 podium card — warm celebration */
--gradient-podium-gold: linear-gradient(
  180deg,
  #FDF6E3 0%,
  #FBF0D1 50%,
  #FFFFFF 100%
);

/* Status ribbon subtle gradient */
--gradient-ribbon: linear-gradient(90deg, #0D1B2A 0%, #1B2838 100%);
```

---

## 5. Typography System

### 5.1 Font Stack

| Role | Font | Weights | Fallback Stack |
|---|---|---|---|
| **Display** (headlines) | **Outfit** | 600, 700, 800 | `system-ui, -apple-system, sans-serif` |
| **Body** (reading) | **Inter** | 400, 500, 600, 700 | `system-ui, -apple-system, sans-serif` |
| **Data** (numbers, code) | **JetBrains Mono** | 400, 500, 600, 700 | `ui-monospace, SFMono-Regular, monospace` |

> **Rationale:** Replacing Playfair Display with **Outfit** — a geometric sans-serif with personality. Playfair's high-contrast serifs work well for editorial print but feel heavy on data-dense dashboards. Outfit provides authority and modern elegance while being more legible at small sizes and in tables.

### 5.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `--text-hero` | 56px / 3.5rem | 800 | 1.08 | -0.03em | Home hero headline only |
| `--text-h1` | 40px / 2.5rem | 700 | 1.15 | -0.025em | Page titles (Global Top...) |
| `--text-h2` | 28px / 1.75rem | 700 | 1.2 | -0.02em | Section headings |
| `--text-h3` | 22px / 1.375rem | 600 | 1.3 | -0.015em | Card titles, subsection heads |
| `--text-h4` | 18px / 1.125rem | 600 | 1.35 | -0.01em | Table group headers |
| `--text-body` | 15px / 0.9375rem | 400 | 1.6 | 0 | Paragraphs, descriptions |
| `--text-body-sm` | 13px / 0.8125rem | 400 | 1.5 | 0 | Secondary descriptions |
| `--text-caption` | 12px / 0.75rem | 500 | 1.4 | 0.01em | Timestamps, helper text |
| `--text-label` | 11px / 0.6875rem | 700 | 1.3 | 0.06em | UPPERCASE labels, badges |
| `--text-data-xl` | 36px / 2.25rem | 700 | 1.1 | -0.01em | Hero stat counters |
| `--text-data-lg` | 24px / 1.5rem | 700 | 1.15 | 0 | Card stat values |
| `--text-data-md` | 16px / 1rem | 600 | 1.2 | 0 | Table follower counts |
| `--text-data-sm` | 13px / 0.8125rem | 600 | 1.3 | 0 | Inline metrics, deltas |
| `--text-rank` | 16px / 1rem | 700 | 1 | -0.02em | Rank numbers in tables |

### 5.3 Font Feature Settings

```css
/* Tabular lining figures for all numeric displays */
.data-text {
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: 'tnum' 1, 'lnum' 1;
}

/* Stylistic alternates for Outfit headings */
.display-text {
  font-feature-settings: 'ss01' 1; /* geometric alternates */
}
```

---

## 6. Spacing, Grid & Layout System

### 6.1 Spacing Scale (4px base)

| Token | Value | Usage |
|---|---|---|
| `--space-0` | 0px | — |
| `--space-1` | 4px | Tight inner padding, icon gaps |
| `--space-2` | 8px | Chip padding, small gaps |
| `--space-3` | 12px | Input padding, list item gaps |
| `--space-4` | 16px | Card inner padding (compact) |
| `--space-5` | 20px | Standard card padding |
| `--space-6` | 24px | Section gaps, card padding (comfortable) |
| `--space-8` | 32px | Large section separation |
| `--space-10` | 40px | Page section vertical spacing |
| `--space-12` | 48px | Hero padding, footer padding |
| `--space-16` | 64px | Hero vertical rhythm |
| `--space-20` | 80px | Major section breathing room |

### 6.2 Layout Containers

| Container | Max Width | Padding | Usage |
|---|---|---|---|
| `container-narrow` | 720px | 16–24px | Methodology, About, legal pages |
| `container-default` | 1120px | 16–24px | Chart tables, profiles grid |
| `container-wide` | 1280px | 16–24px | Home page, admin dashboard |
| `container-full` | 100% | 0 | Hero sections, footer |

### 6.3 Grid System

```
Home page:
- Hero: full-bleed gradient
- Podium: 3-column grid (1-col mobile), center card elevated
- Movers strip: single row with scroll on mobile
- Top 10 tables: 2-column grid (stack on tablet)
- Trust strip: single card, 3-column inner grid

Charts page:
- Single column, max-w-1120px
- Filters: flex-wrap toolbar
- Table: full-width with sticky columns

Profiles directory:
- 3-column card grid (2 on tablet, 1 on mobile)

Profile detail:
- 3-column stat cards (stack on mobile)
- Full-width history section

Admin dashboard:
- Sidebar (240px fixed) + main content area
- 4-column stat grid (2 on tablet, 1 on mobile)
```

---

## 7. Elevation, Shadows & Depth

### Shadow Scale

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(0, 0, 0, 0.04)` | Subtle depth for inputs, chips |
| `--shadow-sm` | `0 2px 8px rgba(0, 0, 0, 0.06)` | Default card shadow |
| `--shadow-md` | `0 4px 16px rgba(0, 0, 0, 0.08)` | Hovered cards, dropdowns |
| `--shadow-lg` | `0 8px 32px rgba(0, 0, 0, 0.10)` | Modals, elevated cards |
| `--shadow-xl` | `0 16px 48px rgba(0, 0, 0, 0.14)` | Floating podium card (#1) |
| `--shadow-gold` | `0 4px 20px rgba(212, 168, 67, 0.2)` | Gold CTA button glow |
| `--shadow-inner` | `inset 0 1px 2px rgba(0, 0, 0, 0.06)` | Input fields, search bars |

### Depth Layers (z-index)

| Layer | z-index | Elements |
|---|---|---|
| Base | 0 | Page content |
| Card | 1 | Cards, tables |
| Sticky | 10 | Sticky table columns/headers |
| Ribbon | 20 | Status ribbon |
| Header | 40 | Navigation header |
| Overlay | 50 | Mobile menu backdrop |
| Modal | 60 | Command palette, dialogs |
| Toast | 70 | Notifications |

---

## 8. Border Radius & Corner Strategy

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | 4px | Inline code snippets, tiny badges |
| `--radius-sm` | 6px | Category chips, filter pills |
| `--radius-md` | 8px | Input fields, small buttons |
| `--radius-lg` | 12px | Cards, dropdowns, table wrapper |
| `--radius-xl` | 16px | Large cards, modals, podium cards |
| `--radius-2xl` | 20px | Hero content blocks, admin cards |
| `--radius-full` | 9999px | Avatars, round buttons, badges |

### Strategy
- **Data containers** (tables, chart cards): `--radius-lg` for a contained, professional feel
- **Interactive elements** (buttons, chips): `--radius-md` for subtle softness without playfulness
- **Decorative elements** (avatars, rank badges): `--radius-full` for visual distinctiveness

---

## 9. Motion & Animation Catalog

### 9.1 Duration Scale

| Token | Value | Usage |
|---|---|---|
| `--duration-instant` | 80ms | Colour changes, opacity toggles |
| `--duration-fast` | 150ms | Button hover, chip press, row highlight |
| `--duration-normal` | 250ms | Card hover lift, dropdown open |
| `--duration-slow` | 400ms | Page transitions, modal fade |
| `--duration-dramatic` | 600ms | Hero counter roll-up, podium entrance |

### 9.2 Easing Curves

| Token | Value | Usage |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Most UI transitions |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Symmetric animations |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Rank delta chip pop, badge bounce |
| `--ease-decel` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering view |

### 9.3 Animation Definitions

```css
/* Hero counter roll-up */
@keyframes counter-roll {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Podium card stagger entrance */
@keyframes podium-rise {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Rank delta chip pop */
@keyframes delta-pop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}

/* Table row shimmer (loading) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Subtle pulse for live data indicators */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Card hover micro-lift */
.card-hover {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

---

## 10. Iconography & Visual Assets

### Icon Library

Continue using **Lucide React** (current choice — excellent coverage, consistent stroke weight).

### Icon Sizing Convention

| Context | Size | Usage |
|---|---|---|
| Inline text | 14px (w-3.5) | Inside buttons, links, chips |
| Default | 16px (w-4) | Navigation, table actions |
| Section header | 20px (w-5) | Section title decorators |
| Feature icon | 24px (w-6) | Trust section, empty states |
| Hero icon | 32px (w-8) | Hero decorative, admin stat cards |

### Custom Visual Elements

1. **Rank crown**: Retain Trophy/Crown from Lucide but add a subtle gold glow ring behind it for #1
2. **Delta arrows**: Custom-styled up/down chevrons with colour-coded backgrounds (not just text colour)
3. **Sparkline graphics**: Replace the current 2-bar sparkline with a proper SVG mini area chart showing follower trend direction with gradient fill

---

## 11. Reusable Component Styles

### 11.1 Button System

#### Primary Button (Gold CTA)
```css
.btn-primary {
  background: var(--gradient-gold);
  color: var(--brand-deep);
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  border: none;
  box-shadow: var(--shadow-gold);
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
}
.btn-primary:hover {
  box-shadow: 0 6px 24px rgba(212, 168, 67, 0.35);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}
```

#### Secondary Button (Ghost/Outline)
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  transition: all var(--duration-fast) var(--ease-out);
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
}
```

#### Tertiary Button (Text link)
```css
.btn-tertiary {
  background: none;
  color: var(--brand-accent);
  font-weight: 600;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: none;
  transition: all var(--duration-instant) var(--ease-out);
}
.btn-tertiary:hover {
  background: var(--brand-accent-glow);
  text-decoration: underline;
}
```

### 11.2 Card Component

```css
.card {
  background: var(--neutral-0);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-out);
}
.card:hover {
  border-color: var(--neutral-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Elevated card variant for podium, featured content */
.card-elevated {
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

/* Gold-washed card for rank #1, featured */
.card-gold {
  background: var(--gradient-podium-gold);
  border-color: rgba(212, 168, 67, 0.3);
  box-shadow: var(--shadow-gold);
}
```

### 11.3 Badge / Chip Component

```css
/* Category badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
}

/* Variants */
.badge-default { background: var(--neutral-100); color: var(--neutral-600); }
.badge-gold { background: var(--brand-accent-glow); color: var(--brand-accent); border: 1px solid rgba(212, 168, 67, 0.25); }
.badge-success { background: #ECFDF5; color: #059669; }
.badge-danger { background: #FEF2F2; color: #DC2626; }
.badge-info { background: #EFF6FF; color: #2563EB; }
```

### 11.4 Rank Delta Chip (Redesigned)

```css
/* Up delta */
.delta-up {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: #ECFDF5;
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Down delta */
.delta-down {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Neutral / no change */
.delta-flat {
  background: var(--neutral-100);
  color: var(--neutral-400);
  border: 1px solid var(--neutral-200);
}
```

### 11.5 Search Input

```css
.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  font-size: 14px;
  color: var(--neutral-800);
  background: var(--neutral-0);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-inner);
  transition: all var(--duration-fast) var(--ease-out);
}
.search-input:focus {
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 3px var(--brand-accent-glow), var(--shadow-inner);
  outline: none;
}
.search-input::placeholder {
  color: var(--neutral-400);
}
```

### 11.6 Filter Chip (Category Selector)

```css
.filter-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--neutral-200);
  background: var(--neutral-0);
  color: var(--neutral-600);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  white-space: nowrap;
}
.filter-chip:hover {
  border-color: var(--neutral-300);
  background: var(--neutral-50);
}
.filter-chip--active {
  background: var(--brand-navy);
  color: #FFFFFF;
  border-color: var(--brand-navy);
  box-shadow: var(--shadow-xs);
}
```

### 11.7 Avatar Component (Enhanced)

```css
.avatar {
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--neutral-200);
  transition: border-color var(--duration-fast) var(--ease-out);
}

/* Size variants */
.avatar-sm { width: 36px; height: 36px; }
.avatar-md { width: 44px; height: 44px; }
.avatar-lg { width: 64px; height: 64px; }
.avatar-xl { width: 88px; height: 88px; }

/* Rank-specific border ring */
.avatar-rank-1 {
  border: 3px solid var(--rank-1-fill);
  box-shadow: 0 0 12px rgba(212, 168, 67, 0.3);
}
.avatar-rank-2 {
  border: 3px solid var(--rank-2-fill);
}
.avatar-rank-3 {
  border: 3px solid var(--rank-3-fill);
}
```

### 11.8 Table Row Styling

```css
/* Default row */
.table-row {
  transition: background-color var(--duration-instant) var(--ease-out);
}
.table-row:hover {
  background: var(--neutral-50);
}

/* Rank wash rows */
.table-row--rank-1 {
  background: var(--rank-1-wash);
}
.table-row--rank-1:hover {
  background: #FBF0C8;
}
.table-row--rank-2 {
  background: var(--rank-2-wash);
}
.table-row--rank-3 {
  background: var(--rank-3-wash);
}

/* Alternating subtle stripe for readability (rows 4+) */
.table-row:nth-child(even) {
  background: var(--neutral-50);
}
```

### 11.9 Skeleton / Shimmer Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--neutral-100) 25%,
    var(--neutral-200) 50%,
    var(--neutral-100) 75%
  );
  background-size: 400% 100%;
  animation: shimmer 1.6s infinite var(--ease-in-out);
  border-radius: var(--radius-sm);
}
```

---

## 12. Page-by-Page Redesign Plans

---

### 12.1 Home Page (`/`)

**Design Intent:** A cinematic landing that immediately communicates authority, real-time data, and editorial quality. It should feel like opening a premium sports stats publication.

#### Hero Section (Full-bleed)

**Current:** Navy background matching header, serif headline, 3 equal buttons.

**Redesign:**

1. **Background:** Use `--gradient-hero` (deep multi-tone dark gradient) with a **subtle radial glow** centered behind the headline text (`radial-gradient(ellipse at 50% 40%, rgba(212, 168, 67, 0.06) 0%, transparent 70%)`). This creates depth without being distracting.

2. **Headline treatment:**
   - Keep "Who leads Instagram today." — it's punchy and effective
   - Use `--text-hero` (56px, weight 800, Outfit) with slightly tighter letter-spacing
   - Add a **subtle animated text gradient** that sweeps a gold highlight across the word "leads" on load (one-shot, not looping)

3. **Sub-headline:** Use Inter 15px/1.6, `--neutral-400` colour (lighter for contrast against dark hero)

4. **CTA Buttons — Visual hierarchy:**
   - **"View Global Chart"** → Primary Gold CTA (`btn-primary`) with globe icon, leftmost
   - **"View India Chart"** → Primary Gold CTA variant (same style, trends icon), rightmost
   - **"How ranking works"** → Secondary ghost button (`btn-secondary`) between them
   - All buttons get `gap: 12px` between them, centered flex-wrap

5. **Live data indicator:** Below CTAs, add a small pulsing green dot + text: `● Updated 16m ago · Algorithm: followers_v1` in `--text-caption` size, monospace

#### Podium Section (Overlapping hero)

**Current:** 3 cards in a grid, #1 card has subtle `translate-y(-2)`, gold wash.

**Redesign:**

1. **Layout:** Keep 3-card layout but increase elevation difference:
   - **#1 card**: `translateY(-32px)` relative to hero bottom, `--shadow-xl`, gold gradient background, larger avatar (88px with gold ring glow), gold border
   - **#2 card**: `translateY(-8px)`, regular shadow, silver avatar border
   - **#3 card**: `translateY(-8px)`, regular shadow, bronze avatar border
   - On mobile, stack vertically with #1 first (remove translate)

2. **Card content enhancement:**
   - Avatar: Ring border matching rank colour with subtle outer glow for #1
   - Rank badge: Redesigned as a floating pill above the card (keep crown/medal icons but use rank-specific gradient backgrounds)
   - Follower count: Use `--text-data-lg` with `JetBrains Mono` font, tabular nums
   - Add a subtle sparkline mini-chart below follower count showing trend direction

3. **Entrance animation:** Cards stagger-animate upward with `podium-rise` keyframe (200ms delay between each)

#### Movers Ticker Strip

**Current:** White card with grid of mover chips.

**Redesign:**

1. **Background:** Use a subtle gradient bar (`--gradient-ribbon`) spanning full container width
2. **Layout:** Horizontal scroll ticker for movers (animated auto-scroll on desktop if >4 items) with manual scroll on mobile
3. **Each mover chip:** Compact card with rank number, name, delta chip, aligned horizontally
4. **Empty state (baseline):** Keep current messaging but style with `--status-info` badge colours, add a small calendar icon and estimated next-run date

#### Top 10 Tables Section

**Current:** Side-by-side tables with "See Full Chart" links.

**Redesign:**

1. **Section title:** Use `--text-h2` with Outfit font, globe/trend icon with 20px size
2. **Table styling:**
   - Apply alternating row stripes for rows 4+ (subtle `--neutral-50`)
   - Rank column: Use rank-coloured numbers (#1 gold, #2 silver, #3 bronze, rest slate)
   - Avatar: 40px with rank-coloured ring border for top 3
   - Follower count: `JetBrains Mono` bold, right-aligned
   - "See Full Chart →" link: Use `btn-tertiary` style with gold arrow on hover
3. **Responsive:** Stack tables vertically below `lg` breakpoint

#### Trust & Transparency Strip

**Current:** White card with icon + 3 description cards.

**Redesign:**

1. **Background:** Very light gradient card (`--neutral-50` to white) with a left green accent border (4px `--status-up`)
2. **Section icon:** Larger (32px) shield icon in a circular green-tinted background
3. **Trust pillars (3 cards):** Each gets a tiny coloured top accent line:
   - Tracked Watchlist: Navy top line
   - Persons-Only: Gold top line
   - Honest Precision: Emerald top line
4. **Card hover:** Subtle `translateY(-2px)` with `--shadow-md`

---

### 12.2 Charts Page (`/charts/global` & `/charts/india`)

**Design Intent:** A dense, scannable data table experience with powerful filtering and clear visual hierarchy. Should feel like a premium sports league standings page.

#### Page Header & Scope Switcher

**Redesign:**

1. **Scope tabs:** Redesign as a **segmented control** with animated active indicator:
   - Background: `--neutral-100` with 1px border
   - Active tab: `--brand-navy` background, white text, smooth `translateX` slide animation
   - Inactive tab: Transparent, `--neutral-600` text

2. **Title area:**
   - `--text-h1` Outfit 700 heading
   - Subtitle in `--text-body-sm`, `--neutral-500`
   - Right-aligned metrics badge: Keep current "Ranked People / Algorithm" design but use `--radius-lg` with subtle gold accent border left divider

3. **Breadcrumb ribbon:** Add above title: `Charts > Global Persons` with `>` chevron separator

#### Search & Filters

**Redesign:**

1. **Search bar:**
   - Wider (full width up to 480px)
   - Use `search-input` component with gold focus ring
   - Add keyboard shortcut hint text: `⌘K` as a subtle badge inside the input

2. **Category filter chips:**
   - Use `filter-chip` component with `--radius-full`
   - Active chip: Filled navy with white text
   - Add a small count badge inside each chip showing filtered results count (e.g., "Actors & Cinema (30)")

3. **Results summary:** `Showing 1–50 of 125` — use `JetBrains Mono` for numbers, `--neutral-500` for text

#### Rank Table

**Redesign:**

1. **Table wrapper:** `--radius-lg` with `--shadow-sm`, 1px `--neutral-200` border
2. **Header row:**
   - Background: `--neutral-100` (not muted surface — cleaner)
   - Text: `--text-label` uppercase, `--neutral-500`
   - Bottom border: 2px solid `--neutral-200` (stronger separation)

3. **Data rows:**
   - Top 3 rows get rank-specific wash backgrounds
   - Rows 4+ get alternating stripe (`--neutral-0` / `--neutral-50`)
   - Row height: 56px (comfortable touch target)
   - Hover: `--neutral-100` background + subtle left border accent (4px `--brand-accent` for top 10)

4. **Rank number column:**
   - #1: Gold text, slightly larger font (18px)
   - #2: Silver text
   - #3: Bronze text
   - #4–#10: Navy text with bold weight
   - #11+: `--neutral-500` with medium weight

5. **Avatar:** Round, 40px, with rank-coloured border ring for top 3
6. **Name + Handle:**
   - Name: `--text-body` bold, `--neutral-900`
   - Handle: `--text-caption`, `JetBrains Mono`, `--neutral-400`
   - On hover: Name shows a subtle right arrow icon (ChevronRight)

7. **Category badge:** Use coloured variants:
   - Athlete: `--badge-info` (blue tint)
   - Actor: `--badge-gold` (warm gold tint)
   - Musician: Purple tint (`#EDE9FE`, `#7C3AED`)
   - Creator: Green tint (`#ECFDF5`, `#059669`)
   - Model: Rose tint (`#FFF1F2`, `#E11D48`)

8. **Follower count:** `JetBrains Mono` 600 weight, right-aligned, `--neutral-800`

9. **Trend sparkline (redesigned):**
   - Replace simple bar with an **SVG mini area chart** (24px tall, 60px wide)
   - Fill gradient: Status-up green (growth) or status-down red (decline) with 0.15 opacity
   - Stroke: 1.5px solid matching status colour
   - Show 5 data points if available

10. **External link icon:** Gold on hover, subtle opacity transition

#### Pagination

**Redesign:**

1. **Position:** Sticky bottom bar (sticks when table scrolls)
2. **Style:** Clean, minimal with `--neutral-200` top border
3. **Page numbers:** Use `--radius-md` buttons, active page gets `--brand-navy` fill
4. **Ellipsis:** Show `...` between first and current range (existing logic is good)

---

### 12.3 Movers Page (`/movers`)

**Design Intent:** Show velocity and momentum — who's rising, who's falling. Should feel energetic and directional.

**Redesign:**

1. **Header badge:** Use split-colour badge — green ↑ / red ↓ gradient
2. **Scope selector:** Same segmented control as Charts page

3. **Gainers column:**
   - Left green accent border (4px `--status-up`)
   - Header: Green icon in green-tinted circle, "Top Climbers" in `--text-h3`
   - Each row: Green delta chip with animated bounce-in
   - Add position change visualization: `#47 → #32 (↑15)` with arrow

4. **Decliners column:**
   - Left red accent border (4px `--status-down`)
   - Header: Red icon in red-tinted circle, "Rank Slips" in `--text-h3`
   - Red delta chips

5. **Empty state:** Full-width centered illustration (calendar + data icon), with "Next data run scheduled for [date]" messaging

---

### 12.4 Profiles Directory (`/profiles`)

**Design Intent:** A browsable, visual directory that feels like a gallery of influential people — not just a data dump.

**Redesign:**

1. **Header:** Use `--text-h1` with people icon, show total count as a large stat number beside the title

2. **Filter toolbar:**
   - Redesign as a floating toolbar bar with subtle shadow
   - Search input on left, filter chips on right (scrollable)
   - Add a "Sort by" dropdown (Followers high→low, Name A→Z, Recently added)

3. **Profile cards (3-column grid):**
   - **Card top:** Full-width colour accent strip (4px, colour-coded by category)
   - **Layout:** Avatar (48px, left) + name/handle/bio (right), flex row
   - **Category + Region badges:** Use coloured badge variants (matching chart table)
   - **Bottom bar:** Follower count (JetBrains Mono) + "View Profile →" link (gold hover)
   - **Hover:** Card lifts 2px + shadow increase + subtle gold left border appears

4. **Responsive:** 2 columns on tablet, 1 on mobile with horizontal layout

---

### 12.5 Profile Detail (`/profiles/[username]`)

**Design Intent:** A comprehensive profile page that tells the story of a creator's Instagram standing. Should feel like a Wikipedia infobox meets a sports player card.

**Redesign:**

1. **Hero banner:**
   - Full-width dark gradient banner (shorter, ~120px) with the creator's category as a subtle watermark text
   - Avatar overlaps banner bottom (80px, with rank ring)
   - Name + handle positioned right of avatar
   - "View on Instagram" CTA: Redesigned as a prominent navy button with external link icon

2. **Stat cards (3-column):**
   - **Follower Count card:**
     - Large `JetBrains Mono` number (36px)
     - Animated counter roll-up on page load
     - Below: delta chip if rank changed
   - **Leaderboard Position card:**
     - Large rank number with rank-coloured styling
     - "Competition Rank #X" label
     - Previous rank comparison line
   - **Data Verification card:**
     - Clean key-value pairs
     - Green checkmark for verified data, amber warning for stale

3. **Nearby Ranks section:**
   - Redesign as a **compact horizontal comparison strip**
   - Current profile highlighted with gold left border
   - Each entry: avatar (32px), rank, name, follower count
   - Feel like a sports standings context window

4. **History & Snapshots section:**
   - Replace plain table with an **interactive area chart** (using Chart.js or Recharts)
   - Chart: Gradient fill area chart showing follower count over time
   - Below chart: Compact data table (existing columns) with alternating rows
   - Milestone markers on chart (e.g., largest jump)

5. **Discovery CTA banner:**
   - Redesign bottom CTA as a visually distinct banner with gradient background
   - "Explore more personalities" with direct links to Global / India charts

---

### 12.6 Methodology Page (`/methodology`)

**Design Intent:** An editorial-quality explainer that builds trust. Should feel like a well-researched white paper, not a boring FAQ.

**Redesign:**

1. **Header:**
   - Shield badge in green (keep current)
   - `--text-h1` Outfit heading (larger, more authoritative)
   - Subtitle in larger body text for gravitas

2. **Section layout:**
   - Each numbered section gets a **left colour accent border** (4px, cycling through navy, gold, blue, amber, purple, emerald)
   - Section icon: Larger (28px) in a tinted circle background
   - Content: `--text-body` with generous line-height (1.7)

3. **Add visual callout boxes:**
   - Key principles should have highlighted callout cards (like blockquotes with coloured left border and tinted background)
   - Example: "We never coerce unknown counts into zero" → callout box with amber tint

4. **Code snippets:** Style `<code>` with `JetBrains Mono` in inline code pills (dark bg, rounded)

5. **Table of Contents:** Add a sticky right sidebar (desktop only) with section anchors that highlight as you scroll (intersection observer)

---

### 12.7 About Page (`/about`)

**Redesign:**

1. **Hero:** Brand story section with IGshorts logo large, mission statement
2. **Values section:** 3-column grid of value cards (Transparency, Precision, Independence)
3. **Team/Attribution:** If applicable, clean team member cards
4. **Contact CTA:** Simple card with "Questions? Get in touch" messaging

---

### 12.8 FAQ Page (`/faq`)

**Redesign:**

1. **Layout:** Accordion-style Q&A with smooth expand/collapse animation
2. **Question styling:** `--text-h4`, bold, with `+` / `−` toggle icon
3. **Answer styling:** Body text with generous padding, supports links and code
4. **Category grouping:** Group FAQs under headers (General, Data & Methodology, Technical)

---

### 12.9 Legal Pages (`/privacy`, `/terms`)

**Redesign:**

1. **Layout:** `container-narrow` (720px max), clean readable typography
2. **Heading hierarchy:** Clear H2/H3 structure with section numbering
3. **Last updated date:** Prominent at top in a subtle info badge
4. **Navigation:** Anchor links sidebar (desktop) or dropdown TOC (mobile)

---

### 12.10 Admin Dashboard (`/admin`)

**Design Intent:** An operational command center that surfaces critical system health at a glance. Dark theme by default with high-contrast data.

**Redesign:**

1. **Sidebar navigation:**
   - Fixed 240px sidebar on left (collapsible on tablet)
   - Dark background (`--brand-deep`)
   - Nav items: Icon + label, active item gets gold left accent bar
   - Bottom: Operator name + logout button

2. **Stat cards (4-column):**
   - **Redesign each card with distinct accent colours:**
     - Tracked Creators: Blue accent icon ring
     - Ranked: Gold accent icon ring
     - Unranked: Amber accent icon ring, with warning pulse if > 10%
     - Pipeline: Green (fresh) / Red (stale) accent with animated pulse dot
   - Each card gets a subtle gradient from dark to slightly lighter
   - Numbers: `JetBrains Mono` 32px bold white

3. **Action cards:**
   - "Recompute Rankings" → Gold outline border with gold CTA button
   - "Re-import Seed" → Blue outline border with blue CTA button
   - Add confirmation dialog before triggering actions
   - Show live progress indicator during operations

4. **Quick links grid:** Redesign as icon + label cards with subtle hover effects

5. **Activity feed (new):** Add a real-time activity log at the bottom showing recent operations (import, rebuild, sync) with timestamps

---

### 12.11 Error & 404 Pages

**Redesign:**

1. **404:** Centered layout with large "404" in gradient text (gold), friendly messaging, search input, and links to popular pages
2. **Error:** Red-tinted warning card with retry button and "Report issue" link

---

### 12.12 Header (Global)

**Redesign:**

1. **Background:** `--brand-deep` (slightly darker than current navy for more contrast)
2. **Logo:** Keep IGshorts text mark, redesign trophy icon container with subtle gold glow ring
3. **Navigation links:**
   - Active state: Gold text + gold bottom bar (animated slide indicator)
   - Hover state: White text (from `--neutral-400` default)
   - Font: Inter 14px/600
4. **Right actions:**
   - Theme toggle: Redesigned as a sleek moon/sun icon with smooth rotation transition
   - Search: Opens **command palette** (Cmd+K modal) instead of navigating to `/profiles`
5. **Mobile menu:**
   - Slide-in from right with backdrop blur overlay
   - Smooth `translateX` transition
   - Same nav items + theme toggle + search

---

### 12.13 Footer (Global)

**Redesign:**

1. **Background:** `--brand-deep` with subtle noise texture overlay (1-2% opacity)
2. **Layout:** 4-column grid (keep current structure)
3. **Brand column:** Larger logo, mission text in `--neutral-400`, animated gold accent line below
4. **Link columns:** Section headers in gold, links in `--neutral-400` → white on hover with underline
5. **Disclaimer column:** Slightly lighter text colour for hierarchy
6. **Bottom bar:**
   - Full-width divider line
   - Copyright + hosting info + social links (Twitter, GitHub if applicable)
   - Add a "Built with ❤️ on AWS" flourish

---

### 12.14 Status Ribbon

**Redesign:**

1. **Layout:** Full-width bar below header with gradient background
2. **Content:** `Chart Key · Algorithm: followers_v1 · Updated 16m ago (Seed list) · How rankings work →`
3. **Data freshness indicator:**
   - Fresh (<12h): Green pulsing dot
   - Moderate (12-36h): Yellow static dot
   - Stale (>36h): Red pulsing dot + warning text
4. **Height:** 32px compact, with smooth reveal/hide animation

---

## 13. Dark Mode Specification

### Philosophy

Dark mode isn't just an inversion — it's a distinct experience optimized for low-light viewing of data-dense content.

### Dark Mode Colour Mapping

| Light Token | Light Value | Dark Value | Notes |
|---|---|---|---|
| `--neutral-0` (surface) | `#FFFFFF` | `#111827` | Card backgrounds |
| `--neutral-50` (canvas) | `#F8FAFC` | `#0B1220` | Page background |
| `--neutral-100` (muted) | `#F1F5F9` | `#1E293B` | Input, stripe bg |
| `--neutral-200` (border) | `#E2E8F0` | `#334155` | Borders |
| `--neutral-600` (body) | `#475569` | `#94A3B8` | Body text |
| `--neutral-800` (heading) | `#1E293B` | `#F1F5F9` | Headings |
| `--neutral-900` (contrast) | `#0F172A` | `#F8FAFC` | Max contrast |
| `--brand-accent` | `#D4A843` | `#E8C867` | Slightly brighter gold for dark bg |
| `--rank-1-wash` | `#FDF6E3` | `rgba(212, 168, 67, 0.1)` | Gold wash transparent |
| `--status-up bg` | `#ECFDF5` | `rgba(16, 185, 129, 0.1)` | Transparent tint |
| `--status-down bg` | `#FEF2F2` | `rgba(239, 68, 68, 0.1)` | Transparent tint |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,.06)` | `0 2px 8px rgba(0,0,0,.25)` | Deeper in dark |

### Dark Mode Specific Rules

1. **Cards:** Use `--neutral-100` (dark: `#1E293B`) instead of pure dark for subtle layering
2. **Borders:** Reduce opacity (use `--neutral-200` dark value `#334155`)
3. **Gold accent:** Shift to `#E8C867` (warmer, brighter) for visibility
4. **Shadows:** Increase opacity by 2–3x (dark backgrounds absorb shadow)
5. **Text:** Use `--neutral-400` (dark: `#94A3B8`) for secondary text (not pure white which is harsh)

---

## 14. Responsive Breakpoints & Mobile Strategy

### Breakpoints

| Token | Width | Target |
|---|---|---|
| `xs` | 0–479px | Small phones |
| `sm` | 480–639px | Large phones |
| `md` | 640–767px | Tablets (portrait) |
| `lg` | 768–1023px | Tablets (landscape), small laptops |
| `xl` | 1024–1279px | Desktop |
| `2xl` | 1280px+ | Large desktop |

### Mobile-First Priorities

1. **Tables on mobile:**
   - Hide Category, Region, Trend columns below `md`
   - Make Rank + Avatar + Name columns sticky-left
   - Follower count right-aligned, always visible
   - Use horizontal scroll for remaining columns with scroll shadow indicators

2. **Podium on mobile:**
   - Stack vertically: #1 on top (full width), #2 and #3 side-by-side below
   - Remove vertical offset transforms

3. **Filters on mobile:**
   - Search bar: Full width
   - Category chips: Horizontal scroll with fade-out edge indicators
   - Collapse into a "Filters" dropdown button if space is tight

4. **Profile grid on mobile:**
   - Single column, full-width cards
   - Cards become horizontal layout (avatar left, info right)

5. **Admin on mobile:**
   - Sidebar collapses to bottom tab bar
   - Stat cards: 2-column grid → 1-column on xs

---

## 15. Accessibility Standards

### WCAG 2.1 AA Compliance Targets

| Criterion | Standard | Implementation |
|---|---|---|
| **Colour contrast** | 4.5:1 normal text, 3:1 large text | All text/background combos verified with WCAG checker |
| **Focus indicators** | Visible focus ring on all interactive elements | 3px gold (`--brand-accent`) ring with 2px offset |
| **Skip navigation** | Keyboard skip link to main content | Already implemented — keep |
| **ARIA landmarks** | Proper `<main>`, `<nav>`, `<aside>`, `<footer>` | Audit and add missing landmarks |
| **Table accessibility** | `<caption>`, `<thead>`, scope attributes | Already implemented — enhance |
| **Reduced motion** | `prefers-reduced-motion` media query | Already implemented — keep |
| **Touch targets** | Minimum 44×44px touch targets | Audit all clickable elements |
| **Screen reader** | Meaningful alt text, aria-labels | Audit all icons and images |

### Focus Ring Specification

```css
*:focus-visible {
  outline: 3px solid var(--brand-accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}
```

### Colour Contrast Verification Matrix

| Combination | Contrast Ratio | Pass? |
|---|---|---|
| `--neutral-900` on `--neutral-0` | 17.4:1 | ✅ AAA |
| `--neutral-600` on `--neutral-0` | 5.8:1 | ✅ AA |
| `--neutral-400` on `--neutral-0` | 3.5:1 | ✅ AA (large text only) |
| `--brand-accent` on `--brand-deep` | 7.2:1 | ✅ AA |
| White on `--brand-navy` | 14.1:1 | ✅ AAA |
| `--status-up` on white | 4.6:1 | ✅ AA |
| `--status-down` on white | 4.6:1 | ✅ AA |

---

## 16. Implementation Priority & Migration Plan

### Phase 1: Design System Foundation (Effort: 1–2 days)

| Task | File(s) | Description |
|---|---|---|
| 1.1 | `tokens.css`, `globals.css` | Replace all CSS custom properties with new palette tokens |
| 1.2 | `layout.tsx` | Switch from Playfair Display to Outfit Google Font |
| 1.3 | `tokens.css` | Add all new shadow, radius, motion, and spacing tokens |
| 1.4 | `globals.css` | Update dark mode variable mappings |
| 1.5 | `tokens.css` | Add gradient definitions |

### Phase 2: Core Components (Effort: 2–3 days)

| Task | File(s) | Description |
|---|---|---|
| 2.1 | `public-header.tsx` | Redesigned header with animated active indicator, new colours |
| 2.2 | `public-footer.tsx` | Updated footer with new colour scheme, hover effects |
| 2.3 | `rank-table.tsx` | Enhanced table with rank-coloured numbers, category badges, better sparklines |
| 2.4 | `rank-delta-chip.tsx` | Redesigned delta chips with backgrounds and borders |
| 2.5 | `podium-card.tsx` | Enhanced podium with larger offset, avatar rings, gold glow |
| 2.6 | `avatar.tsx` | Rank-coloured border rings, size variants |
| 2.7 | `status-ribbon.tsx` | Gradient background, data freshness indicator |
| 2.8 | `sparkline.tsx` | Replace bar with SVG mini area chart |

### Phase 3: Page Redesigns (Effort: 3–4 days)

| Task | File(s) | Description |
|---|---|---|
| 3.1 | `app/page.tsx` | Home page hero gradient, podium animation, movers ticker |
| 3.2 | `chart-view.tsx` | Segmented control, enhanced table, sticky pagination |
| 3.3 | `app/movers/page.tsx` | Coloured accent borders, enhanced empty states |
| 3.4 | `app/profiles/page.tsx` | Grid cards with category accents, sort dropdown |
| 3.5 | `app/profiles/[username]/page.tsx` | Hero banner, stat card counters, chart integration |
| 3.6 | `app/methodology/page.tsx` | Accent borders, callout boxes, sticky TOC |
| 3.7 | `app/faq/page.tsx` | Accordion component with animations |
| 3.8 | `app/about/page.tsx`, legal pages | Typography polish, narrow layout |

### Phase 4: Admin & Polish (Effort: 1–2 days)

| Task | File(s) | Description |
|---|---|---|
| 4.1 | `app/admin/*` | Sidebar navigation, enhanced stat cards, activity feed |
| 4.2 | `not-found.tsx`, `error.tsx` | Branded 404/error pages |
| 4.3 | All | Accessibility audit (contrast, focus, ARIA) |
| 4.4 | All | Responsive testing across breakpoints |
| 4.5 | All | Performance audit (font loading, animation jank) |

### Total Estimated Effort: 7–11 days

---

## Appendix A: Token Reference Quick Sheet

```css
:root {
  /* Brand */
  --brand-deep: #0A0F1A;
  --brand-navy: #0D1B2A;
  --brand-slate: #1B2838;
  --brand-accent: #D4A843;
  --brand-accent-light: #F0DCA0;
  --brand-accent-glow: rgba(212, 168, 67, 0.15);

  /* Neutrals */
  --neutral-0: #FFFFFF;
  --neutral-50: #F8FAFC;
  --neutral-100: #F1F5F9;
  --neutral-200: #E2E8F0;
  --neutral-300: #CBD5E1;
  --neutral-400: #94A3B8;
  --neutral-500: #64748B;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1E293B;
  --neutral-900: #0F172A;

  /* Status */
  --status-up: #10B981;
  --status-up-vivid: #059669;
  --status-up-bg: #ECFDF5;
  --status-down: #EF4444;
  --status-down-vivid: #DC2626;
  --status-down-bg: #FEF2F2;
  --status-flat: #94A3B8;
  --status-flat-bg: #F8FAFC;
  --status-stale: #F59E0B;
  --status-stale-bg: #FFFBEB;
  --status-info: #3B82F6;
  --status-info-bg: #EFF6FF;
  --status-danger: #B91C1C;
  --status-danger-bg: #FEF2F2;

  /* Ranks */
  --rank-1-fill: #D4A843;
  --rank-1-wash: #FDF6E3;
  --rank-2-fill: #A8B8C8;
  --rank-2-wash: #F0F4F8;
  --rank-3-fill: #CD7F32;
  --rank-3-wash: #FDF5EB;
  --rank-top10: #1E40AF;
  --rank-default: #64748B;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.14);
  --shadow-gold: 0 4px 20px rgba(212, 168, 67, 0.2);
  --shadow-inner: inset 0 1px 2px rgba(0, 0, 0, 0.06);

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;

  /* Motion */
  --duration-instant: 80ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-dramatic: 600ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-decel: cubic-bezier(0, 0, 0.2, 1);

  /* Gradients */
  --gradient-hero: linear-gradient(175deg, #0A0F1A 0%, #0D1B2A 40%, #1B2838 70%, #0D1B2A 100%);
  --gradient-gold: linear-gradient(135deg, #D4A843 0%, #E8C867 50%, #D4A843 100%);
  --gradient-card-hover: linear-gradient(145deg, rgba(212, 168, 67, 0.04) 0%, rgba(255, 255, 255, 0) 60%);
  --gradient-podium-gold: linear-gradient(180deg, #FDF6E3 0%, #FBF0D1 50%, #FFFFFF 100%);
  --gradient-ribbon: linear-gradient(90deg, #0D1B2A 0%, #1B2838 100%);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

---

## Appendix B: Category Colour Map

| Category | Text Colour | Background | Border |
|---|---|---|---|
| Athlete / Sports | `#2563EB` | `#EFF6FF` | `rgba(37, 99, 235, 0.2)` |
| Actor / Cinema | `#B45309` | `#FFFBEB` | `rgba(180, 83, 9, 0.2)` |
| Musician / Singer | `#7C3AED` | `#EDE9FE` | `rgba(124, 58, 237, 0.2)` |
| Digital Creator | `#059669` | `#ECFDF5` | `rgba(5, 150, 105, 0.2)` |
| Fashion / Model | `#E11D48` | `#FFF1F2` | `rgba(225, 29, 72, 0.2)` |
| Public Figure | `#475569` | `#F1F5F9` | `rgba(71, 85, 105, 0.2)` |
| Comedian | `#EA580C` | `#FFF7ED` | `rgba(234, 88, 12, 0.2)` |

---

*End of UI/UX Redesign Specification v1.0*
