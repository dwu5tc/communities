# AGENTS.md — Implementation Guide for an AI Coding Agent

## Mission

Build a **minimal web MVP** for a mixed-provider content feed using official embeds and a tiny local discussion layer.

The app is not a social network clone and not a media scraper.  
It is a lightweight aggregator + discussion layer.

---

## Product requirements you must preserve

You must build:

1. a feed page
2. a detail page per post
3. a submit page
4. persistent comments
5. persistent reaction counts
6. lightweight demo/fake-engagement tooling

You must not introduce unnecessary scope.

---

## Hard constraints

1. **Use official embed approaches only.**
2. **Do not download or re-host source media.**
3. **Do not scrape private endpoints or reverse-engineer mobile APIs.**
4. **Do not require auth in v1.**
5. **Do not add complex infra.**
6. **Prefer graceful fallback cards over brittle hacks.**
7. **Keep the database tiny and denormalized.**
8. **Do not pull source-platform comments for MVP.**

---

## Technical constraints

- Use Next.js App Router
- Use TypeScript
- Use Tailwind
- Use Drizzle + SQLite
- Keep code readable and modular
- Minimize dependencies
- Avoid over-abstraction

---

## Priorities in order

1. end-to-end working flow
2. reliability
3. simple code
4. provider fallback behavior
5. metadata enrichment
6. visual polish

---

## Architectural rules

### Rule 1 — isolate provider logic

All provider-specific parsing and embed logic must live under a provider layer.

Do not scatter TikTok/YouTube/Instagram URL logic through components.

### Rule 2 — separate local app data from source data

Use naming like:

- `localTitle`
- `localNote`
- `sourceTitle`
- `sourceAuthor`

Avoid ambiguous field names like just `title`.

### Rule 3 — tolerate partial data

A post can still be valid if:

- provider is recognized
- original URL is valid
- metadata fetch failed

Do not make metadata perfection a blocker.

### Rule 4 — keep reactions simple

Reactions are counters, not identity-aware events.

### Rule 5 — comments are flat

Do not add nested replies unless explicitly asked later.

---

## Functional assumptions you should make without asking

- single global feed
- newest-first feed ordering
- oldest-first comments on detail page
- duplicates allowed
- alias defaults to `anon`
- dev seeding tools can live behind an env flag or `/dev`

---

## UI expectations

Keep the UI clean and simple.

Minimum screens:

### Feed `/`
- header
- submit CTA
- list of feed cards
- each card shows embed, metadata, reactions, comments preview

### Submit `/submit`
- URL input
- optional local title
- optional local note
- optional alias
- submit button

### Detail `/p/[postId]`
- embed
- metadata
- reactions
- full comments
- add comment form
- optional dev tools

---

## Reaction model

Use direct counters on `posts` and `comments`.

Suggested default reaction keys:
- `fire`
- `heart`
- `thinking`
- `skull`

Also include:
- `likeCount`
- `dislikeCount`

Store emoji reaction counters in JSON.

---

## Data quality rules

When resolving a URL:

1. normalize it
2. identify provider
3. extract external ID if possible
4. derive content type if possible
5. attempt metadata
6. attempt embed
7. store result

Always store:
- `provider`
- `originalUrl`
- `canonicalUrl` when available
- `externalId` when available

---

## Embed behavior rules

### YouTube
Prefer iframe URL rendering.

### TikTok
Prefer official embed HTML/script rendering.
Be ready for client-side hydration needs.

### Instagram
Prefer official embed HTML/oEmbed rendering.
Be ready for public-only restrictions and disabled embeds.

### Fallback
If official embed cannot render:
- show preview/fallback card
- preserve detail page
- include outbound source link

---

## Coding guidelines

- keep functions small
- prefer explicit types
- use zod only if it clearly helps; do not introduce heavy ceremony
- do not optimize prematurely
- leave concise comments only where helpful
- favor boring code over clever code

---

## Suggested milestones

### Milestone 1
Scaffold project and DB

### Milestone 2
Submit flow with provider detection

### Milestone 3
Feed rendering

### Milestone 4
Detail page and comments

### Milestone 5
Reactions

### Milestone 6
Provider metadata enrichment

### Milestone 7
Dev seeding tools

### Milestone 8
Fallback and polish

---

## Definition of success

The app is successful when all of the following work locally:

- create post from supported URL
- view post on feed
- open detail page
- add comments
- increment reactions
- seed fake activity
- survive provider-specific failures without crashing

---

## Things you should not spend time on

Do not spend time on:

- auth
- dashboards
- pagination optimization
- ranking systems
- nested comments
- moderation systems
- fancy animations
- fully custom media players
- recreating native source-app UX

---

## If platform behavior is inconsistent

Prefer this order of decisions:

1. official embed that works
2. official metadata + fallback card
3. reject unsupported case clearly

Never invent an unsupported player workaround that risks policy issues.
