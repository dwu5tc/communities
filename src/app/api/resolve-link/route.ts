import { NextResponse } from "next/server";
import { detectProvider, getProviderModule } from "@/lib/providers/detect-provider";
import { z } from "zod";

const schema = z.object({ url: z.string().url() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = schema.parse(body);

    const match = detectProvider(url);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Try to fetch metadata — pass url for generic provider
    const mod = getProviderModule(match.provider);
    const metadata = mod?.fetchMetadata
      ? await mod.fetchMetadata(match.externalId, url)
      : {};

    return NextResponse.json({ match, metadata });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to resolve link" },
      { status: 500 }
    );
  }
}
