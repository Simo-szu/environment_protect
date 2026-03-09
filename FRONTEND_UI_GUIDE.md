# YouthLoop Frontend UI Guide

## Purpose

This document defines the current frontend UI system for the YouthLoop website and provides a stable reference for future UI refinement.

It is based on the actual code in `apps/web/src/app/[locale]` and shared components in `apps/web/src/components`.

Goals:

- preserve YouthLoop brand recognition
- keep page-specific theme roles stable
- improve cross-page consistency
- reduce one-off visual decisions
- make future UI changes easier to review

## Brand Color Rules

Do not replace the core brand hues.

- Primary green: `#56B949`
- Warm orange: `#F0A32F`
- Trust blue: `#30499B`
- Action red: `#EE4035`

Allowed adjustments:

- opacity
- soft background tints
- subtle borders
- hover states
- shadow color
- gradient layering using the same hue family

Not allowed:

- introducing a new primary palette
- replacing page theme colors with gray-first or desaturated systems
- changing page identity by moving it to another main color family

## Page Theme Roles

Each page keeps a stable theme role.

- Home: green-led, blue support, orange accent
- Science: blue-led, green support
- Activities: green-led, small orange/red accents
- Game: green-led, blue support
- Points: orange-led, green support
- Global navigation and brand shell: blue + green

## Shared UI Foundation

The global style layer lives in:

- `apps/web/src/app/globals.css`
- `apps/web/src/components/Layout.tsx`
- `apps/web/src/components/ui/AuthenticatedHeader.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/Pagination.tsx`

### Shared CSS Utilities

The current UI system uses these reusable primitives:

- `.yl-page-surface`
  - page-level soft gradient section background
  - used for content areas below hero sections
- `.yl-panel`
  - primary glass panel
  - large radius, soft border, medium blur, elevated shadow
- `.yl-panel-soft`
  - lighter card treatment for smaller blocks
- `.yl-hover-card`
  - standard hover lift and shadow enhancement
- `.yl-chip`
  - rounded pill for badges, inline sub-labels, supporting copy
- `.yl-section-kicker`
  - small uppercase label above section titles
- `.yl-section-title`
  - section title scale and tracking
- `.yl-section-copy`
  - supporting text tone and line height

### Global Shape and Elevation

Use these as defaults:

- Hero / major panels: `rounded-[2rem]`
- Standard content panels: `rounded-[1.75rem]` to `rounded-[1.9rem]`
- Soft cards / list cards: `rounded-[1.5rem]` to `rounded-[1.6rem]`
- Buttons and chips: `rounded-full`

Shadow language:

- soft, large-radius product shadows
- avoid harsh black shadows
- tint shadows with existing brand families when emphasis is needed

Border language:

- prefer white or low-opacity brand borders
- dark mode should use low-opacity white borders

### Spacing System

Recommended spacing rhythm:

- Hero top/bottom: `py-12` to `py-14`
- Major page sections: `py-12`
- Section gaps: `space-y-16`
- Panel padding: `p-6`, `sm:p-8`
- Inline chip/button gap: `gap-2` or `gap-3`

## Navigation System

Primary file:

- `apps/web/src/components/ui/AuthenticatedHeader.tsx`

Rules:

- keep the shell blue/green
- navbar should feel stable, premium, and not page-themed
- active nav state uses green/blue emphasis, not page-specific recolors
- search and language controls use soft glass treatment
- desktop and mobile nav should share the same border radius and surface logic

## Buttons

Primary file:

- `apps/web/src/components/ui/button.tsx`

Rules:

- default CTA: blue
- secondary CTA: green
- destructive CTA: red
- outline CTA: white glass / neutral surface
- avoid square buttons unless the component is explicitly icon-only
- hover should lift slightly instead of only changing color

## Cards and Panels

Primary file:

- `apps/web/src/components/ui/card.tsx`

Rules:

- cards should read as product panels, not plain white boxes
- use glassmorphism lightly, not heavily blurred everywhere
- keep panel edges soft and consistent
- keep internal spacing generous
- cards should not rely on large color fills unless they are deliberate focal cards

## Hero Design Rules

A Hero should feel like one intentional surface, not nested disconnected surfaces.

Use this pattern:

- one major rounded container
- subtle brand-tinted background gradients
- one badge line
- one clear title line
- one restrained subtitle or chip group
- supporting chips only if they help scanability

Title rules:

- large, but not oversized versus other major pages
- tight but not compressed tracking
- use `font-semibold` or `font-medium` depending on density
- avoid visually heavy or bloated Chinese titles

Subtitle rules:

- lighter color than title
- slightly smaller than body headline text
- use chips or inline support bars only when alignment is stable

## Page-by-Page Reference

### Home

Primary file:

- `apps/web/src/app/[locale]/page.tsx`

Current role:

- brand gateway
- cross-product navigation hub

UI direction:

- green-first atmosphere
- blue for structure and trust
- orange for small highlights

Key patterns:

- large hero card
- interactive entry cards
- curated sections for content, activities, points, game

### Science

Primary file:

- `apps/web/src/app/[locale]/science/page.tsx`

Current role:

- editorial / knowledge product page

UI direction:

- blue-led hero and titles
- green support for eco framing

Key patterns:

- blue-led hero surface
- tips cards
- article list cards with softer editorial density

Detail page:

- `apps/web/src/app/[locale]/science/[id]/page.tsx`

Should continue the editorial tone rather than becoming a generic dashboard page.

### Activities

Primary files:

- `apps/web/src/app/[locale]/activities/page.tsx`
- `apps/web/src/app/[locale]/activities/[id]/page.tsx`
- `apps/web/src/app/[locale]/activities/register/page.tsx`

Current role:

- community participation and action conversion

UI direction:

- green-led
- red/orange only as emphasis accents

Key patterns:

- green hero
- action entry cards
- list cards with status labels
- detail pages with readable content blocks and clear signup paths

Rules:

- signup CTA must remain obvious
- title and status hierarchy must be stronger than decorative imagery
- activity content should not break layout when backend HTML is injected

### Game

Primary entry file:

- `apps/web/src/app/[locale]/game/page.tsx`

Additional pages:

- `apps/web/src/app/[locale]/game/tutorial/page.tsx`
- `apps/web/src/app/[locale]/game/leaderboard/page.tsx`
- `apps/web/src/app/[locale]/game/tech-tree/page.tsx`
- `apps/web/src/app/[locale]/game/archive/page.tsx`
- `apps/web/src/app/[locale]/game/play/page.tsx`

Current role:

- strategy/simulation product experience

UI direction:

- green-led with blue structure support
- should feel more immersive, but still belong to YouthLoop

Rules:

- do not drift into unrelated neon palettes
- keep simulation seriousness without losing eco identity
- game entry page can be more cinematic than the rest of the site
- avoid touching in-progress gameplay files unless the task explicitly requires it

### Points

Primary files:

- `apps/web/src/app/[locale]/points/page.tsx`
- `apps/web/src/app/[locale]/points/history/page.tsx`
- `apps/web/src/app/[locale]/points/exchange/page.tsx`

Current role:

- rewards and motivation system

UI direction:

- orange-led
- green support to connect action and eco outcomes

Rules:

- title scale should stay consistent with other heroes
- subtitle chips must align perfectly
- reward interfaces should feel warm and optimistic, not childish

## Secondary and Utility Pages

These pages should inherit the shared system instead of inventing new layouts:

- profile
- profile edit
- login
- register
- forgot password
- notifications
- likes
- favorites
- my activities
- host activities
- host verification
- contact
- help
- feedback
- privacy
- terms
- search
- admin

Default treatment:

- use shared header shell
- use `.yl-panel` or `.yl-panel-soft`
- use consistent section title structure
- avoid custom card radius/shadow combinations without reason

## Rich Text Content Rules

Activity detail currently uses `.activity-richtext`.

Rules:

- backend HTML must be visually normalized
- images should never blow out layout width or height
- `section` blocks inside injected content need a controlled container treatment
- headings inside injected content should follow the product title rhythm

## Interaction Rules

Hover:

- prefer gentle lift plus border/shadow refinement
- do not use aggressive scale unless the element is intentionally playful

Motion:

- short, smooth, reliable
- motion should support clarity, not call attention to itself

Transitions:

- standard duration target: `300ms`
- longer only for hero image transforms or atmospheric background motions

## Consistency Checklist

When editing any page, check:

- does the page still follow its assigned theme role
- are brand hues unchanged
- are panel radii consistent with the shared system
- are shadows soft and product-like
- do Hero titles match the global size hierarchy
- do section titles use the same visual rhythm
- are buttons using shared button logic unless there is a strong reason not to
- do hover states feel smoother rather than louder
- does the page still work in dark mode

## Implementation Notes

For future work:

- prefer extending the shared primitives before introducing per-page one-off classes
- if a page needs a special visual treatment, document why
- when refining a page, preserve API usage, routing, and page structure unless functional changes are also requested

## Current Scope Covered

This guide reflects the current UI refinement work applied to:

- shared shell and controls
- home
- science
- activities
- game entry
- points

It should be updated whenever another major page family is visually refactored.
