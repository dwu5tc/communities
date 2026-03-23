# TECH_SPEC — Content Layer MVP

## 1. Technical choices

## 1.1 Stack

Recommended stack for fastest MVP:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Drizzle ORM
- SQLite via `better-sqlite3` for local-first MVP

Why:

- lowest infra overhead
- minimal backend ceremony
- easy local setup
- easy server rendering + route handlers
- works well for an agent-driven build

### Deployment note

For local prototype:
- SQLite is fine.

For hosted demo:
- easiest upgrade path is to move the same schema to Turso/libSQL or Postgres later.
- do not optimize deployment infra in v1 unless needed.

---

## 1.2 Architecture style

Use a simple monolith:

- Next.js pages/routes for UI
- route handlers or server actions for writes
- one DB
- provider utilities for URL parsing / embed resolution / metadata resolution

No queues, workers, or background jobs.

---

## 2. App routes

### UI routes

- `/` — feed
- `/submit` — create post
- `/p/[postId]` — detail page
- `/dev` — optional dev/demo utilities

### Route handlers / server endpoints

Recommended:

- `POST /api/resolve-link`
  - validates URL
  - detects provider
  - attempts metadata + embed resolution preview

- `POST /api/posts`
  - creates post

- `POST /api/posts/[postId]/react`
  - increments post reaction counts

- `POST /api/posts/[postId]/comments`
  - adds a comment

- `POST /api/comments/[commentId]/react`
  - increments comment reaction counts

- `POST /api/dev/seed-post`
  - bulk-create comments or reaction counts for demo

You may replace some of these with server actions if preferred, but the boundaries above should remain conceptually the same.

---

## 3. Domain model

## 3.1 Post

Purpose:
Stores one submitted content item plus local discussion metadata.

Suggested fields:

- `id`
- `provider` — `youtube | tiktok | instagram`
- `contentType` — `video | short_video | image | unknown`
- `originalUrl`
- `canonicalUrl`
- `externalId` — provider content identifier when parseable
- `localTitle`
- `localNote`
- `submittedByAlias`
- `sourceTitle`
- `sourceAuthor`
- `sourceThumbnailUrl`
- `embedKind` — `iframe_url | html | unsupported`
- `embedUrl`
- `embedHtml`
- `isEmbeddable`
- `likeCount`
- `dislikeCount`
- `reactionCountsJson`
- `commentCount`
- `createdAt`
- `updatedAt`

Notes:

- `reactionCountsJson` can be a JSON string/object such as:
  `{ "fire": 3, "heart": 2, "thinking": 1, "skull": 0 }`
- `commentCount` can be denormalized for simplicity.

## 3.2 Comment

Suggested fields:

- `id`
- `postId`
- `displayName`
- `body`
- `likeCount`
- `dislikeCount`
- `reactionCountsJson`
- `createdAt`
- `updatedAt`

No nesting in v1.

---

## 4. Database schema strategy

Keep schema denormalized and simple.

### Why not full reaction event tables?

Because MVP goals are:

- visible counters
- fake activity
- no auth
- no deduplication

Therefore, direct counters on posts/comments are acceptable.

### Why comments need a table

Because you need:
- detail-page discussion
- feed preview
- persistent fake activity

### Minimum schema set

- `posts`
- `comments`

That is enough for MVP.

---

## 5. Provider abstraction

Create a small provider layer.

## 5.1 Interface

Each provider module should expose functions like:

- `canHandleUrl(url: string): boolean`
- `normalizeUrl(url: string): string`
- `extractExternalId(url: string): string | null`
- `getContentType(url: string): ContentType`
- `resolveEmbed(input): EmbedResult`
- `resolveMetadata(input): MetadataResult`

### Shared result shapes

`EmbedResult`
- `embedKind`
- `embedUrl`
- `embedHtml`
- `isEmbeddable`
- `reasonIfUnsupported`

`MetadataResult`
- `sourceTitle`
- `sourceAuthor`
- `sourceThumbnailUrl`
- `canonicalUrl`

---

## 5.2 YouTube provider

Support:
- standard watch URLs
- youtu.be short URLs
- Shorts URLs

Preferred embed path:
- iframe embed URL using parsed `videoId`

Preferred metadata path:
- official metadata API or oEmbed-style path if available in your implementation plan
- if metadata fails, rely on manual/local title

Notes:
- Shorts can still map to a normal embed target by video ID.
- player controls and behavior should remain YouTube-native.

---

## 5.3 TikTok provider

Support:
- common public video URLs

Preferred embed path:
- official TikTok embed HTML/script flow or official embed surface

Preferred metadata path:
- official embed/display-friendly metadata path if available
- otherwise store minimal metadata and rely on local title

Notes:
- expect more fragility than YouTube
- be ready for variable embed heights and script hydration issues

---

## 5.4 Instagram provider

Support:
- public post URLs
- public reel URLs
- public image/photo posts where embeddable

Preferred embed path:
- official Instagram embed HTML / oEmbed flow when available

Preferred metadata path:
- official oEmbed/basic metadata route when available and configured
- otherwise allow manual local title fallback

Notes:
- some public content may still disable embedding
- image/photo support depends on embeddability of the source post

---

## 6. Rendering strategy

## 6.1 Feed cards

Use a `ProviderEmbed` component that switches by `embedKind`:

### If `iframe_url`
Render:
- responsive iframe wrapper
- sandbox/referrer policies as appropriate
- provider-specific allow attributes if needed

### If `html`
Render:
- sanitized or trusted provider embed HTML container
- load provider script only when needed
- client-side hydration only

### If unsupported/failure
Render:
- provider badge
- title/source info
- thumbnail if present
- “Open original” CTA

---

## 6.2 SSR vs client behavior

Recommendation:

- server-render metadata and shell
- client-render provider embed hydrators when embed HTML/scripts are involved

Reason:
- TikTok and Instagram embeds often depend on client-side script hydration

---

## 6.3 Layout constraints

Use a consistent wrapper per card:

- max width
- media aspect box
- overflow hidden
- provider-specific min heights

Do not try to force every provider into identical dimensions beyond reason.

---

## 7. Submit flow

## 7.1 UX flow

1. User pastes URL.
2. Client optionally calls `/api/resolve-link` for preview.
3. App shows detected provider and basic resolved info.
4. User enters local title and optional note/comment.
5. Save post.

If preview fails:
- user can still save if URL matches a supported provider and the failure is only metadata-related

---

## 7.2 Validation rules

Required:
- URL present
- URL parses
- provider recognized

Optional:
- title
- note
- alias

Error cases:
- unsupported domain
- malformed URL
- duplicate URL (optional rule; recommended to allow duplicates in MVP)

Recommendation:
- allow duplicates in MVP

---

## 8. Comment and reaction behavior

## 8.1 Post reactions

Endpoint increments:
- `likeCount`
- `dislikeCount`
- or one key in `reactionCountsJson`

No auth.
No dedupe.
Return updated counts.

## 8.2 Comment reactions

Same behavior as posts.

## 8.3 Comments

On comment creation:

- insert row
- increment `posts.commentCount`

No edit/delete required for v1, but optional lightweight admin delete is acceptable.

---

## 9. Fake engagement / seed behavior

Add a dev-only seeding function.

Supported operations:

- add N random comments to a post
- add random post reaction increments
- add random comment reaction increments

Suggested fake alias pool:
- `fitcheck99`
- `archivenerd`
- `selvedgeszn`
- `runwaylurker`
- `denimbrain`
- `anon`

Suggested sample comment bank:
- “hard agree”
- “this styling is crazy good”
- “way better than the thumbnail suggested”
- “saving this for later”
- “the details are nuts”
- “not for me but i get it”

This can be deterministic or random.

---

## 10. File/folder suggestion

```txt
src/
  app/
    page.tsx
    submit/page.tsx
    p/[postId]/page.tsx
    api/
      resolve-link/route.ts
      posts/route.ts
      posts/[postId]/react/route.ts
      posts/[postId]/comments/route.ts
      comments/[commentId]/react/route.ts
      dev/seed-post/route.ts
  components/
    provider-embed.tsx
    feed-card.tsx
    reaction-bar.tsx
    comment-list.tsx
    comment-form.tsx
    submit-form.tsx
    post-meta.tsx
  lib/
    db/
      schema.ts
      client.ts
    providers/
      types.ts
      detect-provider.ts
      youtube.ts
      tiktok.ts
      instagram.ts
    validation/
      posts.ts
      comments.ts
    utils/
      json.ts
      dates.ts
```

---

## 11. Recommended implementation order

1. scaffold app
2. DB schema + migrations
3. submit flow without metadata enrichment
4. feed
5. detail page
6. comments
7. reactions
8. provider-specific metadata enrichment
9. dev seeding tools
10. fallback polish

---

## 12. Error handling

Each post should have one of these states:

- `ready`
- `partial`
- `unsupported`

### `ready`
- metadata present enough
- embed available

### `partial`
- metadata missing or embed uncertain
- still show fallback/open-original

### `unsupported`
- store only if you intentionally want visibility into failures  
  otherwise reject before save

Recommendation:
- reject clearly unsupported URLs before save
- allow partial saves when the provider is supported but enrichment fails

---

## 13. Security and trust boundaries

- trust only provider HTML/embed responses you explicitly allow
- never allow arbitrary user HTML
- validate provider domain before rendering embed HTML
- do not proxy or download source media
- do not attempt to bypass source restrictions

---

## 14. Performance notes

- do not autoplay multiple embeds in feed
- lazy-load embeds below the fold
- consider rendering a click-to-load shell for heavy embeds later if needed
- keep feed page server-rendered and simple

---

## 15. Testing checklist

## 15.1 URL parsing
- valid YouTube long URL
- valid YouTube short URL
- valid YouTube Shorts URL
- valid TikTok URL
- valid Instagram post URL
- valid Instagram reel URL
- malformed URL
- unsupported domain

## 15.2 Feed
- zero state
- one post
- mixed-provider posts
- embed failure fallback
- comments preview

## 15.3 Detail page
- renders full post
- add comment
- add reactions
- counts persist after refresh

## 15.4 Dev seeding
- seed comments
- seed post reactions
- seed comment reactions

---

## 16. Recommendation on metadata APIs

For MVP, use this priority order:

1. official provider metadata/embed routes
2. embed-derived metadata already returned by official provider surfaces
3. manual local title fallback

Do **not** block the whole product on perfect metadata coverage.

---

## 17. What to skip on purpose

Skip all of the following in v1:

- auth
- user profiles
- anti-spam
- moderation queues
- ranking algorithms
- nested comments
- notifications
- share sheets
- bookmarks
- infinite scrolling
- community/category taxonomies
- external-source comment syncing
