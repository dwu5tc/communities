# PRD — Content Layer MVP

## 1. Summary

Build a very small web product where a user can submit links to content from YouTube, TikTok, and Instagram, then browse that content in a single aggregated feed and discuss it locally.

The product should feel like:

- a mixed feed of embedded source content
- a local discussion layer on top of that content
- a detail page per content item, similar to a small Reddit thread

This is an MVP, so the implementation should optimize for:

- lowest build complexity
- official embed support
- minimum moving parts
- local discussion and reaction features
- easy manual seeding/fake engagement for demos

---

## 2. Goals

### Primary goals

1. Let a user paste a supported content URL and create a post.
2. Show submitted posts in an aggregated listing/feed.
3. Embed playable/viewable source content inside the app where supported.
4. Allow local likes/dislikes/reactions and comments on each post.
5. Allow a detail page with full discussion.
6. Allow one operator to fake community activity for demo purposes.

### Secondary goals

1. Fetch basic source metadata when feasible:
   - original title/caption
   - original creator/account name
   - thumbnail/preview
   - provider/platform label
2. Support both long-form and short-form video where possible.
3. Support photo/image posts where supported by the provider.

---

## 3. Non-goals

These are explicitly out of scope for MVP:

- real user authentication
- moderation tooling beyond basic delete/reset
- syncing official source comments/likes from YouTube/TikTok/Instagram
- posting back to source platforms
- scraping unofficial/private APIs
- full search, ranking, recommendation, or personalization systems
- multi-community architecture
- notifications
- mobile native app
- advanced analytics
- content ingestion at scale
- creator dashboards

---

## 4. Target user

For MVP, the target user is effectively **the builder/tester**.

The user wants to:

- save a link from YouTube / TikTok / Instagram
- browse all saved items in one place
- see embeds inline
- write opinions/discussion around each item
- simulate multiple users and activity for demos

---

## 5. Product principles

1. **Official embeds first.**  
   Never re-host source media.

2. **Discussion belongs to our app.**  
   Source-platform comments are not required for MVP.

3. **Graceful fallback beats fragile hacks.**  
   If an embed or metadata fetch fails, store the link and render a fallback card with outbound link.

4. **One-person demoability matters.**  
   The operator should be able to generate fake comments/reactions without real users.

5. **Web-first.**  
   Do not optimize for native-app parity in v1.

---

## 6. MVP feature set

## 6.1 Feed / listing page

Route: `/`

Shows a chronological feed of submitted content cards.

Each card includes:

- embedded content or preview/fallback
- provider badge: YouTube / TikTok / Instagram
- content type label where known:
  - video
  - short video
  - image/photo
- post title (local title entered by submitter)
- optional submitter note/comment
- source metadata if available:
  - source title/caption
  - source creator/account
- local reaction bar:
  - like
  - dislike
  - 3–5 emoji reactions
- top local comments preview (e.g. first 2 or top 2)
- comment count
- link to dedicated detail page

Sort order for MVP:
- newest first

No ranking algorithm in v1.

### Feed acceptance criteria

- A newly submitted supported URL appears in the feed.
- A feed card renders an embed when supported and available.
- A feed card still renders a usable fallback if embed hydration fails.
- Reactions update visibly.
- Top comments preview renders when comments exist.

---

## 6.2 Detail page

Route: `/p/[postId]`

Shows:

- full embedded content
- local title
- local submitter note/comment
- provider/source metadata
- reaction controls
- full local comment thread
- add-comment form
- simple admin/dev tools for seeding demo activity

### Detail page acceptance criteria

- Opening a post from the feed lands on a dedicated page.
- The same source content is viewable here in larger format.
- All comments for the post are visible.
- New comments can be added.
- Reactions can be added from this page.

---

## 6.3 Submit page

Route: `/submit`

Simple form:

- source URL (required)
- local title (optional but recommended)
- local note/comment (optional)
- optional display name / alias (default: `anon`)
- submit button

On submit:

1. validate URL
2. detect provider
3. attempt metadata resolution
4. attempt embed resolution
5. save post
6. redirect to detail page or feed

### Submit acceptance criteria

- User can paste a valid supported URL.
- Invalid or unsupported URLs show a clear error.
- Metadata fetch failure does not block post creation if the URL itself is valid and embeddable or at least storable as a fallback link.
- User lands on a successful state after creation.

---

## 6.4 Local reactions

For MVP, local reactions belong to **our app only**.

Supported actions:

- like
- dislike
- emoji reactions (e.g. fire, heart, thinking, skull)

MVP behavior:

- no identity enforcement
- no dedupe by user
- one click increments the chosen counter
- same operator can click repeatedly for demo purposes

### Acceptance criteria

- Counters increment immediately.
- Refresh preserves counts.
- Works on both posts and comments.

---

## 6.5 Local comments

Comments are app-local, not source-platform comments.

Fields:

- display name / alias
- body
- created time

MVP rules:

- flat comments only
- no nested replies in v1
- newest first or oldest first; choose one and keep it consistent  
  **Recommendation:** oldest first for readability on detail page.

Feed preview:
- show first 2 comments by oldest-first or top-by-score if scoring exists  
  **Recommendation:** just show first 2 oldest comments for simplicity.

---

## 6.6 Demo / fake engagement tools

Because MVP may only have one real operator, include lightweight dev/admin tools.

Required capability:

- add seed comments under fake aliases
- bulk increment post reactions
- bulk increment comment reactions

Possible UI:

- a hidden `/dev` page
- or dev panel on detail page behind a query param or environment flag

Suggested fake aliases:

- `fitcheck99`
- `archivenerd`
- `selvedgeszn`
- `runwaylurker`
- `anon`

This is explicitly for demoing community behavior.

---

## 7. Functional requirements

## 7.1 Supported providers

### Required in MVP

- YouTube video links
- YouTube Shorts links
- TikTok video links
- Instagram post/reel links

### Nice-to-have / opportunistic

- Instagram image/photo posts
- TikTok photo posts if official embed supports them cleanly

### Not required

- YouTube Community posts
- carousel/multi-image edge cases
- Stories / ephemeral content
- private content

---

## 7.2 URL handling

The system must:

- parse and normalize URLs
- detect provider
- extract canonical content ID where possible
- store original URL and canonical URL
- reject obviously unsupported URLs

---

## 7.3 Metadata handling

The system should try to resolve:

- source title/caption
- source creator/account name
- thumbnail URL
- provider
- content type
- canonical URL

If metadata cannot be fetched:

- allow manual title only
- still create the post if the URL is otherwise valid

---

## 7.4 Embed handling

The system should use official embed patterns or provider-provided embed HTML where available.

If embed rendering fails at runtime:

- show a structured fallback with:
  - provider
  - title
  - source URL
  - “Open original” button

---

## 8. UX requirements

## 8.1 Visual style

Keep the UI plain and functional.

Recommended style:

- dark or neutral feed
- cards with generous spacing
- sticky top nav with:
  - Feed
  - Submit
- large embed region
- compact metadata row
- reaction row
- comments preview

Do not over-design v1.

## 8.2 Feed card layout

Suggested order:

1. provider badge + type
2. local title
3. source metadata line
4. embed region
5. local note/comment
6. reaction row
7. comment preview
8. “Open discussion” CTA

## 8.3 Detail layout

Suggested order:

1. breadcrumb/back
2. local title
3. source metadata
4. main embed
5. local note/comment
6. reaction row
7. comment composer
8. full comments
9. optional dev tools

---

## 9. Data and content model

At minimum, the app needs persistent storage for:

- posts
- comments
- post reaction counts
- comment reaction counts

There is no need for:

- user accounts
- sessions tied to real identities
- media storage
- blob storage

---

## 10. Success criteria for MVP

The MVP is successful if all of the following are true:

1. You can submit at least one YouTube link, one TikTok link, and one Instagram link.
2. Each appears in the same feed.
3. At least the common supported cases render in embedded form.
4. Every post has a working detail page.
5. You can add comments and reactions.
6. You can fake activity quickly enough to demo the product alone.
7. The app works locally with minimal setup.

---

## 11. Risks and constraints

## 11.1 Provider/platform constraints

- embed behavior differs by provider
- some content may not be embeddable
- some metadata APIs may require app setup or permissions
- some public content may still disable embeds
- autoplay/fullscreen/control behavior will be inconsistent across providers

## 11.2 Product constraints

- mixed-provider feed will not feel identical to each native app
- dynamic embed scripts can be finicky in SSR/React environments
- unsupported edge cases must fail gracefully

## 11.3 Compliance/product posture

This MVP must behave like:

- a link-and-discussion layer
- not a media re-host
- not a clone of source engagement systems
- not a scraper of private platform data

---

## 12. Open questions resolved for MVP

### Q: Do we need auth?
No.

### Q: Do we need real per-user reaction tracking?
No.

### Q: Do we need source comments?
No.

### Q: Do we need communities/spaces now?
No.  
Single global feed first.

### Q: Do we need image support across every provider?
No.  
Support it where embed support is clean; otherwise fall back.

### Q: Do we need a mobile app now?
No.  
Web only.

---

## 13. Scope cuts if time is tight

Cut in this order:

1. emoji reactions on comments
2. fake engagement UI
3. image/photo support edge cases
4. metadata enrichment
5. comment preview on feed

Must keep:

- submit link
- feed
- detail page
- at least basic comments
- at least like/dislike counts
- at least one supported embed path per provider

---

## 14. MVP definition of done

The product is done when:

- the app boots locally
- the DB can be initialized with one command
- a user can submit supported content links
- the feed renders posts from multiple providers
- detail pages work
- comments and reactions persist
- fake engagement tools exist
- unsupported cases fail clearly and safely
