import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";
import { detectProvider, getProviderModule } from "@/lib/providers/detect-provider";
import { submitPostSchema } from "@/lib/validation/posts";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = submitPostSchema.parse(body);

    const match = detectProvider(input.url);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch metadata — pass url for generic provider
    const mod = getProviderModule(match.provider);
    const metadata = mod?.fetchMetadata
      ? await mod.fetchMetadata(match.externalId, input.url)
      : {};

    const [post] = await db
      .insert(posts)
      .values({
        provider: match.provider,
        contentType: match.contentType,
        originalUrl: input.url,
        canonicalUrl: match.canonicalUrl,
        externalId: match.externalId,
        localTitle: input.localTitle || null,
        localNote: input.localNote || null,
        submittedByAlias: input.submittedByAlias || null,
        sourceTitle: metadata?.title || null,
        sourceAuthor: metadata?.author || null,
        sourceDescription: metadata?.description || null,
        sourceThumbnailUrl: metadata?.thumbnailUrl || null,
        embedKind: match.embed.kind,
        embedUrl: match.embed.url || null,
        embedHtml: match.embed.html || null,
        isEmbeddable: true,
      })
      .returning();

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Failed to create post:", e);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
