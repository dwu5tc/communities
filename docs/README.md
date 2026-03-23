# Content Layer MVP Docs

This doc pack is for a **minimal web MVP** that lets a user:

- submit links to supported content from YouTube, TikTok, and Instagram
- view those posts in a single aggregated feed using official embeds
- open a dedicated detail page per post
- add local comments, likes, dislikes, and emoji-style reactions
- simulate community activity without real authentication

## Included docs

- `PRD.md` — product scope, UX, requirements, non-goals
- `TECH_SPEC.md` — stack, routes, data model, provider behavior, risks
- `AGENTS.md` — implementation rules and constraints for an AI coding agent
- `TASKS.md` — recommended build order with milestones and acceptance checks

## Recommended MVP stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- SQLite + Drizzle ORM
- Official provider embeds only
- No user auth in v1

## Product stance

This is **not** a re-hosting app and **not** a native-clone player.  
It is a lightweight community/discussion layer on top of official embeds.

## Key constraint

Use platform-native/official embed mechanisms wherever possible.  
Do **not** scrape private endpoints, download source media, strip branding, or fake native platform actions.
