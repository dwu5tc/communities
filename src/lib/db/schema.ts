import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  provider: text("provider").notNull(), // youtube | tiktok | instagram
  contentType: text("content_type").notNull(), // video | reel | post | short
  originalUrl: text("original_url").notNull(),
  canonicalUrl: text("canonical_url").notNull(),
  externalId: text("external_id").notNull(),
  localTitle: text("local_title"),
  localNote: text("local_note"),
  submittedByAlias: text("submitted_by_alias"),
  sourceTitle: text("source_title"),
  sourceAuthor: text("source_author"),
  sourceThumbnailUrl: text("source_thumbnail_url"),
  embedKind: text("embed_kind").notNull(), // iframe_url | html | unsupported
  embedUrl: text("embed_url"),
  embedHtml: text("embed_html"),
  isEmbeddable: integer("is_embeddable", { mode: "boolean" }).notNull().default(true),
  likeCount: integer("like_count").notNull().default(0),
  dislikeCount: integer("dislike_count").notNull().default(0),
  reactionCountsJson: text("reaction_counts_json").notNull().default("{}"),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull().references(() => posts.id),
  displayName: text("display_name").notNull().default("anon"),
  body: text("body").notNull(),
  likeCount: integer("like_count").notNull().default(0),
  dislikeCount: integer("dislike_count").notNull().default(0),
  reactionCountsJson: text("reaction_counts_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
