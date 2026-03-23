# TASKS.md — Recommended build plan

## Goal

Ship a local-first MVP as fast as possible with the smallest useful feature set.

---

## Phase 1 — App skeleton

### Tasks
- create Next.js app with TypeScript + Tailwind
- install and configure Drizzle
- set up SQLite database
- create base layout and nav

### Deliverables
- app boots locally
- top nav with links to Feed and Submit

### Exit criteria
- `npm run dev` works
- empty feed page renders

---

## Phase 2 — Database schema

### Tasks
- create `posts` table
- create `comments` table
- add migration and seed helpers

### Deliverables
- schema checked in
- migration command works

### Exit criteria
- DB can be created/reset locally

---

## Phase 3 — Provider parsing and URL validation

### Tasks
- implement provider detection
- implement URL normalization
- implement external ID extraction
- implement content type heuristics

### Deliverables
- provider modules:
  - `youtube`
  - `tiktok`
  - `instagram`

### Exit criteria
- known valid URLs parse correctly
- unsupported URLs fail clearly

---

## Phase 4 — Submit flow

### Tasks
- build `/submit` form
- build create-post action/endpoint
- optionally add “resolve link preview”
- save post with minimum fields

### Deliverables
- user can submit a supported URL and create a post

### Exit criteria
- created post exists in DB
- redirect succeeds

---

## Phase 5 — Feed page

### Tasks
- query posts newest-first
- build feed card component
- render basic provider info
- render local title and note
- render placeholder/fallback media area first

### Deliverables
- mixed-provider feed appears

### Exit criteria
- multiple posts render in one list

---

## Phase 6 — Embeds

### Tasks
- implement YouTube embed
- implement TikTok embed path
- implement Instagram embed path
- implement generic fallback card

### Deliverables
- supported common cases display embedded source content

### Exit criteria
- one working embed example per provider
- unsupported cases fail gracefully

---

## Phase 7 — Detail page

### Tasks
- build `/p/[postId]`
- show larger embed
- show full metadata
- show comment form and comment list

### Deliverables
- detail page works per post

### Exit criteria
- clicking from feed opens detail page

---

## Phase 8 — Comments

### Tasks
- add comment creation endpoint/action
- persist comments
- render comments on detail page
- render top comments preview on feed

### Deliverables
- full local discussion exists

### Exit criteria
- comment survives refresh
- comment count updates

---

## Phase 9 — Reactions

### Tasks
- implement post like/dislike/reaction increment
- implement comment reaction increment
- show updated counters in UI

### Deliverables
- reaction bars on posts and comments

### Exit criteria
- counts persist after refresh

---

## Phase 10 — Metadata enrichment

### Tasks
- add best-effort metadata resolution
- populate source title/author/thumbnail when available
- never block post creation on metadata failures

### Deliverables
- nicer cards for supported URLs

### Exit criteria
- at least some posts show real source metadata

---

## Phase 11 — Fake engagement tools

### Tasks
- add `/dev` or post-level dev controls
- seed fake comments
- bulk bump reaction counts

### Deliverables
- solo operator can simulate community activity

### Exit criteria
- one click can generate visible demo activity

---

## Phase 12 — Polish and safeguards

### Tasks
- empty states
- unsupported URL states
- loading states
- minimal error banners
- basic styling cleanup
- lazy load heavy embeds where practical

### Deliverables
- stable demo-ready build

### Exit criteria
- happy path and failure path both feel understandable

---

## Manual QA script

### Happy path
1. submit one YouTube URL
2. submit one TikTok URL
3. submit one Instagram URL
4. verify all appear in feed
5. open each detail page
6. add comment to each
7. click reactions
8. seed fake activity

### Failure path
1. paste unsupported URL
2. paste malformed URL
3. simulate metadata failure
4. verify app does not crash

---

## Stretch goals only if everything above is done

- click-to-load embeds for performance
- simple provider filters on feed
- duplicate post detection
- edit/delete controls for admin
- better seeded persona switching
